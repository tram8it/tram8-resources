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

**Thứ tự ưu tiên ảnh (v15, chủ chốt):** (1) ảnh hãng / NPP; (2) ảnh **Gemini vẽ lại** từ ảnh mẫu (internet hoặc ảnh chụp tay) — chỉ khi ảnh AI **không sai nội dung đáng kể** (tên vị, khối lượng, logo, bố cục); (3) ảnh chụp tay đã xử lý đủ (tách nền, crop, cân bằng trắng, tăng độ tươi) — chỉ khi Gemini không vẽ đúng được. Chi tiết dưới đây.

**Thứ tự nguồn ảnh (v13 — áp dụng cho mọi SP):** (1) ảnh hãng (trang/kênh chính chủ) đủ nét; (2) ảnh **nhà phân phối** đang cấp hàng cho Trạm 8 (v11) — chưa biết NPP nào thì **hỏi chủ**; (3) không có hoặc không đủ nét → **Gemini vẽ lại** (v12) từ ảnh mẫu rõ nhất: ảnh hãng/NPP mờ, ảnh BHX, Lotte Mart, sàn… (ảnh nhà bán lẻ **chỉ làm mẫu cho Gemini, không bao giờ đăng thẳng**); ảnh nhân viên chụp cũng chỉ làm mẫu. Ảnh chụp tay **chỉ dùng khi rất đẹp** (thẳng, nét, đủ nắp/đáy, sáng đều); ảnh tầm tầm, méo, mất nắp → không dùng. **Đồng bộ theo dãy SP** (cùng dòng/cùng thương hiệu trong danh mục, vd. cơm nắm): một SP dùng ảnh chụp tay thì cả dãy dùng ảnh chụp tay; mặc định **ưu tiên Gemini** vì cho ảnh đồng bộ hơn (v14).

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
| v9 | 2026-10-15 | Mô tả: KiotViet đã có mô tả **chi tiết của hãng/nhà phân phối** (thành phần, quy cách, cách dùng…) thì **KEEP**, kể cả khi có định dạng HTML; chỉ viết mới khi trống, quá sơ sài hoặc sai SP. | Chủ (đậu phộng Tân Tân) |
| v10 | 2026-10-15 | Trang hãng chặn bot hoàn toàn (vd. pringles.com: Akamai 405 cả curl lẫn trình duyệt) và chủ **chấp nhận ảnh chụp hiện có** — **chỉ ảnh đạt chuẩn**: thấy trọn bao bì (nắp, đáy, mặt trước), đủ nét; ảnh chụp cận/cắt mất phần bao bì → `NEEDS_PHOTO`, không cứu bằng chỉnh màu. Ảnh đạt thì tách nền như v5, `tone.py` như v7, rồi **tăng độ tươi** cho màu giống packshot hãng — độ bão hoà ×1,25, tương phản ×1,08, chỉ trên vùng SP, nền giữ trắng; xoá đốm nền sót (kệ, bokeh) ngoài SP. Không vẽ lại SP. Ghi `source.ownerAccepted: true`. | Chủ (Pringles) |
| v11 | 2026-10-15 | Nguồn ảnh/mô tả thêm **trang web của nhà phân phối (NPP) đang cấp hàng cho Trạm 8** (vd. Hương Thủy cấp Pringles). Ghi NPP vào `data/brands.json` với `role: "distributor"`, danh sách thương hiệu NPP phân phối và bằng chứng (tên công ty/MST, chủ xác nhận là NPP của mình). Chỉ dùng ảnh **đúng SP, đúng vị, đúng bao bì đang bán**; NPP không phải nhà bán lẻ/sàn. Sàn TMĐT, siêu thị, shop thường vẫn **cấm**. | Chủ (Pringles) |
| v12 | 2026-10-15 | Trang hãng không có/chặn ảnh và ảnh hiện có không đạt → **Gemini vẽ lại** được dùng (nới v8; phiên AI được điều khiển Gemini theo yêu cầu chủ). Ảnh mẫu theo thứ tự: catalogue/báo giá NPP chính thức (vd. NPP Hương Thủy) → ảnh nhà bán lẻ (BHX, Lotte Mart…) **chỉ làm mẫu cho Gemini, không đăng thẳng** → ảnh tự chụp. Prompt: chép đúng chữ lớn, không bịa chữ, bỏ watermark/cờ của nhà bán lẻ, nền trắng 1:1. AI kiểm từng ảnh với mẫu (chữ vị, khối lượng, logo); chữ sai thì cho Gemini sửa hoặc bỏ. Ghi `source.aiGenerated: true`, `referenceUrl`, khác biệt vào `reason`; chủ duyệt từng SP trên Hub. Khối lượng trên lon khác tên KiotViet → `ASK_OWNER`. | Chủ (Pringles/Slide) |
| v13 | 2026-10-15 | **Chốt thứ tự nguồn ảnh cho mọi SP:** ảnh hãng → ảnh NPP (hỏi chủ NPP nào) → Gemini vẽ lại từ ảnh mẫu (BHX, Lotte… chỉ làm mẫu). Chủ muốn **mọi SP đều đẹp**: không đăng ảnh chụp tay/méo/mất nắp kể cả sau tách nền + chỉnh màu (thay v10); ảnh nhân viên chụp chỉ làm mẫu cho Gemini. `NEEDS_PHOTO` chỉ còn khi không có ảnh mẫu nào đủ để vẽ đúng (vd. không biết bao bì/vị), hoặc ảnh vẽ ra sai chữ quan trọng sau khi đã sửa. | Chủ (Pringles/Slide) |
| v14 | 2026-10-15 | Nới v13: ảnh chụp tay được dùng nếu **rất đẹp**; tầm tầm thì không. **Đồng bộ theo dãy SP**: một SP trong dãy (cùng dòng/thương hiệu trong danh mục) dùng ảnh chụp tay thì cả dãy dùng ảnh chụp tay — không trộn chụp tay với ảnh hãng/Gemini trong cùng dãy. Mặc định ưu tiên Gemini vì đồng bộ hơn. | Chủ |
| v15 | 2026-10-15 | **Thứ tự ưu tiên ảnh:** ảnh hãng/NPP > ảnh Gemini vẽ lại (mẫu từ internet hoặc ảnh chụp tay; AI không được sai nội dung đáng kể) > ảnh chụp tay đã xử lý đủ (tách nền, crop, cân bằng trắng, độ tươi). Rà lại cả SP đang chờ duyệt theo thứ tự này. | Chủ |
| v16 | 2026-10-16 | **Nhãn khối lượng:** khi nhiều cỡ của cùng một SP dùng chung một ảnh mặt trước (vd. Lay's Nori 53g và 90g), gắn nhãn khối lượng lên ảnh bằng `tools/size_tag.py` (viên tròn tối góc phải dưới, vd. "53g"; SP thu nhỏ còn 80% để nhãn không đè gói). Khối lượng lấy theo tên SP trên KiotViet; ghi `image.sizeTag`. Giữ ảnh chưa gắn nhãn ở `work/untagged/`. | Chủ |
| v17 | 2026-10-16 | Ảnh luôn dùng **bao bì thường, không phải bản sự kiện/khuyến mãi** (World Cup, Tết, bóng đá, mùa lễ). Cùng mã vạch thì ruột như nhau → dùng bản thường dù cửa hàng còn hàng bản sự kiện. Kiểu ảnh chủ muốn: **render phẳng, sạch** như bản thiết kế bao bì (không nhăn, không bóng lóa). | Chủ (Doritos) |
| v18 | 2026-10-17 | **Món hấp bán lẻ (bánh bao…)**: ảnh là **cái bánh**, không phải bao bì — một chiếc nguyên và một chiếc bổ đôi thấy rõ nhân (kiểu ảnh bánh bao Cobi), nền trắng 1:1, **không đĩa**, không chữ/logo. Bánh tạo hình (con gà, con heo…) hiện đúng hình và mặt con vật. Nhân phải đúng tên/bao bì SP, không thêm nguyên liệu. Vẽ bằng `gemini_redraw.py gen --style food --filling "…"` từ ảnh bao bì; ghi là ảnh minh hoạ trong `reason`. | Chủ (bánh bao Thọ Phát) |
| v19 | 2026-10-17 | **Khối lượng:** tin **bao bì đúng mã vạch** hơn tên KiotViet (NSX hay đổi 1–2 g); ảnh + mô tả theo bao bì, **không cần sửa tên**. Chỉ hỏi chủ khi lệch lớn (> ~10% hoặc rõ là cỡ khác). **Đơn vị:** tin **đơn vị KiotViet** (Gói/Cái/Viên… = 1 đơn vị lẻ); tên có thể giữ chữ kiểu "x10 PCS" vì phải khớp HĐĐT — ảnh/mô tả theo đơn vị. **Bao bì:** tìm được bản mới nhất của hãng thì dùng bản mới. **Không phải hàng hoá** (phí vận chuyển, standee, nhãn nội bộ): bỏ qua, không làm ảnh/mô tả. | Chủ |
| v20 | 2026-10-17 | **Tự tra trước khi hỏi:** trước khi đặt `ASK_OWNER` phải xem ảnh KiotViet của SP và SP cùng dòng (bao bì in trên ảnh = hàng trên kệ), tra mã vạch + tên trên web (trang hãng, NPP, Kingfoodmart, Open Food Facts, iCheck) và áp các luật chủ đã chốt (v17, v19). Chỉ hỏi khi còn hai khả năng thật mà không nguồn nào phân định; **không bao giờ** hỏi chủ đọc một con số đã thấy trên ảnh mình có. Câu hỏi ≤ 25 chữ, nêu rõ hai lựa chọn. | Chủ |
| v21 | 2026-10-17 | **Nhãn "Size cực lớn":** gói snack cỡ lớn mới (vd. Oishi 110 g) gắn thêm nhãn chữ "Size cực lớn" bằng `tools/size_tag.py <ảnh chưa gắn> <image.webp> "Size cực lớn"`; giữ ảnh chưa gắn ở `work/untagged/`, ghi `image.sizeTag`. | Chủ |
| v22 | 2026-10-17 | **Đồ tươi / món làm tại quầy** (cơm nắm, cơm cuộn, pizza tam giác, trái cây cắt sẵn, cơm rang, mì Ý tại quầy): ảnh **món ăn hấp dẫn, đồng bộ một phong cách** cho cả nhóm — nền trắng, cùng ánh sáng, góc ~30° từ trên, không chữ/logo/tay/đạo cụ. Cơm nắm/cơm cuộn/pizza: 1 cái nguyên + 1 cái cắt đôi thấy nhân (không đĩa). Trái cây: miếng trái cây trong hộp nhựa trong mở nắp (+ hũ sốt nếu có). Cơm rang/mì Ý: trong hộp mang đi mở nắp. Nhân/nguyên liệu đúng tên, không thêm. Ghi "ảnh minh hoạ món ăn (v22)". Hàng đóng gói của hãng (ATB…) vẫn dùng ảnh bao bì. | Chủ |
| v23 | 2026-10-18 | **Bỏ v22.** Đồ tươi / món làm tại quầy dùng **ảnh bao bì thật** như hàng đóng gói (vẽ lại gói thật từ ảnh KiotViet/ảnh nhân viên, không vẽ món ăn đã bóc). Cơm nắm Onigiri Việt: theo đúng phong cách ảnh **Bò BBQ** chủ đã duyệt (tam giác rong biển trong màng, dải PULL đỏ, nhãn cam). Pizza tam giác: **1 gói**. Cơm cuộn ngắn ăn liền: 1 cuộn nguyên trong màng, không cắt. Trái cây Fresh 2GO: đúng túi hút chân không/hộp tròn và nhãn thật. Cơm rang: túi nilon hút chân không. Không có ảnh thật → NEEDS_PHOTO, không vẽ đoán. | Chủ |
