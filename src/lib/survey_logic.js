import fs from "fs";
import path from "path";
import { generateJSON } from "./gemini";

/**
 * Phân tích Survey SCLS Connect 2026
 */
export async function analyzeSurvey(surveyData) {

    // Load matrix from file system
    let matrixContent = "";
    try {
        const matrixPath = path.join(process.cwd(), "core/skills/hust_competency_matrix.md");
        matrixContent = fs.readFileSync(matrixPath, "utf-8");
    } catch (err) {
        matrixContent = "Matrix not found.";
        console.error("Error loading matrix:", err);
    }

    const systemPrompt = `
You are a Career Path Consultant for HUST SCLS (Chemical, Food, Bio, Environment). 
Your task is to analyze a student's survey data and benchmark it against the target position matrix.

BENCHMARK MATRIX:
${matrixContent}

Strictly output valid JSON with the following structure:
{
  "match_score": number (0-100),
  "summary": "Short 1-sentence summary (Vietnamese)",
  "gaps": [
    { "skill": "string", "gap_value": number, "explanation": "string (Vietnamese)" }
  ],
  "recommendations": [
    { "action": "string", "reason": "string (Vietnamese)" }
  ],
  "career_path": "Para-length professional roadmap (Vietnamese)"
}

Tone: Professional, encouraging, academic-friendly. Language: Vietnamese.
`;

    const userPrompt = `
STUDENT DATA:
Name: ${surveyData.name}
Major: ${surveyData.major}
Target Position: ${surveyData.target_position}

ASSESSMENT SCORES (ASK):
${JSON.stringify(surveyData.ask_scores, null, 2)}

SITUATIONAL RESPONSES:
${JSON.stringify(surveyData.situational, null, 2)}

Please perform the Gap Analysis and generate the Career Path report.
`;

    return await generateJSON({ systemPrompt, userPrompt });
}
