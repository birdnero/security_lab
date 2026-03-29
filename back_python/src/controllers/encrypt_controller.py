import asyncio
import logging
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse
import tempfile

from src.config.config import EncryptionConfig, get_config
from src.services.encrypt_service.rc5_service import build_rc5_runtime_config, stream_decrypt, stream_encrypt

router = APIRouter(prefix="/encryption")
logger = logging.getLogger(__name__)


async def _read_request_to_tempfile(
    request: Request,
    max_size_bytes: int,
) -> tuple[tempfile.SpooledTemporaryFile, int]:
    #? потрібно, бо фастапі не  сприйняв двох сторонній стрим((((
    tmp = tempfile.SpooledTemporaryFile(max_size=1024 * 1024 * 1024)
    total = 0
    async for chunk in request.stream():
        if not chunk:
            continue
        total += len(chunk)
        if total > max_size_bytes:
            tmp.close()
            raise HTTPException(status_code=400, detail="File too large")
        tmp.write(chunk)
    tmp.seek(0)
    return tmp, total


async def _file_iter(file_obj, chunk_size: int = 64 * 1024):
    while True:
        data = file_obj.read(chunk_size)
        if not data:
            break
        yield data


@router.post("/encrypt")
async def encrypt(
    request: Request,
    w: int | None = None,
    rounds: int | None = None,
    passphrase: str | None = None,
):
    try:
        config = build_rc5_runtime_config(w=w, rounds=rounds, passphrase=passphrase)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    tmp, total = await _read_request_to_tempfile(
        request,
        get_config().encryption_module.max_upload_size_bytes,
    )
    logger.info("Encryption upload complete: %d bytes", total)

    async def _stream():
        try:
            logger.info("Starting encryption stream")
            async for chunk in stream_encrypt(_file_iter(tmp), config):
                if await request.is_disconnected():
                    break
                yield chunk
        except asyncio.CancelledError:
            return
        except ValueError as e:
            logger.warning("Encryption stream stopped: %s", str(e))
            return
        finally:
            tmp.close()

    return StreamingResponse(
        _stream(),
        media_type="application/octet-stream",
    )


@router.post("/decrypt")
async def decrypt(
    request: Request,
    w: int | None = None,
    rounds: int | None = None,
    passphrase: str | None = None,
):
    try:
        config = build_rc5_runtime_config(w=w, rounds=rounds, passphrase=passphrase)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    tmp, total = await _read_request_to_tempfile(
        request,
        get_config().encryption_module.max_upload_size_bytes,
    )
    logger.info("Decryption upload complete: %d bytes", total)
    block_size = 2 * (config.w // 8)
    if total < block_size:
        tmp.close()
        raise HTTPException(status_code=400, detail="is missing IV block")
    if (total - block_size) % block_size != 0:
        tmp.close()
        raise HTTPException(status_code=400, detail="length must be a multiple of block size")

    async def _stream():
        try:
            logger.info("Starting decryption stream")
            async for chunk in stream_decrypt(_file_iter(tmp), config):
                if await request.is_disconnected():
                    break
                yield chunk
        except asyncio.CancelledError:
            return
        except ValueError as e:
            logger.warning("Decryption stream stopped: %s", str(e))
            return
        finally:
            tmp.close()

    return StreamingResponse(
        _stream(),
        media_type="application/octet-stream",
    )


@router.get("/config")
def get_encryption_config() -> EncryptionConfig:
    return get_config().encryption_module
