"use client";

import { useMemo } from "react";
import dynamic from 'next/dynamic';

const RadarChart = dynamic(() => import('./RadarChart'), { ssr: false });

const SCORING_RUBRIC = [
    { level: 1, label: "Mới biết", detail: "Chưa từng sử dụng/mới nghe tên qua lý thuyết." },
    { level: 2, label: "Đã học", detail: "Hiểu lý thuyết cơ bản, đã quan sát hoặc thực hành ít." },
    { level: 3, label: "Biết dùng", detail: "Có thể vận hành cơ bản nhưng cần hướng dẫn/tài liệu." },
    { level: 4, label: "Thành thạo", detail: "Tự tin vận hành độc lập và xử lý sự cố thông thường." },
    { level: 5, label: "Chuyên gia", detail: "Bậc thầy, có thể tối ưu quy trình và hướng dẫn người khác." },
];

export default function ReportView({ result, formData, selectedPos, isAdmin = false }) {
    const radarData = useMemo(() => {
        if (!selectedPos || !result) return [];
        // Extract tool names if selectedPos.tools are objects
        const toolNames = selectedPos.tools.map(t => typeof t === 'string' ? t : t.name);

        return [
            { name: toolNames[0], user: formData.ask_scores[toolNames[0]] || 1, target: 4 },
            { name: toolNames[1], user: formData.ask_scores[toolNames[1]] || 1, target: 4 },
            { name: toolNames[2], user: formData.ask_scores[toolNames[2]] || 1, target: 4 },
            { name: "English", user: formData.ask_scores["Technical English"] || 1, target: 4 },
            { name: "Soft Skills", user: 3, target: 5 },
        ];
    }, [selectedPos, result, formData.ask_scores]);

    if (!result) return null;

    return (
        <div className="report-container">
            {/* Admin Info Header (Print only) */}
            <div className="print-only-header" style={{ display: 'none', borderBottom: '2px solid #8B1D1D', paddingBottom: '20px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 style={{ color: '#8B1D1D', fontSize: '24px', margin: 0 }}>BÁO CÁO ĐÁNH GIÁ NĂNG LỰC</h1>
                        <p style={{ margin: '5px 0 0', fontSize: '14px', color: '#666' }}>Hệ thống SCLS Connect 2026 • FNX Talent Factory</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '800' }}>Ứng viên: {formData.name}</div>
                        <div style={{ fontSize: '12px' }}>Email: {formData.email}</div>
                        <div style={{ fontSize: '12px' }}>Ngày: {new Date().toLocaleDateString('vi-VN')}</div>
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <div className="scls-badge">Audit Completed</div>
                <h1 className="headline" style={{ fontSize: '3.5rem', marginBottom: '2rem' }}>Báo cáo Năng lực thực chiến</h1>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4rem' }}>
                    <div style={{ fontSize: '6rem', fontWeight: '900', color: '#005A31', letterSpacing: '-4px' }}>{result.match_score}%</div>
                    <div style={{ textAlign: 'left', maxWidth: '300px' }}>
                        <div style={{ fontWeight: '800', fontSize: '1.25rem', marginBottom: '8px' }}>
                            {result.match_score > 75 ? "Tiềm năng Xuất sắc" : "Sẵn sàng Nhập cuộc"}
                        </div>
                        <p style={{ color: '#86868B', fontSize: '0.9rem' }}>{result.summary}</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px', marginBottom: '3rem' }}>
                <div className="apple-card" style={{ textAlign: 'center' }}>
                    <h3 style={{ textAlign: 'left', marginBottom: '2rem', borderLeft: '4px solid #8B1D1D', paddingLeft: '15px' }}>Biểu đồ Năng lực</h3>
                    <div className="radar-chart-container">
                        <RadarChart data={radarData} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '0.7rem', fontWeight: '800', color: '#888' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', background: '#8B1D1D', borderRadius: '2px' }}></div>BẠN</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '10px', height: '10px', background: '#005A31', opacity: 0.2, borderRadius: '2px' }}></div>NGÀNH</div>
                    </div>
                </div>

                <div className="apple-card">
                    <h3 style={{ marginBottom: '2rem', borderLeft: '4px solid #005A31', paddingLeft: '15px' }}>Khoảng cách kỹ năng (GAP)</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                        {(result.gaps || []).slice(0, 4).map((g, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '0.9rem', marginBottom: '8px' }}>
                                    <span>{g.skill}</span>
                                    <span style={{ color: g.gap_value < 0 ? '#8B1D1D' : '#005A31' }}>{g.gap_value > 0 ? `+${g.gap_value}` : g.gap_value}</span>
                                </div>
                                <div className="progress-container">
                                    <div className={`progress-fill ${g.gap_value < 0 ? 'hust' : 'scls'}`} style={{ width: `${(Math.max(1, 4 + g.gap_value) / 5) * 100}%` }}></div>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: '#86868B', marginTop: '6px' }}>{g.explanation}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="career-roadmap-box">
                <div className="career-roadmap-content">
                    <h2 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '2rem' }}>Lộ trình Đột phá</h2>
                    <div style={{ fontSize: '1.25rem', lineHeight: '1.6', color: '#ccc', borderLeft: '3px solid #005A31', paddingLeft: '2rem', marginBottom: '3rem', fontStyle: 'italic' }}>
                        "{result.career_path}"
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        {(result.recommendations || []).map((rec, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ fontSize: '0.7rem', color: '#005A31', fontWeight: '900', marginBottom: '8px' }}>RECO #{i + 1}</div>
                                <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '8px' }}>{rec.action}</div>
                                <p style={{ fontSize: '0.85rem', color: '#888' }}>{rec.reason}</p>
                            </div>
                        ))}
                    </div>

                    <div className="no-print" style={{ marginTop: '4rem', textAlign: 'center' }}>
                        {isAdmin && (
                            <button onClick={() => window.print()} className="btn-hust" style={{ background: 'white', color: 'black', width: '300px' }}>📥 Xuất PDF Báo cáo</button>
                        )}
                        <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#666' }}>Báo cáo đã lưu trữ thành công cho <strong>{formData.name}</strong></p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    .no-print, .navbar, .scls-footer, footer, nav {
                        display: none !important;
                    }
                    body {
                        background: white !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                    .report-container {
                        padding: 20px !important;
                    }
                    .apple-card {
                        box-shadow: none !important;
                        border: 1px solid #eee !important;
                        break-inside: avoid;
                    }
                    .career-roadmap-box {
                        background: #111 !important;
                        color: white !important;
                        -webkit-print-color-adjust: exact;
                        padding: 40px !important;
                    }
                    .print-only-header {
                        display: block !important;
                    }
                    .headline {
                        font-size: 2.5rem !important;
                    }
                }
            `}</style>
        </div>
    );
}
