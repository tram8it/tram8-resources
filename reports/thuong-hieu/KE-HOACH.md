# Kế hoạch chuẩn hoá thương hiệu trên KiotViet (19/10/2026)

Mục tiêu: mỗi sản phẩm trên KiotViet có **đúng một thương hiệu, viết đúng một kiểu**; danh sách
thương hiệu không còn trùng, gõ sai, tên công ty, tên nhà phân phối hay tên loại hàng.
Sửa **trực tiếp trên production** bằng Claude in Chrome → kế hoạch này ưu tiên **không sai** hơn nhanh.

> Vì sao phải sửa trên web: API công khai KiotViet **không ghi được thương hiệu** (thử 13–14/10:
> gửi `tradeMarkId`/`tradeMarkName` → trả 200 nhưng bỏ qua — tram8-hub `docs/25`). Đọc thì được.

---

## 1. Hiện trạng (đo thật 19/10/2026, chỉ đọc qua Hub `GET /api/v1/forward/...`)

| | Số |
|---|---|
| Thương hiệu trên KiotViet | **244** |
| — không còn SP nào | **64** (26%) |
| SP gốc (không tính đơn vị lốc/thùng) | 2.700 (2.488 đang bán · 212 ngừng) |
| — **chưa có thương hiệu** | **1.388** (1.244 đang bán) |
| Đơn vị quy đổi (lốc/thùng) | 1.265 — **luôn cùng thương hiệu với SP gốc** (0 lệch) |
| SP có dòng "Thương hiệu:/Nhà sản xuất:" trong mô tả (AI viết từ bao bì/trang hãng) | 2.084 |

Các kiểu lỗi (bảng đầy đủ: [`hien-trang-244-thuong-hieu.csv`](hien-trang-244-thuong-hieu.csv)):

