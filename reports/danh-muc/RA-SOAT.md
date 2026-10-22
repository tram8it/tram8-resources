# Rà soát nhóm hàng (danh mục) — 22/10/2026

Đã rà 2.287 hàng gốc đang bán, xếp trong 214 nhóm lá của cây 292 nhóm trên KiotViet. Cách làm:
- Bảy agent đọc song song, mỗi agent một nhánh.
- Mỗi SP được đối chiếu tên, thương hiệu, ĐVT và mô tả (viết khi xem ảnh); ảnh chỉ mở khi còn nghi.
- Chỉ đề xuất đổi khi **rõ ràng sai**. Ca hai nhóm đều hợp thì để nguyên.
- Mọi nhóm đề xuất đều là nhóm lá có sẵn trong cây; đã dùng script kiểm từng dòng.

Kết quả: **216 SP** nên đổi nhóm, gồm 132 `CHAC` (chắc chắn) và 84 `KIEM` (chủ nên liếc qua).
Danh sách đầy đủ: `de-xuat-sua-danh-muc.csv`.

## Lỗi lớn
- **47 SP đặt ở nhóm cha thay vì nhóm lá**, nên trên web lọc theo nhóm con không thấy:
  - 10 chai rượu đặc sản (Chanh Giấy, Mơ Má Đào, Táo Mèo…). Nhãn ghi liqueur 19–29%, nên vào Rượu Mùi.
  - 5 SP sữa Celano.
  - Bông lan tam giác, Hesan.
  - Goldfish, Ritz, Hello Panda.
  - Milo Wafer.
  - Coolkick.
  - Đồ chay Trung.
- **Pillows 75 g (5 SP)** đang ở "Snack mì", chuyển sang "Snack bắp & phồng" cho khớp với Pillows 45 g. Cùng lỗi: 4 Oishi 110 g đang ở "Snack khoai mì", Bola mực đang ở "Snack mì".
- **Đồ uống:**
  - Sting (4 SP) nằm trong "Nước ngọt có gas", chuyển sang Nước tăng lực.
  - Revive (2 SP) chuyển sang Nước bù khoáng / ion.
  - Nước gạo OKF chuyển sang Nước gạo / sữa hạt.
- **Bỏng ngô IAMG (7 SP)** đang ở "Snack đậu phộng", chuyển sang "Bắp rang bơ".
- **Hamburger đóng gói (8 SP)** đang ở "Bánh ăn sáng / ngũ cốc", chuyển sang "Burger - Hotdog - Bánh mì".
- **Pizza tam giác Lemon (2 SP)** đang ở "Cơm nắm Onigiri", chuyển sang "Pizza".
- **Chăm sóc cá nhân:**
  - Dầu gội Romano đang ở "Sữa tắm".
  - Dầu xả Pantene đang ở "Dầu gội".
  - Nhíp lông mày đang ở "Dụng cụ mi".
  - Sáp khử mùi đang ở "Lăn khử mùi".
- **Mì:**
  - Mì trộn nằm ở nhóm mì nước, và ngược lại.
  - Gói và tô xếp lẫn: ĐVT là Tô nhưng nằm ở nhóm (Gói).
- **Kem:**
  - Kem bánh cá, kem sandwich đang ở Kem que, chuyển sang Kem bánh.
  - Kem tổ ong đang ở Kem bánh, chuyển sang Kem que.
- **Đồ nội địa Trung:** thịt chay, tai heo chay đang ở "Thịt & hải sản", chuyển sang "Đồ chay giả mặn".
- **Smirnoff Vodka** đang ở Whisky. **Nước muối súc miệng** đang ở Dụng cụ sơ cứu.

## Cần chủ quyết (cây nhóm chưa có chỗ hợp)
1. **Cà phê hoà tan / trà hoà tan**: cà phê Chồn, Cộng bạc xỉu, VINA gói, trà Blendy… đang ở "Cà phê uống liền" và "Trà đóng chai" (hai nhóm này dành cho đồ uống đóng chai).
   Có thêm nhóm lá "Cà phê & trà hoà tan" không?
2. **Lạp xưởng** (Wyn, Fansipan): chưa có nhóm. Tạm xếp "Giò chả" / "Thịt khô đóng gói khác"?
3. **Đậu phụ khô cay** (Trung): xếp chung "Đồ chay giả mặn" hay "Que cay"? Hiện đang nằm ở cả hai.
4. **Tiger Crystal**: lon 250 ml ở "Lager phổ thông", lon 330 ml ở "Nhập khẩu & premium". Chọn một.
5. **Bánh bao Thọ Phát 300 g** (đông lạnh): "Thực phẩm chế biến sẵn", hay "Món ngon Trạm 8 > Món hấp" nếu cửa hàng hấp bán?

## Không phải lỗi nhóm, nhưng nên xem
- **Không phải hàng bán:** "Ngày rã đông" (mã 16062026), "Bìa cát tông bà tuyết", "Phí vận chuyển".
  Kệ trưng bày đã được Hub ẩn (PR #117). Nếu chủ tắt "Được bán trực tiếp" cho mấy SP này thì web cũng tự ẩn.
- **Tên và mô tả/ảnh không khớp:**
  - "Sữa uống TH Socola 180ml": ảnh là sữa chua dâu.
  - "Paldo Wangttugeung Jjamppong": mô tả là Pororo.
  - "Kem vani Macadamia Celano": mô tả là nam việt quất.
  - Mã 88011049000722 Chocobananamallow: mô tả là Melona chuối.
  - "Wrigleys Doublemint chewing gum": ảnh là kẹo ngậm mint.
- **Dòng thùng lệch nhóm với hàng gốc:** Phở gà Cung Đình (SP878222). Khi nhập lại hàng gốc thì KiotViet tự kéo dòng thùng theo.

## Cách sửa
Nhập Excel cột "Nhóm hàng(3 Cấp)", theo đúng quy trình đã làm với thương hiệu và ĐVT:
1. Chủ xuất file.
2. Cắt lô thử 3 SP.
3. Chụp dữ liệu trước/sau và chạy `brand-diff`.
4. Làm lô còn lại.

Khi nhập, dòng lốc/thùng tự theo nhóm của hàng gốc (đo được ở lô ĐVT 8, ngày 20/10).
