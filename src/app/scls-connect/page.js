"use client";

import { useState } from "react";
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

export default function SCLSConnectSurvey() {
    const [step, setStep] = useState(0); // 0 (Hero) to 6 (Result)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        major: "",
        target_position: "",
        ask_scores: {}, // e.g., { "SCADA": 3, "English": 4 }
        situational: {
            scenario_1: "",
            scenario_2: ""
        }
    });

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const updateForm = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateScore = (tool, score) => {
        setFormData(prev => ({
            ...prev,
            ask_scores: { ...prev.ask_scores, [tool]: score }
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setStep(5); // Show loading page
        try {
            const resp = await submitSurvey(formData);
            setResult(resp.data);
            setStep(6); // Show result page
        } catch (err) {
            setError(err.message);
            setStep(4); // Go back to situational to retry
        } finally {
            setLoading(false);
        }
    };

    const selectedPos = POSITIONS.find(p => p.id === formData.target_position);

    return (
        <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-inter">
            {/* Navbar Branding */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E5E5E7] px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Link href="/" className="text-xl font-bold tracking-tight text-[#8B1D1D]">SCLS Connect</Link>
                    <span className="text-[#86868B] text-sm">X</span>
                    <span className="text-lg font-semibold text-[#005A31]">C Factory</span>
                </div>
                <div className="hidden md:flex gap-6 text-sm font-medium text-[#1D1D1F]/60">
                    <span>29.03.2026</span>
                    <span>ĐHBK Hà Nội</span>
                </div>
            </nav>

            <main className="max-w-2xl mx-auto px-6 py-12">
                {/* Step 0: Hero */}
                {step === 0 && (
                    <div className="text-center space-y-8 py-10">
                        <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
                            Audit năng lực.<br />Phát triển sự nghiệp.
                        </h1>
                        <p className="text-xl text-[#86868B] max-w-lg mx-auto">
                            Công cụ "Talent Lab Check-up" giúp sinh viên Bách Khoa đối chiếu năng lực thực chiến với tiêu chuẩn ngành.
                        </p>
                        <button
                            onClick={nextStep}
                            className="px-10 py-4 bg-[#8B1D1D] text-white rounded-full text-lg font-semibold hover:opacity-90 transition-all shadow-lg"
                        >
                            Bắt đầu Audit ngay
                        </button>
                        <div className="pt-12 text-sm text-[#86868B]">
                            29.03.2026 • SCLS CONNECT — KẾT NỐI TRI THỨC, KIẾN TẠO TƯƠNG LAI
                        </div>
                    </div>
                )}

                {/* Step 1: Identity */}
                {step === 1 && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="space-y-2">
                            <span className="text-sm font-bold text-[#86868B] uppercase tracking-widest">Bước 1 / 4</span>
                            <h2 className="text-3xl font-bold">Thông tin cá nhân</h2>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Họ và tên</label>
                                <input
                                    type="text"
                                    placeholder="VD: Nguyễn Văn A"
                                    className="w-full px-4 py-3 rounded-xl border border-[#D2D2D7] focus:border-[#8B1D1D] outline-none transition-all"
                                    value={formData.name}
                                    onChange={(e) => updateForm("name", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Email (Để nhận bản PDF Career Path)</label>
                                <input
                                    type="email"
                                    placeholder="email@student.hust.edu.vn"
                                    className="w-full px-4 py-3 rounded-xl border border-[#D2D2D7] focus:border-[#8B1D1D] outline-none transition-all"
                                    value={formData.email}
                                    onChange={(e) => updateForm("email", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Chuyên ngành</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {MAJORS.map(m => (
                                        <button
                                            key={m}
                                            onClick={() => updateForm("major", m)}
                                            className={`px-4 py-3 rounded-xl border text-left text-sm transition-all ${formData.major === m ? 'border-[#8B1D1D] bg-[#8B1D1D]/5 font-semibold' : 'border-[#D2D2D7] hover:border-[#86868B]'}`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="pt-8">
                            <button
                                disabled={!formData.name || !formData.email || !formData.major}
                                onClick={nextStep}
                                className="w-full py-4 bg-[#1D1D1F] text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-30 transition-all"
                            >
                                Tiếp tục
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Mapping (Target Position) */}
                {step === 2 && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="space-y-2">
                            <span className="text-sm font-bold text-[#86868B] uppercase tracking-widest">Bước 2 / 4</span>
                            <h2 className="text-3xl font-bold">Vị trí mục tiêu Audit</h2>
                            <p className="text-[#86868B]">Chọn vị trí bạn muốn đối chiếu năng lực thực chiến.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {POSITIONS.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => updateForm("target_position", p.id)}
                                    className={`p-4 rounded-xl border text-left transition-all ${formData.target_position === p.id ? 'border-[#005A31] bg-[#005A31]/5 ring-1 ring-[#005A31]' : 'border-[#D2D2D7] hover:border-[#86868B]'}`}
                                >
                                    <div className="font-bold">{p.name}</div>
                                </button>
                            ))}
                        </div>
                        <div className="pt-8 flex gap-4">
                            <button onClick={prevStep} className="flex-1 py-4 border border-[#D2D2D7] rounded-xl font-bold">Quay lại</button>
                            <button
                                disabled={!formData.target_position}
                                onClick={nextStep}
                                className="flex-[2] py-4 bg-[#1D1D1F] text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-30 transition-all"
                            >
                                Tiếp tục
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: ASK Assessment */}
                {step === 3 && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="space-y-2">
                            <span className="text-sm font-bold text-[#86868B] uppercase tracking-widest">Bước 3 / 4</span>
                            <h2 className="text-3xl font-bold">Đánh giá Năng lực (ASK)</h2>
                            <p className="text-[#86868B]">Đánh giá trình độ của bạn với các công cụ/kỹ năng trọng tâm (1: Mới biết - 5: Chuyên gia).</p>
                        </div>

                        <div className="space-y-10">
                            {selectedPos?.tools.map(tool => (
                                <div key={tool} className="space-y-4">
                                    <label className="font-bold block text-lg">{tool}</label>
                                    <div className="flex justify-between items-center gap-2">
                                        {[1, 2, 3, 4, 5].map(num => (
                                            <button
                                                key={num}
                                                onClick={() => updateScore(tool, num)}
                                                className={`w-12 h-12 rounded-full border flex items-center justify-center font-bold transition-all ${formData.ask_scores[tool] === num ? 'bg-[#005A31] text-white border-[#005A31]' : 'border-[#D2D2D7] hover:border-[#86868B]'}`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <div className="space-y-4">
                                <label className="font-bold block text-lg">Tiếng Anh Kỹ Thuật (Technical English)</label>
                                <p className="text-sm text-[#86868B]">Bạn tự tin ở mức nào khi đọc hiểu spec quốc tế?</p>
                                <div className="flex justify-between items-center gap-2">
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <button
                                            key={num}
                                            onClick={() => updateScore("Technical English", num)}
                                            className={`w-12 h-12 rounded-full border flex items-center justify-center font-bold transition-all ${formData.ask_scores["Technical English"] === num ? 'bg-[#005A31] text-white border-[#005A31]' : 'border-[#D2D2D7] hover:border-[#86868B]'}`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 flex gap-4">
                            <button onClick={prevStep} className="flex-1 py-4 border border-[#D2D2D7] rounded-xl font-bold">Quay lại</button>
                            <button
                                disabled={Object.keys(formData.ask_scores).length < (selectedPos?.tools.length + 1)}
                                onClick={nextStep}
                                className="flex-[2] py-4 bg-[#1D1D1F] text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-30 transition-all"
                            >
                                Tiếp tục
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Situational */}
                {step === 4 && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="space-y-2">
                            <span className="text-sm font-bold text-[#86868B] uppercase tracking-widest">Bước 4 / 4</span>
                            <h2 className="text-3xl font-bold">Tư duy xử lý (Situational)</h2>
                            <p className="text-[#86868B]">Phân tích tình huống để đánh giá tư duy giải quyết vấn đề.</p>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="font-bold text-lg">Tình huống 1: Phát hiện sai lệch quy trình</label>
                                <p className="text-sm text-[#86868B]">Nếu bạn phát hiện một thông số sản xuất (nhiệt độ/nồng độ) bị lệch khỏi tiêu chuẩn trong khi ca sản xuất đang chạy, bạn sẽ làm gì?</p>
                                <textarea
                                    className="w-full px-4 py-3 rounded-xl border border-[#D2D2D7] min-h-[120px] outline-none"
                                    placeholder="Mô tả cách xử lý của bạn..."
                                    value={formData.situational.scenario_1}
                                    onChange={(e) => updateForm("situational", { ...formData.situational, scenario_1: e.target.value })}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="font-bold text-lg">Tình huống 2: Tối ưu hiệu quả</label>
                                <p className="text-sm text-[#86868B]">Bạn đề xuất một cải tiến kỹ thuật nhưng cấp trên lo ngại về chi phí. Bạn sẽ thuyết phục như thế nào?</p>
                                <textarea
                                    className="w-full px-4 py-3 rounded-xl border border-[#D2D2D7] min-h-[120px] outline-none"
                                    placeholder="Mô tả cách bạn thuyết phục..."
                                    value={formData.situational.scenario_2}
                                    onChange={(e) => updateForm("situational", { ...formData.situational, scenario_2: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-8 flex gap-4">
                            <button onClick={prevStep} className="flex-1 py-4 border border-[#D2D2D7] rounded-xl font-bold">Quay lại</button>
                            <button
                                disabled={!formData.situational.scenario_1 || !formData.situational.scenario_2}
                                onClick={handleSubmit}
                                className="flex-[2] py-4 bg-[#8B1D1D] text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-30 transition-all shadow-lg"
                            >
                                Hoàn tất Audit
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 5: Loading */}
                {step === 5 && (
                    <div className="text-center py-20 space-y-10 animate-pulse">
                        <div className="w-24 h-24 border-4 border-[#8B1D1D] border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold">AI đang phân tích lộ trình của bạn...</h2>
                            <div className="text-[#86868B] space-y-1">
                                <p className="animate-in slide-in-from-bottom duration-1000">Đang đối chiếu với Benchmark ngành...</p>
                                <p className="animate-in slide-in-from-bottom duration-2000 delay-1000">Đang xác định khoảng cách kỹ năng (GAP)...</p>
                                <p className="animate-in slide-in-from-bottom duration-3000 delay-2000">Đang xây dựng Career Path cá nhân hóa...</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 6: Result */}
                {step === 6 && result && (
                    <div className="space-y-10 animate-in zoom-in duration-700">
                        <div className="text-center space-y-4">
                            <div className="bg-[#005A31] text-white px-6 py-2 rounded-full inline-block font-bold">Audit Completed</div>
                            <h2 className="text-4xl font-extrabold">Kết quả Năng lực thực chiến</h2>
                            <div className="pt-6">
                                <div className="text-7xl font-black text-[#005A31]">{result.match_score}%</div>
                                <div className="text-sm font-bold text-[#86868B] uppercase tracking-widest mt-2">Chỉ số phù hợp mục tiêu</div>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-3xl space-y-6 shadow-sm border border-[#E5E5E7]">
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold">Tổng quan (Summary)</h3>
                                <p className="text-[#1D1D1F] leading-relaxed">{result.summary}</p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-bold">Khoảng cách kỹ năng (Gaps)</h3>
                                <div className="space-y-3">
                                    {result.gaps.map((g, i) => (
                                        <div key={i} className="p-4 bg-[#F5F5F7] rounded-xl flex justify-between items-start gap-4">
                                            <div className="space-y-1">
                                                <div className="font-bold">{g.skill}</div>
                                                <div className="text-xs text-[#86868B]">{g.explanation}</div>
                                            </div>
                                            <div className={`px-2 py-1 rounded text-xs font-bold ${g.gap_value < 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                {g.gap_value > 0 ? `+${g.gap_value}` : g.gap_value}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-bold">Lộ trình đột phá (Career Path)</h3>
                                <div className="p-6 bg-[#005A31]/5 rounded-2xl border border-[#005A31]/10 text-[#005A31] leading-relaxed italic">
                                    {result.career_path}
                                </div>
                            </div>

                            <div className="pt-6">
                                <button className="w-full py-4 bg-[#1D1D1F] text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2">
                                    📥 Download bản PDF chi tiết (Email)
                                </button>
                                <p className="text-center text-xs text-[#86868B] mt-4">
                                    Kết quả đã được gửi về email <strong>{formData.email}</strong>
                                </p>
                            </div>
                        </div>

                        <div className="text-center pt-8">
                            <Link href="/" className="text-[#8B1D1D] font-bold hover:underline">← Quay lại Trang chủ C Factory</Link>
                        </div>
                    </div>
                )}

                {error && step === 4 && (
                    <div className="mt-8 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                        ⚠️ Lỗi: {error}. Vui lòng thử lại.
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="mt-20 border-t border-[#E5E5E7] py-12 px-6 bg-white">
                <div className="max-w-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-[#86868B] text-sm">
                    <div className="flex items-center gap-4">
                        <div className="font-bold text-[#1D1D1F]">SCLS CONNECT 2026</div>
                        <span>•</span>
                        <div>FNX Talent Factory</div>
                    </div>
                    <div>© 2026 FNX. Lab with systematic competency.</div>
                </div>
            </footer>
        </div>
    );
}
