from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PORT: int = 5001
    CORS_ORIGIN: str = "*"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
