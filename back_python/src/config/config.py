import json
from pathlib import Path
from typing import Annotated
from annotated_types import Len
from pydantic import BaseModel, model_validator


ROOT_DIR = Path(__file__).resolve().parents[2]


class HashConfig(BaseModel):
    algorithm: list[str]
    algorithm_src: list[str]


class Config(BaseModel):
    hash_module: HashConfig


_config: Config | None = None


def get_config() -> Config:
    global _config
    if _config is None:
        path = ROOT_DIR / "src" / "config" / "config.json"
        with path.open("r", encoding="utf-8") as f:
            data = json.load(f)
        _config = Config.model_validate(data)
    return _config
