---
name: bloom_classifier
description: Phân loại mức độ yêu cầu năng lực theo Bloom's Taxonomy
input: Yêu cầu năng lực từ JD + context
output: Level (1-5) + mức dễ hiểu (Biết/Làm/Tối ưu)
---

# Skill: Bloom's Taxonomy Classifier

## Bối cảnh
Bloom's Taxonomy (1956, revised 2001) phân loại mục tiêu nhận thức thành 6 cấp.
Agent Factory ánh xạ sang 5 level + 3 mức dễ hiểu cho ứng viên.

## Thang đo

### Level 1 — Nhận biết (Remember)
- **Mức dễ hiểu**: 🟢 **BIẾT**
- **Từ khóa JD**: nhận biết, hiểu, biết, nắm được, aware, understand
- **Ý nghĩa cho ứng viên**: "Bạn cần BIẾT khái niệm này tồn tại và hiểu ở mức cơ bản"
- **Ví dụ CV**: "Đã tham gia khóa học...", "Hiểu biết về..."

### Level 2 — Hiểu & Áp dụng cơ bản (Understand + Apply)
- **Mức dễ hiểu**: 🟢 **BIẾT**
- **Từ khóa JD**: sử dụng, áp dụng, thực hiện, apply, use, operate, 1-2 năm kinh nghiệm
- **Ý nghĩa cho ứng viên**: "Bạn cần ĐÃ TỪNG LÀM dưới sự hướng dẫn"
- **Ví dụ CV**: "Hỗ trợ triển khai...", "Tham gia dự án..."

### Level 3 — Phân tích & Thực hành độc lập (Analyze)
- **Mức dễ hiểu**: 🟡 **LÀM**
- **Từ khóa JD**: phân tích, đánh giá, quản lý, chịu trách nhiệm, analyze, manage, lead, 3-5 năm
- **Ý nghĩa cho ứng viên**: "Bạn cần CÓ THỂ TỰ LÀM và giải quyết vấn đề"
- **Ví dụ CV**: "Chịu trách nhiệm...", "Quản lý... đạt kết quả..."

### Level 4 — Đánh giá & Tối ưu (Evaluate)
- **Mức dễ hiểu**: 🔴 **TỐI ƯU**
- **Từ khóa JD**: tối ưu, cải tiến, thiết kế hệ thống, chiến lược, optimize, design, strategic, 5+ năm, senior
- **Ý nghĩa cho ứng viên**: "Bạn cần CẢI TIẾN ĐƯỢC và có thành tích chứng minh"
- **Ví dụ CV**: "Tối ưu hóa quy trình giảm 30%...", "Thiết kế hệ thống..."

### Level 5 — Sáng tạo & Dẫn dắt (Create)
- **Mức dễ hiểu**: 🔴 **TỐI ƯU**
- **Từ khóa JD**: xây dựng từ đầu, sáng tạo, innovate, thought leader, architect, build from scratch, expert
- **Ý nghĩa cho ứng viên**: "Bạn cần là CHUYÊN GIA có thể tạo ra cái mới"
- **Ví dụ CV**: "Sáng lập...", "Phát triển phương pháp mới...", "Bằng sáng chế..."

## Quy tắc phân loại

1. **Dựa vào từ khóa hành động** trong JD — không đoán
2. **Kinh nghiệm yêu cầu** là tín hiệu mạnh:
   - Fresher / 0-1 năm → Level 1-2
   - Junior / 1-3 năm → Level 2-3
   - Mid / 3-5 năm → Level 3
   - Senior / 5+ năm → Level 4
   - Expert / Lead → Level 4-5
3. **Nếu mâu thuẫn** (ví dụ: "Junior nhưng yêu cầu thiết kế hệ thống") → ghi nhận mâu thuẫn, chọn level cao hơn
4. **Kết quả định lượng** trong yêu cầu → +1 level (ví dụ: "quản lý team 10 người" → Level 4)

## Mapping 3 mức dễ hiểu

| Level | Mức dễ hiểu | Ý nghĩa |
|-------|------------|---------|
| 1-2 | 🟢 BIẾT | Có kiến thức cơ bản, đã tiếp xúc |
| 3 | 🟡 LÀM | Đã làm được trong thực tế, tự chủ |
| 4-5 | 🔴 TỐI ƯU | Có thể cải tiến, dẫn dắt, tạo mới |
