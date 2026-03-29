import json
from pathlib import Path
from pydantic import BaseModel


ROOT_DIR = Path(__file__).resolve().parents[2]


class HashConfig(BaseModel):
    algorithm: list[str]
    algorithm_src: list[str]


class Rc5Config(BaseModel):
    w: int
    rounds: int
    key_length: int
    key_hex: str | None = None


class Rc5IvConfig(BaseModel):
    x0: int
    m: int
    a: int
    c: int


class EncryptionConfig(BaseModel):
    rc5: Rc5Config
    rc5_iv_rng: Rc5IvConfig
    max_upload_size_bytes: int
    passphrase: str | None = None


class Config(BaseModel):
    hash_module: HashConfig
    encryption_module: EncryptionConfig


_config: Config | None = None


def get_config() -> Config:
    global _config
    if _config is None:
        path = ROOT_DIR / "src" / "config" / "config.json"
        with path.open("r", encoding="utf-8") as f:
            data = json.load(f)
        _config = Config.model_validate(data)
    return _config
