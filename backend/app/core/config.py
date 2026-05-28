from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    REDIS_URL: str
    PROJECT_NAME: str = "Finance AI Platform"

    class Config:
        env_file = ".env"

settings = Settings()