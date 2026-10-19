# Kết quả thử nhập Excel 2 SP (19/10/2026)

File: xuất 2 SP (37 cột) → chỉ sửa 2 ô Thương hiệu (sửa thẳng XML, mọi ô khác giữ nguyên) → nhập với
trùng = Báo lỗi, tồn kho / mô tả / giá vốn = Không. KiotViet: "Import thành công".

Kiểm 2 lớp:
- **API, mọi trường của 3.965 dòng** (`brand-diff truoc-excel sau-excel thu-excel-2-sp.csv`): 2 SP đổi đúng thương hiệu,
  đơn vị Cây / Dây đổi theo. **1 thay đổi ngoài ý muốn:** đơn vị Dây (SP877417, quy đổi 12) của X-Men,
  `weight` **60 → 720** (= 60 × 12: KiotViet nhân lại trọng lượng đơn vị với hệ số quy đổi khi nhập file).
  Đơn vị Cây của Thăng Long trọng lượng 0 nên không lộ.
- **So từng ô file xuất trước/sau** (bắt tên HĐĐT, lô–HSD…): chỉ 2 ô Thương hiệu khác.

## Kết luận
- Nhập Excel **dùng được** cho SP **không có đơn vị quy đổi mang trọng lượng > 0**: 2.048 / 2.124 SP cần đổi.
- 76 SP có đơn vị mang trọng lượng → **sửa trên form từng SP**.
- Phải sửa tay lại: Dây SP877417 trọng lượng 720 → **60**.
- Chưa biết: nhập file với thương hiệu **chưa có** thì KiotViet tự tạo hay báo lỗi → thử ở lô nhỏ tiếp theo.

## Sửa lại trọng lượng (chủ, 19/10/2026)
Không sửa trực tiếp được trọng lượng đơn vị Dây; chủ mở form **hàng gốc**, giữ trọng lượng 5, bấm **Lưu** → Dây tự về **60**
(KiotViet tính trọng lượng đơn vị = hàng gốc × quy đổi). Kiểm lại: hết cảnh báo trọng lượng.

Lần **Lưu trên form** đó còn làm 2 việc (đúng chữ, khác byte):
- mô tả hàng gốc: xuống dòng `\n` → `<br>` (159 → 168 ký tự, chữ giữ nguyên);
- mô tả đơn vị Dây (bản cũ 4.698 ký tự) bị thay bằng mô tả của hàng gốc.

→ Đường **form** luôn đổi định dạng mô tả và đồng bộ mô tả đơn vị theo hàng gốc. `brand-snapshot` nay lưu thêm hash của
riêng chữ (`descriptionTextSha`); `brand-diff` chỉ ghi chú hai trường hợp trên, mọi thay đổi chữ khác vẫn là cảnh báo.
Đường **Excel** (cập nhật mô tả = Không) không đụng mô tả.
