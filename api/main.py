"""
C Factory — FastAPI Server

Endpoints:
    POST /api/decode          → Phân tích JD
    POST /api/compare         → So sánh nhiều JD với CV
    GET  /api/health          → Health check
"""

import os
import sys
import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add project root to sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(PROJECT_ROOT, ".env"))
except ImportError:
    pass

from core.agents.decoder_agent import DecoderAgent
from core.agents.gap_analyzer import GAPAnalyzer

# ── App Setup ──
app = FastAPI(
    title="C Factory API",
    description="Competency Contextual Factory — Phân tích chuyên sâu năng lực tuyển dụng",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Initialize Agents ──
_decoder_agent = DecoderAgent(llm_provider="gemini")
_gap_analyzer = GAPAnalyzer(llm_provider="gemini")

# ── In-memory history ──
_history: dict = {}


# ── Request Models ──

class JDRequest(BaseModel):
    content: str
    role: Optional[str] = "Không rõ vị trí"
    company: Optional[str] = None
    industry: Optional[str] = None


class JDInput(BaseModel):
    content: str
    role: Optional[str] = None
    company: Optional[str] = None
    industry: Optional[str] = None


class CompareRequest(BaseModel):
    cv_content: str
    jds: List[JDInput]


# ── Routes ──

@app.get("/api/health")
async def health():
    return {
        "status": "healthy",
        "service": "C Factory",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
    }


@app.post("/api/decode")
async def decode_jd(request: JDRequest):
    """Phân tích JD → Competency analysis."""
    jd_data = {
        "content": request.content,
        "role": request.role,
        "company": request.company,
        "industry": request.industry,
    }

    result = _decoder_agent.decode(jd_data)

    record_id = str(uuid.uuid4())[:8]
    _history[record_id] = {
        "id": record_id,
        "type": "decode",
        "input": jd_data,
        "result": result,
        "timestamp": datetime.now().isoformat(),
    }

    return {
        "success": True,
        "record_id": record_id,
        "data": result,
    }


@app.post("/api/compare")
async def compare_jds(request: CompareRequest):
    """So sánh 1-3 JD với CV ứng viên.

    Luồng:
    1. Decode từng JD (nếu chưa decode)
    2. Analyze GAP cho mỗi JD vs CV
    3. Ranking & recommendation
    """
    if len(request.jds) < 1 or len(request.jds) > 3:
        return {"success": False, "error": "Cần 1-3 JD để so sánh."}

    # Step 1: Decode each JD
    decoded_jds = []
    for i, jd in enumerate(request.jds):
        jd_data = {
            "content": jd.content,
            "role": jd.role,
            "company": jd.company,
            "industry": jd.industry,
        }
        decoded = _decoder_agent.decode(jd_data)
        decoded_jds.append(decoded)

    # Step 2 & 3: Compare
    compare_result = _gap_analyzer.compare_jds({
        "cv_content": request.cv_content,
        "decoded_jds": decoded_jds,
    })

    # Save to history
    record_id = str(uuid.uuid4())[:8]
    _history[record_id] = {
        "id": record_id,
        "type": "compare",
        "timestamp": datetime.now().isoformat(),
    }

    return {
        "success": True,
        "record_id": record_id,
        "decoded_jds": decoded_jds,
        "comparison": compare_result,
    }


@app.get("/api/history")
async def list_history():
    records = sorted(
        _history.values(),
        key=lambda x: x["timestamp"],
        reverse=True,
    )
    return {"records": records}
