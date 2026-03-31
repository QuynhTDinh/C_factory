"use client";

import { useState } from "react";
import { decodeJD } from "@/lib/api";
import { recordActivity } from "@/lib/db";

export default function DecodePage() {
    const [jdContent, setJdContent] = useState("");
    const [role, setRole] = useState("");
    const [company, setCompany] = useState("");
    const [industry, setIndustry] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleDecode = async () => {
        if (!jdContent.trim() || jdContent.trim().length < 50) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await decodeJD({
                content: jdContent,
                role: role || undefined,
                company: company || undefined,
                industry: industry || undefined,
            });
            const decodedData = response.data;
            setResult(decodedData);

            // ── Master Database Logging ──
            await recordActivity({
                type: "Decode",
                context: decodedData.role || role || "N/A",
                summary: `${decodedData.competencies?.length || 0} năng lực, Cấp bậc: ${decodedData.seniority}`,
                score: decodedData.difficulty_score || "",
                payload: decodedData,
                input: { jdContent, role, company, industry }
            });

            // Save to history (localStorage - legacy support)
            try {
                const history = JSON.parse(localStorage.getItem("cfactory_history") || "[]");
                history.unshift({
                    id: response.record_id || Date.now(),
                    role: decodedData.role || role || "Chưa rõ",
                    company: company || decodedData.company || "",
                    seniority: decodedData.seniority || "",
                    competencyCount: decodedData.competencies?.length || 0,
                    timestamp: new Date().toISOString(),
                    result: decodedData,
                });
                localStorage.setItem("cfactory_history", JSON.stringify(history.slice(0, 50)));
            } catch (e) { }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getLevelClass = (label) => {
        if (label === "Biết") return "level-know";
        if (label === "Làm") return "level-do";
        if (label === "Tối ưu") return "level-optimize";
        return "";
    };

    const getBarClass = (level) => {
        if (level <= 2) return "green";
        if (level === 3) return "orange";
        return "red";
    };

    const getPriorityBadge = (priority) => {
        if (priority === "high") return { cls: "badge-required", text: "Bắt buộc" };
        if (priority === "medium") return { cls: "badge-preferred", text: "Ưu tiên" };
        return { cls: "badge-optional", text: "Nên có" };
    };

    const getDifficultyColor = (score) => {
        if (score <= 3) return "var(--accent-green)";
        if (score <= 5) return "var(--accent-orange)";
        if (score <= 7) return "#E8720C";
        return "var(--accent-red)";
    };

    return (
        <div className="page">
            <div className="container-narrow" style={{ paddingTop: "2.5rem", paddingBottom: "4rem" }}>
                <div className="animate-in text-center" style={{ marginBottom: "2rem" }}>
                    <h1 className="headline">Phân tích yêu cầu tuyển dụng</h1>
                    <p className="subheadline mt-1">Dán nội dung JD để nhận phân tích chuyên sâu về năng lực yêu cầu.</p>
                </div>

                <div className="card card-elevated animate-in">
                    <div className="form-row" style={{ marginBottom: "0.75rem" }}>
                        <div className="form-group">
                            <label className="form-label">Chức danh</label>
                            <input className="form-input" placeholder="VD: Product Manager" value={role} onChange={(e) => setRole(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Công ty</label>
                            <input className="form-input" placeholder="VD: VNG, FPT" value={company} onChange={(e) => setCompany(e.target.value)} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Nội dung JD</label>
                        <textarea className="form-textarea" placeholder="Dán nội dung JD..." value={jdContent} onChange={(e) => setJdContent(e.target.value)} style={{ minHeight: "220px" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
                        <button className="btn btn-primary" onClick={handleDecode} disabled={loading || jdContent.trim().length < 50}>
                            {loading ? "Đang phân tích..." : "Phân tích"}
                        </button>
                    </div>
                </div>

                {error && <div className="card animate-in mt-3" style={{ borderColor: "var(--accent-red)" }}><p className="body-text">{error}</p></div>}

                {result && (
                    <div className="animate-in mt-5">
                        <h2 className="headline" style={{ fontSize: "1.75rem" }}>{result.role || "Kết quả phân tích"}</h2>
                        <p className="body-text mt-1">{result.raw_jd_summary}</p>

                        <div className="competencies-grid stagger mt-3">
                            {result.competencies?.map((comp, index) => {
                                const badge = getPriorityBadge(comp.priority);
                                return (
                                    <div key={index} className="competency-card">
                                        <div className="competency-card-header">
                                            <div>
                                                <div className="competency-card-name">{comp.name_vi}</div>
                                                <div className="competency-card-sub">{comp.name_en}</div>
                                            </div>
                                            <span className={`badge ${badge.cls}`}>{badge.text}</span>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "0.625rem 0" }}>
                                            <span className={`level-tag ${getLevelClass(comp.level_label)}`}>{comp.level_label} · L{comp.level}</span>
                                        </div>
                                        <div className="competency-card-body">{comp.explanation}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
