export const MAJORS = [
    "Kỹ thuật Hóa học",
    "Công nghệ Thực phẩm",
    "Kỹ thuật Sinh học",
    "Kỹ thuật Môi trường",
    "Hóa học (Pure/Applied Chemistry)",
    "Quản lý tài nguyên & Môi trường",
];

export const POSITIONS = [
    {
        id: "operations",
        name: "Kỹ sư Vận hành (Operations)",
        tools: [
            { name: "SCADA/HMI", desc: "Hệ thống giám sát và điều khiển dữ liệu nhà máy." },
            { name: "5S/Kaizen", desc: "Phương pháp tối ưu hóa nơi làm việc và cải tiến liên tục." },
            { name: "Troubleshooting", desc: "Kỹ năng chẩn đoán và khắc phục sự cố hệ thống." },
            { name: "Safety Standards", desc: "Các quy chuẩn an toàn lao động và vận hành máy móc." },
            { name: "Process Control", desc: "Kiểm soát các thông số vận hành (nhiệt độ, áp suất, lưu lượng)." }
        ]
    },
    {
        id: "rd",
        name: "Kỹ sư QA/QC/R&D",
        tools: [
            { name: "HPLC/GC/MS", desc: "Sắc ký lỏng/khí ghép khối phổ (phân tích thành phần hỗn hợp)." },
            { name: "Spectrophotometry", desc: "Đo quang phổ (xác định nồng độ chất dựa trên hấp thụ ánh sáng)." },
            { name: "Analytical Method", desc: "Xây dựng và thẩm định quy trình phân tích mẫu." },
            { name: "ISO Standards", desc: "Các tiêu chuẩn ISO (9001, 14001, 17025...)." },
            { name: "R&D Methodology", desc: "Thiết kế thí nghiệm (DOE) và phát triển sản phẩm mới." }
        ]
    },
    {
        id: "design",
        name: "Kỹ sư Thiết kế kỹ thuật",
        tools: [
            { name: "AutoCAD", desc: "Phần mềm thiết kế bản vẽ 2D/3D kỹ thuật." },
            { name: "SolidWorks", desc: "Thiết kế và mô phỏng mô hình cơ khí 3D." },
            { name: "Sơ đồ P&ID", desc: "Sơ đồ đường ống và thiết bị đo lường trong nhà máy." },
            { name: "Simulation Tools", desc: "Các công cụ mô phỏng quá trình (Aspen HYSYS, PRO/II...)." }
        ]
    },
    {
        id: "consultant",
        name: "Kỹ sư Tư vấn giải pháp",
        tools: [
            { name: "Problem Solving", desc: "Phương pháp giải quyết vấn đề có hệ thống." },
            { name: "Presentation", desc: "Kỹ năng thuyết trình và trình bày giải pháp." },
            { name: "Cost-Benefit Analysis", desc: "Phân tích tỉ lệ chi phí và lợi ích của dự án." },
            { name: "Regulatory Compliance", desc: "Tư vấn về luật môi trường và các quy định pháp lý." }
        ]
    },
    {
        id: "sales",
        name: "Kỹ sư Sales Kỹ thuật",
        tools: [
            { name: "Product Knowledge", desc: "Khả năng am hiểu sâu sắc về thông số kỹ thuật sản phẩm." },
            { name: "Networking", desc: "Kỹ năng xây dựng và quản trị mối quan hệ khách hàng." },
            { name: "Negotiation", desc: "Kỹ năng đàm phán và thuyết phục trong kinh doanh." }
        ]
    },
    {
        id: "maintenance",
        name: "Kỹ sư Bảo trì",
        tools: [
            { name: "Mechanical/Electrical", desc: "Kiến thức về cơ khí và hệ thống điện công nghiệp." },
            { name: "Preventive Maintenance", desc: "Quy trình bảo trì phòng ngừa sự cố định kỳ." },
            { name: "Troubleshooting", desc: "Chẩn đoán lỗi phần cứng và hệ thống điều khiển." }
        ]
    },
];

export const SCORING_RUBRIC = [
    { level: 1, label: "Số 0/Biết", detail: "Chưa có kinh nghiệm thực tế. Chỉ nắm lý thuyết cơ bản hoặc mới nghe qua." },
    { level: 2, label: "Làm/Hiểu", detail: "Đã thực hành cơ bản, hiểu quy trình nhưng cần hướng dẫn khi gặp ca khó." },
    { level: 3, label: "Thành thạo", detail: "Tự tin xử lý độc lập mọi tình huống thông thường trong vận hành." },
    { level: 4, label: "Tối ưu", detail: "Khả năng tìm ra lỗi và cải tiến quy trình để tăng hiệu suất/chất lượng." },
    { level: 5, label: "Chuyên gia", detail: "Cố vấn, đào tạo và định hướng giải pháp cho hệ thống lớn." }
];

export const INDUSTRIES = [
    "Công nghệ thông tin / Phần mềm",
    "Sản xuất / Công nghiệp nặng",
    "FMCG / Hàng tiêu dùng nhanh",
    "Dược phẩm / Y tế",
    "Tài chính / Ngân hàng",
    "Giáo dục / Đào tạo",
    "Năng lượng / Dầu khí",
    "Logistics / Chuỗi cung ứng",
    "Khác"
];

export const SENIORITY_LEVELS = [
    "Sinh viên / Thực tập sinh",
    "Mới tốt nghiệp (Freshman)",
    "Nhân viên (Junior/Middle)",
    "Chuyên gia / Trưởng nhóm (Senior/Lead)",
    "Quản lý / Giám đốc (Manager/Director)"
];

export const USER_INTENTS = [
    "Tìm kiếm cơ hội việc làm mới",
    "Đánh giá & Phát triển bản thân",
    "Tuyển dụng & Phân tích ứng viên",
    "Tham khảo / Nghiên cứu thị trường"
];
