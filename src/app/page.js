export default function Home() {
  return (
    <div className="page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content animate-in">
          <h1 className="headline-large">
            Hiểu công việc.
            <br />
            Hiểu chính mình.
          </h1>
          <p className="subheadline">
            C Factory phân tích chuyên sâu yêu cầu tuyển dụng, giúp bạn nhận
            diện năng lực cần thiết và chuẩn bị chiến lược ứng tuyển phù hợp.
          </p>
          <div className="hero-actions">
            <a href="/decode" className="btn btn-primary btn-lg">
              Bắt đầu phân tích
            </a>
            <a href="#features" className="btn btn-secondary btn-lg">
              Tìm hiểu thêm
            </a>
          </div>
        </div>
      </section>

      <hr className="section-separator" />

      {/* Features */}
      <section id="features" className="section">
        <div className="container">
          <div className="text-center mb-3">
            <h2 className="headline">Ba công cụ. Một hành trình.</h2>
            <p className="subheadline" style={{ maxWidth: 560, margin: "0.75rem auto 0" }}>
              Từ phân tích đến hành động — mỗi bước đưa bạn gần hơn với công
              việc phù hợp.
            </p>
          </div>

          <div className="modules-grid mt-4">
            <a href="/decode" className="module-tile" style={{ textDecoration: "none" }}>
              <div className="module-tile-icon">◎</div>
              <div className="caption">Phân tích</div>
              <h3>Giải mã JD</h3>
              <p>
                Dịch yêu cầu tuyển dụng thành năng lực cụ thể. Biết chính xác
                vị trí cần gì và ở mức độ nào.
              </p>
              <span className="btn-secondary btn-sm">Bắt đầu →</span>
            </a>

            <a href="/compare" className="module-tile" style={{ textDecoration: "none" }}>
              <div className="module-tile-icon">⊞</div>
              <div className="caption">So sánh</div>
              <h3>Đối chiếu cơ hội</h3>
              <p>
                So sánh tối đa 3 JD với hồ sơ của bạn. Xem vị trí nào phù hợp
                nhất và cần bổ sung gì.
              </p>
              <span className="btn-secondary btn-sm">Khám phá →</span>
            </a>

            <div className="module-tile" style={{ opacity: 0.5 }}>
              <div className="module-tile-icon">◈</div>
              <div className="caption">Luyện tập</div>
              <h3>Diễn tập phỏng vấn</h3>
              <p>
                Mô phỏng tình huống phỏng vấn thực tế với giới hạn thời gian.
                Phản xạ nhanh, tự tin hơn.
              </p>
              <span className="module-disabled">Sắp ra mắt</span>
            </div>
          </div>
        </div>
      </section>

      <hr className="section-separator" />

      {/* Value */}
      <section className="section">
        <div className="container-narrow text-center">
          <h2 className="headline">
            Không chỉ giúp bạn ứng tuyển.
            <br />
            Giúp bạn phát triển.
          </h2>
          <p className="subheadline mt-2" style={{ maxWidth: 520, margin: "1rem auto 2rem" }}>
            Mỗi lần phân tích là một lần bạn hiểu sâu hơn về năng lực của
            chính mình — và biết rõ đâu là bước tiếp theo.
          </p>
          <a href="/decode" className="btn btn-primary btn-lg">
            Bắt đầu ngay
          </a>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>© 2026 C Factory. Competency Contextual Factory.</p>
        </div>
      </footer>
    </div>
  );
}
