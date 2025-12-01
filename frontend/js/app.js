window.addEventListener("DOMContentLoaded", () => {
  const chatWindow = document.getElementById("chatWindow");
  const chatForm = document.getElementById("chatForm");
  const promptInput = document.getElementById("promptInput");
  const sendBtn = document.getElementById("sendBtn");
  const statRequests = document.getElementById("statRequests");
  const logsList = document.getElementById("logsList");

  // Функция создания сообщения на экране
  function createMessage(role, text = "") {
    const msg = document.createElement("div");
    msg.className = `message ${role}`;
    
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = role === "user" ? "U" : "AI";
    
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;
    
    msg.appendChild(avatar);
    msg.appendChild(bubble);
    chatWindow.appendChild(msg);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return bubble; // Возвращаем пузырь, чтобы дописывать в него текст
  }

  // Обновление статистики и логов в сайдбаре
  async function updateSidebar() {
    try {
      const stats = await fetchStats();
      if(statRequests) statRequests.textContent = stats.total_requests;

      const logs = await fetchLogs();
      if(logsList) {
        logsList.innerHTML = "";
        logs.items.forEach(item => {
          const li = document.createElement("li");
          li.textContent = `Q: ${item.prompt.slice(0, 30)}...`;
          logsList.appendChild(li);
        });
      }
    } catch(e) { console.error("Ошибка обновления статистики", e); }
  }

  // Обработка отправки формы
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const prompt = promptInput.value.trim();
    if (!prompt) return;

    // 1. Показываем вопрос пользователя
    createMessage("user", prompt);
    
    // 2. Создаем пустой пузырь для ответа AI
    const aiBubble = createMessage("assistant", "");
    
    // 3. Блокируем кнопку
    promptInput.value = "";
    sendBtn.disabled = true;

    // 4. Запускаем стриминг
    await streamChat(prompt, {
      onChunk: (chunk) => {
        aiBubble.textContent += chunk;
        chatWindow.scrollTop = chatWindow.scrollHeight;
      },
      onDone: () => {
        sendBtn.disabled = false;
        updateSidebar(); // Обновляем статистику после ответа
      },
      onError: (err) => {
        aiBubble.textContent += "\n[Ошибка: Не удалось связаться с сервером]";
        sendBtn.disabled = false;
      }
    });
  });

  // Загрузить статистику при запуске
  updateSidebar();
});