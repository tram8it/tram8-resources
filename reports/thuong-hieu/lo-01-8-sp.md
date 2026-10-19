# Lô 1 — 8 SP (thử Excel lần 2)

Mỗi SP thử một điều. Cắt bằng `tools/brand_excel.py … --ids` từ file xuất **toàn bộ** mới nhất; kiểm bằng
`brand-diff --zero-weight` + so từng ô file xuất trước/sau.

| # | ID | Mã | SP | Thử điều gì |
|---|---|---|---|---|
| 1 | 64865789 | 8935136860919 | Dầu gội X-Men For Boss sport | Giữ X-Men; trọng lượng 5 → 0: **đơn vị Dây (60) có về 0 không** |
| 2 | 64865179 | 8935047690995 | Thuốc lá Thăng Long Rồng Đỏ | Vinataba → Thăng Long, **VAT 10%** phải giữ |
| 3 | 65192227 | 4987176208538 | Dây gội Pantene phục hồi tóc | P&G → **Pantene (chưa có)**: KiotViet tự tạo hay báo lỗi; đơn vị Dây 50 g |
| 4 | 64865785 | 4902430512848 | PTN X 6G Ngăn rụng tóc | P&G → Pantene (cùng file với #3: không được tạo 2 "Pantene"); đơn vị dây 60 g |
| 5 | 64865202 | 8938538379119 | Nước muối | Dược phẩm Nam Hà → **(trống)**: ô trống có xoá được thương hiệu không |
| 6 | 64865292 | 8934563182144 | Hảo Hảo Sườn Heo Tỏi Phi | ACECOOK → Hảo Hảo (có sẵn), đơn vị Thùng |
| 7 | 64865273 | 8935341301627 | Bánh chocolat Lotte trà xanh | **Ngừng kinh doanh**: Lottte → Lotte, phải vẫn ngừng kinh doanh |
| 8 | 65217822 | 8936217700476 | Nước nghệ Hưng Yên Cocoon | (trống) → Cocoon (có sẵn); trọng lượng 140 → 0 |

Đạt khi: đúng 8 SP đổi như bảng (kể cả đơn vị), trọng lượng chỉ về 0, không trường nào khác đổi ở bất kỳ SP nào,
file xuất trước/sau chỉ khác ô Thương hiệu + Trọng lượng; KiotViet có đúng **một** "Pantene" mới.
Không đạt mục 3/5 (không tự tạo / không xoá được) thì vẫn dùng được Excel, chỉ đổi cách: tạo thương hiệu trên web trước,
và xoá thương hiệu trên form.

## Kết quả (19/10/2026) — ĐẠT
Nhập 7 SP (SP ngừng kinh doanh #7 không có trong file xuất: xuất file chỉ ra hàng đang kinh doanh).
- `brand-diff --zero-weight` trên 3.965 dòng: **ĐẠT**, chỉ 7 SP đổi đúng kế hoạch ([`lo-01-diff.md`](lo-01-diff.md)).
- Trọng lượng hàng gốc về 0 → **đơn vị về 0 theo** (Dây 60/50/60 → 0). Lỗi nhân trọng lượng không còn khi gốc = 0.
- Ô Thương hiệu **trống xoá được** thương hiệu (Nước muối).
- 2 SP "Pantene" về cùng một thương hiệu #747652 — nhưng Pantene **đã có sẵn** (0 SP) nên **chưa biết** nhập tên chưa có thì
  KiotViet tự tạo hay báo lỗi → thử ở lô 2.
- So từng ô file xuất trước/sau 7 SP: chỉ khác Thương hiệu, Trọng lượng — và "Thời gian tạo", nhưng đó là do **hai kiểu xuất**
  (xuất toàn bộ vs xuất SP đã lọc) ghi giờ tạo khác nhau: xuất lọc 15:16 trước lô 1 cũng đã ra 15:38:22.737 cho X-Men, API
  `createdAt` trước/sau lô 1 không đổi (15:39:05.237).
