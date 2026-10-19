# Prompt cho Claude in Chrome — đổi tên 34 thương hiệu (chỉ khác hoa/thường hoặc dấu)

Vì sao: nhập Excel **không** đổi được cách viết khi tên chỉ khác hoa/thường — KiotViet coi "Nivea" là "NIVEA" và giữ "NIVEA"
(lô 2, 19/10/2026). Nên đổi tên các thương hiệu này **trước** khi nhập các lô lớn. Kiểm: `brand-diff … doi-ten-hoa-thuong.csv`.

---

Bạn đang điều khiển Chrome của tôi (đã đăng nhập KiotViet Trạm 8, dữ liệu thật). Việc: **đổi tên 34 thương hiệu** theo bảng dưới.
Chỉ đổi tên; không xoá, không tạo, không sửa hàng hoá nào.

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
| 2 | `CELANO` | `Celano` | 59 |
| 3 | `CHIP CHIP` | `Chip Chip` | 3 |
| 4 | `CLOSEUP` | `Closeup` | 2 |
| 5 | `CoBi Bread` | `Cobi Bread` | 23 |
| 6 | `dasani` | `Dasani` | 0 |
| 7 | `DOVE` | `Dove` | 5 |
| 8 | `DUREX` | `Durex` | 16 |
| 9 | `FRESH 2GO` | `Fresh 2Go` | 12 |
| 10 | `GUMI` | `Gumi` | 11 |
| 11 | `HAI HA` | `Hải Hà` | 2 |
| 12 | `HAZELINE` | `Hazeline` | 4 |
| 13 | `HEY YO` | `Hey Yo` | 2 |
| 14 | `Hoa Việt` | `Hòa Việt` | 0 |
| 15 | `Jagermeister` | `Jägermeister` | 2 |
| 16 | `KINH DO` | `Kinh Đô` | 24 |
| 17 | `KORENO` | `Koreno` | 5 |
| 18 | `LACTACYD` | `Lactacyd` | 3 |
| 19 | `LASVON` | `Lasvon` | 2 |
| 20 | `LIFEBUOY` | `Lifebuoy` | 5 |
| 21 | `MiDas` | `Midas` | 7 |
| 22 | `NABATI` | `Nabati` | 42 |
| 23 | `NIVEA` | `Nivea` | 70 |
| 24 | `omachi` | `Omachi` | 19 |
| 25 | `OREO` | `Oreo` | 36 |
| 26 | `ORION` | `Orion` | 28 |
| 27 | `OVALTINE` | `Ovaltine` | 13 |
| 28 | `POCA` | `Poca` | 0 |
| 29 | `ponnie` | `Ponnie` | 41 |
| 30 | `Purité De Prôvence` | `Purité de Provence` | 2 |
| 31 | `star food` | `Star Food` | 3 |
| 32 | `ánh dương` | `Ánh Dương` | 3 |
| 33 | `ĂN CÙNG BÀ TUYẾT` | `Ăn Cùng Bà Tuyết` | 23 |
| 34 | `ĐÀ LẠT MILK` | `Đà Lạt Milk` | 10 |
