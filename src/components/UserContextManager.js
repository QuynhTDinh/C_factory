"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { INDUSTRIES, SENIORITY_LEVELS } from "@/lib/constants";

export default function UserContextManager({ children }) {
    const { data: session, status } = useSession();
    const [profile, setProfile] = useState(null);
    const [isFirstTime, setIsFirstTime] = useState(false);

    useEffect(() => {
        if (status === "authenticated" && session?.user?.email) {
            const saved = localStorage.getItem(`cfactory_profile_${session.user.email}`);
            if (saved) {
                setProfile(JSON.parse(saved));
            } else {
                setIsFirstTime(true);
            }
        }
    }, [status, session]);

    const handleSaveProfile = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newProfile = {
            industry: formData.get("industry"),
            seniority: formData.get("seniority"),
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem(`cfactory_profile_${session.user.email}`, JSON.stringify(newProfile));
        setProfile(newProfile);
        setIsFirstTime(false);
    };

    if (status === "loading") {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="loading-spinner" style={{ borderTopColor: '#0071E3' }}></div>
            </div>
        );
    }

    if (status === "unauthenticated") {
        return (
            <div className="container-narrow animate-in" style={{ padding: '6rem 0', textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎯</div>
                <h2 className="headline">Chào mừng bạn đến với C Factory</h2>
                <p className="body-text mt-1 mb-3">Vui lòng đăng nhập bằng Google để mở khóa tính năng phân tích và lưu trữ bản đồ năng lực cá nhân.</p>
                <button onClick={() => signIn("google")} className="btn btn-primary btn-lg">Đăng nhập ngay</button>
            </div>
        );
    }

    if (isFirstTime) {
        return (
            <div className="modal-overlay">
                <div className="modal-content animate-in">
                    <h2 className="headline mb-2" style={{ fontSize: '1.5rem' }}>Thiết lập bối cảnh</h2>
                    <p className="body-text mb-4" style={{ fontSize: '0.9rem' }}>
                        Chào <strong>{session.user.name}</strong>, hãy cho chúng tôi biết bối cảnh của bạn để AI có thể tư vấn chính xác nhất.
                    </p>
                    <form onSubmit={handleSaveProfile} className="stagger">
                        <div className="form-group mb-3">
                            <label className="form-label">Ngành nghề của bạn</label>
                            <select name="industry" className="form-input" required>
                                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                            </select>
                        </div>
                        <div className="form-group mb-4">
                            <label className="form-label">Cấp bậc chuyên môn hiện tại</label>
                            <select name="seniority" className="form-input" required>
                                {SENIORITY_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary w-full">Lưu & Bắt đầu</button>
                    </form>
                </div>
                <style jsx>{`
                    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.9); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 999; }
                    .modal-content { background: white; padding: 2.5rem; border-radius: 24px; width: 100%; max-width: 480px; box-shadow: var(--shadow-modal); border: 1px solid #f0f0f0; }
                    .w-full { width: 100%; }
                `}</style>
            </div>
        );
    }

    // Wrap children with profile context if needed (or just render)
    return <>{children}</>;
}
