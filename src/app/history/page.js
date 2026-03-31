"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { logTrace } from "@/lib/tracing";

export default function HistoryPage() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");

    useEffect(() => {
        const loadHistory = () => {
            setLoading(true);
            try {
                // Get Local History (C Factory Core)
                const localHistory = JSON.parse(localStorage.getItem("cfactory_history") || "[]");

                // Also check if there are SCLS history records
                const sclsHistory = JSON.parse(localStorage.getItem("scls_history") || "[]").map(h => ({
                    id: h.id || Math.random().toString(),
                    type: "Assess",
                    role: h.formData?.target_position || "Survey",
                    company: "HUST SCLS",
                    timestamp: h.timestamp,
                    result: h.result,
                    summary: h.result?.summary || "Survey Completion"
                }));

                const combined = [...localHistory.map(h => ({ ...h, type: h.type || "Decode" })), ...sclsHistory];
                setRecords(combined.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));

                logTrace("History Page Viewed", { count: combined.length });
            } catch (e) {
                console.error("Failed to load history", e);
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, []);

    const filteredRecords = filter === "All"
        ? records
        : records.filter(r => r.type === filter || (filter === "Decode" && r.type === "JD Decode"));

    const formatDate = (dateStr) => {
        try {
            return new Date(dateStr).toLocaleString("vi-VN");
        } catch (e) {
            return dateStr || "N/A";
        }
    };

    return (
        <div className="page" style={{ padding: '2.5rem', minHeight: '100vh', background: '#F5F5F7' }}>
            <div className="container-narrow" style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                    <div>
                        <h1 className="headline" style={{ fontSize: '2.5rem', fontWeight: '800' }}>Lịch sử cá nhân</h1>
                        <p style={{ color: '#86868b', marginTop: '0.5rem' }}>Dữ liệu giải mã và đối chiếu năng lực được lưu cục bộ trên trình duyệt này.</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem' }}>
                    {["All", "Decode", "Compare", "Assess"].map(t => (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            style={{
                                padding: '0.625rem 1.25rem',
                                borderRadius: '100px',
                                border: 'none',
                                background: filter === t ? '#000' : '#fff',
                                color: filter === t ? '#fff' : '#86868b',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: filter === t ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                            }}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '5rem 0' }}>
                        <div className="loading-spinner" style={{ width: '40px', height: '40px', margin: '0 auto' }} />
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {filteredRecords.length === 0 && (
                            <div className="card text-center" style={{ padding: '4rem' }}>
                                <p style={{ color: '#86868b' }}>Chưa có bản ghi nào trên thiết bị này.</p>
                            </div>
                        )}
                        {filteredRecords.map((r, idx) => (
                            <div key={idx} className="card animate-in" style={{ padding: '1.5rem', borderRadius: '18px', background: '#fff', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 6px rgba(0,0,0,0.01)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <span style={{
                                                fontSize: '10px',
                                                fontWeight: '800',
                                                textTransform: 'uppercase',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                background: r.type === 'Decode' ? '#EBF5FF' : r.type === 'Compare' ? '#F0F9F4' : '#FFF5F5',
                                                color: r.type === 'Decode' ? '#007AFF' : r.type === 'Compare' ? '#34C759' : '#FF3B30'
                                            }}>
                                                {r.type}
                                            </span>
                                            <span style={{ fontSize: '12px', color: '#86868b' }}>{formatDate(r.timestamp)}</span>
                                        </div>
                                        <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{r.role} {r.company ? `— ${r.company}` : ''}</div>
                                        <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '4px' }}>{r.summary || `${r.competencyCount} năng lực yêu cầu`}</p>
                                    </div>
                                    {r.result?.match_score && (
                                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#000' }}>{r.result.match_score}%</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <style jsx>{`
                .animate-in { animation: slideUp 0.5s ease-out forwards; }
                @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .loading-spinner { border: 3px solid rgba(0,0,0,0.1); border-top: 3px solid #000; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
