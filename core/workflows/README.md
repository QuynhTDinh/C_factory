# Workflows — Hướng dẫn

Thư mục này chứa các **workflow** (luồng công việc) cho Agent Factory.

## Workflow là gì?

Workflow là file `.md` mô tả **step-by-step** cách một Agent thực hiện một nhiệm vụ cụ thể.
Agent sẽ load workflow khi cần để đi đúng luồng.

## Format

```yaml
---
name: tên_workflow
description: Mô tả ngắn
agent: Agent nào sử dụng
skills_required: [skill_1, skill_2]
---
```

Tiếp theo là nội dung workflow với các bước cụ thể.

## Cách tạo workflow mới

1. Tạo file `.md` mới trong thư mục này
2. Thêm YAML frontmatter (name, description, agent, skills_required)
3. Viết các bước theo thứ tự
4. Agent sẽ tự động load qua `self.load_workflow("tên_file")`
