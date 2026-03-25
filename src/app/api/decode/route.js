/**
 * POST /api/decode — Phân tích JD
 */

import { NextResponse } from "next/server";
import { generateJSON, loadSkill, loadWorkflow } from "@/lib/gemini";

function buildDecoderSystemPrompt() {
    const lominger = loadSkill("lominger_mapping");
    const bloom = loadSkill("bloom_classifier");
    const evidence = loadSkill("evidence_extractor");
    const workflow = loadWorkflow("decode_jd");

    return `Bạn là chuyên gia phân tích năng lực tuyển dụng của C Factory.
Nhiệm vụ: Giúp ỨNG VIÊN hiểu rõ JD (Job Description) đang yêu cầu gì.

## Vai trò
Bạn là "người phiên dịch" — dịch ngôn ngữ tuyển dụng (thường mơ hồ, hàn lâm) sang ngôn ngữ mà ứng viên có thể hiểu và hành động được.

## Nguyên tắc
1. LUÔN đứng về phía ứng viên — giải thích dễ hiểu
2. Chỉ trích xuất từ nội dung JD thực tế, KHÔNG bịa
3. Tiếng Việt là chính, thuật ngữ chuyên ngành giữ tiếng Anh (ghi chú nghĩa)
4. Mỗi competency phải có evidence (trích dẫn từ JD)
5. Tối thiểu 3, tối đa 10 competencies

## Skills (Kỹ năng tham chiếu)

### Lominger Competency Mapping
${lominger}

### Bloom's Taxonomy Classifier
${bloom}

### Evidence Extractor
${evidence}

## Workflow
${workflow}

## Output Format (JSON)
Trả về JSON hợp lệ, KHÔNG có text thừa:

\`\`\`json
{
    "role": "<chức danh>",
    "company": "<công ty nếu có>",
    "industry": "<ngành>",
    "seniority": "<Fresher|Junior|Mid|Senior|Lead|Expert>",
    "difficulty_score": <1-10>,
    "difficulty_label": "<Dễ tiếp cận|Trung bình|Thử thách|Rất khó>",
    "raw_jd_summary": "<tóm tắt JD 2-3 câu bằng ngôn ngữ đơn giản>",
    "competencies": [
        {
            "lominger_id": "<L01-L27 hoặc C01+ cho custom>",
            "name_en": "<tên năng lực tiếng Anh>",
            "name_vi": "<tên năng lực tiếng Việt>",
            "level": <1-5>,
            "level_label": "<Biết|Làm|Tối ưu>",
            "priority": "<high|medium|low>",
            "extracted_from": "<trích dẫn nguyên văn từ JD>",
            "explanation": "<giải thích dễ hiểu cho ứng viên>"
        }
    ],
    "candidate_guide": {
        "must_have_keywords": ["<từ khóa nên có trong CV>"],
        "preparation_tips": ["<lời khuyên chuẩn bị cụ thể>"],
        "red_flags": ["<những điểm lưu ý/cảnh báo nếu có>"]
    }
}
\`\`\``;
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { content, role, company, industry } = body;

        if (!content || content.trim().length < 30) {
            return NextResponse.json(
                { success: false, error: "Nội dung JD quá ngắn (tối thiểu 30 ký tự)" },
                { status: 400 }
            );
        }

        const systemPrompt = buildDecoderSystemPrompt();
        const userPrompt = `## Mô tả Công việc (JD) cần phân tích

${role ? `Chức danh: ${role}` : ""}
${company ? `Công ty: ${company}` : ""}
${industry ? `Ngành: ${industry}` : ""}

${content}

---
Hãy phân tích JD trên và trả về JSON theo format đã quy định.
Nhớ đứng về phía ứng viên — giải thích sao cho người đi tìm việc hiểu được.`;

        const result = await generateJSON({ systemPrompt, userPrompt });

        const recordId = Math.random().toString(36).substring(2, 10);

        return NextResponse.json({
            success: true,
            record_id: recordId,
            data: result,
        });
    } catch (error) {
        console.error("[/api/decode] Error:", error.message);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
