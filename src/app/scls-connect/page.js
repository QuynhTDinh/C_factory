"use client";

import { useState, useEffect } from "react";
import { analyzeSurvey } from "@/lib/api";
import ReportView from "@/components/ReportView";
import { MAJORS, POSITIONS, SCORING_RUBRIC } from "@/lib/constants";
import { logTrace } from "@/lib/tracing";

export default function SCLSConnectPage() {
    // ── State Management ──
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        major: MAJORS[0],
        target_position: POSITIONS[0].id,
        ask_scores: {}, // Tool-based: { "AutoCAD": 3, ... }
        situational: {}
    });

    const selectedPos = POSITIONS.find(p => p.id === formData.target_position) || POSITIONS[0];

    const updateScore = (tool, score) => {
        setFormData(prev => ({
            ...prev,
            ask_scores: { ...prev.ask_scores, [tool]: score }
        }));
    };

    const handleStepChange = (nextStep) => {
        logTrace("Survey Step Change", { from: step, to: nextStep, current_data: formData });
        setStep(nextStep);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        logTrace("Survey Submit Started", { formData });

        try {
            const response = await analyzeSurvey(formData);
            if (response.success) {
                setResult(response.data);
                logTrace("Survey Success", { score: response.data.match_score });

                // Save to historical records
                const history = JSON.parse(localStorage.getItem("scls_history") || "[]");
                history.push({
                    id: Date.now(),
                    timestamp: new Date().toISOString(),
                    formData,
                    result: response.data
                });
                localStorage.setItem("scls_history", JSON.stringify(history));

                setStep(4);
            } else {
                throw new Error("Phân tích không thành công");
            }
        } catch (err) {
            setError(err.message);
            logTrace("Survey Error", { error: err.message });
        } finally {
            setLoading(false);
        }
    };

    // ── Render Helpers ──
    const renderStep1 = () => (
        <div className="animate-in">
            <h2 className="headline" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Thông tin cơ bản</h2>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Họ và tên</label>
                <input className="form-input" placeholder="VD: Nguyễn Văn A" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Email cơ quan/trường học</label>
                <input className="form-input" type="email" placeholder="email@hust.edu.vn" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                <label className="form-label">Chuyên ngành</label>
                <select className="form-input" value={formData.major} onChange={e => setFormData({ ...formData, major: e.target.value })}>
                    {MAJORS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={() => handleStepChange(2)} disabled={!formData.name || !formData.email}>Tiếp tục</button>
        </div>
    );

    const renderStep2 = () => (
        <div className="animate-in">
            <div className="scls-badge" style={{ marginBottom: '1rem' }}>Mục tiêu nghề nghiệp</div>
            <h2 className="headline" style={{ fontSize: '2.25rem', marginBottom: '2rem' }}>Bạn muốn trở thành?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '3rem' }}>
                {POSITIONS.map(p => (
                    <div
                        key={p.id}
                        className={`card card-elevated ${formData.target_position === p.id ? 'active-selection' : ''}`}
                        style={{ cursor: 'pointer', border: formData.target_position === p.id ? '2px solid #000' : '1px solid #ddd' }}
                        onClick={() => setFormData({ ...formData, target_position: p.id })}
                    >
                        <div style={{ fontWeight: '700' }}>{p.name}</div>
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-lg" style={{ background: '#eee' }} onClick={() => handleStepChange(1)}>Quay lại</button>
                <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={() => handleStepChange(3)}>Tiếp tục</button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="animate-in">
            <h2 className="headline" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Tự đánh giá năng lực</h2>
            <p className="body-text" style={{ marginBottom: '2rem' }}>Đánh giá khả năng của bạn với các công cụ/kỹ năng trong ngành `{selectedPos.name}`.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '3rem' }}>
                {selectedPos.tools.map(tool => (
                    <div key={tool.name} className="card">
                        <div style={{ fontWeight: '700', marginBottom: '10px' }}>{tool.name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>{tool.desc}</div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {[1, 2, 3, 4, 5].map(lv => (
                                <button
                                    key={lv}
                                    onClick={() => updateScore(tool.name, lv)}
                                    className={`btn ${formData.ask_scores[tool.name] === lv ? 'btn-primary' : ''}`}
                                    style={{ flex: 1, padding: '0.5rem', background: formData.ask_scores[tool.name] === lv ? '#000' : '#f5f5f7' }}
                                >
                                    L{lv}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn btn-lg" style={{ background: '#eee' }} onClick={() => handleStepChange(2)}>Quay lại</button>
                <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={handleSubmit} disabled={loading}>
                    {loading ? "Đang xử lý..." : "Hoàn tất & Xem báo cáo"}
                </button>
            </div>
        </div>
    );

    return (
        <div className="page">
            <div className="container-narrow" style={{ padding: '4rem 0' }}>
                {step < 4 && (
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '3rem' }}>
                        {[1, 2, 3].map(s => (
                            <div key={s} style={{ flex: 1, height: '4px', background: s <= step ? '#000' : '#eee', borderRadius: '2px' }}></div>
                        ))}
                    </div>
                )}

                {error && <div className="card" style={{ background: '#FFF5F5', color: '#C53030', marginBottom: '2rem' }}>{error}</div>}

                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && result && (
                    <div className="animate-in">
                        <ReportView result={result} formData={formData} selectedPos={selectedPos} />
                        <div className="text-center mt-5">
                            <button className="btn btn-primary btn-lg" onClick={() => window.location.reload()}>Thực hiện đánh giá mới</button>
                            <Link href="/admin/local" className="btn btn-lg" style={{ marginLeft: '1rem', background: '#f5f5f7' }}>Xem Trace Debug</Link>
                        </div>
                    </div>
                )}
            </div>
            <style jsx global>{`
                .active-selection { border-color: #000 !important; background: #fafafa; }
            `}</style>
        </div>
    );
}
