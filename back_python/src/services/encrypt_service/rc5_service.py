from ctypes import CDLL, Structure, POINTER, c_int32, c_int64, c_uint16, c_uint8, c_uint64, byref
from dataclasses import dataclass
from pathlib import Path
import time
from typing import AsyncIterable, AsyncIterator

from src.config.config import EncryptionConfig, Rc5IvConfig, get_config
from src.schemas.random import GenConfig
from src.services.hash_service.hash_service import MD5_service
from src.services.random_service import RandomService


_LIB_DIR = Path(__file__).resolve().parent
_LIB = CDLL(_LIB_DIR / "librc5_service.so")


class RC5Context(Structure):
    _fields_ = [
        ("w", c_uint16),
        ("r", c_uint16),
        ("b", c_uint16),
        ("key", POINTER(c_uint8)),
        ("S", POINTER(c_uint64)),
        ("block_size_bytes", c_uint8),
        ("buffer", c_uint8 * 16),
        ("buffer_size_bytes", c_uint8),
        ("prev_block", c_uint8 * 16),
    ]


def _init_lib(lib):
    lib.init_context.argtypes = [
        POINTER(RC5Context),
        POINTER(c_uint8),
        POINTER(c_uint8),
        c_uint16,
        c_uint16,
        c_uint16,
        POINTER(c_uint64),
    ]
    lib.init_context.restype = None

    lib.rc5_ecb.argtypes = [POINTER(c_uint8), POINTER(RC5Context), POINTER(c_uint8)]
    lib.rc5_ecb.restype = None

    lib.decrypt.argtypes = [c_uint64, c_uint64, POINTER(c_uint64), c_uint8, c_uint8, POINTER(c_uint8)]
    lib.decrypt.restype = None

    lib.rc5_cbc_pad_encrypt_update.argtypes = [POINTER(c_uint8), c_int64, POINTER(RC5Context), POINTER(c_uint8)]
    lib.rc5_cbc_pad_encrypt_update.restype = c_int32
    lib.rc5_cbc_pad_encrypt_final.argtypes = [POINTER(RC5Context), POINTER(c_uint8)]
    lib.rc5_cbc_pad_encrypt_final.restype = c_int32
    lib.rc5_cbc_pad_decrypt_update.argtypes = [POINTER(c_uint8), c_int64, POINTER(RC5Context), POINTER(c_uint8)]
    lib.rc5_cbc_pad_decrypt_update.restype = c_int32
    lib.rc5_cbc_pad_decrypt_final.argtypes = [POINTER(RC5Context), POINTER(c_uint8)]
    lib.rc5_cbc_pad_decrypt_final.restype = c_int32


_init_lib(_LIB)


@dataclass(frozen=True)
class Rc5RuntimeConfig:
    w: int
    rounds: int
    key: bytes
    iv: bytes


def _md5_bytes(data: bytes):
    service = MD5_service()
    service.update(data)
    return bytes.fromhex(service.get_result())


