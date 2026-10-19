# Prompt cho Claude in Chrome — đổi tên 29 thương hiệu (chỉ khác hoa/thường)

Vì sao: nhập Excel không đổi được cách viết khi tên chỉ khác hoa/thường — KiotViet coi "Nivea" là "NIVEA" và giữ "NIVEA"
(lô 2 và lô tất cả, 19/10/2026). Đổi tên thương hiệu một lần là mọi SP của nó đổi theo. Tên hàng hoá **không** đổi.
Số "SL kỳ vọng" lấy từ bản chụp sau lô tất cả (19/10/2026 16:27), đếm cả lốc/thùng và hàng ngừng kinh doanh.
Kiểm: `brand-diff <trước> <sau> doi-ten-hoa-thuong.csv`.

---

Bạn đang điều khiển Chrome của tôi (đã đăng nhập KiotViet Trạm 8, dữ liệu thật). Việc: **đổi tên 29 thương hiệu** theo bảng dưới.
Chỉ đổi tên thương hiệu; không xoá, không tạo, không sửa hàng hoá nào.

Mở **Thiết lập (bánh răng) → Hàng hóa → Thương hiệu** (bảng "Tên thương hiệu · SL hàng hóa · Thao tác"). Với TỪNG dòng, lần lượt:
1. Tìm đúng dòng có tên **y hệt** cột "Tên hiện tại" (kể cả hoa/thường).
2. Cột **SL hàng hóa** phải bằng cột "SL kỳ vọng". Khác → bỏ qua dòng này, ghi lại.
3. Bấm **bút chì** → ô "Tên thương hiệu": xoá hết, gõ **đúng từng ký tự** cột "Tên mới" → **Lưu**.
   KHÔNG bấm nút "Xóa" trong hộp sửa.
4. Kiểm: danh sách hiện tên mới, SL hàng hóa không đổi.

Dừng và hỏi tôi nếu: KiotViet báo trùng tên / lỗi; không tìm thấy dòng; có 2 dòng gần giống nhau.
Cuối cùng trả bảng: STT · Tên cũ → mới · SL trước/sau · OK / bỏ qua + lý do.

| STT | Tên hiện tại | Tên mới | SL kỳ vọng |
|---|---|---|---|
| 1 | `ALUCOS` | `Alucos` | 1 |
| 2 | `CELANO` | `Celano` | 58 |
| 3 | `CHIP CHIP` | `Chip Chip` | 4 |
| 4 | `CLOSEUP` | `Closeup` | 2 |
| 5 | `CoBi Bread` | `Cobi Bread` | 28 |
| 6 | `dasani` | `Dasani` | 4 |
| 7 | `DOVE` | `Dove` | 5 |
| 8 | `DUREX` | `Durex` | 17 |
| 9 | `FRESH 2GO` | `Fresh 2Go` | 8 |
| 10 | `GUMI` | `Gumi` | 16 |
| 11 | `HAZELINE` | `Hazeline` | 4 |
| 12 | `HEY YO` | `Hey Yo` | 2 |
| 13 | `KORENO` | `Koreno` | 22 |
| 14 | `LACTACYD` | `Lactacyd` | 3 |
| 15 | `LASVON` | `Lasvon` | 6 |
| 16 | `LIFEBUOY` | `Lifebuoy` | 5 |
| 17 | `MiDas` | `Midas` | 9 |
| 18 | `NABATI` | `Nabati` | 19 |
| 19 | `NIVEA` | `Nivea` | 60 |
| 20 | `omachi` | `Omachi` | 41 |
| 21 | `OREO` | `Oreo` | 45 |
| 22 | `ORION` | `Orion` | 24 |
| 23 | `OVALTINE` | `Ovaltine` | 17 |
| 24 | `POCA` | `Poca` | 10 |
| 25 | `ponnie` | `Ponnie` | 43 |
| 26 | `star food` | `Star Food` | 4 |
| 27 | `ánh dương` | `Ánh Dương` | 3 |
| 28 | `ĂN CÙNG BÀ TUYẾT` | `Ăn Cùng Bà Tuyết` | 32 |
| 29 | `ĐÀ LẠT MILK` | `Đà Lạt Milk` | 20 |
