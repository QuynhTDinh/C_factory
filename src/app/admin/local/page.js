"use client";

import { useState, useEffect } from "react";
import { getTraces, clearAllLocalData } from "@/lib/tracing";
import Link from "next/link";

export default function LocalAdminDashboard() {
    const [traces, setTraces] = useState([]);
    const [selectedTrace, setSelectedTrace] = useState(null);
    const [activeFilter, setActiveFilter] = useState("All");

    useEffect(() => {
        const loadTraces = () => {
            const data = getTraces();
            setTraces(data);
        };
        loadTraces();
        const interval = setInterval(loadTraces, 3000);
        return () => clearInterval(interval);
    }, []);

    const filteredTraces = activeFilter === "All"
        ? traces
        : traces.filter(t => t.action.includes(activeFilter));

    const handleClear = () => {
        if (confirm("Xóa toàn bộ dấu vết local?")) {
            clearAllLocalData();
            setTraces([]);
        }
    };

    return (
        <div style={{ padding: '2.5rem', minHeight: '100vh', background: '#F5F5F7', fontFamily: '-apple-system, system-ui' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.02em' }}>C Factory Trace Console</h1>
                        <p style={{ color: '#86868b', marginTop: '0.5rem' }}>Theo dõi hành vi và dữ liệu local trực tiếp (Option 0).</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={handleClear} style={{ background: '#fff', border: '1px solid #ff3b30', color: '#ff3b30', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}>Xóa sạch Local</button>
                        <Link href="/decode" style={{ background: '#000', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: '600', textDecoration: 'none' }}>Về Giải mã JD</Link>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem' }}>
                    {["All", "Decode", "Match", "Error", "Survey"].map(f => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            style={{
                                padding: '0.6rem 1.2rem',
                                borderRadius: '100px',
                                border: 'none',
                                background: activeFilter === f ? '#000' : '#fff',
                                color: activeFilter === f ? '#fff' : '#86868b',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: activeFilter === f ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: selectedTrace ? '1fr 1.2fr' : '1fr', gap: '2rem' }}>
                    {/* Trace List */}
                    <div style={{ background: '#fff', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', overflowY: 'auto', maxHeight: '750px' }}>
                        {filteredTraces.length === 0 && <p style={{ textAlign: 'center', padding: '4rem', color: '#86868b' }}>Chưa có bản ghi nào.</p>}
                        {filteredTraces.map((t, idx) => (
                            <div
                                key={idx}
                                onClick={() => setSelectedTrace(t)}
                                style={{
                                    padding: '1.25rem',
                                    borderBottom: '1px solid #f5f5f7',
                                    cursor: 'pointer',
                                    background: selectedTrace?.id === t.id ? '#F5F5F7' : 'transparent',
                                    borderRadius: '12px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                    <span style={{
                                        fontSize: '10px',
                                        fontWeight: '800',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        background: t.action.includes('Success') ? '#F0F9F4' : t.action.includes('Error') ? '#FFF5F5' : '#EBF5FF',
                                        color: t.action.includes('Success') ? '#34C759' : t.action.includes('Error') ? '#FF3B30' : '#007AFF',
                                        textTransform: 'uppercase'
                                    }}>{t.action}</span>
                                    <span style={{ fontSize: '12px', color: '#86868b' }}>{new Date(t.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <div style={{ fontWeight: '700', fontSize: '1rem' }}>{t.details.role || t.details.best_match || "Action Start"}</div>
                                {t.details.company && <div style={{ fontSize: '0.85rem', color: '#86868b' }}>{t.details.company}</div>}
                            </div>
                        ))}
                    </div>

                    {/* Inspector Panel */}
                    {selectedTrace && (
                        <div style={{ background: '#fff', borderRadius: '24px', padding: '2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', position: 'sticky', top: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <div>
                                    <h2 style={{ fontWeight: '800' }}>Trace Inspector</h2>
                                    <code style={{ fontSize: '0.8rem', color: '#86868b' }}>ID: {selectedTrace.id}</code>
                                </div>
                                <button onClick={() => setSelectedTrace(null)} style={{ border: 'none', background: '#F5F5F7', padding: '0.5rem 1rem', borderRadius: '10px', cursor: 'pointer' }}>Đóng ×</button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ background: '#F9F9FB', padding: '1.5rem', borderRadius: '16px' }}>
                                    <h4 style={{ marginBottom: '0.5rem', opacity: 0.6 }}>Thông tin cơ bản</h4>
                                    <p><strong>Path:</strong> {selectedTrace.path}</p>
                                    <p><strong>Time:</strong> {selectedTrace.timestamp}</p>
                                </div>

                                <div style={{ background: '#000', color: '#0f0', padding: '1.5rem', borderRadius: '16px', overflowX: 'auto' }}>
                                    <h4 style={{ color: '#aaa', marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Dữ liệu JSON Payload</h4>
                                    <pre style={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>{JSON.stringify(selectedTrace.details, null, 2)}</pre>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
