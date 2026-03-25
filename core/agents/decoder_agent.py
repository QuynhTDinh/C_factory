"""
DecoderAgent — Module A: Giải mã JD sang Ngôn ngữ Năng lực

Dịch JD từ ngôn ngữ tuyển dụng sang ngôn ngữ mà ứng viên hiểu được.
Sử dụng: Lominger competencies, Bloom's Taxonomy, Evidence extraction.
"""

from .base_agent import BaseAgent
from .llm_client import create_llm_client
from core.prompts.decoder_prompts import build_decoder_system_prompt, DECODER_USER_TEMPLATE


class DecoderAgent(BaseAgent):
    """Module A: The Decoder — Giải mã & May đo JD cho ứng viên."""

    def __init__(self, llm_provider="gemini"):
        super().__init__("DecoderAgent")
        self.llm = None
        self.llm_provider = llm_provider
        self._system_prompt = None

    def _ensure_llm(self):
        """Lazy-init LLM client."""
        if self.llm is None:
            self.llm = create_llm_client(self.llm_provider)

    def _build_system_prompt(self):
        """Build system prompt by injecting skills & workflow."""
        if self._system_prompt is not None:
            return self._system_prompt

        # Load skills
        lominger = self.load_skill("lominger_mapping")
        bloom = self.load_skill("bloom_classifier")
        evidence = self.load_skill("evidence_extractor")

        # Load workflow
        workflow = self.load_workflow("decode_jd")

        self._system_prompt = build_decoder_system_prompt(
            lominger_skill=lominger,
            bloom_skill=bloom,
            evidence_skill=evidence,
            workflow=workflow,
        )
        return self._system_prompt

    def handle_event(self, event_name, data):
        """Handle incoming events."""
        if event_name == "JD_SUBMITTED":
            return self.decode(data)

    def decode(self, jd_data):
        """Giải mã JD thành ma trận năng lực cho ứng viên.

        Args:
            jd_data: dict chứa ít nhất 'content' (nội dung JD).
                     Optional: 'role', 'company', 'industry'.

        Returns:
            dict: Kết quả giải mã với competencies, guide, và metadata.
        """
        role = jd_data.get("role") or jd_data.get("title", "Không rõ vị trí")
        self.log(f"Giải mã JD: {role}")

        # Build JD content string
        jd_parts = []
        if jd_data.get("role") or jd_data.get("title"):
            jd_parts.append(f"**Chức danh**: {role}")
        if jd_data.get("company"):
            jd_parts.append(f"**Công ty**: {jd_data['company']}")
        if jd_data.get("industry"):
            jd_parts.append(f"**Ngành**: {jd_data['industry']}")

        content = (
            jd_data.get("content")
            or jd_data.get("text")
            or jd_data.get("description", "")
        )
        if content:
            jd_parts.append(f"\n**Nội dung JD**:\n{content}")

        jd_content = "\n".join(jd_parts) if jd_parts else "Không có nội dung JD."

        # Build prompts
        system_prompt = self._build_system_prompt()
        user_prompt = DECODER_USER_TEMPLATE.format(jd_content=jd_content)

        # Call LLM
        self._ensure_llm()
        self.log("Đang gọi AI giải mã JD...")

        try:
            result = self.llm.generate_json(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=0.1,
            )
            competency_count = len(result.get("competencies", []))
            self.log(f"✓ Giải mã xong: {competency_count} năng lực được trích xuất.")

        except Exception as e:
            self.log(f"✗ Lỗi khi gọi AI: {e}")
            result = {
                "role": role,
                "company": jd_data.get("company"),
                "industry": jd_data.get("industry"),
                "competencies": [],
                "raw_jd_summary": "Giải mã JD thất bại.",
                "candidate_guide": {
                    "must_have_keywords": [],
                    "preparation_tips": [],
                    "red_flags": [],
                },
                "error": str(e),
            }

        return result
