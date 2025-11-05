import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "SlotSwapper API"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev_secret_change_me")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./slotswapper.db")
    CORS_ORIGINS: list[str] = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

settings = Settings()
