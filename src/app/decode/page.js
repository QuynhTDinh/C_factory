"use client";

import { useState } from "react";
import { decodeJD } from "@/lib/api";

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
            setResult(response.data);

            // Save to history (localStorage)
            try {
                const history = JSON.parse(localStorage.getItem("cfactory_history") || "[]");
                history.unshift({
                    id: response.record_id,
                    role: response.data?.role || role || "Chưa rõ",
                    company: company || response.data?.company || "",
                    seniority: response.data?.seniority || "",
                    competencyCount: response.data?.competencies?.length || 0,
                    timestamp: new Date().toISOString(),
                    result: response.data,
                });
                localStorage.setItem("cfactory_history", JSON.stringify(history.slice(0, 50)));
            } catch (e) {
                // localStorage not available
            }
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
                {/* Header */}
                <div className="animate-in text-center" style={{ marginBottom: "2rem" }}>
                    <h1 className="headline">Phân tích yêu cầu tuyển dụng</h1>
                    <p className="subheadline mt-1">
                        Dán nội dung JD để nhận phân tích chuyên sâu về năng lực yêu cầu.
                    </p>
                </div>

                {/* Input Form */}
                <div className="card card-elevated animate-in" style={{ animationDelay: "0.05s" }}>
                    <div className="form-row" style={{ marginBottom: "0.75rem" }}>
                        <div className="form-group">
                            <label className="form-label">Chức danh</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="VD: Product Manager"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Công ty</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="VD: VNG, FPT"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Ngành</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="VD: Công nghệ"
                                value={industry}
                                onChange={(e) => setIndustry(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Nội dung JD</label>
                        <textarea
                            className="form-textarea"
                            placeholder={"Dán toàn bộ nội dung mô tả công việc vào đây...\n\nVí dụ:\n- Yêu cầu kinh nghiệm, kỹ năng\n- Mô tả trách nhiệm\n- Quyền lợi, điều kiện"}
                            value={jdContent}
                            onChange={(e) => setJdContent(e.target.value)}
                            style={{ minHeight: "220px" }}
                        />
                    </div>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: "1rem",
                        }}
                    >
                        <span className="form-hint">
                            {jdContent.length > 0 ? `${jdContent.length} ký tự` : "Tối thiểu 50 ký tự"}
                        </span>
                        <button
                            className="btn btn-primary"
                            onClick={handleDecode}
                            disabled={loading || jdContent.trim().length < 50}
                        >
                            {loading ? (
                                <>
                                    <span className="loading-spinner" /> Đang phân tích...
                                </>
                            ) : (
                                "Phân tích"
                            )}
                        </button>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div
                        className="card animate-in mt-3"
                        style={{ borderColor: "var(--accent-red)", borderWidth: 1 }}
                    >
                        <p style={{ color: "var(--accent-red)", fontWeight: 500, marginBottom: "0.25rem" }}>
                            Không thể phân tích
                        </p>
                        <p className="body-text">{error}</p>
                    </div>
                )}

                {/* Results */}
                {result && (
                    <div className="animate-in mt-5">
                        {/* Summary */}
                        <div style={{ marginBottom: "2rem" }}>
                            <div className="results-header">
                                <div>
                                    <h2 className="headline" style={{ fontSize: "1.75rem" }}>
                                        {result.role || "Kết quả phân tích"}
                                    </h2>
                                    <p className="body-text mt-1">{result.raw_jd_summary}</p>
                                </div>
                                <div className="results-stats">
                                    <div className="stat-item">
                                        <div className="stat-value">{result.competencies?.length || 0}</div>
                                        <div className="stat-label">Năng lực</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-value">{result.seniority}</div>
                                        <div className="stat-label">Cấp bậc</div>
                                    </div>
                                </div>
                            </div>

                            {result.difficulty_score && (
                                <div className="difficulty-meter">
                                    <span className="form-hint">Độ khó</span>
                                    <div className="difficulty-bar">
                                        <div
                                            className="difficulty-fill"
                                            style={{
                                                width: `${result.difficulty_score * 10}%`,
                                                background: getDifficultyColor(result.difficulty_score),
                                            }}
                                        />
                                    </div>
                                    <span
                                        className="difficulty-label"
                                        style={{ color: getDifficultyColor(result.difficulty_score) }}
                                    >
                                        {result.difficulty_label} ({result.difficulty_score}/10)
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Competency Cards */}
                        <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>
                            Năng lực yêu cầu
                        </h3>
                        <div className="competencies-grid stagger">
                            {result.competencies?.map((comp, index) => {
                                const badge = getPriorityBadge(comp.priority);
                                return (
                                    <div key={index} className="competency-card">
                                        <div className="competency-card-header">
                                            <div>
                                                <div className="competency-card-name">{comp.name_vi}</div>
                                                <div className="competency-card-sub">
                                                    {comp.name_en} · {comp.lominger_id}
                                                </div>
                                            </div>
                                            <span className={`badge ${badge.cls}`}>{badge.text}</span>
                                        </div>

                                        {/* Level */}
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "0.625rem 0" }}>
                                            <span className={`level-tag ${getLevelClass(comp.level_label)}`}>
                                                {comp.level_label} · Level {comp.level}
                                            </span>
                                            <div className="level-bar" style={{ flex: 1 }}>
                                                <div
                                                    className={`level-bar-fill ${getBarClass(comp.level)}`}
                                                    style={{ width: `${comp.level * 20}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div className="competency-card-body">{comp.explanation}</div>

                                        {comp.extracted_from && (
                                            <div className="competency-card-evidence">
                                                {comp.extracted_from}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Candidate Guide */}
                        {result.candidate_guide && (
                            <div className="mt-5">
                                <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "1rem" }}>
                                    Chiến lược chuẩn bị
                                </h3>
                                <div className="guide-grid">
                                    {result.candidate_guide.must_have_keywords?.length > 0 && (
                                        <div className="guide-card">
                                            <div className="guide-card-title">Từ khóa nên có trong CV</div>
                                            <div className="keywords-list">
                                                {result.candidate_guide.must_have_keywords.map((kw, i) => (
                                                    <span key={i} className="keyword-tag">{kw}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {result.candidate_guide.preparation_tips?.length > 0 && (
                                        <div className="guide-card">
                                            <div className="guide-card-title">Gợi ý chuẩn bị</div>
                                            <ul className="guide-list">
                                                {result.candidate_guide.preparation_tips.map((tip, i) => (
                                                    <li key={i}>{tip}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {result.candidate_guide.red_flags?.length > 0 && (
                                        <div className="guide-card">
                                            <div className="guide-card-title">Lưu ý quan trọng</div>
                                            <ul className="guide-list">
                                                {result.candidate_guide.red_flags.map((flag, i) => (
                                                    <li key={i}>{flag}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
