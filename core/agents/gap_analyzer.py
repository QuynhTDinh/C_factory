"""
GAP Analyzer Agent — Phân tích mức độ phù hợp CV vs JD

So sánh hồ sơ ứng viên với yêu cầu công việc đã giải mã.
Tính match score, xác định GAP, đề xuất hành động.
"""

from .base_agent import BaseAgent
from .llm_client import create_llm_client
from core.prompts.gap_prompts import (
    GAP_SYSTEM_PROMPT,
    GAP_USER_TEMPLATE,
    COMPARE_SYSTEM_PROMPT,
    COMPARE_USER_TEMPLATE,
)


class GAPAnalyzer(BaseAgent):
    """Phân tích GAP năng lực giữa CV và JD."""

    def __init__(self, llm_provider="gemini"):
        super().__init__("GAPAnalyzer")
        self.llm = None
        self.llm_provider = llm_provider

    def _ensure_llm(self):
        if self.llm is None:
            self.llm = create_llm_client(self.llm_provider)

    def handle_event(self, event_name, data):
        if event_name == "ANALYZE_GAP":
            return self.analyze_gap(data)
        elif event_name == "COMPARE_JDS":
            return self.compare_jds(data)

    def analyze_gap(self, data):
        """Phân tích GAP giữa CV và 1 JD đã decode.

        Args:
            data: dict chứa:
                - cv_content: str — nội dung CV
                - decoded_jd: dict — kết quả decode JD (từ DecoderAgent)

        Returns:
            dict: match_score, strengths, gaps, action_plan
        """
        cv_content = data.get("cv_content", "")
        decoded_jd = data.get("decoded_jd", {})

        self.log(f"Phân tích GAP: {decoded_jd.get('role', 'N/A')}")

        # Build competencies text
        competencies_text = self._format_competencies(decoded_jd.get("competencies", []))

        user_prompt = GAP_USER_TEMPLATE.format(
            cv_content=cv_content,
            role=decoded_jd.get("role", "Chưa rõ"),
            company=decoded_jd.get("company", "Chưa rõ"),
            seniority=decoded_jd.get("seniority", "Chưa rõ"),
            difficulty=f"{decoded_jd.get('difficulty_label', '')} ({decoded_jd.get('difficulty_score', 'N/A')}/10)",
            competencies_text=competencies_text,
        )

        self._ensure_llm()
        self.log("Đang phân tích mức độ phù hợp...")

        try:
            result = self.llm.generate_json(
                system_prompt=GAP_SYSTEM_PROMPT,
                user_prompt=user_prompt,
                temperature=0.1,
            )
            self.log(f"✓ Match score: {result.get('match_score', 'N/A')}%")
            return result
        except Exception as e:
            self.log(f"✗ Lỗi: {e}")
            return {
                "match_score": 0,
                "match_level": "Lỗi phân tích",
                "summary": f"Không thể phân tích: {str(e)}",
                "strengths": [],
                "gaps": [],
                "action_plan": [],
                "error": str(e),
            }

    def compare_jds(self, data):
        """So sánh nhiều JD với CV, xếp hạng phù hợp.

        Args:
            data: dict chứa:
                - cv_content: str — nội dung CV
                - decoded_jds: list[dict] — danh sách JD đã decode (1-3)

        Returns:
            dict: ranking, gap_analyses (cho mỗi JD), recommendation
        """
        cv_content = data.get("cv_content", "")
        decoded_jds = data.get("decoded_jds", [])

        self.log(f"So sánh {len(decoded_jds)} JD với CV...")

        # Step 1: Analyze GAP for each JD
        gap_analyses = []
        for i, jd in enumerate(decoded_jds):
            self.log(f"  → Phân tích JD {i + 1}: {jd.get('role', 'N/A')}")
            gap = self.analyze_gap({
                "cv_content": cv_content,
                "decoded_jd": jd,
            })
            gap["jd_index"] = i
            gap["role"] = jd.get("role", f"JD {i + 1}")
            gap["company"] = jd.get("company", "")
            gap_analyses.append(gap)

        # Step 2: Compare & Rank
        jds_text = ""
        for i, jd in enumerate(decoded_jds):
            competencies = self._format_competencies(jd.get("competencies", []))
            jds_text += f"\n### JD {i + 1}: {jd.get('role', 'N/A')} — {jd.get('company', '')}\n"
            jds_text += f"Cấp bậc: {jd.get('seniority', 'N/A')} | Độ khó: {jd.get('difficulty_score', 'N/A')}/10\n"
            jds_text += f"Năng lực:\n{competencies}\n"

        compare_prompt = COMPARE_USER_TEMPLATE.format(
            cv_content=cv_content,
            jds_text=jds_text,
        )

        try:
            ranking_result = self.llm.generate_json(
                system_prompt=COMPARE_SYSTEM_PROMPT,
                user_prompt=compare_prompt,
                temperature=0.1,
            )
        except Exception as e:
            self.log(f"✗ Lỗi ranking: {e}")
            ranking_result = {
                "ranking": [{"jd_index": i, "role": jd.get("role", f"JD {i+1}"), "match_score": g.get("match_score", 0), "match_level": g.get("match_level", "N/A"), "key_reason": ""} for i, (jd, g) in enumerate(zip(decoded_jds, gap_analyses))],
                "recommendation": "Không thể xếp hạng.",
                "overall_assessment": "",
            }

        self.log(f"✓ So sánh hoàn tất.")

        return {
            "ranking": ranking_result.get("ranking", []),
            "recommendation": ranking_result.get("recommendation", ""),
            "overall_assessment": ranking_result.get("overall_assessment", ""),
            "gap_analyses": gap_analyses,
        }

    def _format_competencies(self, competencies):
        """Format competencies list cho prompt."""
        lines = []
        for c in competencies:
            name = c.get("name_vi", c.get("name_en", "N/A"))
            level = c.get("level", "?")
            label = c.get("level_label", "")
            priority = c.get("priority", "")
            lines.append(f"- {name} (Level {level} — {label}) [{priority}]")
        return "\n".join(lines) if lines else "Không có dữ liệu."
