from ctypes import CDLL, byref, c_size_t, c_uint32, POINTER, c_uint64, Structure, c_uint8
from pathlib import Path
import time
from typing import AsyncIterable

from src.schemas.hash import MD5_Response
from src.config.config import get_config

_LIB_DIR = Path(__file__).resolve().parent

config = get_config().hash_module
_LIBS = {name: CDLL(_LIB_DIR / src) for name, src in zip(config.algorithm, config.algorithm_src)}


class Context(Structure):
    _fields_ = [
        ("A", c_uint32),
        ("B", c_uint32),
        ("C", c_uint32),
        ("D", c_uint32),
        ("buffer", c_uint8 * 64),
        ("buffer_len", c_size_t),
        ("total_len", c_uint64),
    ]


def _init_lib(lib):
    lib.md5_init.argtypes = [POINTER(Context)]
    lib.md5_update.argtypes = [POINTER(Context), POINTER(c_uint8), c_size_t]
    lib.md5_final.argtypes = [POINTER(Context), POINTER(c_uint8)]
    lib.md5_init.restype = None
    lib.md5_update.restype = None
    lib.md5_final.restype = None


for _lib in _LIBS.values():
    _init_lib(_lib)


class MD5_service:
    def __init__(self, algorithm: str = "default"):
        self.ctx = Context()
        self.lib = _LIBS.get(algorithm)
        self.lib.md5_init(self.ctx)

    def update(self, data: bytes | str):
        if isinstance(data, str):
            data = data.encode()
        buffer = (c_uint8 * len(data)).from_buffer_copy(data)
        self.lib.md5_update(byref(self.ctx), buffer, len(data))

    def get_result(self) -> str:
        out = (c_uint8 * 16)()
        self.lib.md5_final(byref(self.ctx), out)
        return bytes(out).hex()


async def md5_stream_with_metrics(stream: AsyncIterable[bytes], algorithm: str = "default") -> MD5_Response:
    timer = time.perf_counter()
    service = MD5_service(algorithm=algorithm)
    total_bytes = 0
    hash_time = 0.0
    async for chunk in stream:
        if not chunk:
            continue
        total_bytes += len(chunk)
        hash_start = time.perf_counter()
        service.update(chunk)
        hash_time += time.perf_counter() - hash_start
    total_time = time.perf_counter() - timer
    upload_time = max(total_time - hash_time, 0.0)
    upload_speed_bps = (total_bytes / upload_time) if upload_time > 0 else 0.0
    hash_speed_bps = (total_bytes / hash_time) if hash_time > 0 else 0.0
    return MD5_Response(
        hash=str(service.get_result()),
        time=round(total_time, 3),
        upload_time=round(upload_time, 3),
        hash_time=round(hash_time, 3),
        upload_speed_bps=round(upload_speed_bps, 2),
        hash_speed_bps=round(hash_speed_bps, 2),
    )
