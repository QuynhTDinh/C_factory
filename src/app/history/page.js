"use client";

import { useState, useEffect } from "react";
import { fetchActivities } from "@/lib/db";
import Link from "next/link";

export default function HistoryPage() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");

    useEffect(() => {
        const loadHistory = async () => {
            setLoading(true);
            try {
                // Fetch from Master Database
                const masterData = await fetchActivities();

                // Get Local History (Legacy)
                const localHistory = JSON.parse(localStorage.getItem("cfactory_history") || "[]");

                // Combine and Deduplicate (simple id or timestamp check)
                setRecords(masterData);
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
        : records.filter(r => r.Type === filter || (filter === "Decode" && r.Type === "JD Decode") || (filter === "Compare" && r.Type === "CV Match"));

    const formatDate = (dateStr) => {
        return dateStr || "N/A";
    };

    return (
        <div className="page" style={{ padding: '2.5rem', minHeight: '100vh', background: '#F5F5F7' }}>
            <div className="container-narrow" style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem' }}>
                    <div>
                        <h1 className="headline" style={{ fontSize: '2.5rem', fontWeight: '800' }}>Lịch sử C Factory</h1>
                        <p style={{ color: '#86868b', marginTop: '0.5rem' }}>Dữ liệu giải mã và đối chiếu năng lực được lưu trữ tập trung.</p>
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
                        <p style={{ marginTop: '1rem', color: '#86868b' }}>Đang tải dữ liệu từ Master DB...</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {filteredRecords.length === 0 && (
                            <div className="card text-center" style={{ padding: '4rem' }}>
                                <p style={{ color: '#86868b' }}>Chưa có bản ghi nào phù hợp.</p>
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
                                                background: r.Type === 'Decode' ? '#EBF5FF' : r.Type === 'Compare' ? '#F0F9F4' : '#FFF5F5',
                                                color: r.Type === 'Decode' ? '#007AFF' : r.Type === 'Compare' ? '#34C759' : '#FF3B30'
                                            }}>
                                                {r.Type}
                                            </span>
                                            <span style={{ fontSize: '12px', color: '#86868b' }}>{formatDate(r.Timestamp)}</span>
                                        </div>
                                        <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{r.Context}</div>
                                        <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '4px' }}>{r.Summary}</p>
                                    </div>
                                    {r.Score && (
                                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#000' }}>{r.Score}%</div>
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
