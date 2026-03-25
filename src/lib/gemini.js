/**
 * C Factory — Gemini LLM Client (server-side)
 * Used by Next.js API routes for Vercel deployment.
 */

import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

let _ai = null;

function getAI() {
    if (!_ai) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY not set");
        _ai = new GoogleGenAI({ apiKey });
    }
    return _ai;
}

/**
 * Load skill/workflow markdown files from core/ directory
 */
export function loadSkill(name) {
    const filepath = path.join(process.cwd(), "core", "skills", `${name}.md`);
    try {
        return fs.readFileSync(filepath, "utf-8");
    } catch {
        return "";
    }
}

export function loadWorkflow(name) {
    const filepath = path.join(process.cwd(), "core", "workflows", `${name}.md`);
    try {
        return fs.readFileSync(filepath, "utf-8");
    } catch {
        return "";
    }
}

/**
 * Generate JSON from Gemini with system + user prompts
 */
export async function generateJSON({ systemPrompt, userPrompt, temperature = 0.1 }) {
    const ai = getAI();

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: userPrompt,
        config: {
            systemInstruction: systemPrompt,
            temperature,
            maxOutputTokens: 8192,
        },
    });

    const text = response.text;

    // Extract JSON from response
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
        return JSON.parse(jsonMatch[1].trim());
    }

    // Try direct parse
    const trimmed = text.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        return JSON.parse(trimmed);
    }

    throw new Error("Could not extract JSON from LLM response");
}
