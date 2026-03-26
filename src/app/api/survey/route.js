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

        // Action 2: Data Logging (Await for Vercel Serverless)
        // Field Mapping for Vietnamese Headers in Google Sheet
        const logData = {
            "Mã ứng viên": `SCLS-${Date.now().toString().slice(-6)}`,
            "Họ và tên": name,
            "Email": email,
            "Chuyên ngành": major,
            "Lộ trình nghề nghiệp mong muốn": target_position,
            "Cấp độ năng lực": `${aiResult.match_score || 0}%`,
            "Ghi chú": aiResult.gaps?.[0]?.explanation || "N/A"
        };

        // Log to external API (SheetDB/Make)
        // CRITICAL: We MUST await this on Vercel or the function will terminate before logging is done.
        const SHEETDB_API_URL = process.env.SHEETDB_URL || "https://sheetdb.io/api/v1/u95p221290299";

        try {
            const logResponse = await fetch(SHEETDB_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data: [logData] })
            });
            if (!logResponse.ok) {
                const logErr = await logResponse.text();
                console.error("SheetDB Logging Failed Response:", logErr);
            }
        } catch (err) {
            console.error("External Logging Network Error:", err);
        }

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
