import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import crypto from "crypto";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up JSON body parser with increased limit for base64 images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// --- SECURE AUTHENTICATION SYSTEM ---
interface DBUser {
  id: string;
  email: string;
  fullName: string;
  location: string;
  passwordHash: string;
  createdAt: string;
}

const USERS_FILE = path.join(process.cwd(), "users.json");

// Load users with fallback/seeding
function loadUsers(): DBUser[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading users file:", err);
  }
  // Default seed user with password "mkulima123"
  // SHA-256 hash of "mkulima123" is: "ef13501a3577007e0c8b7f7fc74d47225139fb29e479a951e5e01cf4f0611d04"
  const defaultUsers = [
    {
      id: "1",
      email: "mkulima@gmail.com",
      fullName: "Juma Said",
      location: "Morogoro",
      passwordHash: "ef13501a3577007e0c8b7f7fc74d47225139fb29e479a951e5e01cf4f0611d04",
      createdAt: new Date().toISOString()
    }
  ];
  saveUsers(defaultUsers);
  return defaultUsers;
}

function saveUsers(usersList: DBUser[]) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(usersList, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing users file:", err);
  }
}

const dbUsers: DBUser[] = loadUsers();
const sessions = new Map<string, DBUser>();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// 1. Auth: Register Route
app.post("/api/auth/register", (req, res) => {
  try {
    const { email, password, fullName, location } = req.body;
    if (!email || !password || !fullName || !location) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = dbUsers.find(u => u.email === normalizedEmail);
    if (existing) {
      return res.status(400).json({ error: "Email already registered." });
    }

    const newUser: DBUser = {
      id: Date.now().toString(),
      email: normalizedEmail,
      fullName,
      location,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString()
    };

    dbUsers.push(newUser);
    saveUsers(dbUsers);

    const token = generateToken();
    sessions.set(token, newUser);

    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.fullName,
        location: newUser.location,
        createdAt: newUser.createdAt
      },
      token
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed." });
  }
});

// 2. Auth: Login Route
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = dbUsers.find(u => u.email === normalizedEmail);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    if (hashPassword(password) !== user.passwordHash) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = generateToken();
    sessions.set(token, user);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        location: user.location,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed." });
  }
});

// Demo login is DISABLED for security — all users must authenticate with real credentials

// 4. Token verification middleware to secure AI endpoints
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ 
      error: req.body.language === "sw" 
        ? "Imeshindwa kutambua utambulisho wako. Tafadhali ingia kwanza." 
        : "Authentication required. Access denied." 
    });
  }

  const session = sessions.get(token);
  if (!session) {
    return res.status(403).json({ 
      error: req.body.language === "sw" 
        ? "Kipindi chako kimeisha au token si sahihi. Tafadhali ingia tena." 
        : "Session expired or invalid authorization token. Please log in again." 
    });
  }

  req.user = session;
  next();
}