def _get_key_from_passphrase(passphrase: str, key_bits: int):
    h = _md5_bytes(passphrase.encode() if len(passphrase) > 0 else b"")
    if key_bits <= 128:
        return h[-(key_bits // 8) :]
    h2 = _md5_bytes(h)
    k256 = h2 + h
    return k256[-(key_bits // 8) :]


def _generate_iv(config: Rc5IvConfig, block_size: int):
    seed = (config.x0 + (time.time_ns() % config.m)) % config.m
    gen_config = GenConfig(x0=seed, m=config.m, a=config.a, c=config.c)
    # gen_config = GenConfig(x0=config.x0, m=config.m, a=config.a, c=config.c)

    values = RandomService.generate(gen_config, (block_size + 3) // 4)  # ? бере потрібну кількість чисел (+3 це ceil)
    raw = bytearray()
    for value in values:
        raw.extend(int(value).to_bytes(4, "little", signed=False))
        if len(raw) >= block_size:
            break
    return bytes(raw[:block_size])


def build_rc5_runtime_config(
    default: EncryptionConfig | None = None,
    w: int | None = None,
    rounds: int | None = None,
    passphrase: str | None = None,
) -> Rc5RuntimeConfig:
    if default is None:
        default = get_config().encryption_module
    rc5_default = default.rc5
    w = w if w is not None else rc5_default.w
    rounds = rounds if rounds is not None else rc5_default.rounds
    key_length = rc5_default.key_length

    if w not in (16, 32, 64):
        raise ValueError("w must be one of 16, 32, 64")
    if rounds < 0 or rounds > 255:
        raise ValueError("rounds must be between 0 and 255")
    if key_length < 0 or key_length > 255:
        raise ValueError("key_length must be between 0 and 255")

    # if not passphrase:
    #     raise ValueError("passphrase is required")
    key_bits = key_length * 8
    key = _get_key_from_passphrase(passphrase, key_bits)

    block_size = 2 * (w // 8)
    iv = _generate_iv(default.rc5_iv_rng, block_size)

    return Rc5RuntimeConfig(w=w, rounds=rounds, key=key, iv=iv)


class RC5Service:
    def __init__(self, *, key: bytes, w: int, r: int, iv: bytes):
        self.ctx = RC5Context()
        self.key = (c_uint8 * len(key)).from_buffer_copy(key)
        self.iv = (c_uint8 * len(iv)).from_buffer_copy(iv)
        self.S = (c_uint64 * (2 * r + 2))()
        _LIB.init_context(byref(self.ctx), self.key, self.iv, len(key), r, w, self.S)
        self.block = int(self.ctx.block_size_bytes)

    def ecb_encrypt_block(self, block: bytes):
        if len(block) != self.block:
            raise ValueError("block size mismatch")
        #? створюються масиви с типів повного розміру, для ecb підходить
        inp = (c_uint8 * len(block)).from_buffer_copy(block)
        out = (c_uint8 * len(block))()
        _LIB.rc5_ecb(inp, byref(self.ctx), out)
        return bytes(out)

    def ecb_decrypt_block(self, block: bytes):
        if len(block) != self.block:
            raise ValueError("block size mismatch")
        word_size = self.ctx.w // 8
        #? засуває у змінні частини мого блоку в літтл ендіан
        a = int.from_bytes(block[:word_size], "little", signed=False)
        b = int.from_bytes(block[word_size:], "little", signed=False)
        out = (c_uint8 * len(block))()
        _LIB.decrypt(a, b, self.S, self.ctx.r, self.ctx.w, out)
        return bytes(out)

    def cbc_pad_encrypt_update(self, data: bytes):
        if not data:
            return bytes()
        inp = (c_uint8 * len(data)).from_buffer_copy(data)
        out = (c_uint8 * (len(data) + self.block))()
        out_len = _LIB.rc5_cbc_pad_encrypt_update(inp, len(data), byref(self.ctx), out)
        # ? тут як і усюди, в нас буфер out великий але це не значить, що нам повернувся він повнйи, бо внутрішньо ж програма працює через внутршній буфер якому лишається певна частина даних
        return bytes(out[:out_len])

    def cbc_pad_encrypt_final(self):
        out = (c_uint8 * self.block)()
        out_len = _LIB.rc5_cbc_pad_encrypt_final(byref(self.ctx), out)
        return bytes(out[:out_len])

    def cbc_pad_decrypt_update(self, data: bytes):
        if not data:
            return b""
        inp = (c_uint8 * len(data)).from_buffer_copy(data)
        out = (c_uint8 * (len(data) + self.block))()
        out_len = _LIB.rc5_cbc_pad_decrypt_update(inp, len(data), byref(self.ctx), out)
        return bytes(out[:out_len])

    def cbc_pad_decrypt_final(self):
        out = (c_uint8 * self.block)()
        out_len = _LIB.rc5_cbc_pad_decrypt_final(byref(self.ctx), out)
        return bytes(out[:out_len])


async def stream_encrypt(stream: AsyncIterable[bytes], config: Rc5RuntimeConfig) -> AsyncIterator[bytes]:
    service = RC5Service(key=config.key, w=config.w, r=config.rounds, iv=config.iv)
    iv_block = service.ecb_encrypt_block(config.iv)
    if iv_block:
        yield iv_block
    async for chunk in stream:
        if not chunk:
            continue
        out = service.cbc_pad_encrypt_update(chunk)
        if out:
            yield out
    final = service.cbc_pad_encrypt_final()
    if final:
        yield final


async def stream_decrypt(stream: AsyncIterable[bytes], config: Rc5RuntimeConfig) -> AsyncIterator[bytes]:
    #? через довбаний блок на початку треба додавати оце де чекається поки назбирається байтів на блок
    block_size = 2 * (config.w // 8)
    buffer = bytearray()
    async for chunk in stream:
        if not chunk:
            continue
        buffer.extend(chunk)
        if len(buffer) >= block_size:
            break

    if len(buffer) < block_size:
        raise ValueError("is missing IV block")

    #? тут перший блок це iv а все інше потрібно щк зберегти 
    first_block = bytes(buffer[:block_size])
    rest = bytes(buffer[block_size:])

    iv_service = RC5Service(key=config.key, w=config.w, r=config.rounds, iv=bytes(block_size))
    iv = iv_service.ecb_decrypt_block(first_block)

    service = RC5Service(key=config.key, w=config.w, r=config.rounds, iv=iv)
    total_input = 0

    #? той самий залишок, який треба не загубити...
    if rest:
        total_input += len(rest)
        out = service.cbc_pad_decrypt_update(rest)
        if out:
            yield out

    async for chunk in stream:
        if chunk:
            total_input += len(chunk)
            out = service.cbc_pad_decrypt_update(chunk)
            if out:
                yield out

    if total_input % service.block != 0:
        raise ValueError("length must be a multiple of block size")

    final = service.cbc_pad_decrypt_final()
    if final:
        yield final
