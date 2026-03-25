---
name: decode_jd
description: Giải mã JD từ ngôn ngữ tuyển dụng sang Ngôn ngữ Năng lực
agent: DecoderAgent
skills_required: [lominger_mapping, bloom_classifier, evidence_extractor]
---

# Workflow: Decode JD (Giải mã Mô tả Công việc)

## Mục tiêu
Giúp ứng viên hiểu rõ JD đang yêu cầu gì, ở mức độ nào, và cần chuẩn bị những gì.

## Luồng xử lý

### Bước 1: Tiếp nhận JD
- Input: Nội dung JD (raw text) + metadata (chức danh, công ty, ngành)
- Validate: Đảm bảo JD có nội dung đủ dài (tối thiểu 50 ký tự)

### Bước 2: Trích xuất yêu cầu
- Sử dụng skill `evidence_extractor` để trích xuất các yêu cầu từ JD
- Phân loại: Yêu cầu bắt buộc vs. Ưu tiên vs. Nice-to-have

### Bước 3: Map sang Lominger Competencies
- Sử dụng skill `lominger_mapping` để map từng yêu cầu sang competency tương ứng
- Gán mã competency (ví dụ: "Problem Solving", "Strategic Agility", "Drive for Results")

### Bước 4: Phân loại Level theo Bloom's Taxonomy
- Sử dụng skill `bloom_classifier` để xác định level yêu cầu cho từng competency
- Map sang 3 mức dễ hiểu:
  - **Biết** (Level 1-2): Nhận biết, hiểu — "Có kiến thức cơ bản"
  - **Làm** (Level 3): Áp dụng, phân tích — "Đã làm được trong thực tế"
  - **Tối ưu** (Level 4-5): Đánh giá, sáng tạo — "Có thể cải tiến/dẫn dắt"

### Bước 5: Tạo báo cáo "May đo"
- Output JSON chứa:
  - `competencies`: Danh sách năng lực + level
  - `candidate_guide`: Hướng dẫn chuẩn bị CV cho ứng viên
  - `keywords`: Từ khóa nên có trong CV
  - `difficulty_assessment`: Độ khó tổng thể của JD
  - `raw_jd_summary`: Tóm tắt JD 2-3 câu

### Bước 6: Emit kết quả
- Event: `JD_DECODED`
- Payload: Structured JSON result

## Quy tắc
1. KHÔNG bịa năng lực — chỉ trích xuất từ nội dung JD thực tế
2. Nếu JD quá ngắn/mơ hồ → suy luận từ chức danh + ngành nhưng đánh dấu là "suy luận"
3. Tối thiểu 3 competencies, tối đa 10
4. Luôn giải thích bằng tiếng Việt dễ hiểu (thuật ngữ chuyên ngành giữ tiếng Anh)
