"use client";

import { useState, useMemo } from "react";
import { submitSurvey } from "@/lib/api";
import Link from "next/link";

const MAJORS = [
    "Kỹ thuật Hóa học",
    "Công nghệ Thực phẩm",
    "Kỹ thuật Sinh học",
    "Kỹ thuật Môi trường",
];

const POSITIONS = [
    { id: "operations", name: "Kỹ sư Vận hành (Operations)", tools: ["SCADA/HMI", "5S/Kaizen", "Troubleshooting", "Safety Standards"] },
    { id: "rd", name: "Kỹ sư QA/QC/R&D", tools: ["HPLC/GC/MS", "Spectrophotometry", "Analytical Method", "ISO Standards"] },
    { id: "design", name: "Kỹ sư Thiết kế kỹ thuật", tools: ["AutoCAD", "SolidWorks", "Sơ đồ P&ID", "Simulation Tools"] },
    { id: "consultant", name: "Kỹ sư Tư vấn giải pháp", tools: ["Problem Solving", "Presentation", "Cost-Benefit Analysis"] },
    { id: "sales", name: "Kỹ sư Sales Kỹ thuật", tools: ["Product Knowledge", "Networking", "Negotiation"] },
    { id: "maintenance", name: "Kỹ sư Bảo trì", tools: ["Mechanical/Electrical", "Preventive Maintenance", "Troubleshooting"] },
];

/**
 * RadarChart Component (SVG)
 * Shows User vs Benchmark
 */
function RadarChart({ data, size = 320 }) {
    const points = data.length;
    const radius = size / 2 - 50;
    const center = size / 2;

    const getCoordinates = (index, value, max = 5) => {
        const angle = (Math.PI * 2 * index) / points - Math.PI / 2;
        const r = (value / max) * radius;
        return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle),
        };
    };

    const userPath = data.map((d, i) => {
        const { x, y } = getCoordinates(i, d.user);
        return `${x},${y}`;
    }).join(" ");

    const targetPath = data.map((d, i) => {
        const { x, y } = getCoordinates(i, d.target);
        return `${x},${y}`;
    }).join(" ");

    return (
        <svg width={size} height={size} style={{ overflow: 'visible' }}>
            {/* Grid Lines */}
            {[1, 2, 3, 4, 5].map(level => (
                <polygon
                    key={level}
                    points={data.map((_, i) => {
                        const { x, y } = getCoordinates(i, level);
                        return `${x},${y}`;
                    }).join(" ")}
                    style={{ fill: 'none', stroke: '#E5E5E5', strokeWidth: 1 }}
                />
            ))}

            {/* Target Area (SCLS Green) */}
            <polygon points={targetPath} style={{ fill: 'rgba(0, 90, 49, 0.08)', stroke: 'rgba(0, 90, 49, 0.2)', strokeWidth: 2 }} />

            {/* User Area (HUST Maroon) */}
            <polygon points={userPath} style={{ fill: 'rgba(139, 29, 29, 0.35)', stroke: '#8B1D1D', strokeWidth: 2.5 }} className="animate-in" />

            {/* Labels */}
            {data.map((d, i) => {
                const { x, y } = getCoordinates(i, 5.8);
                return (
                    <text key={i} x={x} y={y} textAnchor="middle" style={{ fontSize: '11px', fontWeight: '700', fill: '#666' }}>
                        {d.name.length > 15 ? d.name.substring(0, 12) + "..." : d.name}
                    </text>
                );
            })}
        </svg>
    );
}

