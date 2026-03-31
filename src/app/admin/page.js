"use client";

import { useState, useEffect } from "react";
import { fetchActivities } from "@/lib/db";
import ReportView from "@/components/ReportView";

export default function AdminPage() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [password, setPassword] = useState("");
    const [isAuth, setIsAuth] = useState(false);
    const [filter, setFilter] = useState("All");

    useEffect(() => {
        if (isAuth) loadRecords();
    }, [isAuth]);

    const loadRecords = async () => {
        setLoading(true);
        const data = await fetchActivities(150); // Fetch more for trace feed
        setRecords(data);
        setLoading(false);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === "hust2026") {
            setIsAuth(true);
            localStorage.setItem("admin_auth", "true");
        } else {
            alert("Sai mật khẩu!");
        }
    };

    const filteredRecords = filter === "All"
        ? records
        : records.filter(r => r.Type.includes(filter));

    if (!isAuth) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F5F7' }}>
                <form onSubmit={handleLogin} className="card" style={{ padding: '3rem', width: '400px', background: '#fff', borderRadius: '24px', textAlign: 'center' }}>
                    <h2 style={{ marginBottom: '2rem', fontWeight: '800' }}>Admin Console</h2>
                    <input
                        type="password"
                        className="hust-input"
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', marginBottom: '1.5rem' }}
                    />
                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>Tiếp tục</button>
                    <p style={{ marginTop: '1.5rem', color: '#86868b', fontSize: '0.8rem' }}>Dành cho quản trị viên hệ thống C Factory.</p>
                </form>
            </div>
        );
    }

    return (
        <div style={{ padding: '3rem', minHeight: '100vh', background: '#F5F5F7', fontFamily: '-apple-system, system-ui, sans-serif' }}>
            <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3.5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.75rem', fontWeight: '800', letterSpacing: '-0.03em' }}>Master Trace Console</h1>
                        <p style={{ color: '#86868b', marginTop: '0.5rem', fontSize: '1.1rem' }}>Giám sát toàn bộ hoạt động Giải mã & Đối chiếu Năng lực (Real-time Cloud Traces).</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={loadRecords} className="btn-refresh">Làm mới {loading ? '...' : ''}</button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem' }}>
                    {["All", "Decode", "Match", "Assess", "Error"].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            style={{
                                padding: '0.6rem 1.2rem',
                                borderRadius: '100px',
                                border: 'none',
                                background: filter === f ? '#000' : '#fff',
                                color: filter === f ? '#fff' : '#86868b',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: selectedRecord ? '1fr 1.2fr' : '1fr', gap: '2rem' }}>
                    {/* Activity List */}
                    <div style={{ background: '#fff', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', overflowY: 'auto', maxHeight: '850px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid #f5f5f7', paddingBottom: '1rem' }}>
                            <h3 style={{ fontWeight: '800' }}>Trace Feed ({filteredRecords.length})</h3>
                        </div>
                        {loading && records.length === 0 ? <p>Đang đồng bộ từ Cloud...</p> : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', color: '#86868b', fontSize: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>
                                        <th style={{ padding: '1rem' }}>TYPE</th>
                                        <th style={{ padding: '1rem' }}>CONTEXT</th>
                                        <th style={{ padding: '1rem' }}>STATUS/SCORE</th>
                                        <th style={{ padding: '1rem' }}>TIME</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecords.map((r, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #f9f9f9', cursor: 'pointer', background: selectedRecord === r ? '#F5F5F7' : 'transparent', transition: 'all 0.2s' }} onClick={() => setSelectedRecord(r)}>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    fontSize: '9px', fontWeight: '900', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase',
                                                    background: r.Type.includes('Success') ? '#E3FBE3' : r.Type.includes('Error') ? '#FEECEB' : '#EBF5FF',
                                                    color: r.Type.includes('Success') ? '#1B7C1B' : r.Type.includes('Error') ? '#C53030' : '#007AFF'
                                                }}>{r.Type}</span>
                                            </td>
                                            <td style={{ padding: '1rem', fontWeight: '600', fontSize: '0.95rem' }}>{r.Context}</td>
                                            <td style={{ padding: '1rem', color: r.Score ? '#000' : '#888' }}>{r.Score ? `${r.Score}%` : 'Recorded'}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.8rem', color: '#86868b' }}>{r.Timestamp}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Inspector Panel */}
                    {selectedRecord && (
                        <div style={{ background: '#fff', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', position: 'sticky', top: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                                <div>
                                    <span style={{ color: '#86868b', fontSize: '0.8rem' }}>{selectedRecord.Timestamp}</span>
                                    <h2 style={{ fontWeight: '800', fontSize: '1.75rem' }}>{selectedRecord.Context}</h2>
                                </div>
                                <button onClick={() => setSelectedRecord(null)} style={{ border: 'none', background: '#F5F5F7', padding: '0.6rem 1.25rem', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' }}>Đóng ×</button>
                            </div>

                            <div style={{ marginBottom: '2.5rem', padding: '1.75rem', background: '#F9F9FB', borderRadius: '18px', border: '1px solid rgba(0,0,0,0.02)' }}>
                                <h4 style={{ marginBottom: '0.75rem', opacity: 0.5, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>Tóm tắt hoạt động</h4>
                                <p style={{ fontSize: '1.15rem', fontWeight: '500', lineHeight: '1.5' }}>{selectedRecord.Summary}</p>
                            </div>

                            <div style={{ overflowY: 'auto', maxHeight: '550px' }}>
                                {selectedRecord.Type === 'Assess' || selectedRecord.Type.includes('Survey') ? (
                                    <ReportView
                                        result={JSON.parse(selectedRecord.FullReport)}
                                        formData={JSON.parse(selectedRecord.RawData)}
                                        isAdmin={true}
                                    />
                                ) : (
                                    <div style={{ background: '#000', color: '#0f0', padding: '1.5rem', borderRadius: '16px', overflowX: 'auto' }}>
                                        <h4 style={{ color: '#666', marginBottom: '1rem', fontSize: '0.75rem', textTransform: 'uppercase' }}>Dữ liệu JSON thô</h4>
                                        <pre style={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{JSON.stringify(JSON.parse(selectedRecord.FullReport), null, 2)}</pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style jsx>{`
                .btn-primary { background: #000; color: #fff; padding: 1rem 2rem; border-radius: 14px; border: none; font-weight: 700; cursor: pointer; transition: all 0.2s; }
                .btn-primary:hover { transform: scale(1.02); }
                .hust-input { background: #F5F5F7; border: none; padding: 1rem; border-radius: 12px; width: 100%; outline: none; }
                .btn-refresh { background: #fff; border: 1px solid #ddd; padding: 0.6rem 1.25rem; borderRadius: 12px; fontWeight: 600; cursor: pointer; transition: all 0.2s; }
                .btn-refresh:hover { background: #fafafa; border-color: #bbb; }
            `}</style>
        </div>
    );
}
