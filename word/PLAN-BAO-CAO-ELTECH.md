# KẾ HOẠCH TRIỂN KHAI VIẾT BÁO CÁO ĐỒ ÁN EL-TECH DRAGON STORE

## 1. MỤC TIÊU VÀ PHẠM VI DỰ ÁN

### 1.1. Mục tiêu cốt lõi
- Chuyển đổi toàn bộ nội dung từ tập dàn ý [PT Web NC - Quy định trình bày & Outline.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/word/PT%20Web%20NC%20-%20Quy%20d%E1%BB%8Bnh%20tr%C3%ACnh%20b%C3%A0y%20&%20Outline.md) thành một bản báo cáo hoàn chỉnh ở định dạng Markdown ([BAO_CAO_DO_AN_ELTECH.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/word/BAO_CAO_DO_AN_ELTECH.md)), quy mô dung lượng 270 KB, 2.279 dòng văn bản học thuật.
- Xuất bản tệp Microsoft Word hoàn chỉnh ([BAO_CAO_DO_AN_ELTECH.docx](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/word/BAO_CAO_DO_AN_ELTECH.docx)) đạt chuẩn trình bày học thuật A4 (19.21 MB, 1.157 đoạn văn, 37 bảng biểu, nhúng đầy đủ 63 hình ảnh độ nét cao).
- Chuẩn hóa ngôn ngữ học thuật tiếng Việt: Hạn chế tối đa và loại bỏ các thuật ngữ tiếng Anh không cần thiết trong văn bản, thay thế bằng các từ ngữ tiếng Việt tương đương chuẩn mực trong ngành Hệ thống thông tin và Thương mại điện tử.
- Xây dựng 38 sơ đồ kỹ thuật dưới dạng tệp nguồn `.drawio` (chuẩn XML `mxGraphModel`) đặt trực tiếp tại thư mục [word/drawio/](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/word/drawio/), đồng thời sử dụng script tự động hóa [scripts/export-drawio.ps1](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/scripts/export-drawio.ps1) để chuyển đổi đồng loạt sang định dạng hình ảnh `.png` độ phân giải cao phục vụ nhúng trực tiếp vào tài liệu Markdown.
- Thu thập và chuẩn hóa toàn bộ 25 ảnh chụp minh chứng giao diện thực tế của hệ thống EL-TECH (giao diện khách hàng và cổng quản trị) cùng các ảnh khảo sát website tham chiếu thực tế (GEARVN, HACOM, Phong Vũ), lưu trữ tại [word/images/](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/word/images/).
- Cập nhật chính xác thông tin trường đại học: Trường Đại học Kinh tế - Luật - ĐHQG TP.HCM (Khoa Hệ thống Thông tin), và danh sách nhóm sinh viên thực hiện: Nguyễn Phạm Quốc Khiêm (K234060701), Bùi Ngọc Linh (K2340607XX), Huỳnh Tấn Phúc (K234060717).

### 1.2. Các ràng buộc và bất biến kỹ thuật bắt buộc
- Tuyệt đối không sử dụng bất kỳ biểu tượng, icon, emoji nào trong toàn bộ văn bản báo cáo, chú thích mã nguồn và thông điệp hệ thống.
- Tuyệt đối không sử dụng chú thích đánh số thứ tự trong mã nguồn và kịch bản thực thi.
- Cấu trúc đoạn văn tuân thủ nguyên tắc A.2 và A.3 của đề cương: mỗi tiểu mục hoặc vị trí có hình/bảng phải có đoạn mở đầu, bảng/hình minh chứng, 2 đến 5 đoạn văn phân tích chuyên sâu đối chiếu mã nguồn và nghiệp vụ, cùng đoạn tổng kết ngắn gọn.
- Tuân thủ mô hình nghiệp vụ tại Phần B của đề cương: mô hình một cửa hàng duy nhất, một kho hàng duy nhất; thanh toán QR toàn phần hoặc COD toàn phần, không cọc; đúng 9 trạng thái đơn hàng; không tích hợp quy trình đổi trả hoàn tiền trực tuyến; tiếp nhận khiếu nại tự do ngoài màn hình; không kinh doanh laptop và điện thoại di động.

---

## 2. KIẾN TRÚC THƯ MỤC VÀ TÀI NGUYÊN

