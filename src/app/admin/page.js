"use client";

import { useState, useEffect } from "react";
import { fetchActivities } from "@/lib/db";
import Link from "next/link";
import ReportView from "@/components/ReportView";

export default function AdminPage() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [password, setPassword] = useState("");
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        if (isAuth) {
            loadRecords();
        }
    }, [isAuth]);

    const loadRecords = async () => {
        setLoading(true);
        const data = await fetchActivities(200);
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

    if (!isAuth) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F5F7' }}>
                <form onSubmit={handleLogin} className="card" style={{ padding: '3rem', width: '400px', background: '#fff', borderRadius: '24px', textAlign: 'center' }}>
                    <h2 style={{ marginBottom: '2rem' }}>Admin Access</h2>
                    <input
                        type="password"
                        className="hust-input"
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #ddd', marginBottom: '1.5rem' }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Đăng nhập</button>
                </form>
            </div>
        );
    }

    return (
        <div style={{ padding: '3rem', minHeight: '100vh', background: '#F5F5F7' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800' }}>Master Control Dashboard</h1>
                        <p style={{ color: '#86868b' }}>Quản trị tập trung toàn bộ dữ liệu Giải mã & Đối chiếu Năng lực.</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: selectedRecord ? '1fr 1.5fr' : '1fr', gap: '2rem' }}>
                    {/* List */}
                    <div style={{ background: '#fff', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflowY: 'auto', maxHeight: '800px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3 style={{ fontWeight: '800' }}>Tất cả hoạt động ({records.length})</h3>
                            <button onClick={loadRecords} style={{ border: 'none', background: 'none', color: '#007AFF', cursor: 'pointer', fontWeight: '600' }}>Làm mới</button>
                        </div>
                        {loading ? <p>Đang tải...</p> : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #f0f0f0', color: '#86868b', fontSize: '0.8rem' }}>
                                        <th style={{ padding: '1rem' }}>TYPE</th>
                                        <th style={{ padding: '1rem' }}>CONTEXT</th>
                                        <th style={{ padding: '1rem' }}>SCORE</th>
                                        <th style={{ padding: '1rem' }}>ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((r, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #f9f9f9', cursor: 'pointer', background: selectedRecord === r ? '#F5F5F7' : 'transparent' }} onClick={() => setSelectedRecord(r)}>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{ fontSize: '10px', fontWeight: '800', background: '#f0f0f0', padding: '2px 6px', borderRadius: '4px' }}>{r.Type}</span>
                                            </td>
                                            <td style={{ padding: '1rem', fontWeight: '600' }}>{r.Context}</td>
                                            <td style={{ padding: '1rem' }}>{r.Score ? `${r.Score}%` : '-'}</td>
                                            <td style={{ padding: '1rem' }}><span style={{ color: '#007AFF' }}>Chi tiết ›</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Detail Panel */}
                    {selectedRecord && (
                        <div style={{ background: '#fff', borderRadius: '24px', padding: '2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <div>
                                    <span style={{ color: '#86868b', fontSize: '0.8rem' }}>{selectedRecord.Timestamp}</span>
                                    <h2 style={{ fontWeight: '800' }}>{selectedRecord.Context}</h2>
                                </div>
                                <button onClick={() => setSelectedRecord(null)} style={{ border: 'none', background: '#F5F5F7', padding: '0.5rem 1rem', borderRadius: '10px', cursor: 'pointer' }}>Đóng x</button>
                            </div>

                            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#F9F9FB', borderRadius: '16px' }}>
                                <h4 style={{ marginBottom: '0.5rem', opacity: 0.6 }}>Tóm tắt kết quả</h4>
                                <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>{selectedRecord.Summary}</p>
                            </div>

                            <div style={{ overflowY: 'auto', maxHeight: '500px' }}>
                                {selectedRecord.Type === 'Assess' ? (
                                    <ReportView
                                        result={JSON.parse(selectedRecord.FullReport)}
                                        formData={JSON.parse(selectedRecord.RawData)}
                                        isAdmin={true}
                                    />
                                ) : (
                                    <div style={{ background: '#000', color: '#0f0', padding: '1.5rem', borderRadius: '12px', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                                        <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(JSON.parse(selectedRecord.FullReport), null, 2)}</pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style jsx global>{`
                .btn-primary { background: #000; color: #fff; padding: 1rem 2rem; border-radius: 12px; border: none; fontWeight: 700; cursor: pointer; }
                .hust-input { background: #F5F5F7; border: none; padding: 1rem; border-radius: 12px; width: 100%; outline: none; }
            `}</style>
        </div>
    );
}
