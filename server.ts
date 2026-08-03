import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Business Digitalization Advisor AI Endpoint
  app.post("/api/advisor", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "GEMINI_API_KEY environment variable is not configured.",
        });
      }

      const { prompt, context } = req.body;
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const systemInstruction = `You are an expert Business Digitalization Advisor specializing in South Asian local retail operations, specifically small Medicine Shops (Pharmacies) and Mobile Financial Services (MFS - e.g. bKash, Nagad, Rocket, Flexiload, Utility Payment points).
The business owner has 4 shop staff who use Android smartphones. The owner wants to prevent cash leakage, maintain strict role-based data entry control, manage customer credit dues (Tally / Baki), track cash float vs digital wallet balances, and automate customer payment reminders.
Provide direct, actionable, practical, and empathetic advice. You can also generate courteous customer calling/SMS scripts in English and Bengali when asked.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${systemInstruction}\n\n[Shop Context]: ${JSON.stringify(context || {})}\n\n[User Query]: ${prompt}`,
              },
            ],
          },
        ],
      });

      const text = response.text || "No response generated from AI Advisor.";
      res.json({ advice: text });
    } catch (err: any) {
      console.error("Error in /api/advisor:", err);
      res.status(500).json({ error: err.message || "Failed to contact AI Advisor." });
    }
  });

  // Vite Middleware in Dev vs Static in Prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
