# PLAYBOOK — làm mới ảnh & mô tả sản phẩm Trạm 8

Kế hoạch dài hạn, chạy qua **nhiều phiên làm việc**. Mỗi phiên AI đọc file này, `RUBRIC.md`
và `STATUS.md` rồi làm tiếp đúng chỗ — không dựa vào trí nhớ của phiên trước.

> Trạng thái: **v1 — chờ chủ duyệt.** Chưa phiên nào được làm thật trước khi file này được duyệt
> và category thử nghiệm (pilot) chạy xong.

---

## 1. Mục tiêu và giới hạn

**Mục tiêu:** mọi sản phẩm hiện trên tram8.vn có ảnh và mô tả **đầy đủ, đúng, chuyên nghiệp**.

**Giới hạn cứng (vi phạm là dừng):**

1. **Nguồn ảnh/mô tả chỉ từ trang chính hãng** của nhà sản xuất/thương hiệu (danh sách trong
   `data/brands.json`). **Cấm** lấy từ nhà bán lẻ/sàn: xem `data/blocked-domains.json`
   (Bách Hóa Xanh, WinMart, Shopee, …). Không tìm được trên trang hãng → **CẦN CHỤP**, không lấy tạm.
2. **Không sửa cái đang đúng.** Khoảng 1/3 sản phẩm đã đúng: chỉ sửa cái **chắc chắn sai**.
3. **Không chắc thì không đoán** → trạng thái `ASK_OWNER` kèm câu hỏi cụ thể.
4. **Không bịa thông tin** trong mô tả. Thiếu dữ kiện thì bỏ trống mục đó.
5. **Repo này chỉ chuẩn bị.** Không phiên nào gọi API ghi vào Hub/KiotViet. Đưa lên web là bước
   riêng (§7), chỉ cho sản phẩm `APPROVED`.

## 2. Ai làm gì

| Việc | Ai |
|---|---|
| Xem **từng sản phẩm** theo `RUBRIC.md`, quyết định giữ/crop/thay, viết mô tả | AI, từng SP một |
| Tải ảnh, đo kích thước, crop thử, dựng trang xem trước/sau | Script (`tools/`, và `scripts/` của tram8-hub) — **chỉ hỗ trợ, không quyết định** |
| Trả lời `ASK_OWNER`, duyệt lô, góp ý tiêu chí | Chủ |
| Chụp ảnh sản phẩm trong danh sách `NEEDS_PHOTO` | Nhân viên, theo `PHOTO-GUIDE.md` |

## 3. Trạng thái của một sản phẩm

Mỗi SP có `categories/<id>-<slug>/<kiotProductId>-<slug>/meta.json` — **nguồn sự thật duy nhất**
về tiến độ. `STATUS.md` được sinh lại từ các file này (`node tools/status.mjs`), không sửa tay.

```
TODO ──review──► NO_CHANGE                      (ảnh GIỮ + mô tả GIỮ → xong, không đụng)
  │
  ├──► ASK_OWNER ──chủ trả lời──► (quay lại review)
  │
  └──► IN_PROGRESS ──► NEEDS_PHOTO ──nhân viên chụp──► IN_PROGRESS
             │
             └──► READY  (image.webp/description.md đã làm + AI kiểm lại đạt)
                    └──chủ duyệt──► APPROVED ──đưa lên web──► UPLOADED
                    └──chủ trả lại──► IN_PROGRESS (ghi lý do vào history)
```

Ảnh và mô tả có quyết định **riêng** (`image.decision`, `description.decision`) — một SP có thể
giữ ảnh nhưng viết lại mô tả.

## 4. Thứ tự làm

1. **Pilot:** 1 category (chủ chọn) — làm hết vòng, chủ duyệt, chốt `RUBRIC.md` v1 và khuôn mô tả
   của category đó. Chỉ sau pilot mới chạy dài hạn.
2. **Theo category, doanh số 90 ngày cao làm trước** (thứ tự in trong `STATUS.md`).
3. **Nhóm hàng tự làm/địa phương** (Món ngon Trạm 8: ATB, trà sữa Lạc Lạc, cơm nắm…) không có
   trang hãng → review ảnh như thường, ảnh cần thay đi thẳng `NEEDS_PHOTO`. Mô tả viết từ thông
   tin chủ/nhân viên cung cấp (thành phần, quy cách, HSD).
4. **Bia (18+)** để cuối.

