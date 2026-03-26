import os
import json
from .base_agent import BaseAgent
from .llm_client import LLMClient

class SurveyAgent(BaseAgent):
    """
    SurveyAgent - Phân tích dữ liệu survey SCLS Connect 2026.
    Thực hiện Gap Analysis giữa năng lực SV và Matrix chuẩn.
    """
    
    def __init__(self, api_key=None, model="gemini-2.0-flash"):
        self.llm = LLMClient(api_key=api_key, model=model)
        self.matrix_path = os.path.join(os.path.dirname(__file__), "..", "skills", "hust_competency_matrix.md")
        self._load_matrix()

    def _load_matrix(self):
        try:
            with open(self.matrix_path, "r", encoding="utf-8") as f:
                self.matrix_content = f.read()
        except Exception:
            self.matrix_content = "Matrix not found."

    def analyze(self, survey_data):
        """
        Input: survey_data (Identity, Mapping, ASK, Situational)
        Output: JSON (match_score, gaps, recommendations, career_path)
        """
        
        system_prompt = f"""
You are a Career Path Consultant for HUST SCLS (Chemical, Food, Bio, Environment). 
Your task is to analyze a student's survey data and benchmark it against the target position matrix.

BENCHMARK MATRIX:
{self.matrix_content}

Strictly output JSON with the following structure:
{{
  "match_score": number (0-100),
  "summary": "Short 1-sentence summary",
  "gaps": [
    {{ "skill": "string", "gap_value": number, "explanation": "string" }}
  ],
  "recommendations": [
    {{ "action": "string", "reason": "string" }}
  ],
  "career_path": "Para-length professional roadmap"
}}

Tone: Professional, encouraging, academic-friendly. Language: Vietnamese.
"""

        user_prompt = f"""
STUDENT DATA:
Name: {survey_data.get('name')}
Major: {survey_data.get('major')}
Target Position: {survey_data.get('target_position')}

ASSESSMENT SCORES (ASK):
{json.dumps(survey_data.get('ask_scores'), indent=2)}

SITUATIONAL RESPONSES:
{json.dumps(survey_data.get('situational'), indent=2)}

Please perform the Gap Analysis and generate the Career Path report.
"""

        result = self.llm.generate_json(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.1
        )
        return result
