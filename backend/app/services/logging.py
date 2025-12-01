from pathlib import Path
from typing import List, Dict, Any
import json
from app.core.config import settings

LOG_PATH: Path = settings.LOG_FILE_PATH

def append_log(entry: Dict[str, Any]) -> None:
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    with LOG_PATH.open("a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")

def load_logs() -> List[Dict[str, Any]]:
    if not LOG_PATH.exists(): return []
    entries = []
    with LOG_PATH.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                try: entries.append(json.loads(line))
                except: continue
    return entries