```
word/
├── PT Web NC - Quy định trình bày & Outline.md  (Tài liệu đề cương gốc)
├── PLAN-BAO-CAO-ELTECH.md                     (Kế hoạch điều phối sub-agents)
├── BAO_CAO_DO_AN_ELTECH.md                     (Báo cáo hoàn chỉnh tiếng Việt chuẩn hóa: 270 KB, 2.279 dòng)
├── BAO_CAO_DO_AN_ELTECH.docx                   (Tệp Word xuất bản hoàn chỉnh: 19.21 MB, 1.157 đoạn, 63 ảnh, 37 bảng)
├── chapters/                                   (Các tệp phân chương độc lập tiếng Việt)
│   ├── 00-front-matter.md                      (Bìa UEL, Lời cam đoan, Lời cảm ơn, Tóm tắt, Mục lục, Danh mục viết tắt, Danh mục bảng/hình)
│   ├── 01-chuong-1.md                          (Tổng quan về đề tài)
│   ├── 02-chuong-2.md                          (Cơ sở lý thuyết và công nghệ vận dụng)
│   ├── 03-chuong-3.md                          (Khảo sát thực tế GEARVN, HACOM, Phong Vũ, phân tích nghiệp vụ và đặc tả yêu cầu)
│   ├── 04-chuong-4.md                          (Mô hình hóa và thiết kế hệ thống)
│   ├── 05-chuong-5.md                          (Thiết kế giao diện UI/UX và hiện thực website)
│   ├── 06-chuong-6.md                          (Kết luận và hướng phát triển)
│   └── 07-references-appendices.md             (Tài liệu tham khảo APA 7 và Phụ lục A, B, C)
├── drawio/                                     (38 tệp sơ đồ .drawio và 38 tệp .png kết xuất)
├── images/                                     (28 ảnh chụp giao diện và khảo sát thực tế)
│   ├── storefront/                             (14 ảnh giao diện khách hàng thực tế)
│   ├── admin/                                  (11 ảnh giao diện quản trị thực tế)
│   └── surveys/                                (3 ảnh khảo sát thực tế từ URL của GEARVN, HACOM, Phong Vũ)
└── mermaid/                                    (Thư mục dự phòng cho các tệp mermaid)
```

---

## 3. TRẠNG THÁI TRIỂN KHAI VÀ NGHIỆM THU

1. Tệp báo cáo Word: [BAO_CAO_DO_AN_ELTECH.docx](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/word/BAO_CAO_DO_AN_ELTECH.docx) đã hoàn thành xuất bản với dung lượng 19.21 MB, định dạng chuẩn phông Times New Roman 13pt, 1.157 đoạn văn, 37 bảng biểu và nhúng toàn bộ 63 hình ảnh sắc nét.
2. Tệp báo cáo tổng hợp Markdown: [BAO_CAO_DO_AN_ELTECH.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/word/BAO_CAO_DO_AN_ELTECH.md) với 100% thuật ngữ được Việt hóa học thuật chuẩn mực.
3. Kịch bản chuyển đổi tự động: [scripts/convert_report_to_docx.py](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/scripts/convert_report_to_docx.py) sử dụng thư viện `python-docx` để tự động hóa hoàn toàn quy trình sinh tệp `.docx` từ tệp `.md`.
4. Minh chứng khảo sát thực tế: 3/3 ảnh chụp giao diện thực tế từ URL chính thức của GEARVN, HACOM và Phong Vũ đã được thu thập qua CDP và lưu trữ tại `word/images/surveys/` cũng như đồng bộ sang `word/drawio/`.
5. Ảnh chụp giao diện hệ thống: 25/25 ảnh chụp màn hình độ nét cao từ ứng dụng đang hoạt động tại `http://localhost:4200` và `http://localhost:3000` được lưu trữ tại `word/images/storefront/` và `word/images/admin/`.
6. Danh mục bảng và hình ảnh: 32 bảng phân tích số liệu cốt lõi (37 bảng tính cả mục lục phụ) và 63/63 hình ảnh sơ đồ/giao diện thực tế khớp hoàn toàn 100%.
7. Kiểm tra quy tắc hệ thống:
   - Quy tắc cấm Icon và Emoji: 100% tài liệu và chú thích không chứa bất kỳ icon hoặc emoji nào.
   - Quy tắc cấm chú thích đánh số thứ tự trong mã nguồn: 100% khối mã nguồn và kịch bản thực thi không chứa chú thích đánh số thứ tự.
   - Quy định lưu trữ tài nguyên: Toàn bộ tệp tin được tổ chức trực tiếp tại thư mục `word/`, không lưu trữ tại `docs/`.
