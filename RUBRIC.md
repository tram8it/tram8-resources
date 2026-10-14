# RUBRIC — bộ tiêu chí cố định (phiên bản **v4**)

Áp dụng giống nhau cho mọi SP, mọi phiên. Ghi `rubricVersion` vào mỗi quyết định để biết SP được
chấm theo bản nào. Sửa tiêu chí = tăng phiên bản + ghi **nhật ký thay đổi** ở cuối file.

Nguyên tắc chung: **chỉ sửa cái chắc chắn sai. Không chắc → `ASK_OWNER` với câu hỏi cụ thể.**

---

## A. Ảnh

Mở ảnh ra xem, trả lời theo thứ tự. Câu đầu tiên trả lời “không” quyết định kết quả.

| # | Câu hỏi | “Không” → |
|---|---|---|
| I1 | Có ảnh, mở được? | `REPLACE` |
| I2 | **Đúng sản phẩm** — đúng tên, đúng vị/màu, đúng dung tích/quy cách, **bao bì mới nhất**? | `REPLACE` (không chắc → `ASK_OWNER`) |
| I3 | Ảnh **sản phẩm** (packshot), không phải ảnh chụp cận nhãn/kệ/tay cầm/bối cảnh? | `REPLACE` |
| I4 | **Nền trắng** sạch (hoặc trong suốt)? | `REPLACE` — trừ khi tách nền bằng `tools/cutout.py` ra viền sạch (v5) |
| I5 | Thấy **nguyên vẹn** sản phẩm, không bị khung ảnh cắt? | `REPLACE` |
| I6 | Nét, đủ lớn (cạnh ngắn ≥ 300px)? Web hiện ảnh nhỏ (~200px trên thẻ SP) nên ảnh phóng to hơi mềm/vỡ nhẹ vẫn **đạt** (v4) | `REPLACE` |
| I7 | Không watermark, logo/tem giá cửa hàng khác, chữ chèn, khung viền? | `REPLACE` |
| I8 | Chỉ một sản phẩm (trừ khi SKU là lốc/thùng/combo — khi đó phải đúng số lượng)? | `REPLACE` |
| I9 | **1:1** và sản phẩm **nằm giữa**, lề vừa phải? | `CROP` |
| — | Tất cả “có” | `KEEP` |

**CROP** = cắt sát sản phẩm, đặt giữa nền trắng 1:1. **Bắt buộc mở ảnh sau crop ra xem lại**;
mờ/vỡ/lộ viền xấu → đổi thành `REPLACE`.

**Bao bì mới nhất (v2):** SP cùng mã vạch, hoặc cùng thương hiệu + cùng vị trên trang hãng = cùng SP đã đổi bao bì → luôn dùng ảnh bao bì mới nhất trên trang hãng, kể cả khi ảnh hiện tại đúng nhưng là bao bì đời trước. Mô tả (khối lượng, thành phần) theo bao bì mới đó. Tên trên KiotViet lệch (vd. 74g → 75g) thì báo chủ sửa ở KiotViet.

**Nguồn ảnh (v3):** (1) trang web chính hãng; (2) **kênh chính chủ của hãng**: fanpage đã xác minh, gian hàng do chính hãng vận hành trên Shopee Mall/TikTok Shop/LazMall — ghi kênh + bằng chứng vào `data/brands.json` trước khi dùng. Ảnh của shop thường, siêu thị, người bán lẻ vẫn **cấm**; không vẽ lại/tái tạo ảnh của họ. Ảnh hãng nhỏ (~300px) được phóng tối đa ~3 lần nếu xem lại không vỡ, ghi rõ trong `reason`.

### Ví dụ chủ đã chốt (13/10/2026, từ tram8.vn)

| Sản phẩm | Kết luận | Vì sao |
|---|---|---|
| ATB _ Bánh Su Dai / Su Kem / Mì Ý Bò | `CROP` | packshot nền trắng, đúng SP, chỉ không phải 1:1 |
| Trà sữa Lạc Lạc (Thái đỏ, Thái xanh, Ô Long nhài, Trà đào sữa) | `REPLACE` → `NEEDS_PHOTO` | chụp cận nhãn bằng điện thoại, nền không trắng (I3, I4) |
| Cơm Cuộn Bò Phô Mai, ATB Mì Ý Xốt Kem (hiện logo 8) | `REPLACE` | không có ảnh (I1) |
| Cơm nắm Chả Cá Sốt Cay | `REPLACE` | sản phẩm bị khung cắt, nhiều SP chồng lệch (I5, I8) |
| Cơm nắm Gà Teriyaki | `CROP` (xem lại sau crop) | nền trắng, nguyên vẹn, nhưng nhỏ và lệch |

