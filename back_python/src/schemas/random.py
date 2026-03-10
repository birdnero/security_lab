from pydantic import BaseModel, Field


class GenConfig(BaseModel):
    x0: int
    m: int
    a: int
    c: int


class GenerateRequest(BaseModel):
    config: GenConfig
    n: int = Field(gt=0, le=9999)


class ChizaruRequest(BaseModel):
    config: GenConfig
    n: int = Field(gt=0)


class SequencePeriodRequest(BaseModel):
    config: GenConfig


class CompareRequest(BaseModel):
    config: GenConfig
    n: int = Field(gt=0)


class GenerateResponse(BaseModel):
    numbers: list[int]


class BitBalanceResponse(BaseModel):
    zeros: int
    ones: int
    ratio_zero_to_one: float


class PiEstimateResponse(BaseModel):
    pi_estimate: float
    abs_error_vs_math_pi: float


class SequencePeriodResponse(BaseModel):
    period: int
    reached_limit: bool


class CompareResponse(BaseModel):
    generator: BitBalanceResponse
    builtin: BitBalanceResponse
