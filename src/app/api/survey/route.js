import { NextResponse } from "next/server";
import { analyzeSurvey } from "@/lib/survey_logic";

/**
 * POST /api/survey
 * Pipeline: 
 * 1. AI Analysis
 * 2. Log to External API (SheetDB/Make) - Async
 * 3. Return result
 */
export async function POST(req) {
    try {
        const data = await req.json();
        const { name, email, major, target_position, ask_scores, situational } = data;

        // Action 1: AI Analysis
        const aiResult = await analyzeSurvey(data);

        // Action 2: Data Logging (Async / Fire and Forget)
        // Field Mapping for SheetDB
        const logData = {
            timestamp: new Date().toLocaleString("vi-VN"),
            name,
            email,
            major,
            target_position,
            score: aiResult.match_score || 0,
            main_gap: aiResult.gaps?.[0]?.explanation || "N/A"
        };

        // Log to external API (SheetDB/Make)
        // Note: We don't await this to keep the response fast for the user
        const SHEETDB_API_URL = "https://sheetdb.io/api/v1/u95p221290299"; // Placeholder / Replace if needed
        fetch(SHEETDB_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: [logData] })
        }).catch(err => console.error("External Logging Failed:", err));

        return NextResponse.json({
            success: true,
            data: aiResult
        });
    } catch (error) {
        console.error("Survey Error:", error);
        return NextResponse.json(
            { error: "Phân tích Survey thất bại" },
            { status: 500 }
        );
    }
}
