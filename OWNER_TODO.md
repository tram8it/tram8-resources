# Việc chủ hẹn làm sau

Danh sách việc chủ đã nói "tính sau". **Mọi phiên AI:** khi xong hết sản phẩm (hoặc khi chủ hỏi
còn gì), đọc file này và **nhắc chủ từng mục còn mở**. Ghi thêm việc mới chủ hẹn; mục xong thì
đánh `[x]` kèm ngày. File viết tay — không phải file sinh ra.

## Khi đã làm xong tất cả sản phẩm

- [ ] **Chuyển danh mục "Rong biển ăn liền" sang "Đồ ăn vặt"** trên KiotViet. Hiện nằm ở
      `Đồ khô - Mì Gói > Rong biển ăn liền` (KiotViet id 2549391). Chủ dặn 14/10/2026.
      Sau khi chủ chuyển: chạy `node tools/pull-from-hub.mjs` + `init-from-export` để thư mục
      `categories/2549391-…` nhận đường dẫn mới.

- [ ] **Chỉnh sáng/cân bằng trắng hàng loạt** bằng `tools/tone.py` (chủ dặn "sau này làm lại 1 thể",
      14/10/2026). `python3 tools/tone.py --scan` lúc tạo công cụ: 274 ảnh thiếu sáng. Chỉnh, xem
      so trước/sau từng danh mục, rồi gửi lại đề xuất ảnh.

## Sửa tay trên KiotViet (Hub không ghi tên/thương hiệu)

- [ ] Tên cũ sai khối lượng/loại (chủ: "vụ tên tính sau", 14/10/2026):
  - 64865699 Omachi ly Sườn hầm ngũ quả: tên ghi 70gr, bao bì mới 72 g
  - 64865694 "Mỳ tô Cung Đình vị sườn heo 80g": thực tế thố khoai tây sườn heo hầm măng 79 g
  - 65139544 "Mỳ Cung Đình Bát Vị Gà Hầm 80g" (mã …0487): thực tế thố khoai tây gà hầm 79 g
  - 65139690 "…Khoai Tây Vị Gà Hầm 12 Thố Tròn" (mã …0500): thực tế **thịt hầm nấm** 79 g
- [ ] Thương hiệu sửa tay: xem `reports/thuong-hieu-can-sua-tay-mi-goi.csv`
- [ ] Ngừng kinh doanh: 64865678 Phở Gà Cung Đình mã 8936010681422 (chủ xác nhận đã lâu không
      bán) — từ chối đề xuất trên Hub và tắt trên KiotViet
- [ ] Mã trùng: 4 cặp Feastables MrBeast (mã nội bộ 390000032… và mã vạch 85002788…) cùng một
      sản phẩm — gộp/tắt mã thừa