## 5. Quy trình MỘT phiên làm việc

**Mở phiên**
1. `git pull`. Đọc `CLAUDE.md`, file này, `RUBRIC.md` (cả **nhật ký thay đổi** cuối file), `STATUS.md`.
2. Trả lời trước những `ASK_OWNER` mà chủ đã trả lời (xem `answers/`).
3. Chọn lô: category đang dở, hoặc category kế tiếp. **Tối đa ~100 SP/phiên** — xem kỹ từng SP
   quan trọng hơn làm nhanh.

**Từng sản phẩm** (đúng thứ tự, không nhảy bước)
1. Mở ảnh hiện tại (xem trực tiếp, không chỉ đọc số đo) + đọc tên, quy cách, mô tả hiện tại.
2. Chấm theo `RUBRIC.md` → ghi `image.decision` / `description.decision` + **lý do ngắn** + `rubricVersion`.
3. `CROP` → crop về 1:1, **mở ảnh sau crop ra xem lại**; không đạt → đổi thành `REPLACE`.
4. `REPLACE` → tìm trên trang hãng (chỉ domain trong `brands.json`; domain mới phải ghi vào đó
   kèm bằng chứng là trang chính thức). So **đúng vị, đúng dung tích, đúng bao bì hiện hành**.
   Không khớp chắc chắn → `NEEDS_PHOTO`.
5. Mô tả `REWRITE`/`WRITE_NEW` → viết theo khuôn trong `RUBRIC.md`, chỉ từ nguồn đã ghi.
6. Thành phẩm: `image.webp` (1000×1000) + `description.md`. AI **kiểm lại thành phẩm** theo rubric
   lần nữa → `READY`.
7. Ghi `source` (URL trang hãng, ngày lấy) cho mọi thứ lấy từ ngoài.

**Đóng phiên**
1. `node tools/status.mjs` → cập nhật `STATUS.md`.
2. Dựng trang duyệt cho lô: `node tools/review-page.mjs <category>` → `review/<category>.html`.
3. Commit theo lô: `review(<category>): <n> SP — X giữ, Y sửa, Z cần chụp, W hỏi chủ`. Push.
4. Báo chủ: link trang duyệt + danh sách `ASK_OWNER` + danh sách `NEEDS_PHOTO`.

## 6. Chủ duyệt và tiêu chí được học thêm

- Chủ duyệt theo lô trên trang duyệt; trả lời bằng tin nhắn hoặc file trong `answers/`.
- Mỗi góp ý mang tính **quy tắc** (“loại ảnh này là sai”) → thêm vào **nhật ký thay đổi** trong
  `RUBRIC.md`, tăng phiên bản. Từ lô sau áp dụng luôn; SP đã duyệt trước đó **không** tự động làm
  lại — chỉ khi chủ yêu cầu.
- Chủ báo lại “SP này chưa đúng” bất cứ lúc nào → SP về `IN_PROGRESS`, ghi lý do vào `history`.

## 7. Đưa lên web (bước riêng, sau cùng)

- Làm ở repo **tram8-hub**, một PR riêng: API hẹp `PUT /api/v1/products/:kiotProductId/content`
  **chỉ nhận ảnh + mô tả**, scope riêng, ghi log giá trị cũ để rollback; trường do Hub sở hữu nên
  sync KiotViet không ghi đè. (Thiết kế chi tiết khi tới bước này.)
- Chỉ đẩy SP `APPROVED`. Thử 20 SP → kiểm tram8.vn → đẩy phần còn lại theo category.
- Sau khi đẩy: `UPLOADED` + ngày + hash ảnh.

## 8. Đầu vào cần có

| Đầu vào | Từ đâu |
|---|---|
| Danh mục + sản phẩm thật | `scripts/export-product-content.sh` của tram8-hub, chạy trên VPS → `inbox/` → `node tools/init-from-export.mjs inbox/<thư mục>` |
| Ảnh hiện tại | URL CDN KiotViet trong `meta.json` (cần mở mạng cho `cdn1/cdn2-retail-images.kiotviet.vn`), hoặc thư mục `originals/` của script audit |
| Trang chính hãng | Mạng của phiên làm việc phải cho phép truy cập web |

## 9. Ước lượng

~2.000–3.000 SP trên web, ~100 SP/phiên → **khoảng 20–30 phiên**, chưa tính thời gian chờ ảnh
chụp và chủ duyệt. Con số sẽ được chỉnh sau pilot.
