"use client";

import { useState } from "react";
import { compareJDs } from "@/lib/api";

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
                {/* Header */}
                <div className="animate-in text-center" style={{ marginBottom: "2rem" }}>
                    <h1 className="headline">Đối chiếu cơ hội</h1>
                    <p className="subheadline mt-1">
                        So sánh tối đa 3 mô tả công việc với hồ sơ của bạn.
                    </p>
                </div>

                {/* CV Input */}
                <div className="card card-elevated animate-in mb-3">
                    <div className="form-group">
                        <label className="form-label">Hồ sơ của bạn (CV)</label>
                        <textarea
                            className="form-textarea"
                            placeholder={"Dán nội dung CV hoặc mô tả kinh nghiệm của bạn...\n\nVí dụ:\n- Kinh nghiệm làm việc, dự án đã tham gia\n- Kỹ năng, công cụ thành thạo\n- Thành tích nổi bật"}
                            value={cvContent}
                            onChange={(e) => setCvContent(e.target.value)}
                            style={{ minHeight: "160px" }}
                        />
                        <span className="form-hint">{cvContent.length} ký tự · Tối thiểu 30</span>
                    </div>
                </div>

                {/* JD Count Selector */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                    <span className="form-label">Số lượng JD:</span>
                    {[1, 2, 3].map((n) => (
                        <button
                            key={n}
                            className={n === activeJds ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"}
                            onClick={() => setActiveJds(n)}
                            style={{ minWidth: 40 }}
                        >
                            {n}
                        </button>
                    ))}
                </div>

                {/* JD Inputs */}
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${activeJds}, 1fr)`, gap: "0.75rem" }}>
                    {Array.from({ length: activeJds }).map((_, i) => (
                        <div key={i} className="card card-elevated animate-in" style={{ animationDelay: `${i * 0.05}s` }}>
                            <div className="caption mb-1">JD {i + 1}</div>
                            <div className="form-row" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: "0.5rem" }}>
                                <input
                                    className="form-input"
                                    placeholder="Chức danh"
                                    value={jds[i].role}
                                    onChange={(e) => updateJD(i, "role", e.target.value)}
                                />
                                <input
                                    className="form-input"
                                    placeholder="Công ty"
                                    value={jds[i].company}
                                    onChange={(e) => updateJD(i, "company", e.target.value)}
                                />
                            </div>
                            <textarea
                                className="form-textarea"
                                placeholder={`Dán nội dung JD ${i + 1} vào đây...`}
                                value={jds[i].content}
                                onChange={(e) => updateJD(i, "content", e.target.value)}
                                style={{ minHeight: "160px" }}
                            />
                            <span className="form-hint mt-1">{jds[i].content.length} ký tự</span>
                        </div>
                    ))}
                </div>

                {/* Submit */}
                <div className="text-center mt-3">
                    <button
                        className="btn btn-primary btn-lg"
                        onClick={handleCompare}
                        disabled={loading || !canSubmit()}
                    >
                        {loading ? (
                            <>
                                <span className="loading-spinner" /> Đang phân tích...
                            </>
                        ) : (
                            "Phân tích & So sánh"
                        )}
                    </button>
                    {loading && (
                        <p className="form-hint mt-2">
                            Quá trình phân tích có thể mất 30-60 giây tùy số lượng JD.
                        </p>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="card mt-3" style={{ borderColor: "var(--accent-red)" }}>
                        <p style={{ color: "var(--accent-red)", fontWeight: 500 }}>Không thể phân tích</p>
                        <p className="body-text">{error}</p>
                    </div>
                )}

                {/* Results */}
                {result && result.comparison && (
                    <div className="animate-in mt-5">
                        {/* Ranking */}
                        <h2 className="headline" style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>
                            Kết quả so sánh
                        </h2>

                        {/* Ranking Cards */}
                        <div style={{ display: "grid", gridTemplateColumns: `repeat(${result.comparison.ranking?.length || 1}, 1fr)`, gap: "0.75rem", marginBottom: "2rem" }}>
                            {result.comparison.ranking
                                ?.sort((a, b) => b.match_score - a.match_score)
                                .map((item, index) => (
                                    <div
                                        key={index}
                                        className="card"
                                        style={{
                                            borderColor: index === 0 ? "var(--accent-green)" : "var(--border-subtle)",
                                            borderWidth: index === 0 ? 2 : 1,
                                            position: "relative",
                                        }}
                                    >
                                        {index === 0 && (
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    top: -1,
                                                    left: "50%",
                                                    transform: "translate(-50%, -50%)",
                                                    background: "var(--accent-green)",
                                                    color: "white",
                                                    padding: "0.125rem 0.625rem",
                                                    borderRadius: "var(--radius-full)",
                                                    fontSize: "0.6875rem",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                Phù hợp nhất
                                            </div>
                                        )}
                                        <div className="text-center" style={{ paddingTop: index === 0 ? "0.5rem" : 0 }}>
                                            <div
                                                style={{
                                                    fontSize: "2.5rem",
                                                    fontWeight: 700,
                                                    color: getScoreColor(item.match_score),
                                                    lineHeight: 1,
                                                }}
                                            >
                                                {item.match_score}%
                                            </div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                                                {item.match_level}
                                            </div>
                                            <div style={{ fontWeight: 600, marginTop: "0.5rem" }}>{item.role}</div>
                                            <p className="body-text" style={{ fontSize: "0.8125rem", marginTop: "0.375rem" }}>
                                                {item.key_reason}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                        </div>

                        {/* Recommendation */}
                        {result.comparison.recommendation && (
                            <div className="guide-card mb-3">
                                <div className="guide-card-title">Khuyến nghị</div>
                                <p className="body-text">{result.comparison.recommendation}</p>
                            </div>
                        )}

                        {/* GAP Analysis per JD */}
                        {result.comparison.gap_analyses?.map((gap, i) => (
                            <div key={i} className="card mb-2">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                                    <div>
                                        <h3 style={{ fontSize: "1.125rem", fontWeight: 600 }}>
                                            {gap.role}
                                            {gap.company && (
                                                <span style={{ fontWeight: 400, color: "var(--text-muted)" }}> — {gap.company}</span>
                                            )}
                                        </h3>
                                        <p className="body-text" style={{ fontSize: "0.875rem" }}>{gap.summary}</p>
                                    </div>
                                    <div
                                        style={{
                                            fontSize: "1.5rem",
                                            fontWeight: 700,
                                            color: getScoreColor(gap.match_score),
                                        }}
                                    >
                                        {gap.match_score}%
                                    </div>
                                </div>

                                {/* Strengths */}
                                {gap.strengths?.length > 0 && (
                                    <div style={{ marginBottom: "1rem" }}>
                                        <div className="caption mb-1">Điểm mạnh</div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                                            {gap.strengths.map((s, j) => (
                                                <div key={j} style={{ padding: "0.5rem 0.75rem", background: "rgba(52, 199, 89, 0.06)", borderRadius: "var(--radius-sm)" }}>
                                                    <span style={{ fontWeight: 500, color: "var(--accent-green)" }}>{s.competency}:</span>{" "}
                                                    <span className="body-text" style={{ fontSize: "0.875rem" }}>{s.assessment}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Gaps */}
                                {gap.gaps?.length > 0 && (
                                    <div style={{ marginBottom: "1rem" }}>
                                        <div className="caption mb-1">Cần bổ sung</div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                                            {gap.gaps.map((g, j) => (
                                                <div key={j} style={{ padding: "0.5rem 0.75rem", background: "rgba(255, 159, 10, 0.06)", borderRadius: "var(--radius-sm)" }}>
                                                    <div>
                                                        <span style={{ fontWeight: 500, color: "var(--accent-orange)" }}>{g.competency}</span>
                                                        <span className="form-hint" style={{ marginLeft: "0.5rem" }}>
                                                            Hiện tại: {g.current_level} → Cần: {g.required_level}
                                                        </span>
                                                    </div>
                                                    <p className="body-text" style={{ fontSize: "0.8125rem", marginTop: "0.25rem" }}>
                                                        {g.recommendation}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Action Plan */}
                                {gap.action_plan?.length > 0 && (
                                    <div>
                                        <div className="caption mb-1">Kế hoạch hành động</div>
                                        <ul className="guide-list">
                                            {gap.action_plan.map((action, j) => (
                                                <li key={j}>{action}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