// Lazy initialize Gemini AI with safe key verification
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("⚠️ Warning: GEMINI_API_KEY environment variable is not set. AI features will fail until configured.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Diagnosis API Endpoint protected by secure authentication
app.post("/api/diagnose", authenticateToken, async (req, res) => {
  try {
    const { image, mimeType, language, notes } = req.body;

    if (!image || !mimeType) {
      return res.status(400).json({ error: language === "sw" ? "Picha inahitajika." : "Image is required." });
    }

    const ai = getGeminiClient();
    const systemPrompt = language === "sw" 
      ? "Wewe ni daktari bingwa wa mimea na mtaalamu wa magonjwa ya mazao (Plant Pathologist). Chambua picha hii ya jani la mmea na utoe majibu sahihi kwa lugha ya KISWAHILI kulingana na muundo wa JSON ulioombwa. Hakikisha majina ya dawa yanayopendekezwa yanapatikana kwa urahisi sokoni."
      : "You are an expert plant pathologist. Analyze this leaf image and provide a highly accurate diagnosis in ENGLISH according to the requested JSON structure. Ensure recommended medicine/chemical names are clear, accurate, and commonly available.";

    const userPrompt = language === "sw"
      ? `Tafadhali chambua jani hili. Maelezo ya ziada kutoka kwa mkulima: "${notes || "Hakuna maelezo ya ziada"}"`
      : `Please analyze this plant leaf. Additional notes from the farmer: "${notes || "No additional notes"}"`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        plantType: { 
          type: Type.STRING, 
          description: "Jina la mmea (mf. Tomato/Nyanya, Maize/Mahindi)" 
        },
        diseaseName: { 
          type: Type.STRING, 
          description: "Jina la ugonjwa (mf. Early Blight, au 'Mmea Una Afya' kama hakuna ugonjwa)" 
        },
        confidence: { 
          type: Type.INTEGER, 
          description: "Asilimia ya uhakika wa utambuzi (0 - 100)" 
        },
        severity: { 
          type: Type.STRING, 
          description: "Kiwango cha madhara: High (Kali), Medium (Wastani), Low (Chini), au None (Hakuna)" 
        },
        description: { 
          type: Type.STRING, 
          description: "Maelezo ya kina ya ugonjwa huu na jinsi unavyoathiri mmea au jinsi mmea ulivyo na afya." 
        },
        symptoms: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Orodha ya dalili zinazoonekana kwenye jani au mmea."
        },
        treatment: {
          type: Type.OBJECT,
          properties: {
            immediateActions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Hatua za haraka na sahihi za kuchukua mara moja kuzuia kuenea."
            },
            organicRemedies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Dawa za asili au za kikaboni ambazo mkulima anaweza kutengeneza mwenyewe."
            },
            chemicalOptions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Aina za dawa za kisasa/kemikali zinazofaa sokoni (pamoja na maelekezo ya matumizi)."
            },
            preventiveMeasures: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Hatua za muda mrefu za kuzuia ugonjwa usijirudie msimu ujao."
            }
          },
          required: ["immediateActions", "organicRemedies", "chemicalOptions", "preventiveMeasures"]
        }
      },
      required: ["plantType", "diseaseName", "confidence", "severity", "description", "symptoms", "treatment"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: image,
          },
        },
        {
          text: userPrompt,
        }
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Empty response from Gemini AI.");
    }

    const diagnosisResult = JSON.parse(textOutput);
    res.json(diagnosisResult);

  } catch (error: any) {
    console.error("Diagnosis error:", error);
    res.status(500).json({ 
      error: req.body.language === "sw" 
        ? `Hitilafu imetokea wakati wa kuchambua picha: ${error.message}` 
        : `An error occurred during image analysis: ${error.message}` 
    });
  }
});

// 2. Chat API Endpoint protected by secure authentication
app.post("/api/chat", authenticateToken, async (req, res) => {
  try {
    const { message, history, language } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const ai = getGeminiClient();
    const systemPrompt = language === "sw"
      ? "Wewe ni mtaalamu wa kilimo wa AI (Agricultural Extension Officer AI). Jibu maswali ya mkulima kwa lugha ya Kiswahili, toa ushauri wa vitendo, rahisi kueleweka, na wenye upendo wa kizalendo."
      : "You are an AI Agricultural Extension Officer. Answer the farmer's questions in English, providing practical, easy-to-understand, and supportive agricultural advice.";

    // Convert history format to Gemini format if provided, otherwise simple text query
    const contents = [];
    if (history && Array.isArray(history)) {
      for (const turn of history) {
        contents.push({
          role: turn.role === "user" ? "user" as const : "model" as const,
          parts: [{ text: turn.text }]
        });
      }
    }
    contents.push({ role: "user" as const, parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Vite development server integration / Static files serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[PlantDoctor AI] Server is running on port ${PORT}`);
  });
}

startServer();
