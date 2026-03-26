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
function RadarChart({ data, size = 300 }) {
    const points = data.length;
    const radius = size / 2 - 40;
    const center = size / 2;

    const getCoordinates = (index, value, max = 5) => {
        const angle = (Math.PI * 2 * index) / points - Math.PI / 2;
        const r = (value / max) * radius;
        return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle),
        };
    };

    // User Polygon
    const userPath = data.map((d, i) => {
        const { x, y } = getCoordinates(i, d.user);
        return `${x},${y}`;
    }).join(" ");

    // Benchmark Polygon
    const targetPath = data.map((d, i) => {
        const { x, y } = getCoordinates(i, d.target);
        return `${x},${y}`;
    }).join(" ");

    // Web/Grid
    const gridLevels = [1, 2, 3, 4, 5];

    return (
        <svg width={size} height={size} className="mx-auto overflow-visible">
            {/* Grid Lines */}
            {gridLevels.map(level => (
                <polygon
                    key={level}
                    points={data.map((_, i) => {
                        const { x, y } = getCoordinates(i, level);
                        return `${x},${y}`;
                    }).join(" ")}
                    className="fill-none stroke-gray-200"
                />
            ))}

            {/* Target Area (SCLS Green) */}
            <polygon
                points={targetPath}
                className="fill-scls-green/10 stroke-scls-green/30 stroke-2"
            />

            {/* User Area (HUST Maroon) */}
            <polygon
                points={userPath}
                className="fill-hust-maroon/40 stroke-hust-maroon stroke-2 transition-all duration-1000"
            />

            {/* Labels */}
            {data.map((d, i) => {
                const { x, y } = getCoordinates(i, 5.8); // Offset labels
                return (
                    <text
                        key={i}
                        x={x}
                        y={y}
                        textAnchor="middle"
                        className="text-[10px] font-bold fill-gray-500"
                    >
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
        setStep(5);
        try {
            const resp = await submitSurvey(formData);
            setResult(resp.data);
            setStep(6);
        } catch (err) {
            setError(err.message);
            setStep(4);
        } finally {
            setLoading(false);
        }
    };

    const selectedPos = useMemo(() => POSITIONS.find(p => p.id === formData.target_position), [formData.target_position]);

    // Mock benchmarks for visual chart
    const radarData = useMemo(() => {
        if (!selectedPos || !result) return [];
        return [
            { name: selectedPos.tools[0], user: formData.ask_scores[selectedPos.tools[0]] || 1, target: 4 },
            { name: selectedPos.tools[1], user: formData.ask_scores[selectedPos.tools[1]] || 1, target: 4 },
            { name: selectedPos.tools[2], user: formData.ask_scores[selectedPos.tools[2]] || 1, target: 4 },
            { name: "Technical English", user: formData.ask_scores["Technical English"] || 1, target: 4 },
            { name: "Problem Solving", user: 3, target: 5 }, // Inferred from situational
        ];
    }, [selectedPos, result, formData.ask_scores]);

    return (
        <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-inter">
            {/* Navbar Branding */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E5E5E7] px-8 py-5 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-2xl font-black tracking-tighter text-hust-maroon">SCLS CONNECT</Link>
                    <div className="w-[1px] h-6 bg-gray-300"></div>
                    <span className="text-xl font-bold text-scls-green">C Factory</span>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                    <div className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-500 uppercase tracking-widest">
                        HUST 29.03.2026
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-12">
                {/* Step 0: Hero */}
                {step === 0 && (
                    <div className="text-center space-y-12 py-16 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        <div className="inline-block px-4 py-1.5 bg-scls-green/10 text-scls-green rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                            Phòng Lab Năng lực FNX
                        </div>
                        <h1 className="text-6xl md:text-7xl font-black tracking-tight leading-none text-hust-maroon">
                            Audit năng lực.<br />Phát triển sự nghiệp.
                        </h1>
                        <p className="text-xl md:text-2xl text-apple-secondary max-w-2xl mx-auto leading-relaxed">
                            Dành riêng cho sinh viên Bách Khoa: Đối chiếu năng lực thực chiến với tiêu chuẩn từ Masan, Nestlé, BASF...
                        </p>
                        <div className="pt-6">
                            <button
                                onClick={nextStep}
                                className="px-12 py-5 bg-hust-maroon text-white rounded-full text-xl font-bold hover:scale-105 transition-all shadow-2xl shadow-hust-maroon/20 active:scale-95"
                            >
                                Bắt đầu Audit ngay
                            </button>
                        </div>
                        <div className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="p-6 bg-white rounded-apple border border-gray-100">
                                <div className="text-2xl mb-2">⚡</div>
                                <div className="font-bold">Real-time Analysis</div>
                                <div className="text-sm text-gray-500">Kết quả và Gaps trích xuất sau 15 giây.</div>
                            </div>
                            <div className="p-6 bg-white rounded-apple border border-gray-100">
                                <div className="text-2xl mb-2">📍</div>
                                <div className="font-bold">HUST Optimized</div>
                                <div className="text-sm text-gray-500">Matrix thiết kế riêng cho sinh viên kỹ thuật.</div>
                            </div>
                            <div className="p-6 bg-white rounded-apple border border-gray-100">
                                <div className="text-2xl mb-2">📑</div>
                                <div className="font-bold">PDF Career Path</div>
                                <div className="text-sm text-gray-500">Lộ trình đột phá gửi trực tiếp về Email.</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 1: Identity */}
                {step === 1 && (
                    <div className="max-w-xl mx-auto space-y-10 animate-in fade-in duration-500">
                        <div className="space-y-3">
                            <div className="flex gap-1 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full w-1/4 bg-hust-maroon"></div>
                            </div>
                            <h2 className="text-4xl font-black tracking-tighter pt-4">Chúng tôi cần biết bạn là ai</h2>
                        </div>
                        <div className="bg-white p-10 rounded-apple shadow-xl shadow-gray-200/50 space-y-8 border border-gray-100">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Họ và tên</label>
                                <input
                                    type="text"
                                    placeholder="Nguyễn Văn A"
                                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-hust-maroon focus:ring-1 focus:ring-hust-maroon outline-none transition-all text-lg font-medium"
                                    value={formData.name}
                                    onChange={(e) => updateForm("name", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Email nhận báo cáo</label>
                                <input
                                    type="email"
                                    placeholder="email@student.hust.edu.vn"
                                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-hust-maroon focus:ring-1 focus:ring-hust-maroon outline-none transition-all text-lg font-medium"
                                    value={formData.email}
                                    onChange={(e) => updateForm("email", e.target.value)}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Chuyên ngành</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {MAJORS.map(m => (
                                        <button
                                            key={m}
                                            onClick={() => updateForm("major", m)}
                                            className={`px-5 py-4 rounded-2xl border text-left text-base transition-all ${formData.major === m ? 'border-hust-maroon bg-hust-maroon/5 ring-1 ring-hust-maroon font-bold text-hust-maroon' : 'border-gray-200 hover:border-gray-400'}`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-4">
                                <button
                                    disabled={!formData.name || !formData.email || !formData.major}
                                    onClick={nextStep}
                                    className="w-full py-5 bg-apple-dark text-white rounded-2xl font-black text-lg hover:opacity-90 disabled:opacity-30 transition-all shadow-xl active:scale-[0.98]"
                                >
                                    Tiếp theo
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Mapping */}
                {step === 2 && (
                    <div className="max-w-xl mx-auto space-y-10 animate-in fade-in duration-500">
                        <div className="space-y-3">
                            <div className="flex gap-1 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full w-2/4 bg-hust-maroon"></div>
                            </div>
                            <h2 className="text-4xl font-black tracking-tighter pt-4">Vị trí mục tiêu của bạn?</h2>
                            <p className="text-gray-500 font-medium">Hệ thống sẽ đối chiếu năng lực chuẩn của vị trí này.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {POSITIONS.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => updateForm("target_position", p.id)}
                                    className={`p-6 rounded-apple border-2 transition-all group ${formData.target_position === p.id ? 'border-scls-green bg-scls-green/5' : 'border-white bg-white hover:border-gray-300 shadow-sm'}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="text-xl font-bold">{p.name}</div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.target_position === p.id ? 'bg-scls-green border-scls-green' : 'border-gray-200'}`}>
                                            {formData.target_position === p.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-4 pt-6">
                            <button onClick={prevStep} className="flex-1 py-5 bg-white border border-gray-200 rounded-2xl font-bold hover:bg-gray-50">Quay lại</button>
                            <button
                                disabled={!formData.target_position}
                                onClick={nextStep}
                                className="flex-[2] py-5 bg-apple-dark text-white rounded-2xl font-black text-lg hover:opacity-90 disabled:opacity-30 transition-all shadow-xl"
                            >
                                Tiếp tục
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: ASK Assessment */}
                {step === 3 && (
                    <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in duration-500">
                        <div className="space-y-3">
                            <div className="flex gap-1 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full w-3/4 bg-hust-maroon"></div>
                            </div>
                            <h2 className="text-4xl font-black tracking-tighter pt-4">Tự đánh giá kỹ năng</h2>
                            <p className="text-gray-500 font-medium">Trung thực là bước đầu để phát triển (1: Mới biết - 5: Chuyên gia).</p>
                        </div>

                        <div className="bg-white p-8 rounded-apple shadow-lg border border-gray-100 space-y-12">
                            {[...selectedPos?.tools, "Technical English"].map(tool => (
                                <div key={tool} className="space-y-6">
                                    <div className="flex justify-between items-end">
                                        <label className="text-xl font-extrabold">{tool}</label>
                                        <span className="text-scls-green font-black text-2xl">{formData.ask_scores[tool] || "—"}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-full border border-gray-100">
                                        {[1, 2, 3, 4, 5].map(num => (
                                            <button
                                                key={num}
                                                onClick={() => updateScore(tool, num)}
                                                className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold transition-all ${formData.ask_scores[tool] === num ? 'bg-apple-dark text-white scale-110 shadow-lg' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-200'}`}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button onClick={prevStep} className="flex-1 py-5 bg-white border border-gray-200 rounded-2xl font-bold hover:bg-gray-50">Quay lại</button>
                            <button
                                disabled={Object.keys(formData.ask_scores).length < (selectedPos?.tools.length + 1)}
                                onClick={nextStep}
                                className="flex-[2] py-5 bg-apple-dark text-white rounded-2xl font-black text-lg hover:opacity-90 disabled:opacity-30 transition-all shadow-xl"
                            >
                                Bước cuối cùng
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Situational */}
                {step === 4 && (
                    <div className="max-w-xl mx-auto space-y-10 animate-in fade-in duration-500">
                        <div className="space-y-3">
                            <div className="flex gap-1 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full w-full bg-hust-maroon"></div>
                            </div>
                            <h2 className="text-4xl font-black tracking-tighter pt-4">Tư duy thực chiến</h2>
                            <p className="text-gray-500 font-medium">FNX Talent Lab đánh giá cao phương pháp luận của bạn.</p>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-white p-8 rounded-apple shadow-sm border border-gray-100 space-y-4">
                                <div className="inline-block px-3 py-1 bg-hust-maroon/10 text-hust-maroon rounded-lg text-xs font-bold uppercase tracking-wider">Tình huống 1</div>
                                <label className="font-extrabold text-xl block">Phát hiện sai số trong dây chuyền sản xuất?</label>
                                <textarea
                                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 min-h-[140px] focus:border-hust-maroon outline-none transition-all placeholder:italic"
                                    placeholder="Mô tả các bước xử lý của bạn..."
                                    value={formData.situational.scenario_1}
                                    onChange={(e) => updateForm("situational", { ...formData.situational, scenario_1: e.target.value })}
                                />
                            </div>
                            <div className="bg-white p-8 rounded-apple shadow-sm border border-gray-100 space-y-4">
                                <div className="inline-block px-3 py-1 bg-scls-green/10 text-scls-green rounded-lg text-xs font-bold uppercase tracking-wider">Tình huống 2</div>
                                <label className="font-extrabold text-xl block">Thuyết phục sếp về cải tiến kỹ thuật?</label>
                                <textarea
                                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 min-h-[140px] focus:border-hust-maroon outline-none transition-all placeholder:italic"
                                    placeholder="Mô tả chiến lược thuyết phục của bạn..."
                                    value={formData.situational.scenario_2}
                                    onChange={(e) => updateForm("situational", { ...formData.situational, scenario_2: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-6">
                            <button onClick={prevStep} className="flex-1 py-5 bg-white border border-gray-200 rounded-2xl font-bold">Quay lại</button>
                            <button
                                disabled={!formData.situational.scenario_1 || !formData.situational.scenario_2}
                                onClick={handleSubmit}
                                className="flex-[2] py-5 bg-hust-maroon text-white rounded-2xl font-black text-lg hover:opacity-90 disabled:opacity-30 transition-all shadow-2xl shadow-hust-maroon/20"
                            >
                                Hoàn tất & Xem báo cáo
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 5: Loading */}
                {step === 5 && (
                    <div className="text-center py-24 space-y-12 animate-in fade-in zoom-in duration-1000">
                        <div className="relative w-32 h-32 mx-auto">
                            <div className="absolute inset-0 border-4 border-hust-maroon/20 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-hust-maroon border-t-transparent rounded-full animate-spin"></div>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-3xl font-black tracking-tight">FNX Agent đang phân tích...</h2>
                            <div className="text-gray-400 font-medium space-y-2 max-w-sm mx-auto">
                                <div className="overflow-hidden h-2 bg-gray-100 rounded-full">
                                    <div className="h-full bg-scls-green animate-[progress_3s_ease-in-out_infinite]"></div>
                                </div>
                                <p className="text-sm">Xây dựng Career Path dành riêng cho <strong>{formData.name}</strong></p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 6: Result (High Fidelity) */}
                {step === 6 && result && (
                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                        {/* Header Result */}
                        <div className="text-center space-y-6">
                            <div className="inline-flex items-center gap-2 px-5 py-2 bg-scls-green text-white rounded-full font-bold text-sm">
                                <span className="animate-pulse">●</span> Audit Successfully Completed
                            </div>
                            <h2 className="text-5xl font-black tracking-tighter">Báo cáo Năng lực thực chiến</h2>
                            <div className="flex justify-center items-center gap-12 py-6">
                                <div className="text-center">
                                    <div className="text-8xl font-black text-scls-green tracking-tighter leading-none">{result.match_score}<span className="text-4xl">%</span></div>
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-4">Match Index</div>
                                </div>
                                <div className="h-20 w-[1px] bg-gray-200"></div>
                                <div className="text-left max-w-xs">
                                    <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Status</div>
                                    <div className="text-xl font-extrabold leading-tight">
                                        {result.match_score > 80 ? "Tiềm năng xuất sắc" : result.match_score > 60 ? "Sẵn sàng nhập cuộc" : "Cần bổ sung kỹ năng"}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-2 font-medium">Dựa trên tiêu chuẩn của {selectedPos?.name}</div>
                                </div>
                            </div>
                        </div>

                        {/* Visual Analytics */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Radar Chart Card */}
                            <div className="bg-white p-10 rounded-apple shadow-xl shadow-gray-200/50 border border-gray-100 text-center">
                                <h3 className="text-xl font-black text-left mb-8 flex items-center gap-2">
                                    <span className="w-2 h-6 bg-hust-maroon rounded-full inline-block"></span>
                                    Biểu đồ Năng lực
                                </h3>
                                <RadarChart data={radarData} />
                                <div className="flex justify-center gap-6 mt-8">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-hust-maroon rounded-full"></div>
                                        <span className="text-xs font-bold text-gray-500 uppercase">Hồ sơ của bạn</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-scls-green opacity-30 rounded-full"></div>
                                        <span className="text-xs font-bold text-gray-500 uppercase">Benchmark Ngành</span>
                                    </div>
                                </div>
                            </div>

                            {/* Skill Bars Card */}
                            <div className="bg-white p-10 rounded-apple shadow-xl shadow-gray-200/50 border border-gray-100">
                                <h3 className="text-xl font-black mb-8 flex items-center gap-2">
                                    <span className="w-2 h-6 bg-scls-green rounded-full inline-block"></span>
                                    Khoảng cách kỹ năng (GAP)
                                </h3>
                                <div className="space-y-8">
                                    {result.gaps.slice(0, 4).map((g, i) => (
                                        <div key={i} className="space-y-2">
                                            <div className="flex justify-between font-bold text-sm uppercase tracking-wide">
                                                <span>{g.skill}</span>
                                                <span className={g.gap_value < 0 ? 'text-hust-maroon' : 'text-scls-green'}>
                                                    {g.gap_value > 0 ? `+${g.gap_value}` : g.gap_value}
                                                </span>
                                            </div>
                                            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex">
                                                <div
                                                    className={`h-full transition-all duration-1000 delay-500 ${g.gap_value < 0 ? 'bg-hust-maroon' : 'bg-scls-green'}`}
                                                    style={{ width: `${(Math.max(1, 4 + g.gap_value) / 5) * 100}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-400 leading-relaxed font-medium">{g.explanation}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Career Roadmap Card */}
                        <div className="bg-apple-dark text-white p-12 rounded-[32px] shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-scls-green/40 blur-[100px] -mr-32 -mt-32"></div>
                            <div className="relative z-10 space-y-8">
                                <h3 className="text-3xl font-black tracking-tight flex items-center gap-3">
                                    Lộ trình Đột phá (Career Roadmap)
                                    <span className="text-xs px-3 py-1 bg-white/10 rounded-full font-bold uppercase tracking-widest">FNX Optimized</span>
                                </h3>
                                <div className="text-xl leading-relaxed text-gray-300 italic font-medium border-l-4 border-scls-green pl-8">
                                    "{result.career_path}"
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                                    {result.recommendations.map((rec, i) => (
                                        <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all">
                                            <div className="text-scls-green font-black mb-2 uppercase tracking-widest text-xs">Phát triển #{i + 1}</div>
                                            <div className="font-bold text-lg mb-2">{rec.action}</div>
                                            <div className="text-sm text-gray-400">{rec.reason}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-10 flex flex-col md:flex-row gap-6">
                                    <button className="flex-1 py-5 bg-white text-apple-dark rounded-2xl font-black text-lg hover:scale-105 transition-all shadow-xl">
                                        📥 Download PDF Report
                                    </button>
                                    <Link href="/" className="flex-1 py-5 bg-white/10 text-white border border-white/20 rounded-2xl font-bold flex items-center justify-center hover:bg-white/20 transition-all">
                                        Quay lại Trang chủ
                                    </Link>
                                </div>
                                <p className="text-center text-xs text-white/40 font-bold uppercase tracking-widest">
                                    Bản quyền báo cáo thuộc về FNX Talent Lab & SCLS Connector
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mt-8 p-6 bg-red-50 text-hust-maroon rounded-2xl text-sm font-bold border border-red-100 animate-in shake duration-500">
                        ⚠️ Lỗi hệ thống: {error}. Vui lòng thử lại hoặc báo cho nhân viên tại booth.
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="mt-24 border-t border-gray-100 py-16 px-8 bg-white">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col gap-2">
                        <div className="text-2xl font-black text-hust-maroon">SCLS CONNECT 2026</div>
                        <div className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none">Kiến tạo tương lai</div>
                    </div>
                    <div className="text-right text-sm text-gray-400 font-medium">
                        © 2026 FNX Talent Factory. <br />
                        Powered by Gemini 2.0 Flash & Korn Ferry Framework.
                    </div>
                </div>
            </footer>
        </div>
    );
}
