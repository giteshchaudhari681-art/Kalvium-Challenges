const DEPLOYED_API_BASE_URL = "https://your-render-service.onrender.com";
const API_BASE_URL =
  window.location.protocol === "file:" ||
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : DEPLOYED_API_BASE_URL;
const chatEndpoint = `${API_BASE_URL}/chat`;

const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");
const history = document.getElementById("chat-history");
const sendButton = document.getElementById("send-button");

const messages = [
  {
    role: "assistant",
    content: "Hi. Ask me a question and I will keep the conversation context.",
  },
];

renderMessages();

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const content = input.value.trim();
  if (!content) {
    return;
  }

  messages.push({ role: "user", content });
  renderMessages();

  input.value = "";
  input.focus();
  setLoading(true);

  try {
    const response = await fetch(chatEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "The chatbot request failed.");
    }

    messages.push({ role: "assistant", content: data.reply });
    renderMessages();
  } catch (error) {
    messages.push({
      role: "assistant",
      content: `Request failed: ${error.message}`,
    });
    renderMessages();
  } finally {
    setLoading(false);
  }
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

function renderMessages() {
  history.innerHTML = "";

  messages.forEach((message) => {
    const wrapper = document.createElement("article");
    wrapper.className = `message message-${message.role}`;

    const role = document.createElement("p");
    role.className = "message-role";
    role.textContent = message.role === "assistant" ? "Assistant" : "You";

    const content = document.createElement("p");
    content.className = "message-content";
    content.textContent = message.content;

    wrapper.append(role, content);
    history.appendChild(wrapper);
  });

  history.scrollTop = history.scrollHeight;
}

function setLoading(isLoading) {
  sendButton.disabled = isLoading;
  sendButton.textContent = isLoading ? "Thinking..." : "Send";
  input.disabled = isLoading;
}
