"use client";

import { useState, useEffect } from "react";
import { INDUSTRIES, SENIORITY_LEVELS, USER_INTENTS } from "@/lib/constants";

export default function InfoGateModal({ isOpen, onComplete, initialData = {} }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        industry: INDUSTRIES[0],
        seniority: SENIORITY_LEVELS[0],
        intent: USER_INTENTS[0],
        social: "",
        ...initialData
    });

    useEffect(() => {
        // Load from localStorage if available
        const saved = localStorage.getItem("cfactory_user_profile");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setFormData(prev => ({ ...prev, ...parsed }));
            } catch (e) { }
        }
    }, []);

    const isFormValid = formData.name.trim() !== "" &&
        formData.email.trim() !== "" &&
        formData.email.includes("@");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        // Save to localStorage for future use
        localStorage.setItem("cfactory_user_profile", JSON.stringify(formData));
        onComplete(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content animate-in">
                <div className="text-center mb-4">
                    <div className="scls-badge mb-1">Bước cuối cùng</div>
                    <h2 className="headline" style={{ fontSize: '1.75rem' }}>Hoàn tất hồ sơ năng lực</h2>
                    <p className="body-text mt-1" style={{ fontSize: '0.9rem', color: '#666' }}>
                        Vui lòng cung cấp thông tin để C Factory tối ưu kết quả và lưu trữ vào hệ thống quản trị.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="stagger">
                    <div className="form-row">
                        <div className="form-group mb-3">
                            <label className="form-label">Họ và tên *</label>
                            <input
                                className="form-input"
                                placeholder="Nguyễn Văn A"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label">Email *</label>
                            <input
                                className="form-input"
                                type="email"
                                placeholder="email@gmail.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group mb-3">
                        <label className="form-label">Ngành nghề (Industry) *</label>
                        <select
                            className="form-input"
                            value={formData.industry}
                            onChange={e => setFormData({ ...formData, industry: e.target.value })}
                        >
                            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group mb-3">
                            <label className="form-label">Cấp bậc (Seniority) *</label>
                            <select
                                className="form-input"
                                value={formData.seniority}
                                onChange={e => setFormData({ ...formData, seniority: e.target.value })}
                            >
                                {SENIORITY_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="form-group mb-3">
                            <label className="form-label">Mục đích sử dụng *</label>
                            <select
                                className="form-input"
                                value={formData.intent}
                                onChange={e => setFormData({ ...formData, intent: e.target.value })}
                            >
                                {USER_INTENTS.map(intent => <option key={intent} value={intent}>{intent}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-group mb-4">
                        <label className="form-label">LinkedIn / Portfolio Link (Tùy chọn)</label>
                        <input
                            className="form-input"
                            placeholder="https://linkedin.com/in/..."
                            value={formData.social}
                            onChange={e => setFormData({ ...formData, social: e.target.value })}
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="btn btn-primary btn-lg w-full"
                            disabled={!isFormValid}
                        >
                            Hoàn tất & Xem kết quả
                        </button>
                    </div>
                </form>
            </div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    padding: 1rem;
                }
                .modal-content {
                    background: white;
                    padding: 2.5rem;
                    border-radius: 24px;
                    width: 100%;
                    max-width: 560px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                    border: 1px solid #f0f0f0;
                }
                .w-full { width: 100%; }
            `}</style>
        </div>
    );
}
