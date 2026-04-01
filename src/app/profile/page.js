"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import UserContextManager from "@/components/UserContextManager";
import { logTrace } from "@/lib/tracing";

export default function ProfilePage() {
    const { data: session } = useSession();
    const [profile, setProfile] = useState(null);
    const [cvContent, setCvContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [competencyMap, setCompetencyMap] = useState([]);

    useEffect(() => {
        if (session?.user?.email) {
            const saved = localStorage.getItem(`cfactory_profile_${session.user.email}`);
            if (saved) {
                const parsed = JSON.parse(saved);
                setProfile(parsed);
                setCompetencyMap(parsed.competencyMap || []);
                setCvContent(parsed.cvContent || "");
            }
        }
    }, [session]);

    const handleAnalyzeCV = async () => {
        if (!cvContent.trim() || cvContent.trim().length < 50) return;
        setLoading(true);
        logTrace("Profile CV Analysis Started", { email: session?.user?.email });

        try {
            const res = await fetch("/api/profile/cv", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cv_content: cvContent })
            });
            const data = await res.json();

            if (data.success) {
                const updatedProfile = {
                    ...profile,
                    cvContent: cvContent,
                    competencyMap: data.competencies,
                    cvSummary: data.summary,
                    lastUpdated: new Date().toISOString()
                };
                localStorage.setItem(`cfactory_profile_${session.user.email}`, JSON.stringify(updatedProfile));
                setProfile(updatedProfile);
                setCompetencyMap(data.competencies);
                logTrace("Profile CV Analysis Success", { count: data.competencies.length });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <UserContextManager>
            <div className="page" style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>
                <div className="container-narrow" style={{ paddingTop: '4rem', paddingBottom: '6rem' }}>

                    {/* Header Profile */}
                    <div className="card animate-in mb-4" style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '2.5rem' }}>
                        {session?.user?.image && (
                            <img src={session.user.image} alt="Avatar" style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid white', boxShadow: 'var(--shadow-card)' }} />
                        )}
                        <div>
                            <h1 className="headline" style={{ fontSize: '2rem' }}>{session?.user?.name}</h1>
                            <p className="body-text">{session?.user?.email}</p>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <span className="keyword-tag" style={{ background: '#EBF5FF' }}>{profile?.industry || "Chưa thiết lập ngành"}</span>
                                <span className="keyword-tag" style={{ background: '#F0F9F4' }}>{profile?.seniority || "Chưa thiết lập cấp bậc"}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
                        {/* Cột Trái: Bản đồ năng lực */}
                        <div className="stagger">
                            <div className="card mb-3">
                                <h3 className="mb-2">Bản đồ năng lực cơ sở</h3>
                                {competencyMap.length > 0 ? (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {competencyMap.map((c, i) => (
                                            <div key={i} className="competency-card" style={{ padding: '0.75rem 1rem', width: '100%' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{c.name_vi}</div>
                                                    <div className="badge badge-preferred" style={{ fontSize: '0.65rem' }}>L{c.level}</div>
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.level_label}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="body-text" style={{ fontSize: '0.85rem' }}>Bạn chưa có bản đồ năng lực. Hãy dán CV bên cạnh để AI trích xuất.</p>
                                )}
                            </div>
                        </div>

                        {/* Cột Phải: Tool Phân tích CV */}
                        <div className="animate-in">
                            <div className="card">
                                <h3 className="mb-2">Cập nhật CV của bạn</h3>
                                <p className="body-text mb-3" style={{ fontSize: '0.8rem' }}>Dán nội dung CV mới nhất để AI cập nhật bản đồ năng lực cá nhân.</p>
                                <textarea
                                    className="form-textarea"
                                    placeholder="Dán nội dung CV tại đây..."
                                    value={cvContent}
                                    onChange={(e) => setCvContent(e.target.value)}
                                    style={{ minHeight: '200px', fontSize: '0.85rem', marginBottom: '1rem' }}
                                />
                                <button
                                    className="btn btn-primary w-full"
                                    onClick={handleAnalyzeCV}
                                    disabled={loading || cvContent.length < 50}
                                >
                                    {loading ? "Đang phân tích..." : "Phân tích & Cập nhật"}
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <style jsx>{`
                .w-full { width: 100%; }
                .badge { padding: 2px 8px; border-radius: 4px; font-weight: bold; }
            `}</style>
        </UserContextManager>
    );
}
