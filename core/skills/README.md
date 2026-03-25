# Skills — Hướng dẫn

Thư mục này chứa các **skill** (kỹ năng tái sử dụng) cho Agent Factory.

## Skill là gì?

Skill là file `.md` chứa **logic chuyên biệt** mà nhiều Agent có thể dùng chung.
Nội dung skill được inject vào prompt của LLM thay vì hardcode trong Agent.

## Format

```yaml
---
name: tên_skill
description: Mô tả ngắn
input: Mô tả input
output: Mô tả output
---
```

Tiếp theo là nội dung skill: logic, rubric, ví dụ.

## Cách tạo skill mới

1. Tạo file `.md` mới trong thư mục này
2. Thêm YAML frontmatter (name, description, input, output)
3. Viết logic/rubric/examples
4. Agent sẽ tự động load qua `self.load_skill("tên_file")`

## Danh sách skills

| Skill | Mục đích | Agent sử dụng |
|-------|---------|---------------|
| `lominger_mapping` | Map keywords → Lominger competencies | DecoderAgent |
| `bloom_classifier` | Classify level theo Bloom's Taxonomy | DecoderAgent |
| `evidence_extractor` | Extract evidence từ text | DecoderAgent, MapperAgent |
| `dreyfus_scorer` | Score theo Dreyfus Model (1-5) | MapperAgent |
| `star_generator` | Generate STAR questions | DiscoveryAgent |
| `company_profiler` | Profile company "vibe" | ContextEngine |
