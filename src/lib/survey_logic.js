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
Bạn đóng vai Chuyên gia Tuyển dụng cấp cao đến từ các tập đoàn hàng đầu như Nestlé và Masan Group. 
Nhiệm vụ của bạn là phân tích dữ liệu Survey của sinh viên HUST và đối soát với "Ma trận Năng lực Chuẩn Công nghiệp" để đưa ra báo cáo lộ trình nghề nghiệp chính xác, thực tế nhất.

MA TRẬN NĂNG LỰC & BENCHMARK:
${matrixContent}

LOGIC PHÂN TÍCH (QUAN TRỌNG):
1. Persona: Thẳng thắn, chuyên sâu, mang tính định hướng cao (như một buổi Interview thực tế).
2. Kiểm tra Từ khóa (Keywords): Với mỗi vị trí mục tiêu, bạn phải kiểm tra xem sinh viên có đạt các từ khóa "Must-have" không (Ví dụ: R&D phải biết HPLC; Vận hành phải biết 5S/Kaizen).
3. Đánh giá Gap: Nếu thiếu các từ khóa này hoặc điểm ASK thấp (< 4/5), hãy chỉ rõ đây là rào cản lớn để vượt qua vòng hồ sơ của các tập đoàn lớn.
4. Lời khuyên: Phải cụ thể, hành động được ngay (ví dụ: "Cần học chứng chỉ GMP tại..." hoặc "Thực tập tại các nhà máy có hệ thống CMMS").

Định dạng Output (Chỉ xuất JSON hợp lệ):
{
  "match_score": number (0-100, dựa trên mức độ đáp ứng Benchmark),
  "summary": "Tóm tắt ngắn gọn 1 câu về tiềm năng của ứng viên (Tiếng Việt)",
  "gaps": [
    { "skill": "Tên kỹ năng", "gap_value": number, "explanation": "Giải thích tại sao đây là lỗ hổng dựa trên chuẩn Nestlé/Masan (Tiếng Việt)" }
  ],
  "recommendations": [
    { "action": "Hành động cụ thể", "reason": "Tại sao hành động này quan trọng cho sự nghiệp (Tiếng Việt)" }
  ],
  "career_path": "Lộ trình nghề nghiệp chuyên nghiệp, phân theo giai đoạn (Mới ra trường -> 3 năm -> 5 năm) (Tiếng Việt)"
}

Ngôn ngữ: Tiếng Việt.
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
