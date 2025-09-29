const express = require("express");
const router = express.Router();

router.post("/text", async (req, res) => {
  const { prompt, instrucciones } = req.body;

  try {
    const { Client } = await import("@gradio/client");
    const client = await Client.connect("Smanriquej/gpt2-backend", {
      hf_token: process.env.HF_API_KEY,
    });

    // Enviamos los inputs al Space
    const result = await client.predict("/predict", [prompt, instrucciones || ""]);
    
    // result.data[0] normalmente es un string
    const textoGenerado = result.data[0] || "";

    res.json({ generated_text: textoGenerado });
  } catch (err) {
    console.error("Error en /text:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