### Chuẩn thành phẩm `image.webp`

- 1000 × 1000 px, WebP chất lượng ~86, nền **#FFFFFF**.
- Sản phẩm chiếm ~**84%** cạnh dài, căn giữa cả hai chiều.
- Giữ nguyên màu và bao bì; **không** chỉnh sửa nội dung bao bì, **không** thêm logo Trạm 8/chữ.
- Bóng đổ nhẹ tự nhiên được giữ; nền xám/vân phải được đưa về trắng hoặc ảnh đó phải thay.

---

## B. Mô tả

| # | Câu hỏi | “Không” → |
|---|---|---|
| D1 | Có mô tả (không trống, không chỉ lặp tên, không rác/“test”/số điện thoại/giá tiền)? | `WRITE_NEW` |
| D2 | **Đúng sản phẩm** — không nói sai vị, dung tích, thành phần, xuất xứ; không phải mô tả của SP khác dán sang? | `REWRITE` |
| D3 | Viết chuyên nghiệp: tiếng Việt có dấu chuẩn, không viết hoa lung tung, không quảng cáo quá đà, không emoji? | `REWRITE` |
| D4 | Có đủ thông tin cốt lõi theo khuôn dưới (ít nhất: giới thiệu + quy cách)? | `REWRITE` |
| — | Tất cả “có” | `KEEP` |

**Nguồn mô tả theo thứ tự (v2):** (1) trang chính hãng; (2) ảnh nhãn mặt sau tìm được trên mạng, chỉ đọc chữ in trên nhãn, không lấy ảnh/văn bản của trang đó (v3: được đọc nhãn trên trang siêu thị/bán lẻ, kể cả domain trong `blocked-domains.json`, chỉ để lấy dữ kiện in trên bao bì); (3) không có hai nguồn trên → mô tả ngắn **chỉ từ dữ kiện chắc chắn** (tên SP, thương hiệu, vị, khối lượng, chữ in mặt trước bao bì), ghi rõ trong `reason`. Thiếu dữ kiện thì bỏ mục đó, tuyệt đối không suy diễn.

Mô tả **đúng nhưng ngắn gọn** vẫn là `KEEP` nếu đạt D1–D4 — không viết lại chỉ vì “có thể hay hơn”.

### Khuôn mô tả (`description.md`)

Văn bản thuần, web bỏ HTML. Bỏ hẳn mục nào không có dữ kiện từ nguồn — **không bịa**.

```
<1–2 câu giới thiệu: là gì, điểm đặc trưng, dùng khi nào.>

Thành phần: …
Quy cách: <dung tích/khối lượng> · <đơn vị bán: chai/lon/gói/hộp/lốc 6…>
Xuất xứ: <nước> · Nhà sản xuất/thương hiệu: …
Bảo quản: …
Hướng dẫn sử dụng: …   (chỉ khi có ý nghĩa: mì, sữa bột, gia vị…)
```

- Viết lại bằng lời của mình từ dữ kiện nguồn; **không chép nguyên văn** đoạn quảng cáo của hãng.
- Không ghi giá, không ghi tồn kho, không ghi khuyến mãi, không cam kết công dụng chữa bệnh.
- Sữa cho trẻ dưới 24 tháng: chỉ thông tin sản phẩm, **không** câu quảng cáo (quy định pháp luật).
- Bia: thêm dòng “Sản phẩm dành cho người từ 18 tuổi trở lên.”

Category có thể có khuôn riêng chi tiết hơn trong `categories/<id>-<slug>/_category.md` (chốt ở pilot).

---

## C. Mức độ chắc chắn

