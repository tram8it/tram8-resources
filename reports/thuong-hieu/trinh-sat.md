# Trinh sát KiotViet — thương hiệu (19/10/2026, chỉ xem)

Claude in Chrome chạy `prompt-trinh-sat.md`; 22 ảnh trong [`trinh-sat/`](trinh-sat/). Không lưu/xoá/thêm/nhập gì;
SP mẫu `8934677000334` vẫn "Lottte" (ảnh A7).

| Mục | Kết quả | Ảnh |
|---|---|---|
| Form Sửa hàng hoá | Ô **Thương hiệu** cạnh Nhóm hàng, có link "Tạo mới". Form hiện **VAT hàng nhập/bán**, **Giá bán sau thuế**, **Tên hàng trên HĐĐT** (SP mẫu: trống). | A1 |
| Ô chọn thương hiệu | Có ô tìm. Tìm theo **chuỗi con, không phân biệt hoa/thường**: "Lotte" → chỉ "Lotte"; "Lott" → "Lotte", "Lottte"; "men" → "X men", "X-Men". Mục đầu luôn là **"Chọn thương hiệu"** = bỏ trống. | A2a–e |
| Gõ tên chưa có | **Không** tự đề nghị tạo mới → không có rủi ro lỡ tạo thương hiệu khi gán. | A4 |
| Sửa/xoá trong ô chọn | Di chuột hiện **bút chì** → hộp "Sửa thương hiệu": đổi tên, nút **Xoá**, Lưu. | A3a–b |
| Đơn vị Lốc | **Không có ô thương hiệu riêng** — dùng chung với hàng gốc (đúng như dữ liệu: 0 lệch). Mỗi đơn vị có ô tên HĐĐT riêng. | A6 |
| Trang quản lý | **Thiết lập → Hàng hóa → Thương hiệu**: 244 thương hiệu, cột **SL hàng hóa** (đếm cả lốc/thùng, khớp bản chụp API: ACECOOK 45, Lottte 95), bút chì / thùng rác, nút "Tạo thương hiệu". | B1–B2 |
| Lọc danh sách | Lọc theo Thương hiệu (chọn nhiều), "Trạng thái hàng hóa: Tất cả" gồm cả ngừng kinh doanh. Có thể bật **cột Thương hiệu**. | C1–C2 |
| Thao tác hàng loạt | Đặt hàng nhập · Đổi nhóm hàng · Thay đổi mức thuế VAT · Liên kết kênh bán · Ngừng kinh doanh · Xoá. **Không có đổi thương hiệu hàng loạt.** | C3 |
| Nhập Excel | Tuỳ chọn: trùng mã/khác tên, trùng mã vạch/khác mã, cập nhật tồn kho (Không/Có), cập nhật mô tả, cập nhật giá vốn, phạm vi giá vốn & trạng thái kinh doanh. **Chưa xem file mẫu** → chưa biết cột, ô trống có xoá giá trị cũ không. | D0–D1 |
| Xuất file | Chọn cột được; có **Thương hiệu, Tên HĐĐT, Hình ảnh, VAT bán/nhập, giá, lô-HSD, mô tả, ĐVT, đang kinh doanh…** | E1–E2 |

## Hệ quả cho kế hoạch

1. **Đổi tên / xoá / tạo** thương hiệu: làm ở trang Thiết lập → Thương hiệu, đối chiếu cột SL hàng hóa trước khi làm.
   `brand-plan.mjs` đã dùng đúng màn hình và số kỳ vọng tính cả lốc/thùng.
2. **Gán từng SP**: chỉ có cách mở form từng SP (không có thao tác hàng loạt). Prompt đã ghi cách tìm trong ô chọn và
   cảnh báo mục "Chọn thương hiệu" = bỏ trống. ~1.670 lượt.
3. **Nhập Excel** là đường duy nhất làm nhanh hàng loạt, nhưng ghi đè **mọi cột** có trong file (giá, VAT, tên HĐĐT,
   ảnh, lô…). Chỉ dùng sau khi thử: xuất file → chỉ sửa cột Thương hiệu của **1 SP** → nhập với tồn kho/mô tả/giá vốn = Không
   → `brand-diff` phải ĐẠT (không trường nào khác đổi). Chưa thử thì chưa dùng.
