---
name: evidence_extractor
description: Trích xuất bằng chứng (evidence) từ văn bản JD hoặc CV
input: Raw text (JD hoặc CV)
output: Danh sách evidence items với loại và context
---

# Skill: Evidence Extractor

## Mục đích
Trích xuất các "bằng chứng" — yêu cầu cụ thể, thành tích, kinh nghiệm — từ văn bản thô.

## Loại Evidence

### Từ JD (Job Description)
| Loại | Mô tả | Ví dụ |
|------|--------|-------|
| `requirement_hard` | Yêu cầu bắt buộc | "Tối thiểu 3 năm kinh nghiệm", "Bắt buộc có chứng chỉ PMP" |
| `requirement_soft` | Yêu cầu mong muốn | "Ưu tiên ứng viên có...", "Nice to have" |
| `responsibility` | Trách nhiệm công việc | "Quản lý team 5-10 người", "Báo cáo trực tiếp cho CEO" |
| `qualification` | Bằng cấp / Chứng chỉ | "Cử nhân CNTT", "IELTS 6.5+" |
| `context` | Bối cảnh công ty | "Startup giai đoạn Series A", "Tập đoàn đa quốc gia" |

### Từ CV (Candidate Profile)
| Loại | Mô tả | Ví dụ |
|------|--------|-------|
| `achievement` | Thành tích có số liệu | "Tăng doanh thu 30%", "Giảm thời gian xử lý 50%" |
| `experience` | Kinh nghiệm làm việc | "3 năm tại vị trí Senior Developer" |
| `project` | Dự án cụ thể | "Dẫn dắt dự án migration hệ thống..." |
| `skill_claim` | Tự đánh giá kỹ năng | "Thành thạo Python, React" |
| `education` | Học vấn | "Thạc sĩ QTKD, ĐH Bách Khoa" |

## Quy tắc trích xuất

1. **Giữ nguyên ngữ cảnh** — trích dẫn đủ để hiểu, không cắt cụt
2. **Phân biệt fact vs. claim** — "3 năm kinh nghiệm" (fact) vs. "kỹ năng giao tiếp tốt" (claim)
3. **Tag priority** cho JD evidence:
   - `high`: Xuất hiện trong tiêu đề/yêu cầu chính, từ "bắt buộc"
   - `medium`: Mô tả chi tiết, từ "ưu tiên"
   - `low`: Nice-to-have hoặc suy luận
4. **Không suy đoán** — chỉ trích xuất cái có trong text
