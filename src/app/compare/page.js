"use client";

import { useState } from "react";
import { compareJDs } from "@/lib/api";
import { recordActivity } from "@/lib/db";

const EMPTY_JD = { content: "", role: "", company: "", industry: "" };

export default function ComparePage() {
    const [cvContent, setCvContent] = useState("");
    const [jds, setJds] = useState([{ ...EMPTY_JD }, { ...EMPTY_JD }, { ...EMPTY_JD }]);
    const [activeJds, setActiveJds] = useState(1);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const updateJD = (index, field, value) => {
        const updated = [...jds];
        updated[index] = { ...updated[index], [field]: value };
        setJds(updated);
    };

    const canSubmit = () => {
        if (cvContent.trim().length < 30) return false;
        const filledJds = jds.slice(0, activeJds).filter((j) => j.content.trim().length >= 50);
        return filledJds.length >= 1;
    };

    const handleCompare = async () => {
        if (!canSubmit()) return;
        setLoading(true);
        setError(null);
        setResult(null);

        const filledJds = jds
            .slice(0, activeJds)
            .filter((j) => j.content.trim().length >= 50)
            .map((j) => ({
                content: j.content,
                role: j.role || undefined,
                company: j.company || undefined,
                industry: j.industry || undefined,
            }));

        try {
            const response = await compareJDs({
                cv_content: cvContent,
                jds: filledJds,
            });
            setResult(response);

            // ── Master Database Logging ──
            const bestMatch = response.comparison?.ranking?.[0];
            await recordActivity({
                type: "Compare",
                context: cvContent.substring(0, 50) + "...",
                summary: `So sánh ${filledJds.length} JD. Best: ${bestMatch?.role} (${bestMatch?.match_score}%)`,
                score: bestMatch?.match_score || "",
                payload: response,
                input: { cvContent, jds: filledJds }
            });

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 70) return "var(--accent-green)";
        if (score >= 45) return "var(--accent-orange)";
        return "var(--accent-red)";
    };

    return (
        <div className="page">
            <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "4rem" }}>
                <div className="animate-in text-center" style={{ marginBottom: "2rem" }}>
                    <h1 className="headline">Đối chiếu cơ hội</h1>
                    <p className="subheadline mt-1">So sánh tối đa 3 mô tả công việc với hồ sơ của bạn.</p>
                </div>

                <div className="card card-elevated animate-in mb-3">
                    <div className="form-group">
                        <label className="form-label">Hồ sơ của bạn (CV)</label>
                        <textarea className="form-textarea" placeholder="Dán nội dung CV..." value={cvContent} onChange={(e) => setCvContent(e.target.value)} style={{ minHeight: "160px" }} />
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: `repeat(${activeJds}, 1fr)`, gap: "0.75rem" }}>
                    {jds.slice(0, activeJds).map((jd, i) => (
                        <div key={i} className="card card-elevated animate-in">
                            <div className="caption mb-1">JD {i + 1}</div>
                            <input className="form-input mb-1" placeholder="Chức danh" value={jd.role} onChange={(e) => updateJD(i, "role", e.target.value)} />
                            <textarea className="form-textarea" placeholder="Dán nội dung JD..." value={jd.content} onChange={(e) => updateJD(i, "content", e.target.value)} style={{ minHeight: "160px" }} />
                        </div>
                    ))}
                </div>

                <div className="text-center mt-3">
                    <button className="btn btn-primary btn-lg" onClick={handleCompare} disabled={loading || !canSubmit()}>
                        {loading ? "Đang phân tích..." : "Phân tích & So sánh"}
                    </button>
                </div>

                {error && <div className="card mt-3" style={{ borderColor: "var(--accent-red)" }}><p className="body-text">{error}</p></div>}

                {result && result.comparison && (
                    <div className="animate-in mt-5">
                        <h2 className="headline" style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Kết quả so sánh</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                            {result.comparison.ranking?.map((item, index) => (
                                <div key={index} className="card" style={{ borderColor: getScoreColor(item.match_score), borderWidth: 2 }}>
                                    <div style={{ fontSize: "2rem", fontWeight: 700, color: getScoreColor(item.match_score) }}>{item.match_score}%</div>
                                    <div style={{ fontWeight: 600 }}>{item.role}</div>
                                    <p className="body-text" style={{ fontSize: "0.8rem" }}>{item.key_reason}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
