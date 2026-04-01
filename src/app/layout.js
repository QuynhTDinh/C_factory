import "./globals.css";
import { Providers } from "@/components/Providers";
import Header from "@/components/Header";

export const metadata = {
  title: "C Factory — Competency Contextual Factory",
  description:
    "Phân tích chuyên sâu năng lực tuyển dụng. Giúp bạn hiểu rõ yêu cầu công việc, đánh giá mức độ phù hợp, và chuẩn bị chiến lược ứng tuyển.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
