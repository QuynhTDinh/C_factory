"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function Header() {
    const { data: session, status } = useSession();

    return (
        <nav className="navbar" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(255, 255, 255, 0.72)', backdropFilter: 'saturate(180%) blur(20px)', borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="navbar-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', height: '52px', maxWidth: '1120px', margin: '0 auto' }}>
                <Link href="/" className="navbar-brand" style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-primary)', textDecoration: 'none' }}>
                    C Factory
                </Link>

                <ul className="navbar-nav" style={{ display: 'flex', alignItems: 'center', gap: '2rem', listStyle: 'none' }}>
                    <li><Link href="/decode">Phân tích JD</Link></li>
                    <li><Link href="/compare">So sánh</Link></li>
                    <li><Link href="/history">Lịch sử</Link></li>
                    <li><Link href="/profile" style={{ fontWeight: '600', color: 'var(--accent-blue)' }}>Hồ sơ của tôi</Link></li>
                </ul>

                <div className="navbar-auth" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                    {status === "loading" ? (
                        <span style={{ fontSize: '0.8rem', color: '#ccc' }}>...</span>
                    ) : session ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ textAlign: 'right', display: 'none', md: 'block' } /* Hide on mobile theoretically */}>
                                <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{session.user.name}</div>
                                <div style={{ fontSize: '0.7rem', color: '#666' }}>{session.user.email}</div>
                            </div>
                            {session.user.image && (
                                <img
                                    src={session.user.image}
                                    alt={session.user.name}
                                    style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #eee' }}
                                />
                            )}
                            <button
                                onClick={() => signOut()}
                                className="btn btn-sm"
                                style={{ background: '#f5f5f7', color: '#666', border: 'none', padding: '0.4rem 0.8rem', fontSize: '0.85rem', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Đăng xuất
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => signIn("google")}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '0.5rem 1rem', background: 'var(--accent-blue)', color: 'white', border: 'none', borderRadius: '980px', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                            Đăng nhập Google
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}
