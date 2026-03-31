"use client";

import { useState, useMemo, useEffect } from "react";
import { submitSurvey } from "@/lib/api";
import { MAJORS, POSITIONS, SCORING_RUBRIC } from "@/lib/constants";
import Link from "next/link";
import ReportView from "@/components/ReportView";

export default function SCLSConnect() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        major: "",
        target_position: "",
        ask_scores: {},
        situational: { scenario_1: "", scenario_2: "" }
    });
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const [isLoaded, setIsLoaded] = useState(false);

    // ── Trace Logger ──
    const logTrace = (action, details = {}) => {
        if (typeof window === "undefined") return;
        const traces = JSON.parse(localStorage.getItem("scls_traces") || "[]");
        traces.push({
            timestamp: new Date().toISOString(),
            step,
            action,
            details,
            userName: formData.name || "Anonymous"
        });
        localStorage.setItem("scls_traces", JSON.stringify(traces.slice(-100))); // Match last 100
    };

    // ── Persistence (Load) ──
    useEffect(() => {
        const saved = localStorage.getItem("scls_current_session");
        if (saved) {
            try {
                const { step: s, formData: f, result: r } = JSON.parse(saved);
                setStep(s || 1);
                setFormData(f || formData);
                setResult(r || null);
                logTrace("Session Resumed", { resumedStep: s });
            } catch (e) {
                console.error("Failed to parse saved session", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // ── Persistence (Save) ──
    useEffect(() => {
        if (!isLoaded) return;
        const session = { step, formData, result };
        localStorage.setItem("scls_current_session", JSON.stringify(session));
    }, [step, formData, result, isLoaded]);

    const updateForm = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (field === "major") logTrace("Major Selected", { major: value });
    };

    const updateScore = (name, score) => {
        setFormData(prev => ({
            ...prev,
            ask_scores: { ...prev.ask_scores, [name]: score }
        }));
        logTrace("Score Updated", { skill: name, score });
    };

    const handleNextStep = (next) => {
        logTrace("Step Changed", { from: step, to: next });
        setStep(next);
        window.scrollTo(0, 0);
    };

    const selectedPos = useMemo(() => {
        return POSITIONS.find(p => p.id === formData.target_position);
    }, [formData.target_position]);

    const handleSubmit = async () => {
        logTrace("Survey Submitted", { formData });
        setStep(5);
        setError("");
        try {
            const response = await submitSurvey(formData);
            setResult(response.data);

            // Save to local history
            const history = JSON.parse(localStorage.getItem("scls_history") || "[]");
            history.push({
                timestamp: new Date().toISOString(),
                formData,
                result: response.data
            });
            localStorage.setItem("scls_history", JSON.stringify(history));

            setStep(6);
            logTrace("Analysis Success", { match_score: response.data.match_score });
        } catch (err) {
            setError(err.message);
            setStep(4);
            logTrace("Analysis Failed", { error: err.message });
        }
    };

    if (!isLoaded) return null;

    return (
        <div className="scls-page">
            <style jsx global>{`
                .scls-page { min-height: 100vh; background: #fff; color: #1d1d1f; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 2rem; }
                .headline { font-size: 3rem; font-weight: 800; letter-spacing: -0.02em; line-height: 1.1; margin-bottom: 2rem; }
                .apple-card { background: #fff; border-radius: 24px; padding: 1.5rem; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.01), 0 2px 4px -1px rgba(0,0,0,0.01); }
                .apple-card:hover { transform: translateY(-2px); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.02); }
                .hust-input { width: 100%; border: none; background: #f5f5f7; border-radius: 14px; padding: 1.25rem; font-size: 1.1rem; margin-bottom: 1rem; outline: none; transition: background 0.2s; }
                .hust-input:focus { background: #eeeeef; }
                .option-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
                .option-btn { border: 2px solid transparent; background: #f5f5f7; padding: 1.5rem; border-radius: 18px; text-align: left; cursor: pointer; transition: all 0.2s; font-weight: 600; }
                .option-btn.active { border-color: #8B1D1D; background: #FFF5F5; }
                .btn-hust { background: #8B1D1D; color: #fff; border: none; padding: 1.25rem 2.5rem; border-radius: 18px; font-weight: 700; font-size: 1.1rem; cursor: pointer; transition: all 0.2s; width: 100%; }
                .btn-hust:hover { background: #a52626; transform: scale(1.02); }
                .btn-hust:disabled { background: #e5e5e7; cursor: not-allowed; transform: none; }
                .score-dot { width: 44px; height: 44px; border-radius: 50%; display: flex; alignItems: center; justifyContent: center; cursor: pointer; border: 2px solid #e5e5e7; transition: all 0.2s; font-weight: 700; color: #86868b; }
                .score-dot.active { background: #8B1D1D; border-color: #8B1D1D; color: #fff; transform: scale(1.1); }
                .step-indicator { height: 4px; background: #f5f5f7; border-radius: 2px; margin-bottom: 3rem; overflow: hidden; }
                .step-indicator-fill { height: 100%; background: #8B1D1D; transition: width 0.3s; }
                .scls-badge { display: inline-block; background: #F2F2F7; padding: 4px 12px; border-radius: 100px; font-size: 0.75rem; font-weight: 700; color: #8B1D1D; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em; }
                .progress-container { height: 8px; background: #f5f5f7; border-radius: 4px; overflow: hidden; }
                .progress-fill { height: 100%; transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
                .progress-fill.hust { background: #8B1D1D; }
                .progress-fill.scls { background: #005A31; }
                .career-roadmap-box { background: #000; color: #fff; border-radius: 40px; padding: 4rem; margin: 4rem 0; overflow: hidden; position: relative; }
                .career-roadmap-content { position: relative; z-index: 2; }
                .scls-footer { margin-top: 8rem; padding: 4rem 0; border-top: 1px solid #e5e5e7; text-align: center; color: #86868b; font-size: 0.9rem; }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-in { animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
            `}</style>

            <Link href="/" style={{ display: 'inline-block', marginBottom: '3rem', fontWeight: '600', color: '#86868b' }}>← Trang chủ</Link>

            {/* Step 1: Info */}
            {step === 1 && (
                <div className="animate-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div className="step-indicator"><div className="step-indicator-fill" style={{ width: '25%' }}></div></div>
                    <h2 className="headline">Chào mừng bạn đến với SCLS Connect 2026</h2>
                    <p style={{ color: '#86868b', marginBottom: '2.5rem', fontSize: '1.25rem' }}>Hãy điền thông tin và chuyên ngành để chúng tôi phân tích hành trình của bạn.</p>

                    <div className="apple-card" style={{ padding: '2rem' }}>
                        <input className="hust-input" placeholder="Họ và tên của bạn" value={formData.name} onChange={e => updateForm("name", e.target.value)} />
                        <input className="hust-input" placeholder="Email nhận kết quả" value={formData.email} onChange={e => updateForm("email", e.target.value)} />

                        <div style={{ marginTop: '2rem' }}>
                            <p style={{ fontWeight: '700', marginBottom: '1rem' }}>Chuyên ngành học tập</p>
                            <div className="option-grid">
                                {MAJORS.map(m => (
                                    <div key={m} onClick={() => updateForm("major", m)} className={`option-btn ${formData.major === m ? 'active' : ''}`}>
                                        {m}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button disabled={!formData.name || !formData.email || !formData.major} onClick={() => handleNextStep(2)} className="btn-hust" style={{ marginTop: '1rem' }}>Bắt đầu Audit ngay</button>
                    </div>
                </div>
            )}

            {/* Step 2: Target */}
            {step === 2 && (
                <div className="animate-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div className="step-indicator"><div className="step-indicator-fill" style={{ width: '50%' }}></div></div>
                    <h2 className="headline">Bạn muốn trở thành ai?</h2>
                    <p style={{ color: '#86868b', marginBottom: '2.5rem' }}>Chọn vị trí/vị thế nghề nghiệp mục tiêu của bạn sau khi ra trường.</p>
                    <div className="option-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                        {POSITIONS.map(p => (
                            <div key={p.id} onClick={() => { updateForm("target_position", p.id); logTrace("Role Selected", { role: p.name }); }} className={`option-btn ${formData.target_position === p.id ? 'active' : ''}`} style={{ padding: '2.5rem' }}>
                                <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{p.name}</div>
                                <div style={{ fontSize: '0.85rem', color: '#86868b', fontWeight: '400' }}>Focus: {p.tools.map(t => t.name).join(", ")}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button onClick={() => handleNextStep(1)} style={{ flex: 1, padding: '1.25rem', borderRadius: '18px', border: '1px solid #E5E5E7', background: 'white', fontWeight: '700' }}>Quay lại</button>
                        <button disabled={!formData.target_position} onClick={() => handleNextStep(3)} className="btn-hust" style={{ flex: 2 }}>Tiếp theo</button>
                    </div>
                </div>
            )}

            {/* Step 3: ASK */}
            {step === 3 && (
                <div className="animate-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div className="step-indicator"><div className="step-indicator-fill" style={{ width: '75%' }}></div></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <div>
                            <h2 className="headline" style={{ marginBottom: '0.5rem' }}>Đánh giá Kỹ năng</h2>
                            <p style={{ color: '#86868B' }}>Chọn kỹ năng của bạn trên thang điểm 1-5.</p>
                        </div>
                    </div>

                    <div className="apple-card" style={{ padding: '1.25rem', background: '#F0F9F4', border: '1px solid #D1EADE', marginBottom: '1.5rem', borderRadius: '16px' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#005A31', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tiêu chuẩn đánh giá (Rubric)</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' }}>
                            {SCORING_RUBRIC.map(unit => (
                                <div key={unit.level} style={{ fontSize: '0.7rem', lineHeight: '1.4' }}>
                                    <div style={{ fontWeight: '800', color: '#333' }}>Lvl {unit.level}: {unit.label}</div>
                                    <div style={{ color: '#666' }}>{unit.detail}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="apple-card" style={{ padding: '2rem' }}>
                        {[...selectedPos.tools, { name: "Technical English", desc: "Kỹ năng đọc hiểu tài liệu và giao tiếp chuyên môn." }].map(tool => (
                            <div key={tool.name} style={{ marginBottom: '2.5rem' }}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '1.15rem', fontWeight: '700' }}>{tool.name}</span>
                                        <span style={{ color: '#005A31', fontWeight: '900', fontSize: '1.5rem' }}>{formData.ask_scores[tool.name] || '—'}</span>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: '#86868B', marginTop: '4px' }}>{tool.desc}</p>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8F8F9', padding: '8px', borderRadius: '100px' }}>
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <div
                                            key={num}
                                            onClick={() => updateScore(tool.name, num)}
                                            className={`score-dot ${formData.ask_scores[tool.name] === num ? 'active' : ''}`}
                                            title={SCORING_RUBRIC[num - 1].detail}
                                        >
                                            {num}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <div style={{ display: 'flex', gap: '15px', marginTop: '2rem' }}>
                            <button onClick={() => handleNextStep(2)} style={{ flex: 1, padding: '1.25rem', borderRadius: '18px', border: '1px solid #E5E5E7', background: 'white', fontWeight: '700' }}>Quay lại</button>
                            <button disabled={Object.keys(formData.ask_scores).length < (selectedPos.tools.length + 1)} onClick={() => handleNextStep(4)} className="btn-hust" style={{ flex: 2 }}>Tiếp tục</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Step 4: Situational */}
            {step === 4 && (
                <div className="animate-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div className="step-indicator"><div className="step-indicator-fill" style={{ width: '100%' }}></div></div>
                    <h2 className="headline">Tư duy Xử lý</h2>
                    <p style={{ color: '#86868B', marginBottom: '2.5rem' }}>Phân tích cách bạn giải quyết vấn đề thực tế.</p>

                    <div className="apple-card" style={{ marginBottom: '2rem' }}>
                        <h4 style={{ marginBottom: '1rem', fontWeight: '800' }}>Tình huống 1: Sai lệch quy trình</h4>
                        <textarea className="hust-input" style={{ minHeight: '120px' }} placeholder="Bạn sẽ làm gì nếu thông số sản xuất bị lệch?" value={formData.situational.scenario_1} onChange={e => { updateForm("situational", { ...formData.situational, scenario_1: e.target.value }); logTrace("Scenario 1 Answered"); }} />
                    </div>

                    <div className="apple-card" style={{ marginBottom: '2rem' }}>
                        <h4 style={{ marginBottom: '1rem', fontWeight: '800' }}>Tình huống 2: Thuyết phục cải tiến</h4>
                        <textarea className="hust-input" style={{ minHeight: '120px' }} placeholder="Cách bạn thuyết phục cấp trên về một giải pháp mới?" value={formData.situational.scenario_2} onChange={e => { updateForm("situational", { ...formData.situational, scenario_2: e.target.value }); logTrace("Scenario 2 Answered"); }} />
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginTop: '2rem' }}>
                        <button onClick={() => handleNextStep(3)} style={{ flex: 1, padding: '1.25rem', borderRadius: '18px', border: '1px solid #E5E5E7', background: 'white', fontWeight: '700' }}>Quay lại</button>
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
                <ReportView result={result} formData={formData} selectedPos={selectedPos} isAdmin={false} />
            )}

            <div className="scls-footer">
                © 2026 FNX Talent Factory • SCLS CONNECT 2026<br />
                Hệ thống Thẩm định Năng lực Thực chiến
            </div>
        </div>
    );
}
