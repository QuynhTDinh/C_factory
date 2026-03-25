"""
BaseAgent — Standardized base class for all Agent Factory agents.
Supports loading workflows and skills from markdown files.
"""

import os
from abc import ABC, abstractmethod


class BaseAgent(ABC):
    """Lớp cơ sở cho tất cả Agent trong Agent Factory."""

    def __init__(self, name, skills_dir=None, workflows_dir=None):
        self.name = name
        self._skills_dir = skills_dir or self._default_dir("skills")
        self._workflows_dir = workflows_dir or self._default_dir("workflows")
        self._loaded_skills = {}
        self._loaded_workflows = {}

    def _default_dir(self, folder):
        """Tìm thư mục skills/ hoặc workflows/ từ core/."""
        base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        return os.path.join(base, folder)

    def load_skill(self, skill_name):
        """Load một skill từ file markdown.

        Args:
            skill_name: Tên skill (không cần .md), ví dụ 'lominger_mapping'

        Returns:
            str: Nội dung skill (dùng để inject vào prompt)
        """
        if skill_name in self._loaded_skills:
            return self._loaded_skills[skill_name]

        path = os.path.join(self._skills_dir, f"{skill_name}.md")
        if not os.path.exists(path):
            self.log(f"⚠ Skill not found: {path}")
            return ""

        with open(path, "r", encoding="utf-8") as f:
            content = f.read()

        self._loaded_skills[skill_name] = content
        self.log(f"✓ Loaded skill: {skill_name}")
        return content

    def load_workflow(self, workflow_name):
        """Load một workflow từ file markdown.

        Args:
            workflow_name: Tên workflow (không cần .md), ví dụ 'decode_jd'

        Returns:
            str: Nội dung workflow (step-by-step guide)
        """
        if workflow_name in self._loaded_workflows:
            return self._loaded_workflows[workflow_name]

        path = os.path.join(self._workflows_dir, f"{workflow_name}.md")
        if not os.path.exists(path):
            self.log(f"⚠ Workflow not found: {path}")
            return ""

        with open(path, "r", encoding="utf-8") as f:
            content = f.read()

        self._loaded_workflows[workflow_name] = content
        self.log(f"✓ Loaded workflow: {workflow_name}")
        return content

    @abstractmethod
    def handle_event(self, event_name, data):
        """Handle incoming events."""
        pass

    def emit_event(self, event_name, data):
        """Emit results (logged — routing handled by orchestrator)."""
        message = {
            "source": self.name,
            "event": event_name,
            "payload": data,
        }
        self.log(f">>> EMITTING: {event_name}")
        return message

    def log(self, message):
        print(f"[{self.name}] {message}")
