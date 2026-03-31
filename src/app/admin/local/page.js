"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function LocalAdminDashboard() {
    const [traces, setTraces] = useState([]);
    const [history, setHistory] = useState([]);
    const [activeTab, setActiveTab] = useState("traces");

    useEffect(() => {
        const loadLocalData = () => {
            const localTraces = JSON.parse(localStorage.getItem("scls_traces") || "[]");
            const localHistory = JSON.parse(localStorage.getItem("scls_history") || "[]");
            setTraces(localTraces.reverse());
            setHistory(localHistory.reverse());
        };
        loadLocalData();
        // Refresh every 5 seconds for "real-time" feel
        const interval = setInterval(loadLocalData, 5000);
        return () => clearInterval(interval);
    }, []);

    const clearLocalData = () => {
        if (confirm("Bạn có chắc chắn muốn xóa toàn bộ dữ liệu local không?")) {
            localStorage.removeItem("scls_traces");
            localStorage.removeItem("scls_history");
            localStorage.removeItem("scls_current_session");
            setTraces([]);
            setHistory([]);
        }
    };

    return (
        <div style={{ padding: '3rem', minHeight: '100vh', background: '#F5F5F7', fontFamily: '-apple-system, sans-serif' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Local Dashboard</h1>
                        <p style={{ color: '#86868b' }}>Theo dõi dữ liệu và dấu vết người dùng trực tiếp trong trình duyệt.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={clearLocalData} style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1px solid #ff3b30', background: 'transparent', color: '#ff3b30', fontWeight: '700', cursor: 'pointer' }}>
                            Xóa dữ liệu
                        </button>
                        <Link href="/scls-connect" style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: '#000', color: '#fff', fontWeight: '700', textDecoration: 'none' }}>
                            Về Survey
                        </Link>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <button onClick={() => setActiveTab("traces")} style={{ padding: '1rem 2rem', borderRadius: '12px', border: 'none', background: activeTab === "traces" ? "#000" : "#fff", color: activeTab === "traces" ? "#fff" : "#000", fontWeight: '700', cursor: 'pointer' }}>
                        Dấu vết (Traces) [{traces.length}]
                    </button>
                    <button onClick={() => setActiveTab("history")} style={{ padding: '1rem 2rem', borderRadius: '12px', border: 'none', background: activeTab === "history" ? "#000" : "#fff", color: activeTab === "history" ? "#fff" : "#000", fontWeight: '700', cursor: 'pointer' }}>
                        Lịch sử nộp bài [{history.length}]
                    </button>
                </div>

                {activeTab === "traces" && (
                    <div style={{ background: 'white', borderRadius: '24px', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                        <div style={{ overflowY: 'auto', maxHeight: '600px' }}>
                            {traces.length === 0 && <p style={{ textAlign: 'center', color: '#86868b', padding: '3rem' }}>Chưa có dấu vết hành động nào.</p>}
                            {traces.map((t, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '20px', padding: '1.5rem 0', borderBottom: '1px solid #f5f5f7' }}>
                                    <div style={{ color: '#86868b', fontSize: '0.8rem', minWidth: '150px' }}>
                                        {new Date(t.timestamp).toLocaleTimeString()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '700', marginBottom: '4px' }}>
                                            <span style={{ color: '#8B1D1D' }}>[{t.userName}]</span> {t.action}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#86868b' }}>
                                            Step: {t.step} | details: {JSON.stringify(t.details)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "history" && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {history.length === 0 && <p style={{ textAlign: 'center', color: '#86868b', gridColumn: '1/-1', padding: '3rem' }}>Chưa có bản ghi nộp bài nào.</p>}
                        {history.map((h, idx) => (
                            <div key={idx} className="apple-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div style={{ fontWeight: '800' }}>{h.formData.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#86868b' }}>{new Date(h.timestamp).toLocaleDateString()}</div>
                                </div>
                                <div style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                                    <strong>Major:</strong> {h.formData.major}<br />
                                    <strong>Match Score:</strong> {h.result.match_score}%
                                </div>
                                <button
                                    onClick={() => alert(JSON.stringify(h.result, null, 2))}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd', background: '#f5f5f7', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Xem JSON thô
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <style jsx>{`
                .apple-card { transition: all 0.2s; }
                .apple-card:hover { transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
            `}</style>
        </div>
    );
}
