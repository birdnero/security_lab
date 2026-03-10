
from pydantic import BaseModel, Field, ConfigDict


class MD5_Response(BaseModel):
    hash_: str = Field(alias="hash")
    time: float
    upload_time: float
    hash_time: float
    upload_speed_bps: float
    hash_speed_bps: float
