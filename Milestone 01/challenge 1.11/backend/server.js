require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_MODEL = "openai/gpt-4o-mini";

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.get("/health", (req, res) => {
  res.json({ ok: true, model: OPENROUTER_MODEL });
});

app.post("/chat", async (req, res) => {
  const { messages } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      error: "Request body must include a non-empty messages array.",
    });
  }

  const invalidMessage = messages.find((message) => {
    return (
      !message ||
      typeof message !== "object" ||
      !["user", "assistant", "system"].includes(message.role) ||
      typeof message.content !== "string" ||
      message.content.trim().length === 0
    );
  });

  if (invalidMessage) {
    return res.status(400).json({
      error:
        "Each message must include a valid role and non-empty string content.",
    });
  }

  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({
      error:
        "Missing OPENROUTER_API_KEY in backend/.env. The API key must stay on the server.",
    });
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Challenge 1.11 AI Chatbot",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data?.error?.message ||
          data?.message ||
          "OpenRouter request failed.",
      });
    }

    const assistantMessage = data?.choices?.[0]?.message;

    if (!assistantMessage?.content) {
      return res.status(502).json({
        error: "AI response did not include a message.",
      });
    }

    return res.json({ reply: assistantMessage.content, model: OPENROUTER_MODEL });
  } catch (error) {
    return res.status(500).json({
      error: "Unable to reach OpenRouter.",
      details: error.message,
    });
  }
});

app.use(express.static(path.join(__dirname, "..", "frontend")));

app.listen(PORT, () => {
  console.log(`AI chatbot backend running on port ${PORT}`);
});
