from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    REDIS_URL: str
    PROJECT_NAME: str = "Finance AI Platform"
    OPENAI_API_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()