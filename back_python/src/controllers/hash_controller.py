from fastapi import APIRouter, Request

from src.config.config import HashConfig, get_config
from src.schemas.hash import MD5_Response
from src.services.hash_service.hash_service import md5_stream_with_metrics


router = APIRouter(prefix="/hash")


@router.post("/md5-stream")
async def md5_stream(request: Request, algorithm: str | None = None) -> MD5_Response:
    allowed = get_config().hash_module.algorithm
    if algorithm not in allowed:
        algorithm = "default" if "default" in allowed else (allowed[0] if allowed else "default")
    data = await md5_stream_with_metrics(request.stream(), algorithm=algorithm)
    return data


@router.get("/config")
def get_hash_config() -> HashConfig:
    return get_config().hash_module