| Kiểu | Ví dụ thật | SP bị ảnh hưởng |
|---|---|---|
| **Tên công ty thay vì nhãn hàng** | ACECOOK (Hảo Hảo), Pepsico (Pepsi, Poca, Lay's…), Procter & Gamble (Pantene, Rejoice…), Masan Consumer / Masan jinju (Omachi, Kokomi…), KINH DO (Oreo, Cadbury, Toblerone), Nước giải khát Sài Gòn, HABECO, KIDO, Nestle, MAYORA, THO Group, Vinataba | ~280 |
| **Không phải thương hiệu** | Halal (chứng nhận), Vodka / Whisky / Tennessee Whiskey (loại rượu), Firm Filter Smooth Taste (khẩu hiệu bao thuốc), Khác, IPHONE, Oat milk, JELLY | ~30 |
| **Gõ sai / trùng** | Lottte (51 SP) ↔ Lotte (4) · X men ↔ X-Men · koko ya ↔ KoKoYa · Coolgate ↔ Colgate · Chuppa Chuđ · DAINISA · Hạ Long Saphhire · HURA (Huda) · Slice (SP ghi SLIDE) · Hershey’s (nháy cong) | ~90 |
| **Hai tên cho một nhãn** | DP Hoa Linh ↔ Dạ Hương · Công nghệ thực phẩm Châu Á ↔ Cung Đình · ACECOOK ↔ Hảo Hảo · Masan jinju ↔ Kokomi · Firm Filter ↔ Marlboro · RJC ↔ Procter & Gamble (Rejoice) · Navi ↔ Navi Tongue Cleaner | — |
| **SP gắn nhầm nhãn** | Alpenliebe dưới Chupa Chups · Snickers dưới Skittles · Doritos dưới Lotte · KitKat dưới Lottte · Strongbow dưới Heineken · Monster/Schweppes dưới Cocacola · Merino ↔ Celano lẫn nhau · Paldo/Nongshim dưới KORENO · Glamiss dưới Doctor Care | chưa đếm hết |
| **Chữ hoa/thường lộn xộn** | NIVEA, omachi, chinsu, ponnie, ĐÀ LẠT MILK, ĂN CÙNG BÀ TUYẾT | — |

Bảng nháp gợi ý: GIỮ 113 · XOÁ (0 SP) 63 · TÁCH (tên công ty/không phải TH) 27 · ĐỔI TÊN 19 ·
SỬA LẺ 10 · GỘP 5 · HỎI 7 — **20 dòng cần chủ quyết**. Đây là nháp từ tên SP, **chưa xem bao bì**;
bước 3 mới chốt.

---

## 2. Đã chốt (chủ, 19/10/2026)

**Vì sao cần chuẩn:** web sẽ có lọc theo thương hiệu và chế độ "xếp theo thương hiệu" thay cho danh mục cấp 2–3
(vào Mì gói → chọn Hảo Hảo → ra đủ Hảo Hảo); kể cả khi xếp theo danh mục, SP cùng thương hiệu nằm cạnh nhau.
Một nhãn viết hai kiểu là hai nhóm trên web.

1. **Cấp:** **thương hiệu con** của SP — "Hảo Hảo" (không "Acecook"), Mirinda, Twister, 7Up, Sting, Fanta, Sprite,
   Milo, KitKat; lon Coca-Cola là Coca-Cola. Dòng con **đủ lớn để lọc (≥ 3 SP)** thành thương hiệu riêng (Buldak,
   Xylitol, Probi, Pocky, Nivea Men…); dòng **1–2 SP gộp về thương hiệu cha** (`MIN_LINE_PRODUCTS` trong
   `tools/brand-propose.mjs`). Dòng chỉ là "nhãn cha + mô tả" luôn về cha (Colgate Slim Soft, Koreno Jumbo,
   Cung Đình Kool, X-Men For Boss, Nivea Sun — `"up": true` trong bảng chuẩn). Tên công ty khách không gọi
   (Acecook, Masan, Mondelez, P&G, Unilever) chỉ dùng khi SP không có nhãn nào khác.
2. **Cách viết:** **Chữ Hoa Đầu Từ** (Nivea, Kido, Bibigo, Hoco, Durex, Đà Lạt Milk); giữ chữ viết tắt (TH, P/S, OKF, 333);
   giữ dấu tiếng Việt; nháy thẳng `'`.
3. **SP không có nhãn** (trái cây cắt, đồ nhà làm, đồ dùng không nhãn): **để trống** — web xếp vào nhóm "Khác".
4. **SP ngừng kinh doanh:** **có** chuẩn hoá, **làm sau cùng**.
5. Thương hiệu rỗng: xoá **cuối cùng**, chỉ khi bản chụp mới nhất = 0 SP (kể cả ngừng bán).
6. Công ty / dòng con: lưu trong `data/brand-canon.json` (trường `c`, `p`) để web/Hub dùng sau; KiotViet chỉ giữ một tên.

Còn mở (đánh dấu `"ask": true` trong `data/brand-canon.json`, chủ xem ở trang duyệt):
- Nhãn lơ lửng: À Table, Onigiri Việt, Fresh 2Go, Pizza 4P's, Thanh Hà Foods, Kinh Đô, Camel (bia và thuốc lá cùng tên),
  Play Candy, Weisiel, Love Minimart, Meo Meo, Lâm Vũ, Hải Đăng Đỏ.

---

## 3. Các bước (làm đúng thứ tự, mỗi bước có cổng kiểm)

### Bước 0 — Công cụ (repo, không đụng production) — **đã có**

Mạng của phiên phải tới được `hub.tram8.vn`; chạy với `NODE_USE_ENV_PROXY=1 TRAM8_API_TOKEN=…`.

| Lệnh | Việc |
|---|---|
| `node tools/brand-snapshot.mjs [out.json]` | Đọc **toàn bộ** SP + thương hiệu qua Hub (chỉ GET, `forward/products`, `forward/trademark`) → `work/brand-snapshots/<giờ>.json`: mọi trường trừ tồn kho; mô tả lưu dạng hash + dòng thương hiệu. **Bản để hoàn tác.** Đọc nhiều lượt với cỡ trang khác nhau vì KiotViet chia trang lệch (đo 19/10: 1 SP lặp, 1 SP mất ở ranh giới trang); thiếu SP là dừng, không ghi bản chụp. |
| `node tools/brand-diff.mjs <trước> <sau> [lô.csv]` | So hai bản chụp với kế hoạch lô: **ĐẠT** chỉ khi mọi thay đổi trong lô có đủ, đúng từng ký tự, và **không trường nào khác đổi** (VAT, giá, tên, nhóm, mô tả, ảnh…). Không có lô = không được đổi gì. Thử thật 19/10: hai lần chụp cách 1,5 phút đã bắt được 4 SP Demisoda đổi VAT 8% → 10% (giá trước thuế đổi theo). |
| `node tools/brand-propose.mjs <bản chụp> [--categories dir]` | Đề xuất thương hiệu từng SP từ `data/brand-canon.json`: dòng "Thương hiệu:" trong mô tả (viết từ bao bì/trang hãng) → tên SP → TH hiện tại; đọc thêm `description.md` chưa đẩy lên KiotViet và `reports/thuong-hieu/doc-anh.json` (nhãn đọc từ ảnh). → `de-xuat-tung-sp.csv` + `de-xuat-tom-tat.md`. |
| `node tools/brand-review.mjs <bản chụp> <đề xuất.csv>` | Trang duyệt `review/thuong-hieu.html`: theo danh mục, trong đó nhóm theo thương hiệu — đúng như web sẽ hiển thị. Lọc "chỉ SP đổi" / "chỉ SP cần xem", tìm kiếm. |
| `node tools/brand-plan.mjs <bản chụp mới> <đề xuất.csv> [--include CHAC]` | Sinh các lô theo thứ tự bước 4 (gộp → xoá tên chặn → đổi tên → tạo → gán từng SP → xoá rỗng), mỗi lô một `.csv` (cho `brand-diff`) + một `.md` (prompt dán vào Claude in Chrome). SP có TH đã bị đổi sau khi lập đề xuất bị loại khỏi lô. Chỉ đổi tên một thương hiệu khi **quá nửa** SP của nó về cùng một tên chuẩn. |

### Bước 1 — Trinh sát KiotViet web (Chrome, **chỉ xem, không bấm Lưu**)
Những điều **chưa biết chắc**, phải nhìn tận mắt trước khi soạn prompt:
1. Quản lý thương hiệu nằm ở đâu (thường trong ô chọn "Thương hiệu" của form hàng hoá): có **đổi tên**,
   **xoá** được không; xoá TH đang có SP thì SP ra sao (mất TH? bị chặn?).
2. Danh sách hàng hoá có **thao tác hàng loạt** gán thương hiệu không (tích nhiều SP → …).
3. **Nhập file Excel** "cập nhật hàng hoá" có cột Thương hiệu không; file có buộc kèm giá/tồn/VAT không
   (nguy cơ ghi đè). Nếu có cách an toàn thì nhanh hơn rất nhiều so với sửa tay ~1.900 SP.
4. Ô chọn thương hiệu tìm kiếm thế nào: gõ "Lotte" có ra cả "Lottte" không → prompt phải chọn **khớp đúng chuỗi**.
5. SP nhiều đơn vị: sửa SP gốc thì lốc/thùng có theo không (dữ liệu nói có — xác nhận).
6. Form Sửa có hiện **tên hoá đơn điện tử**, VAT bán/nhập — để ghi lại trước/sau.

Kết quả ghi `reports/thuong-hieu/trinh-sat.md` (kèm ảnh chụp màn hình). **Cổng:** chủ đọc, chọn cách làm
(sửa từng SP / hàng loạt / Excel).

### Bước 2 — Thử 1 SP thật (chủ ngồi cạnh)
Chọn 1 SP ít bán (VAT 10%, có lốc/thùng, có mô tả + ảnh). Chụp snapshot → đổi **chỉ** thương hiệu trên web
→ snapshot → `brand-diff`. **Cổng:** chỉ `tradeMark*` đổi; VAT, giá sau thuế, tên, tên HĐĐT, nhóm, ảnh,
mô tả **y nguyên**; đơn vị lốc/thùng theo đúng. Có gì khác → dừng, không làm tiếp.
Nếu Bước 1 chọn Excel: thử file **1 dòng** theo đúng cách này trước khi nhập nhiều.

### Bước 3 — Chốt dữ liệu (repo)
1. `data/brand-canon.json`: danh sách tên chuẩn (tên đúng chuỗi, bí danh để dò, công ty, `tradeMarkId`
   giữ lại). Chủ duyệt.
2. Quyết định **từng SP** (2.700 dòng): TH hiện tại → TH đích, căn cứ (dòng "Thương hiệu:" trong mô tả,
   chữ trên ảnh bao bì, tên SP), độ chắc. Theo luật repo: SP nào **không chắc** → hỏi chủ, không đoán;
   SP lẫn nhãn (vd. Lottte có KitKat) phải **xem ảnh**.
3. Trang duyệt HTML theo từng TH đích (ảnh + tên + TH cũ → mới), như các trang `review/` đang dùng.
   **Cổng:** chủ duyệt xong từng nhóm.

### Bước 4 — Thực hiện trên Chrome, theo thứ tự này
Thứ tự để **không bao giờ** có lúc hai thương hiệu cùng tên, và đổi tên một lần sửa được nhiều SP:

| # | Thao tác | Vì sao trước/sau |
|---|---|---|
| 4.1 | **Tạo** thương hiệu chuẩn còn thiếu (Pantene, Poca, Strongbow, Oreo…) | chỉ thêm, vô hại; các bước sau cần có đích |
| 4.2 | **Chuyển SP gắn nhầm** ra khỏi các TH sắp đổi tên/gộp (KitKat khỏi Lottte, Alpenliebe khỏi Chupa Chuđ…) | đổi tên TH sẽ kéo theo mọi SP còn lại — phải sạch trước |
| 4.3 | **Gộp**: chuyển SP của TH bị bỏ sang TH giữ lại (X men → X-Men; Lotte 4 SP → Lottte 51 SP; Dạ Hương 1 SP → DP Hoa Linh 5 SP) | chọn TH **nhiều SP hơn** làm TH giữ lại → ít thao tác nhất |
| 4.4 | **Đổi tên** TH giữ lại về tên chuẩn (Lottte → Lotte, DP Hoa Linh → Dạ Hương, DAINISA → Danisa, Bibi go → bibigo…) | sau 4.3 tên chuẩn mới không còn bị trùng |
| 4.5 | **Tách** TH tên công ty / không phải TH: gán từng SP về nhãn đúng (ACECOOK, Pepsico, Halal…) | nhiều SP nhất; chia lô theo TH đích |
| 4.6 | **Gán** TH cho SP đang trống (1.244 đang bán, rồi 144 ngừng bán) | chỉ thêm, không làm sai SP đã đúng |
| 4.7 | **Xoá** TH rỗng | **cuối cùng** — chỉ xoá TH mà snapshot mới nhất = 0 SP (kể cả ngừng bán) |

**Mỗi lô** (≤ 25 SP, cùng một TH đích, cùng một kiểu thao tác):
1. Chụp snapshot ngay trước lô. `brand-plan` lọc lại: bỏ SP **đã đúng** (chạy lại an toàn), báo SP
   mà TH hiện tại **khác** TH lúc lập kế hoạch (có người sửa giữa chừng) → không đưa vào lô.
2. Prompt Chrome (khuôn ở §4) chứa đúng danh sách: mã hàng · tên · TH hiện tại · TH đích.
3. Snapshot sau lô → `brand-diff`. **Cổng:** 100% SP đúng đích **và** 0 trường khác bị đổi.
   Sai một SP → dừng, sửa cho đúng trước lô sau. Trường khác bị đổi → dừng hẳn, báo chủ.
4. Ghi kết quả lô vào `reports/thuong-hieu/nhat-ky.md` (giờ, lô, số OK/bỏ qua, file snapshot).

Ước lượng: sửa tay ~1.900 lượt × ~1 phút ≈ 30+ giờ Chrome → nếu Bước 1–2 cho thấy đổi tên/gộp/Excel
an toàn thì phần lớn SP đi đường đó; sửa tay chỉ cho SP lẻ.

### Bước 5 — Sau khi xong
- Snapshot cuối, so với snapshot đầu: báo cáo số SP đổi, 0 trường khác bị đổi, số TH còn lại.
- Hub tự quét lại toàn bộ SP (`syncStock` là full sweep) → `brand_name` mới lên Hub/web catalog.
  Kiểm vài SP trên Hub.
- Cập nhật `data/brands.json` (bí danh) cho khớp tên chuẩn; báo Hub cập nhật ô "nhãn phụ trách" của
  đầu mối nhà cung cấp nếu đang ghi tên cũ (vd. "Lottte").
- Quy ước cho nhân viên khi tạo SP mới: **chỉ chọn TH có sẵn**, không gõ mới; muốn thêm → báo chủ.
  (Việc riêng cho Hub sau: báo cáo tuần "SP mới chưa có TH / TH mới xuất hiện".)

---

## 4. Khuôn prompt cho Claude in Chrome (mỗi lô)

Theo mẫu đã dùng cho VAT 17/10 (`reports/prompt-sua-vat-kiotviet.md`):

> Bạn đang điều khiển Chrome của tôi (đã đăng nhập KiotViet Trạm 8). Việc: **đổi thương hiệu của N SP
> sang "<TÊN ĐÍCH>"**. KHÔNG sửa bất cứ thứ gì khác.
>
> Cho TỪNG SP, lần lượt:
> 1. Hàng hoá → Danh sách hàng hoá → ô tìm: gõ đúng **mã hàng**, Enter. Phải ra **đúng 1 dòng**, tên khớp danh sách.
> 2. Mở → Cập nhật. Ghi lại: thương hiệu, VAT bán, VAT nhập, giá sau thuế, tên HĐĐT.
> 3. Thương hiệu hiện tại phải **đúng** "<TH hiện tại>" trong danh sách.
> 4. Ô Thương hiệu: chọn mục có tên **đúng từng ký tự** "<TÊN ĐÍCH>" (không chọn mục gần giống).
> 5. Không chạm: tên hàng, tên HĐĐT, mã, mã vạch, giá, VAT, nhóm, đơn vị, ảnh, mô tả, tồn.
> 6. Lưu. Mở lại SP: thương hiệu đúng đích; VAT, giá sau thuế, tên HĐĐT y như bước 2.
>
> **Dừng và hỏi tôi nếu:** không tìm thấy / ra hơn 1 SP; TH hiện tại khác danh sách; ô chọn không có
> đúng "<TÊN ĐÍCH>" hoặc có 2 mục giống nhau; KiotViet báo lỗi; bất kỳ trường nào ở bước 6 khác bước 2;
> KiotViet hiện hộp thoại hỏi áp dụng cho đơn vị khác / cập nhật giá.
> Không tạo, đổi tên hay xoá thương hiệu trong lô này.
>
> Cuối cùng trả bảng: STT · Mã · Tên · TH trước → sau · VAT/giá/tên HĐĐT có đổi không · Kết quả.

Lô **đổi tên / xoá thương hiệu** (4.4, 4.7) dùng prompt riêng, mỗi lần **1 thương hiệu**, kèm số SP kỳ vọng
đang dùng nó — lệch số → dừng.

---

## 5. Rủi ro và cách chặn

| Rủi ro | Chặn bằng |
|---|---|
| KiotViet tự đổi trường khác khi Lưu (như VAT 8% hôm 17/10 qua API) | Bước 2 thử 1 SP; mọi lô có `brand-diff` so mọi trường; Chrome ghi trước/sau VAT, giá, tên HĐĐT (API không đọc được tên HĐĐT) |
| Chọn nhầm mục gần giống trong ô thương hiệu (Lotte/Lottte, X men/X-Men) | gộp + đổi tên **trước** khi gán hàng loạt (4.3–4.4) → lúc gán đã hết tên gần giống; prompt bắt khớp đúng chuỗi |
| Sửa nhầm SP (mã trùng — xem `reports/ma-trung-de-tat.md`) | tìm theo mã, phải đúng 1 dòng và đúng tên, không thì dừng |
| Đổi tên TH kéo theo SP chưa sạch | 4.2 trước 4.4; prompt đổi tên kèm số SP kỳ vọng |
| Xoá TH còn SP (kể cả ngừng bán) | xoá cuối, chỉ theo snapshot mới nhất = 0 SP |
| Nhân viên sửa SP cùng lúc | snapshot ngay trước lô; SP lệch so với kế hoạch bị loại khỏi lô; nên chạy ngoài giờ cao điểm |
| Sai rồi muốn quay lại | snapshot có `tradeMarkId` cũ của mọi SP → sinh prompt đảo ngược; đổi tên đảo được; xoá TH là thứ duy nhất khó đảo → để cuối |
| Đoán sai thương hiệu | luật repo: không chắc → hỏi chủ; SP lẫn nhãn phải xem ảnh |

---

## 6. Việc tiếp theo

Đề xuất ngày 19/10 (bản chụp 03:13 UTC): [`de-xuat-tom-tat.md`](de-xuat-tom-tat.md) · bảng [`de-xuat-tung-sp.csv`](de-xuat-tung-sp.csv) ·
trang duyệt `review/thuong-hieu.html`. Nhãn đọc từ ảnh cho 210 SP chưa có căn cứ: [`doc-anh.json`](doc-anh.json)
(4 agent xem từng ảnh, không tra web; tên chỉ bằng chữ Trung/Hàn đánh dấu không chắc).

1. Chủ trả lời các câu "còn mở" ở §2 (đồ uống Pepsi / Coca-Cola, Nestlé, các nhãn lơ lửng).
2. Chủ duyệt trang `review/thuong-hieu.html`, ưu tiên nút "Chỉ SP cần xem"; sửa nào → ghi vào bảng chuẩn
   hoặc một danh sách sửa tay, chạy lại `brand-propose`.
3. Bước 1 (trinh sát, chỉ xem) và Bước 2 (thử 1 SP) trên Chrome.
4. `brand-plan` từ bản chụp mới → chạy từng lô, mỗi lô qua `brand-diff`.
5. Trong lúc chạy lô: **tạm dừng bấm "Áp dụng" ảnh/mô tả trên Hub** — mỗi lần áp dụng đổi mô tả/ảnh và có thể
   cả VAT, `brand-diff` sẽ báo KHÔNG ĐẠT dù lô đúng.