| Tình huống | Làm |
|---|---|
| Chắc chắn sai theo một câu ở trên | Sửa (`CROP`/`REPLACE`/`REWRITE`/`WRITE_NEW`) |
| Chắc chắn đúng | `KEEP` |
| Không chắc (ví dụ: không biết bao bì này có còn bán không, tên SP mơ hồ về vị/dung tích) | `ASK_OWNER` + câu hỏi cụ thể, **không sửa** |

---

## Nhật ký thay đổi

| Phiên bản | Ngày | Thay đổi | Theo yêu cầu của |
|---|---|---|---|
| v1 | 2026-10-13 | Bản đầu. Ví dụ chuẩn từ ảnh chụp tram8.vn; 1:1 là bắt buộc, crop được thì crop rồi kiểm lại. | Chủ |
| v2 | 2026-10-13 | I2: luôn dùng **bao bì mới nhất** trên trang hãng khi cùng mã vạch/cùng vị. Mô tả: thêm nguồn nhãn mặt sau và mô tả ngắn từ dữ kiện chắc chắn khi không có nguồn. | Chủ (pilot Mì gói) |
| v3 | 2026-10-13 | Ảnh: thêm kênh chính chủ của hãng (fanpage xác minh, gian hàng chính hãng trên sàn); ảnh hãng nhỏ được phóng ~3 lần nếu không vỡ. Mô tả: được đọc nhãn trên trang siêu thị, chỉ lấy dữ kiện in trên bao bì. | Chủ (pilot Mì gói) |
| v4 | 2026-10-13 | I6 nới: web hiển thị ảnh nhỏ nên ảnh hãng phóng to hơi mềm, vỡ nhẹ vẫn đạt; ưu tiên ảnh hãng phóng to hơn là bắt nhân viên chụp. | Chủ (xem tram8.vn) |
| v5 | 2026-10-14 | I4: ảnh đúng SP nhưng nền màu (ảnh nhân viên chụp, banner chính hãng có nền/hiệu ứng/chữ khuyến mãi) được **tách nền** bằng `tools/cutout.py` (cắt sát SP, bỏ huy hiệu/chữ ngoài SP). Chỉ cắt, **không** vẽ lại/sửa SP; mở ảnh xem viền, nắp/vành trắng; viền xấu → không dùng. Nguồn ảnh vẫn theo v3. | Chủ (Omachi Quán Xá Châu Á) |
| v6 | 2026-10-14 | Nguồn ảnh: **ưu tiên ảnh hãng** (render/packshot chính hãng) hơn ảnh tự chụp hay ảnh KiotViet hiện có, kể cả khi ảnh hãng là bản bao bì gần giống (vd. gói thường thay cho bản "Bát To Đặc Biệt") miễn **cùng sản phẩm, cùng vị**. Ghi rõ khác biệt trong `reason`; **mô tả vẫn theo SP đang bán** (khối lượng, nhãn). Khác vị/khác loại SP thì vẫn không được dùng. Ảnh tự chụp chỉ dùng khi hãng không có ảnh. | Chủ (Phở Gà Cung Đình Bát To) |
| v7 | 2026-10-14 | Ảnh thiếu sáng/ám màu (ảnh tự chụp, ảnh KiotViet) được chỉnh bằng `tools/tone.py`: chỉ **cân bằng trắng** (mỗi kênh ±8%, theo vùng trắng/xám trên bao bì) và **độ sáng toàn ảnh** (levels trên độ sáng, giữ màu/độ bão hoà; chỉ nâng trung tông khi ảnh thiếu sáng). Không chỉnh cục bộ, không sửa chi tiết. Bao bì vốn tối (chai đen, gói đỏ đậm) vẫn phải nhìn tối. Mở so trước/sau. | Chủ (sốt Buldak) |
| v8 | 2026-10-14 | Ảnh **AI tạo lại** bao bì chỉ dùng khi **chủ gửi và duyệt từng SP** (hãng không có ảnh, ảnh thật xấu). AI có thể đổi chi tiết nhỏ trên bao bì (chữ, con dấu, dòng khối lượng): phải so với gói thật, báo chủ khác biệt trước khi dùng; mô tả vẫn theo gói thật. Ghi `source.aiGenerated: true` và khác biệt vào `reason`. Phiên AI **không tự tạo** ảnh. | Chủ (mì trộn gạch cua) |
