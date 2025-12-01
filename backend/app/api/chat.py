from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import AsyncGenerator
from datetime import datetime
import httpx
import json
import time
import uuid
from app.core.config import settings
from app.services.logging import append_log, load_logs

router = APIRouter(prefix="/api", tags=["chat"])

class ChatRequest(BaseModel):
    prompt: str

@router.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    async def event_stream() -> AsyncGenerator[bytes, None]:
        request_id = str(uuid.uuid4())
        started_at = datetime.utcnow().isoformat()
        start_time = time.time()
        full_answer = ""
        
        # === ВОЗВРАЩАЕМ LUNA ===
        # Простая инструкция: быть умным профессором.
        
        luna_prompt = f"Ты — мудрый профессор социологии LUNA. Отвечай на вопрос подробно и интересно на русском языке. Вопрос: {req.prompt}"
        
        payload = {
            "model": settings.OLLAMA_MODEL, 
            "prompt": luna_prompt, 
            "stream": True 
        }

        async with httpx.AsyncClient(timeout=None) as client:
            try:
                async with client.stream("POST", settings.OLLAMA_URL, json=payload) as resp:
                    if resp.status_code != 200:
                        yield f"Error: {resp.status_code}".encode('utf-8')
                        return

                    async for line in resp.aiter_lines():
                        if not line: continue
                        try:
                            data = json.loads(line)
                            chunk = data.get("response", "")
                            if chunk:
                                full_answer += chunk
                                yield chunk.encode("utf-8")
                            if data.get("done"): break
                        except: continue
            finally:
                finished_at = datetime.utcnow().isoformat()
                duration = int((time.time() - start_time) * 1000)
                if full_answer:
                    append_log({
                        "id": request_id, "prompt": req.prompt, "answer": full_answer,
                        "task": "sociology_chat",
                        "started_at": started_at, "finished_at": finished_at, "duration_ms": duration
                    })

    return StreamingResponse(event_stream(), media_type="text/plain; charset=utf-8")

@router.get("/logs")
def get_logs(limit: int = 20):
    return {"items": load_logs()[-limit:][::-1]}

@router.get("/stats")
def get_stats():
    logs = load_logs()
    return {"total_requests": len(logs), "total_answer_chars": sum(len(e.get("answer", "")) for e in logs)}