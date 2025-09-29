const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

// Inicializar cliente con API Key
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Endpoint: recibe { prompt } o { messages }
router.post("/", async (req, res) => {
  try {
    const { prompt, messages } = req.body;
    if (!prompt && !messages) {
      return res.status(400).json({ error: "Se requiere 'prompt' o 'messages'" });
    }

    // Si llegan messages estilo chat, convértelo en texto plano
    const inputText =
      prompt ||
      messages.map((m) => `${m.role}: ${m.content}`).join("\n");

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      input: inputText,
    });

    let reply = "";
    if (response.output && Array.isArray(response.output)) {
      for (const block of response.output) {
        if (block.type === "output_text" && block.text) reply += block.text;
        else if (block.type === "message" && Array.isArray(block.content)) {
          for (const c of block.content) {
            if (c.type === "output_text" && c.text) reply += c.text;
          }
        }
      }
    }
    if (!reply && response.output_text) reply = response.output_text;

    res.json({ reply });
  } catch (err) {
    console.error("Error OpenAI:", err);
    res.status(500).json({ error: "Error al generar respuesta" });
  }
});

module.exports = router;
