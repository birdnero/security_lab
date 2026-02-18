from fastapi import APIRouter

from src.schemas.random import (
    ChizaruRequest,
    CompareRequest,
    CompareResponse,
    GenerateRequest,
    GenerateResponse,
    PiEstimateResponse,
    SequencePeriodRequest,
    SequencePeriodResponse,
)
from src.services.random_service import RandomService


router = APIRouter(prefix="/random")
service = RandomService()


@router.post("/generate", response_model=GenerateResponse)
def generate(request: GenerateRequest) -> GenerateResponse:
    return GenerateResponse(numbers=service.generate(request.config, request.n))


@router.post("/chizaru", response_model=PiEstimateResponse)
def chizaru_pi(request: ChizaruRequest) -> PiEstimateResponse:
    return service.chizaru(request.config, request.n)


@router.post("/sequence-period", response_model=SequencePeriodResponse)
def sequence_period(request: SequencePeriodRequest) -> SequencePeriodResponse:
    return service.sequence_period(request.config)


@router.post("/compare", response_model=CompareResponse)
def compare(request: CompareRequest) -> CompareResponse:
    return service.compare_with_builtin(request.config, request.n)
