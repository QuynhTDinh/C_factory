"use client";

import { useState, useEffect } from "react";

export default function HistoryPage() {
    const [records, setRecords] = useState([]);

    useEffect(() => {
        try {
            const history = JSON.parse(localStorage.getItem("cfactory_history") || "[]");
            setRecords(history);
        } catch {
            setRecords([]);
        }
    }, []);

    const deleteRecord = (id) => {
        const updated = records.filter((r) => r.id !== id);
        setRecords(updated);
        localStorage.setItem("cfactory_history", JSON.stringify(updated));
    };

    const clearAll = () => {
        setRecords([]);
        localStorage.removeItem("cfactory_history");
    };

    const [expandedId, setExpandedId] = useState(null);

    const formatDate = (iso) => {
        const d = new Date(iso);
        return d.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="page">
            <div className="container-narrow" style={{ paddingTop: "2.5rem", paddingBottom: "4rem" }}>
                <div className="animate-in" style={{ marginBottom: "2rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <h1 className="headline">Lịch sử phân tích</h1>
                            <p className="subheadline mt-1">
                                {records.length > 0
                                    ? `${records.length} kết quả đã lưu`
                                    : "Chưa có kết quả nào."}
                            </p>
                        </div>
                        {records.length > 0 && (
                            <button className="btn btn-outline btn-sm" onClick={clearAll}>
                                Xóa tất cả
                            </button>
                        )}
                    </div>
                </div>

                {records.length === 0 && (
                    <div className="card text-center" style={{ padding: "3rem" }}>
                        <p className="body-text" style={{ marginBottom: "1rem" }}>
                            Bạn chưa thực hiện phân tích nào.
                        </p>
                        <a href="/decode" className="btn btn-primary">
                            Bắt đầu phân tích
                        </a>
                    </div>
                )}

                <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                    {records.map((record) => (
                        <div key={record.id} className="card" style={{ cursor: "pointer" }}>
                            {/* Summary row */}
                            <div
                                onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}
                                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                            >
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600 }}>
                                        {record.role}
                                        {record.company && (
                                            <span style={{ fontWeight: 400, color: "var(--text-muted)" }}>
                                                {" "}— {record.company}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: "flex", gap: "1rem", marginTop: "0.25rem" }}>
                                        <span className="form-hint">{formatDate(record.timestamp)}</span>
                                        <span className="form-hint">{record.competencyCount} năng lực</span>
                                        {record.seniority && <span className="form-hint">{record.seniority}</span>}
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <button
                                        className="btn btn-outline btn-sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteRecord(record.id);
                                        }}
                                        style={{ padding: "0.375rem 0.75rem", fontSize: "0.75rem" }}
                                    >
                                        Xóa
                                    </button>
                                    <span style={{ fontSize: "0.875rem", color: "var(--text-muted)", transform: expandedId === record.id ? "rotate(90deg)" : "none", transition: "transform 0.2s" }}>
                                        ›
                                    </span>
                                </div>
                            </div>

                            {/* Expanded detail */}
                            {expandedId === record.id && record.result && (
                                <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border-subtle)" }}>
                                    <p className="body-text mb-2">{record.result.raw_jd_summary}</p>

                                    {record.result.difficulty_score && (
                                        <div className="difficulty-meter mb-2">
                                            <span className="form-hint">Độ khó</span>
                                            <div className="difficulty-bar">
                                                <div
                                                    className="difficulty-fill"
                                                    style={{
                                                        width: `${record.result.difficulty_score * 10}%`,
                                                        background: record.result.difficulty_score <= 5 ? "var(--accent-green)" : "var(--accent-red)",
                                                    }}
                                                />
                                            </div>
                                            <span className="difficulty-label">
                                                {record.result.difficulty_label} ({record.result.difficulty_score}/10)
                                            </span>
                                        </div>
                                    )}

                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                                        {record.result.competencies?.map((comp, i) => (
                                            <span key={i} className={`level-tag ${comp.level <= 2 ? "level-know" : comp.level === 3 ? "level-do" : "level-optimize"}`}>
                                                {comp.name_vi} · L{comp.level}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