export default function SCLSConnectSurvey() {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        major: "",
        target_position: "",
        ask_scores: {},
        situational: {
            scenario_1: "",
            scenario_2: ""
        }
    });

    const selectedPos = useMemo(() => POSITIONS.find(p => p.id === formData.target_position), [formData.target_position]);

    const radarData = useMemo(() => {
        if (!selectedPos || !result) return [];
        return [
            { name: selectedPos.tools[0], user: formData.ask_scores[selectedPos.tools[0]] || 1, target: 4 },
            { name: selectedPos.tools[1], user: formData.ask_scores[selectedPos.tools[1]] || 1, target: 4 },
            { name: selectedPos.tools[2], user: formData.ask_scores[selectedPos.tools[2]] || 1, target: 4 },
            { name: "Technical English", user: formData.ask_scores["Technical English"] || 1, target: 4 },
            { name: "Problem Solving", user: 3, target: 5 },
        ];
    }, [selectedPos, result, formData.ask_scores]);

    const updateForm = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));
    const updateScore = (tool, score) => setFormData(prev => ({ ...prev, ask_scores: { ...prev.ask_scores, [tool]: score } }));

    const handleSubmit = async () => {
        setLoading(true); setStep(5);
        try {
            const resp = await submitSurvey(formData);
            setResult(resp.data); setStep(6);
        } catch (err) {
            setError(err.message); setStep(4);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="scls-container" style={{ minHeight: '100vh', background: '#F5F5F7' }}>
            {/* CSS Hack to hide RootLayout Nav */}
            <style jsx global>{`
        nav.navbar { display: none !important; }
        body { background: #F5F5F7 !important; }
      `}</style>

            {/* Custom Survey Nav */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', padding: '1rem 0', borderBottom: '1px solid #E5E5E7' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#8B1D1D', letterSpacing: '-1px' }}>SCLS CONNECT</span>
                    <div style={{ width: '1px', height: '20px', background: '#ccc' }}></div>
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#005A31' }}>C Factory</span>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#86868B', fontWeight: '600' }}>29.03.2026 • ĐHBK Hà Nội</div>
            </div>

            {/* Step 0: Hero */}
            {step === 0 && (
                <div className="scls-hero animate-in">
                    <div className="scls-badge">FNX Talent Lab Auditing</div>
                    <h1 className="scls-title">Audit năng lực.<br />Phát triển sự nghiệp.</h1>
                    <p className="subheadline" style={{ maxWidth: '600px', margin: '0 auto 3rem' }}>
                        Đối chiếu năng lực thực thực chiến của sinh viên Bách Khoa với tiêu chuẩn kỹ sư toàn cầu.
                    </p>
                    <button onClick={() => setStep(1)} className="btn-hust">Bắt đầu Audit ngay</button>

                    <div style={{ marginTop: '5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        <div className="apple-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>⚡</div>
                            <div style={{ fontWeight: '700' }}>Real-time Insight</div>
                        </div>
                        <div className="apple-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>📍</div>
                            <div style={{ fontWeight: '700' }}>HUST Optimized</div>
                        </div>
                        <div className="apple-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>📄</div>
                            <div style={{ fontWeight: '700' }}>Career Roadmap</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 1: Info */}
            {step === 1 && (
                <div className="animate-in" style={{ maxWidth: '500px', margin: '0 auto' }}>
                    <div className="step-indicator"><div className="step-indicator-fill" style={{ width: '25%' }}></div></div>
                    <h2 className="headline" style={{ marginBottom: '2rem' }}>Bạn là ai?</h2>
                    <div className="apple-card">
                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <label className="caption">Họ và tên</label>
                            <input type="text" className="hust-input" placeholder="Nguyễn Văn A" value={formData.name} onChange={e => updateForm("name", e.target.value)} />
                        </div>
                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <label className="caption">Email nhận PDF</label>
                            <input type="email" className="hust-input" placeholder="email@student.hust.edu.vn" value={formData.email} onChange={e => updateForm("email", e.target.value)} />
                        </div>
                        <div className="form-group" style={{ marginBottom: '2rem' }}>
                            <label className="caption">Chuyên ngành</label>
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {MAJORS.map(m => (
                                    <button key={m} onClick={() => updateForm("major", m)} style={{ padding: '1rem', borderRadius: '14px', border: formData.major === m ? '2px solid #8B1D1D' : '1px solid #E5E5E7', background: formData.major === m ? '#FDF2F2' : 'white', fontWeight: formData.major === m ? '700' : '400', textAlign: 'left', cursor: 'pointer' }}>
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button disabled={!formData.name || !formData.email || !formData.major} onClick={() => setStep(2)} className="btn-hust" style={{ width: '100%' }}>Tiếp theo</button>
                    </div>
                </div>
            )}

            {/* Step 2: Position */}
            {step === 2 && (
                <div className="animate-in" style={{ maxWidth: '500px', margin: '0 auto' }}>
                    <div className="step-indicator"><div className="step-indicator-fill" style={{ width: '50%' }}></div></div>
                    <h2 className="headline" style={{ marginBottom: '1rem' }}>Vị trí mục tiêu?</h2>
                    <p style={{ color: '#86868B', marginBottom: '2rem' }}>Chọn hướng đi bạn muốn audit năng lực.</p>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {POSITIONS.map(p => (
                            <button key={p.id} onClick={() => updateForm("target_position", p.id)} style={{ padding: '1.5rem', borderRadius: '20px', border: formData.target_position === p.id ? '2px solid #005A31' : '1px solid white', background: formData.target_position === p.id ? '#F0F9F4' : 'white', fontWeight: formData.target_position === p.id ? '700' : '500', textAlign: 'left', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                {p.name}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '15px', marginTop: '2.5rem' }}>
                        <button onClick={() => setStep(1)} style={{ flex: 1, padding: '1.25rem', borderRadius: '18px', border: '1px solid #E5E5E7', background: 'white', fontWeight: '700' }}>Quay lại</button>
                        <button disabled={!formData.target_position} onClick={() => setStep(3)} className="btn-hust" style={{ flex: 2 }}>Tiếp tục</button>
                    </div>
                </div>
            )}

            {/* Step 3: ASK */}
            {step === 3 && (
                <div className="animate-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div className="step-indicator"><div className="step-indicator-fill" style={{ width: '75%' }}></div></div>
                    <h2 className="headline" style={{ marginBottom: '1rem' }}>Đánh giá Kỹ năng</h2>
                    <p style={{ color: '#86868B', marginBottom: '2.5rem' }}>Dùng thanh điểm 1 (Biết) đến 5 (Chuyên gia).</p>
                    <div className="apple-card" style={{ padding: '2rem' }}>
                        {[...selectedPos.tools, "Technical English"].map(tool => (
                            <div key={tool} style={{ marginBottom: '2.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '1.15rem', fontWeight: '700' }}>{tool}</span>
                                    <span style={{ color: '#005A31', fontWeight: '900', fontSize: '1.5rem' }}>{formData.ask_scores[tool] || '—'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8F8F9', padding: '8px', borderRadius: '100px' }}>
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <div key={num} onClick={() => updateScore(tool, num)} className={`score-dot ${formData.ask_scores[tool] === num ? 'active' : ''}`}>
                                            {num}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <div style={{ display: 'flex', gap: '15px', marginTop: '2rem' }}>
                            <button onClick={() => setStep(2)} style={{ flex: 1, padding: '1.25rem', borderRadius: '18px', border: '1px solid #E5E5E7', background: 'white', fontWeight: '700' }}>Quay lại</button>
                            <button disabled={Object.keys(formData.ask_scores).length < (selectedPos.tools.length + 1)} onClick={() => setStep(4)} className="btn-hust" style={{ flex: 2 }}>Tiếp tục</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 4: Situational */}
            {step === 4 && (
                <div className="animate-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div className="step-indicator"><div className="step-indicator-fill" style={{ width: '100%' }}></div></div>
                    <h2 className="headline" style={{ marginBottom: '1rem' }}>Tư duy Xử lý</h2>
                    <p style={{ color: '#86868B', marginBottom: '2.5rem' }}>Phân tích cách bạn giải quyết vấn đề thực tế.</p>

                    <div className="apple-card" style={{ marginBottom: '2rem' }}>
                        <h4 style={{ marginBottom: '1rem', fontWeight: '800' }}>Tình huống 1: Sai lệch quy trình</h4>
                        <textarea className="hust-input" style={{ minHeight: '120px' }} placeholder="Bạn sẽ làm gì nếu thông số sản xuất bị lệch?" value={formData.situational.scenario_1} onChange={e => updateForm("situational", { ...formData.situational, scenario_1: e.target.value })} />
                    </div>

                    <div className="apple-card" style={{ marginBottom: '2rem' }}>
                        <h4 style={{ marginBottom: '1rem', fontWeight: '800' }}>Tình huống 2: Thuyết phục cải tiến</h4>
                        <textarea className="hust-input" style={{ minHeight: '120px' }} placeholder="Cách bạn thuyết phục cấp trên về một giải pháp mới?" value={formData.situational.scenario_2} onChange={e => updateForm("situational", { ...formData.situational, scenario_2: e.target.value })} />
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginTop: '2rem' }}>
                        <button onClick={() => setStep(3)} style={{ flex: 1, padding: '1.25rem', borderRadius: '18px', border: '1px solid #E5E5E7', background: 'white', fontWeight: '700' }}>Quay lại</button>
                        <button disabled={!formData.situational.scenario_1 || !formData.situational.scenario_2} onClick={handleSubmit} className="btn-hust" style={{ flex: 2 }}>Hoàn tất & Xem báo cáo</button>
                    </div>
                </div>
            )}

            {/* Step 5: Loading */}
            {step === 5 && (
                <div className="animate-in" style={{ textAlign: 'center', padding: '10rem 0' }}>
                    <div style={{ width: '80px', height: '80px', border: '6px solid #8B1D1D', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 3rem' }} className="animate-spin"></div>
                    <h2 className="headline">Agent đang phân tích...</h2>
                    <p style={{ color: '#86868B', marginTop: '1rem' }}>Đang xây dựng lộ trình cho <strong>{formData.name}</strong></p>
                </div>
            )}

            {/* Step 6: Result */}
            {step === 6 && result && (
                <div className="animate-in">
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
                                {result.gaps.slice(0, 4).map((g, i) => (
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
                                {result.recommendations.map((rec, i) => (
                                    <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#005A31', fontWeight: '900', marginBottom: '8px' }}>RECO #{i + 1}</div>
                                        <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '8px' }}>{rec.action}</div>
                                        <p style={{ fontSize: '0.85rem', color: '#888' }}>{rec.reason}</p>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: '4rem', textAlign: 'center' }}>
                                <button className="btn-hust" style={{ background: 'white', color: 'black', width: '300px' }}>📥 Tải PDF Báo cáo</button>
                                <p style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: '#666' }}>Báo cáo đã gửi về <strong>{formData.email}</strong></p>
                            </div>
                        </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                        <Link href="/" style={{ fontWeight: '700', color: '#8B1D1D' }}>← Quay lại Trang chủ C Factory</Link>
                    </div>
                </div>
            )}

            <div className="scls-footer">
                © 2026 FNX Talent Factory • SCLS CONNECT 2026<br />
                Hệ thống Thẩm định Năng lực Thực chiến
            </div>
        </div>
    );
}
