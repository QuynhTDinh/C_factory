/**
 * POST /api/compare — So sánh JD với CV
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

## Nguyên tắc
1. LUÔN đứng về phía ứng viên
2. Chỉ trích xuất từ nội dung JD thực tế, KHÔNG bịa
3. Tiếng Việt là chính
4. Mỗi competency phải có evidence
5. Tối thiểu 3, tối đa 10 competencies

## Skills
### Lominger Competency Mapping
${lominger}
### Bloom's Taxonomy Classifier
${bloom}
### Evidence Extractor
${evidence}
## Workflow
${workflow}

## Output Format (JSON)
\`\`\`json
{
    "role": "<chức danh>",
    "company": "<công ty>",
    "seniority": "<Fresher|Junior|Mid|Senior|Lead|Expert>",
    "difficulty_score": <1-10>,
    "difficulty_label": "<Dễ tiếp cận|Trung bình|Thử thách|Rất khó>",
    "raw_jd_summary": "<tóm tắt JD>",
    "competencies": [
        {
            "lominger_id": "<L01-L27>",
            "name_en": "<tên EN>",
            "name_vi": "<tên VN>",
            "level": <1-5>,
            "level_label": "<Biết|Làm|Tối ưu>",
            "priority": "<high|medium|low>",
            "extracted_from": "<trích dẫn từ JD>",
            "explanation": "<giải thích>"
        }
    ],
    "candidate_guide": {
        "must_have_keywords": [],
        "preparation_tips": [],
        "red_flags": []
    }
}
\`\`\``;
}

const GAP_SYSTEM_PROMPT = `Bạn là chuyên gia tư vấn nghề nghiệp của C Factory.
Nhiệm vụ: Phân tích mức độ phù hợp giữa hồ sơ ứng viên và yêu cầu công việc.

## Nguyên tắc
1. Đánh giá khách quan dựa trên evidence từ CV và JD
2. Tiếng Việt là chính, thuật ngữ chuyên ngành giữ tiếng Anh
3. Đưa ra đề xuất cụ thể, hành động được
4. KHÔNG bịa thông tin

## Output Format (JSON)
\`\`\`json
{
    "match_score": <0-100>,
    "match_level": "<Phù hợp cao|Phù hợp|Cần bổ sung|Chưa phù hợp>",
    "summary": "<tóm tắt 2-3 câu>",
    "strengths": [
        { "competency": "<tên>", "evidence_from_cv": "<bằng chứng>", "assessment": "<đánh giá>" }
    ],
    "gaps": [
        { "competency": "<tên>", "required_level": "<level yêu cầu>", "current_level": "<level hiện tại>", "gap_description": "<mô tả GAP>", "recommendation": "<đề xuất>" }
    ],
    "action_plan": ["<hành động cụ thể>"]
}
\`\`\``;

const COMPARE_SYSTEM_PROMPT = `Bạn là chuyên gia tư vấn nghề nghiệp của C Factory.
Nhiệm vụ: So sánh và xếp hạng nhiều cơ hội việc làm cho một ứng viên.

## Output Format (JSON)
\`\`\`json
{
    "ranking": [
        { "jd_index": <0-2>, "role": "<chức danh>", "match_score": <0-100>, "match_level": "<Phù hợp cao|Phù hợp|Cần bổ sung|Chưa phù hợp>", "key_reason": "<lý do>" }
    ],
    "recommendation": "<lời khuyên tổng thể>",
    "overall_assessment": "<đánh giá tổng quan>"
}
\`\`\``;

export async function POST(request) {
    try {
        const body = await request.json();
        const { cv_content, jds } = body;

        if (!cv_content || cv_content.trim().length < 20) {
            return NextResponse.json({ success: false, error: "CV quá ngắn" }, { status: 400 });
        }
        if (!jds || jds.length < 1 || jds.length > 3) {
            return NextResponse.json({ success: false, error: "Cần 1-3 JD" }, { status: 400 });
        }

        const decoderPrompt = buildDecoderSystemPrompt();

        // Step 1: Decode each JD
        const decodedJds = [];
        for (const jd of jds) {
            const userPrompt = `## JD cần phân tích
${jd.role ? `Chức danh: ${jd.role}` : ""}
${jd.company ? `Công ty: ${jd.company}` : ""}
${jd.content}
---
Hãy phân tích JD trên và trả về JSON.`;

            const decoded = await generateJSON({
                systemPrompt: decoderPrompt,
                userPrompt,
            });
            decodedJds.push(decoded);
        }

        // Step 2: GAP analysis for each JD
        const gapAnalyses = [];
        for (let i = 0; i < decodedJds.length; i++) {
            const jd = decodedJds[i];
            const comps = (jd.competencies || [])
                .map((c) => `- ${c.name_vi} (Level ${c.level} — ${c.level_label}) [${c.priority}]`)
                .join("\n");

            const gapPrompt = `## Hồ sơ ứng viên (CV)
${cv_content}

---

## Yêu cầu công việc
**Chức danh**: ${jd.role || "N/A"}
**Cấp bậc**: ${jd.seniority || "N/A"}
**Độ khó**: ${jd.difficulty_label || ""} (${jd.difficulty_score || "N/A"}/10)

### Năng lực yêu cầu:
${comps || "Không có dữ liệu"}

---
Hãy phân tích mức độ phù hợp và trả về JSON.`;

            const gap = await generateJSON({
                systemPrompt: GAP_SYSTEM_PROMPT,
                userPrompt: gapPrompt,
            });
            gap.jd_index = i;
            gap.role = jd.role || `JD ${i + 1}`;
            gap.company = jd.company || "";
            gapAnalyses.push(gap);
        }

        // Step 3: Ranking
        const jdsText = decodedJds
            .map((jd, i) => {
                const comps = (jd.competencies || [])
                    .map((c) => `- ${c.name_vi} (Level ${c.level})`)
                    .join("\n");
                return `### JD ${i + 1}: ${jd.role || "N/A"} — ${jd.company || ""}
Cấp bậc: ${jd.seniority || "N/A"} | Độ khó: ${jd.difficulty_score || "N/A"}/10
${comps}`;
            })
            .join("\n\n");

        let rankingResult;
        try {
            rankingResult = await generateJSON({
                systemPrompt: COMPARE_SYSTEM_PROMPT,
                userPrompt: `## Hồ sơ ứng viên\n${cv_content}\n\n---\n\n## Cơ hội việc làm\n${jdsText}\n\n---\nHãy so sánh, xếp hạng và trả về JSON.`,
            });
        } catch {
            rankingResult = {
                ranking: gapAnalyses.map((g, i) => ({
                    jd_index: i,
                    role: g.role,
                    match_score: g.match_score || 0,
                    match_level: g.match_level || "N/A",
                    key_reason: "",
                })),
                recommendation: "",
                overall_assessment: "",
            };
        }

        return NextResponse.json({
            success: true,
            record_id: Math.random().toString(36).substring(2, 10),
            decoded_jds: decodedJds,
            comparison: {
                ranking: rankingResult.ranking || [],
                recommendation: rankingResult.recommendation || "",
                overall_assessment: rankingResult.overall_assessment || "",
                gap_analyses: gapAnalyses,
            },
        });
    } catch (error) {
        console.error("[/api/compare] Error:", error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
