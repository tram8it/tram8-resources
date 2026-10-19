# Thử đổi thương hiệu 2 SP bằng nhập Excel

Mục tiêu: biết nhập Excel có đổi **chỉ** thương hiệu mà không đụng giá, VAT, tên HĐĐT, ảnh, mô tả, tồn, lô… hay không.
Kiểm bằng `brand-diff` với [`thu-excel-2-sp.csv`](thu-excel-2-sp.csv). Không đạt → bỏ đường Excel, sửa từng SP trên form.

| SP | Mã | VAT | Đơn vị phụ | Thương hiệu |
|---|---|---|---|---|
| Dầu gội nước hoa X-Men For Boss sport | 8935136860919 | 8% | Dây (SP877417) | X men → **X-Men** |
| 20453 (20467) Thăng Long Slim bao cứng dẹt | 8935047690476 | **10%** | Cây | Vinataba → **Thăng Long** |

## Bước 1 — xuất file 2 SP (chủ làm tay hoặc Claude in Chrome; chỉ đọc)

> Hàng hoá → Danh sách hàng hoá. Ô tìm: gõ `8935136860919` Enter, rồi gõ thêm `8935047690476` Enter (hai mã cùng
> nằm trong ô tìm). Trạng thái hàng hoá: **Tất cả**. Danh sách phải ra đúng 2 SP trên. Bấm **Xuất file** → trong
> "Tuỳ chọn cột hiển thị" **giữ tất cả các cột** (không bỏ chọn cột nào) → Xuất file. Tải file về, **không mở sửa**.
> Không bấm Lưu/Nhập/Xoá ở đâu cả.

Gửi file đó cho Claude Code. Claude chỉ sửa ô **Thương hiệu** của các dòng thuộc 2 SP (cả dòng đơn vị Dây/Cây),
không đụng ô khác, trả lại file `thu-excel-2-sp.xlsx` kèm bảng so sánh từng ô trước/sau.

## Bước 2 — nhập file (GHI THẬT, sau khi Claude nói "đã chụp dữ liệu trước")

> Hàng hoá → **Import file** → **Nhập từ Excel**. Đặt đúng các tuỳ chọn:
> - Xử lý trùng mã hàng/mã vạch, khác tên hàng hoá: **Báo lỗi và dừng import**
> - Xử lý trùng mã vạch, khác mã hàng: **Báo lỗi và dừng import**
> - Cập nhật tồn kho: **Không** · Cập nhật mô tả: **Không** · Cập nhật giá vốn: **Không**
> - Áp dụng giá vốn / Trạng thái kinh doanh: để mặc định **Toàn hệ thống**
>
> Chụp màn hình hộp thoại trước khi chọn file. **Chọn file dữ liệu** → chọn `thu-excel-2-sp.xlsx`.
> Nếu KiotViet hiện bước xem trước / cảnh báo / số dòng sẽ cập nhật: chụp lại; số dòng khác **2 SP (4 dòng kể cả
> đơn vị)** hoặc có chữ "thêm mới" → **Huỷ, dừng, báo tôi**. Đúng thì xác nhận nhập. Chụp thông báo kết quả.

## Bước 3 — kiểm

1. **Xuất lại** đúng 2 SP như Bước 1 (giữ tất cả cột) và gửi Claude file mới.
2. Nhắn "xong excel". Claude chụp lại dữ liệu qua API và:
   - `brand-diff` so mọi trường của **mọi** SP: chỉ 2 SP (và đơn vị của chúng) được đổi thương hiệu, không trường nào khác
     đổi ở bất kỳ SP nào;
   - so **từng ô** file xuất trước/sau (bắt cả tên HĐĐT, lô–HSD — những thứ API không đọc được): chỉ ô Thương hiệu khác.
   Cả hai đạt → đường Excel dùng được; một trong hai không đạt → sửa từng SP trên form.
