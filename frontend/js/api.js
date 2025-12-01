// Адрес нашего сервера (Бэкенда)
const API_BASE_URL = "http://127.0.0.1:8000";

// Функция для получения ответа по кусочкам (Стриминг)
async function streamChat(prompt, { onChunk, onDone, onError } = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) throw new Error("Ошибка соединения с сервером");

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      if (onChunk) onChunk(chunk);
    }
    if (onDone) onDone();
  } catch (err) {
    if (onError) onError(err);
  }
}

// Функция для получения статистики
async function fetchStats() {
  const res = await fetch(`${API_BASE_URL}/api/stats`);
  return res.json();
}

// Функция для получения истории логов
async function fetchLogs(limit = 20) {
  const res = await fetch(`${API_BASE_URL}/api/logs?limit=${limit}`);
  return res.json();
}