from pathlib import Path
import os

# Путь к корню бэкенда
BACKEND_DIR = Path(__file__).resolve().parents[2]

class Settings:
    def __init__(self) -> None:
        self.OLLAMA_URL: str = "http://localhost:11434/api/generate"
        self.OLLAMA_MODEL: str = "tinyllama"  # Или "llama3", если скачал
        self.LOG_FILE_PATH: Path = BACKEND_DIR / "logs.jsonl"

settings = Settings()