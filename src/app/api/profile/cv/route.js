import { NextResponse } from "next/server";
import { generateJSON } from "@/lib/gemini";

export async function POST(request) {
    try {
        const { cv_content } = await request.json();

        if (!cv_content || cv_content.length < 50) {
            return NextResponse.json({ success: false, error: "CV quá ngắn" }, { status: 400 });
        }

        const systemPrompt = `Bạn là chuyên gia phân tích nhân sự của C Factory.
Nhiệm vụ: Phân tích CV của ứng viên và trích xuất "Bản đồ năng lực cơ sở".

## Output Format (JSON)
\`\`\`json
{
    "summary": "<tóm tắt ngắn gọn 1 câu về hồ sơ chuyên môn>",
    "competencies": [
        {
            "name_vi": "<tên năng lực tiếng Việt>",
            "name_en": "<tên năng lực tiếng Anh>",
            "level": <1-5>,
            "level_label": "<Biết|Làm|Thành thạo|Tối ưu|Chuyên gia>",
            "years_exp": <số năm kinh nghiệm nếu có>
        }
    ]
}
\`\`\``;

        const userPrompt = `Hãy phân tích CV sau đây:\n\n${cv_content}`;

        const result = await generateJSON({ systemPrompt, userPrompt });

        return NextResponse.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error("[/api/profile/cv] Error:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
