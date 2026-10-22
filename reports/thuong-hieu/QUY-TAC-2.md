# Thương hiệu: đối chiếu quy tắc "khách gọi tên gì" (21/10/2026)

Bản chụp KiotViet sau đợt ĐVT 2 (20/10/2026): 2.701 hàng gốc · 423 thương hiệu đang dùng · 188 SP để trống ·
145 SP ghi "Hàng nội địa Trung".

## Quy tắc (chủ, 21/10/2026)
- **Khách gọi tên gì khi hỏi mua thì thương hiệu là tên đó.**
- **Gộp về thương hiệu mẹ** khi logo mẹ in to trên bao bì và khách gọi theo tên mẹ ("bim Oishi").
- **Giữ tên dòng sản phẩm** khi khách gọi theo tên dòng và công ty mẹ chỉ là nhà sản xuất (Poca, O'Star, Swing, Marine Boy).
  Không gộp theo tên công ty.
- **Mỗi thương hiệu chỉ một cách viết**, theo tên chính thức in trên bao bì.
  Khác chữ là khác thương hiệu, ví dụ thêm "Stax", thêm "Foods".
- **Không phải thương hiệu thì để trống.**

So với các quyết định ngày 19/10 (`KE-HOACH.md`), quy tắc mới khớp gần hết:
- Hảo Hảo, Mirinda, 7Up, Sting, Twister, Milo, KitKat vẫn tách riêng như cũ.
- "Lay's Stax" đã gộp về "Lay's", đúng với quy tắc viết thống nhất.

Có hai chỗ khác:
1. Dòng con không còn tách theo số SP (≥ 3 SP) mà theo **logo mẹ có in to không**.
   Vì vậy 4X và Pillows (đang tách vì có 4 và 8 SP) phải gộp về Oishi.
2. Ngày 19/10 chủ chọn ghi "Hàng nội địa Trung". Quy tắc mới coi đó **không phải thương hiệu** và bảo hạn chế dùng.

## Kiểm tra hiện trạng
- **Viết thống nhất:** đạt.
  - Không có hai thương hiệu nào trùng nhau khi bỏ hoa/thường, dấu và khoảng trắng như web làm.
  - Cặp tiền tố duy nhất là "Budweiser" và "Budweiser Budvar". Đây là hai bia khác hãng, nên giữ cả hai.
- **Tên công ty dùng làm thương hiệu:** không còn.
- **Lay's:** 29 SP, một cách viết.

## Đề xuất đổi

| # | Hiện | Đổi thành | SP | Lý do | Báo session tram8-web? |
|---|---|---|---|---|---|
| 1 | 4X | **Oishi** | 4 | Logo Oishi in to, khách gọi "bim Oishi" (quy tắc của chủ) | Không: gộp vào thương hiệu đã có |
| 2 | Pillows | **Oishi** | 8 | như trên | Không |
| 3 | Samyang | **Buldak** | 4 | Mì tô gà cay, mì tô khô gà cay (đen, hoa hồng), Jjajang cay: đều là dòng Buldak | Không: Buldak đã có 15 SP |
| 4 | Orion: "BánhOstar Tảo 33G" | **O'Star** | 1 | Ghi nhầm hãng; O'Star là thương hiệu riêng | Không |

Cần chủ xem (đề xuất của tôi ghi trong ngoặc):

| # | Hiện | SP | Câu hỏi |
|---|---|---|---|
| 5 | Samyang: "Mì trộn tương tàu 140g" | 1 | Có phải Buldak không? Nếu là mì Jjajang thường của Samyang thì để Samyang hay Khác? (Xem ảnh vỏ) |
| 6 | Orion | 14 | Đây là nhóm lẫn lộn, gồm: Chocopie (2), Custas, YeGam (2), Miz, Boom (2), J. Boy, corn chip, 2Mix, con cá bống bang, kẹo họng, măng cay tiêu xanh. Theo quy tắc, khách gọi "Chocopie", "Custas", "Yegam" chứ không gọi "Orion". (Đề xuất: **Chocopie**, **Custas** tách riêng; "Măng cay tiêu xanh" và "Kẹo họng" gần như chắc không phải Orion, cần xem lại.) |
| 7 | SuSu (6) · Probi (11) · Hayđấy (5) | 22 | Chủ quyết: giữ tên dòng hay gộp về Vinamilk. Vinamilk hiện có 29 SP: kem, sữa chua ăn, nước dừa… |
| 8 | Hàng nội địa Trung | 145 (118 đang bán) | Bỏ trống hết, hay giữ? Hai cách đều bị xếp cuối trên web. Để trống thì không lẫn với thương hiệu thật; giữ thì còn lọc được nhóm hàng Trung. |

Các dòng con khác vẫn giữ tên riêng, vì khách gọi theo tên dòng:
- Pocky, Hi-Chew, Dars, Richeese, Richoco, Melona, Shin Ramyun, Cup Noodles, Xylitol, Toppo, Koala's March,
  Hello Panda, Zoo Jelly, Ông Thọ…
- Chủ thấy cái nào khách gọi theo tên mẹ thì báo, tôi gộp.

## Cách làm: nhập Excel, **không sửa tay trên form**
Phần "Cách sửa" trong quy tắc ghi là sửa tay trên web KiotViet. Nên dùng cách nhập Excel như ngày 19/10, vì:
- **Lưu form sản phẩm** trên KiotViet tự đặt lại VAT (sự cố 17/10), đổi xuống dòng trong mô tả thành `<br>`,
  và kéo mô tả của đơn vị lớn theo hàng gốc.
- **Nhập Excel** chỉ ghi ô thương hiệu, có bản chụp trước/sau và `brand-diff` kiểm từng trường.
  Cách này đã làm cho 2.023 SP mà không lỗi.

Các bước:
1. Chủ trả lời 5–8.
2. Chủ xuất toàn bộ danh sách hàng hoá.
3. Lô thử 3 SP (1 Pillows, 1 Samyang, O'Star).
4. Lô còn lại.
5. Nếu chủ chọn tên mới chưa có trên web (Chocopie, Custas…), báo session tram8-web để thêm logo và hạng
   (`src/brand-logos.ts`, `public/brands/`, `src/brand-tiers.ts`).
6. Sau khi gộp, xoá thương hiệu rỗng trên trang Thiết lập → Thương hiệu: 4X, Pillows, Samyang nếu không còn SP.

Bảng chuẩn `data/brand-canon.json` sẽ được cập nhật theo quyết định, để `brand-propose.mjs` không tách ra lại.

## Rà thương hiệu con (chủ 21/10: "rà các thương hiệu con, có gì báo để gộp hết"; Twister → Pepsi)
Chỉ tính những thương hiệu con mà thương hiệu mẹ **cũng đang là thương hiệu trên KiotViet**. Tên công ty không tính
(Procter & Gamble, Unilever, Masan…), vì quy tắc không gộp theo tên công ty.

| Mẹ (SP hiện có) | Con (SP) | Đề xuất |
|---|---|---|
| Pepsi (7) | Twister (5) | **gộp** (chủ đã chốt) |
| Samyang (5 → 1) | Buldak (15) | **gộp về Samyang** (chủ: "Samyang nổi tiếng hơn") |
| Oishi (58) | 4X (4), Pillows (8) | **gộp** (đang làm) |
| Vinamilk (29) | Probi (11), SuSu (6) | **gộp** (đang làm) · Hayđấy (5) · Ông Thọ (4) chờ chủ |
| Lotte (27) | Xylitol (21), Doraemon (4), Koala's March (3), Toppo (3), Kkokalcorn (3), Suku Suku (3), Fusen Nomi (2) | gộp; logo LOTTE in to trên mọi gói |
| Orion (15) | O'Star (7), Swing (5), Marine Boy (5), Bánh Gạo An (4), C'est Bon (3) | quy tắc 21/10 giữ O'Star/Swing/Marine Boy; nay chủ muốn gộp hết thì gộp |
| Nabati (11) | Richoco (8), Richeese (6) | gộp |
| Nongshim (20) | Shin Ramyun (5) | gộp |
| Binggrae (10) | Melona (4) | gộp |
| Meiji (6) | Hello Panda (3) | gộp |
| Nissin (4) | Cup Noodles (4), Raoh (3) | gộp |
| Gery (3) | Chocolatos (4) | gộp |
| OKF (3) | Vtalk (3) | gộp |
| LC Foods (3) | Oh Teen (2) | gộp |
| Doctor Care (3) | Glamiss (1) | gộp |
| Biswell (1) | Pipper (2) | gộp |
| Heineken (1) | Tiger (2), Strongbow (3) | **không gộp**: Tiger là bia khác, Strongbow là cider; khách không gọi "Heineken" |

Các thương hiệu cùng công ty nhưng không có "mẹ" là thương hiệu (vd Mirinda 2, 7Up 1, Sting 4 của Suntory PepsiCo)
vẫn là thương hiệu riêng. Chủ muốn gộp Mirinda/7Up vào Pepsi thì báo.

## Chủ chốt 21/10 → `gop-dot-2.csv` (33 thương hiệu con, 148 SP)
- **Gộp:** Hayđấy và Ông Thọ → Vinamilk. O'Star, Swing, Marine Boy, Bánh Gạo An, C'est Bon → Orion. Twister, Mirinda, 7Up → Pepsi.
  Buldak → Samyang. Các dòng con khác trong bảng trên → thương hiệu mẹ.
- **Không gộp:** Xylitol, vì nổi tiếng riêng (ít ai biết là của Lotte) và có nhiều mã hàng (21). Heineken / Tiger / Strongbow giữ riêng.
- **Quy tắc rút ra:** dòng con giữ tên riêng khi **vừa nổi tiếng riêng vừa có nhiều mã hàng**. Nổi tiếng mà ít mã hàng
  (Mirinda 2, 7Up 1) thì vẫn gộp về mẹ.
- "Hàng nội địa Trung" giữ nguyên (chủ 21/10).
- Danh sách đổi `doi-dot-2.csv` cũ đã lỗi thời: Samyang không còn đổi sang Buldak, O'Star → Orion. Danh sách mới sẽ lập lại từ file xuất mới.
- `data/brand-canon.json` đã ghi `p` và `up: true` cho 33 thương hiệu con, và `up: false` cho Xylitol.
- Sau khi nhập: báo session "Sắp xếp sản phẩm theo thương hiệu" (session lo tram8-web) danh sách gộp, để kiểm logo và hạng
  của các thương hiệu mẹ ít SP (Gery, Meiji, Binggrae, OKF, LC Foods, Doctor Care, Biswell). Xoá các thương hiệu không còn SP nào.

## Kết quả (21/10/2026)
- Lô thử (3 SP) và lô 2 (146 SP): `brand-diff` đổi đúng **149/149 SP**. Các cảnh báo còn lại đều là giá do chủ sửa tay trong lúc nhập
  (kẹo dẻo Xuan Guo Le, thanh mai sấy, rượu 375 ml), không thuộc file nhập.
- 35 thương hiệu không còn SP nào, chờ chủ xoá ở Thiết lập → Hàng hóa → Thương hiệu:
  4X, 7Up, Bánh Gạo An, Bích chi, Buldak, C'est Bon, Chocolatos, Cup Noodles, Doraemon, Fusen Nomi, Glamiss, HABECO,
  Hayđấy, Hello Panda, Kkokalcorn, Koala's March, Marine Boy, Melona, Mirinda, Oh Teen, Ông Thọ, O'Star, Pillows,
  Pipper, Probi, Raoh, Richeese, Richoco, Shin Ramyun, Suku Suku, SuSu, Swing, Toppo, Twister, Vtalk.
- Chủ sửa tay: 2 SP Bento thanh cua surimi → LC Foods.

## Đợt 3 (21/10/2026): `gop-dot-3.csv`, 32 SP, `brand-diff` đổi đúng 32/32
- Đổi:
  - Modern, Phú Hương, Đệ Nhất, Hằng Nga, Lẩu Thái, Good, Nhớ Mãi Mãi → **Acecook** (thương hiệu mới, KiotViet tạo khi nhập).
  - Miyaki, Fasty, Tyti → **Tràng An** (thương hiệu mới).
  - Sprite, Schweppes, Georgia, Dasani → Coca-Cola. Revive, Rockstar → Pepsi. Cosy, AFC → Kinh Đô. Trúc Bạch → Bia Hà Nội.
- Giữ riêng (nổi tiếng riêng và nhiều mã): Hảo Hảo, Siukay, Fanta, Minute Maid, Nutriboost, Boss, các dòng Mayora.
- Đã báo session tram8-web thêm logo và hạng cho Acecook và Tràng An.
- 4 cảnh báo còn lại: chủ đổi tay tên 2 SP "Thịt Bò Chay Xé Sợi" (Vịt Đen ↔ Vịt BBQ). Không thuộc file nhập.
- Thương hiệu không còn SP nào, chờ chủ xoá: **54**. Gồm 35 cái của đợt 2, cộng thêm AFC, Cosy, Dasani, Đệ Nhất, Fasty, Georgia,
  Good, Hằng Nga, Lẩu Thái, Miyaki, Modern, Nhớ Mãi Mãi, Phú Hương, Revive, Rockstar, Schweppes, Sprite, Trúc Bạch, Tyti.

## Đợt 4 (23/10/2026): `gop-dot-4.csv`, 17 SP, `brand-diff` đổi đúng 17/17
- Hảo Hảo (11 SP) và Siukay (6 SP) gộp về **Acecook** (chủ 23/10). Acecook hiện có 31 SP.
- Đã báo session tram8-web bỏ logo của Hảo Hảo và Siukay.
- Thương hiệu không còn SP nào, chờ chủ xoá: **56** (54 cái cũ, cộng Hảo Hảo và Siukay).
