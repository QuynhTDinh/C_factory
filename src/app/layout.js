import "./globals.css";

export const metadata = {
  title: "C Factory — Competency Contextual Factory",
  description:
    "Phân tích chuyên sâu năng lực tuyển dụng. Giúp bạn hiểu rõ yêu cầu công việc, đánh giá mức độ phù hợp, và chuẩn bị chiến lược ứng tuyển.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <nav className="navbar">
          <div className="navbar-inner">
            <a href="/" className="navbar-brand">
              C Factory
            </a>
            <ul className="navbar-nav">
              <li>
                <a href="/decode">Phân tích JD</a>
              </li>
              <li>
                <a href="/compare">So sánh</a>
              </li>
              <li>
                <a href="/history">Lịch sử</a>
              </li>
            </ul>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
