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
        const data = await fetchActivities(150);
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

    // ── Structured Renderers ──

    const renderJDAnalysis = (data) => {
        const res = data.result || data;
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                    <div className="info-field"><strong>Cấp bậc:</strong> {res.seniority}</div>
                    <div className="info-field"><strong>Lĩnh vực:</strong> {res.industry}</div>
                </div>

                <h4 style={{ fontSize: '0.9rem', color: '#86868b', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>BẢNG NĂNG LỰC YÊU CẦU</h4>
                <table style={{ width: '100%', fontSize: '0.85rem' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', opacity: 0.6 }}>
                            <th style={{ padding: '0.5rem' }}>Năng lực</th>
                            <th style={{ padding: '0.5rem' }}>Yêu cầu</th>
                            <th style={{ padding: '0.5rem' }}>Độ ưu tiên</th>
                        </tr>
                    </thead>
                    <tbody>
                        {res.competencies?.map((c, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #f5f5f7' }}>
                                <td style={{ padding: '0.75rem 0.5rem' }}>
                                    <div style={{ fontWeight: '700' }}>{c.name_vi}</div>
                                    <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{c.name_en}</div>
                                </td>
                                <td style={{ padding: '0.75rem 0.5rem' }}>{c.level_label} (L{c.level})</td>
                                <td style={{ padding: '0.75rem 0.5rem' }}>
                                    <span style={{
                                        padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '800',
                                        background: c.priority === 'high' ? '#FFF5F5' : '#F5F5F7',
                                        color: c.priority === 'high' ? '#FF3B30' : '#888'
                                    }}>{c.priority === 'high' ? 'Bắt buộc' : 'Ưu tiên'}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderCVMatch = (data) => {
        const res = data.result || data;
        const ranking = res.comparison?.ranking || [];
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#86868b', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>BẢNG XẾP HẠNG CƠ HỘI</h4>
                <table style={{ width: '100%', fontSize: '0.85rem' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', opacity: 0.6 }}>
                            <th style={{ padding: '0.5rem' }}>Cơ hội (JD)</th>
                            <th style={{ padding: '0.5rem' }}>Điểm (%)</th>
                            <th style={{ padding: '0.5rem' }}>Lý do chính</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ranking.map((item, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #f5f5f7' }}>
                                <td style={{ padding: '0.75rem 0.5rem', fontWeight: '700' }}>{item.role}</td>
                                <td style={{ padding: '0.75rem 0.5rem' }}>
                                    <span style={{ fontWeight: '800', color: item.match_score > 70 ? '#34C759' : '#000' }}>{item.match_score}%</span>
                                </td>
                                <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', color: '#666' }}>{item.key_reason}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

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
                    <button onClick={loadRecords} className="btn-refresh">Làm mới {loading ? '...' : ''}</button>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem' }}>
                    {["All", "Decode", "Match", "Assess", "Error"].map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`tab-btn ${filter === f ? 'active' : ''}`}>{f}</button>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: selectedRecord ? '1fr 1.2fr' : '1fr', gap: '2rem' }}>
                    <div style={{ background: '#fff', borderRadius: '24px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', overflowY: 'auto', maxHeight: '850px' }}>
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
                                        <tr key={i} style={{ borderBottom: '1px solid #f9f9f9', cursor: 'pointer', background: selectedRecord === r ? '#F5F5F7' : 'transparent' }} onClick={() => setSelectedRecord(r)}>
                                            <td style={{ padding: '1rem' }}>
                                                <span className={`type-badge ${r.Type.includes('Success') ? 'success' : r.Type.includes('Error') ? 'error' : ''}`}>{r.Type}</span>
                                            </td>
                                            <td style={{ padding: '1rem', fontWeight: '600' }}>{r.Context}</td>
                                            <td style={{ padding: '1rem' }}>{r.Score ? `${r.Score}%` : 'Recorded'}</td>
                                            <td style={{ padding: '1rem', fontSize: '0.8rem', color: '#86868b' }}>{r.Timestamp}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {selectedRecord && (
                        <div className="inspector-panel">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
                                <div>
                                    <span style={{ color: '#86868b', fontSize: '0.8rem' }}>{selectedRecord.Timestamp}</span>
                                    <h2 style={{ fontWeight: '800', fontSize: '1.75rem' }}>{selectedRecord.Context}</h2>
                                </div>
                                <button onClick={() => setSelectedRecord(null)} className="btn-close">Đóng ×</button>
                            </div>

                            <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#F9F9FB', borderRadius: '18px' }}>
                                <h4 className="label">Tóm tắt hoạt động</h4>
                                <p style={{ fontWeight: '500' }}>{selectedRecord.Summary}</p>
                            </div>

                            <div style={{ overflowY: 'auto', maxHeight: '550px' }}>
                                {(() => {
                                    try {
                                        const payload = JSON.parse(selectedRecord.FullReport);
                                        if (selectedRecord.Type.includes('Decode Success')) return renderJDAnalysis(payload);
                                        if (selectedRecord.Type.includes('Match Success')) return renderCVMatch(payload);
                                        if (selectedRecord.Type === 'Assess' || selectedRecord.Type.includes('Survey')) return (
                                            <ReportView result={payload} formData={JSON.parse(selectedRecord.RawData)} isAdmin={true} />
                                        );
                                        return (
                                            <div style={{ background: '#000', color: '#0f0', padding: '1.5rem', borderRadius: '16px' }}>
                                                <pre style={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>{JSON.stringify(payload, null, 2)}</pre>
                                            </div>
                                        );
                                    } catch (e) {
                                        return <p style={{ color: '#ff3b30' }}>Lỗi khi phân tích dữ liệu Trace.</p>;
                                    }
                                })()}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style jsx>{`
                .btn-primary { background: #000; color: #fff; padding: 1rem 2rem; border-radius: 14px; border: none; font-weight: 700; cursor: pointer; }
                .hust-input { background: #F5F5F7; border: none; padding: 1rem; border-radius: 12px; width: 100%; outline: none; }
                .btn-refresh { background: #fff; border: 1px solid #ddd; padding: 0.6rem 1.25rem; border-radius: 12px; font-weight: 600; cursor: pointer; }
                .btn-close { border: none; background: #F5F5F7; padding: 0.6rem 1.25rem; border-radius: 12px; cursor: pointer; font-weight: 600; }
                .tab-btn { padding: 0.6rem 1.2rem; border-radius: 100px; border: none; background: #fff; color: #86868b; font-weight: 600; cursor: pointer; }
                .tab-btn.active { background: #000; color: #fff; }
                .type-badge { fontSize: 9px; fontWeight: 900; padding: 3px 8px; borderRadius: 4px; textTransform: uppercase; background: #EBF5FF; color: #007AFF; }
                .type-badge.success { background: #E3FBE3; color: #1B7C1B; }
                .type-badge.error { background: #FEECEB; color: #C53030; }
                .inspector-panel { background: #fff; border-radius: 24px; padding: 2.5rem; boxShadow: 0 10px 40px rgba(0,0,0,0.1); position: sticky; top: 2rem; }
                .label { marginBottom: 0.5rem; opacity: 0.5; textTransform: uppercase; fontSize: 0.7rem; letterSpacing: 0.05em; }
                .info-field { background: #f8f8fa; padding: 0.75rem 1rem; border-radius: 10px; font-size: 0.9rem; }
            `}</style>
        </div>
    );
}
