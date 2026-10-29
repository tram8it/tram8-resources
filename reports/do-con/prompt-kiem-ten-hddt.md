# Prompt cho Claude in Chrome — kiểm tên in trên hoá đơn sau khi gắn thuộc tính nồng độ cồn (CHỈ XEM)

Dán nguyên phần dưới đường kẻ vào Claude in Chrome (Chrome đã đăng nhập KiotViet quản lý của Trạm 8).
Kết quả trả về: dán lại cho Claude Code để ghi vào `reports/do-con/ket-qua-ten-hddt.md`.

---

Bạn đang điều khiển Chrome của tôi, đã đăng nhập trang quản lý KiotViet của chuỗi Trạm 8 (dữ liệu **thật, đang bán hàng**).
Việc lần này là **CHỈ XEM**: hôm nay tôi gắn thuộc tính `NỒNG ĐỘ CỒN` cho vài SP, và KiotViet đổi "tên đầy đủ" thành
"Tên hàng - 5% (Thùng)". Tôi cần biết tên nào được in trên **hoá đơn điện tử** và **phiếu in bán hàng**.

## Luật tuyệt đối (vi phạm = dừng ngay, báo tôi)
- **KHÔNG bấm Lưu / Cập nhật / Đồng ý / Xác nhận / Xoá / Thêm / Nhập / Áp dụng / Phát hành / Ký / Gửi** ở bất cứ đâu.
  Hộp thoại nào mở ra thì đóng bằng **Bỏ qua / Huỷ / dấu X**.
- **Không tạo hoá đơn, không bán hàng thử, không phát hành hay xuất hoá đơn điện tử nào.**
- Chỉ gõ vào ô **tìm kiếm**. Không sửa ô nào trong form. Lỡ đổi gì: **Bỏ qua/Huỷ**, không lưu, báo tôi ngay.
- Làm trong **một tab mới**, không đụng các tab tôi đang mở.

## A. Năm dòng hàng vừa gắn thuộc tính (Hàng hoá → Danh sách hàng hoá, tìm theo mã)
| Mã | Hàng | Đơn vị |
|---|---|---|
| `8934822212339` | Bia Heineken | Lon (hàng gốc) |
| `SP877708` | Bia Heineken | Thùng |
| `8902246004984` | Bia Budweiser 0.0 | Lon (hàng gốc) |
| `8936139440047` | Bia Budweiser 0.0 | Thùng |
| `8809018212045` | Soju Damso vị táo | Chai |

Với **mỗi mã**, ghi lại (chụp màn hình):
1. Tên hiện ở **danh sách** (dòng kết quả tìm kiếm).
2. Bấm vào dòng: ở tab **Thông tin**, ô **"Tên hàng trên hóa đơn điện tử"** đang hiện gì? (trống hay có chữ; chép nguyên văn).
3. Di chuột vào biểu tượng **ⓘ** cạnh "Tên hàng trên hóa đơn điện tử": chép nguyên văn chú thích. Nó nói khi ô trống thì in tên nào?
4. Tab **"Hàng hóa cùng loại"** (nếu có): liệt kê những gì trong đó.
Nếu dòng Thùng không mở riêng được, mở hàng gốc rồi xem phần **đơn vị tính**: dòng Thùng có ô tên HĐĐT riêng không, đang hiện gì?
Không bấm **Chỉnh sửa**; nếu buộc phải mở form để thấy ô, đóng bằng **Bỏ qua**.

## B. Hoá đơn điện tử đã phát hành (chỉ xem)
1. Tìm trang danh sách **hoá đơn điện tử** (thường ở menu **Thuế & Kế toán** hoặc **Hoá đơn điện tử**).
2. Tìm **một hoá đơn đã phát hành gần đây** có dòng **bán theo Thùng** (bia thùng bất kỳ) — ưu tiên một thùng có ô tên HĐĐT trống.
   Mở xem (xem/tải bản PDF là được, **không** phát hành lại, không điều chỉnh): tên hàng in trên hoá đơn là gì?
   So với tên ở danh sách hàng hoá và ô tên HĐĐT của dòng đó.
3. Nếu có hoá đơn nào đã bán **Heineken thùng** hoặc **Budweiser 0.0 thùng** sau 20:45 hôm nay (29/10) thì xem luôn — nhưng **không tạo mới**.

## C. Mẫu in phiếu bán hàng (chỉ xem)
1. Vào **Thiết lập → Mẫu in** (hoặc tương đương), mở mẫu **Hoá đơn bán hàng** đang dùng, chế độ **xem trước** (không sửa, không lưu).
2. Mẫu dùng trường nào cho tên hàng: **Tên hàng**, **Tên hàng hoá đầy đủ**, hay **Tên hàng trên HĐĐT**? Chép đúng tên biến/trường nếu thấy (vd. `{Ten_Hang_Hoa}`).
3. Đóng bằng **Huỷ/X**, không lưu.

## Báo lại cho tôi
Một bảng cho phần A (Mã · Tên ở danh sách · Ô tên HĐĐT · Chú thích ⓘ · Hàng cùng loại), và trả lời ngắn cho B, C, kèm ảnh chụp.
Cuối cùng xác nhận rõ: **"Tôi không lưu/sửa/tạo/phát hành gì."**
Nếu gặp màn hình khác mô tả, hoặc nút mà không chắc bấm vào có sửa dữ liệu không → **dừng và hỏi tôi**, đừng thử.
