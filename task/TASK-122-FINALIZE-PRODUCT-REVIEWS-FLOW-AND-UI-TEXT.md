# Task: TASK-122 - Hoàn Thiện Luồng Đánh Giá Sản Phẩm Và Chuẩn Hóa Văn Bản Giao Diện

- Feature: Finalize Product Reviews Flow & UI Copywriting
- Governing Spec: Đánh giá tự do không ràng buộc hóa đơn, hủy bỏ quy trình admin kiểm duyệt thủ công
- Scope: frontend
- Status: Complete

## Objective

Cập nhật các câu chữ tĩnh và mô tả còn sót lại trên giao diện trang chi tiết sản phẩm liên quan đến việc bắt buộc có đơn hàng hoặc xác thực Serial Number linh kiện (REV-004 cũ). Đảm bảo toàn bộ luồng gửi đánh giá từ storefront diễn ra tự nhiên, rõ ràng cho cả khách vãng lai và thành viên.

## Technical Context And Dependencies

- Pre-requisites: Hoàn thành TASK-100, TASK-101.
- Target Files:
  - `fe/src/app/features/catalog/product-detail-page.component.ts`
  - `fe/src/app/features/catalog/review-modal.component.ts`

## Checklist

- [x] Cập nhật `product-detail-page.component.ts`:
  - Thay đổi tiêu đề "Đánh giá thực tế từ khách hàng đã mua" thành "Đánh giá và nhận xét từ người dùng".
  - Thay thế dòng chữ "Đánh giá được kiểm định qua hóa đơn và Serial Number linh kiện (REV-004)" bằng "Chia sẻ nhận xét và trải nghiệm thực tế về linh kiện máy tính."
  - Cập nhật thông báo khi chưa có đánh giá: xóa bỏ câu yêu cầu "Khách hàng đã hoàn tất đơn hàng có thể gửi đánh giá từ trang tra cứu đơn hàng hoặc bấm Viết Đánh Giá ở trên." thành "Hãy là người đầu tiên chia sẻ trải nghiệm sử dụng linh kiện bằng cách bấm nút Viết Đánh Giá ở trên."
- [x] Rà soát `review-modal.component.ts`: Đảm bảo các nhãn và thông điệp hướng dẫn thể hiện đúng tính chất gửi đánh giá tự do, thân thiện.

## Acceptance Criteria

- Criterion 1: Không còn bất kỳ câu chữ nào nhắc đến ràng buộc hóa đơn hoặc quy định REV-004 trên trang chi tiết sản phẩm.
- Criterion 2: Bất kỳ người dùng nào cũng có thể gửi đánh giá tự do thông qua modal và thấy bài đánh giá xuất hiện ngay lập tức sau khi gửi.
- Criterion 3: Lệnh kiểm tra `npm run check:fe` hoàn tất thành công.
