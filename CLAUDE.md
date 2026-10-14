# tram8-resources — hướng dẫn cho mọi phiên AI

Repo chuẩn bị **ảnh + mô tả sản phẩm** cho tram8.vn (chuỗi cửa hàng Trạm 8). Hub/web ở repo
`tram8it/tram8-hub`; repo này **chỉ chuẩn bị**, không bao giờ ghi vào Hub hay KiotViet.

## Bắt buộc đọc trước khi làm bất cứ gì
1. `PLAYBOOK.md` — kế hoạch dài hạn và quy trình một phiên (§5). Làm đúng thứ tự, không nhảy bước.
2. `RUBRIC.md` — bộ tiêu chí cố định, **gồm nhật ký thay đổi ở cuối**. Mọi quyết định ghi `rubricVersion`.
3. `STATUS.md` — đang ở đâu. Chạy `node tools/status.mjs` trước để chắc nó mới.
4. `OWNER_TODO.md` — việc chủ hẹn làm sau. **Nhắc chủ** các mục còn mở khi xong hết sản phẩm hoặc khi chủ hỏi còn gì; ghi thêm việc mới chủ hẹn.

## Luật cứng (vi phạm là dừng lại, hỏi chủ)
- **Xem từng sản phẩm bằng mắt** (mở ảnh ra xem). Script chỉ hỗ trợ đo/crop/tải — không quyết định thay.
- **Chỉ sửa cái chắc chắn sai.** Không chắc → `status: "ASK_OWNER"` + `question` cụ thể. Không đoán.
- **Nguồn chỉ từ trang chính hãng** trong `data/brands.json`. Domain trong `data/blocked-domains.json`
  (Bách Hóa Xanh, WinMart, sàn TMĐT…) **cấm tuyệt đối**. Không tìm được → `NEEDS_PHOTO`.
- **Không bịa** dữ kiện mô tả. Không chép nguyên văn quảng cáo của hãng.
- `meta.json` là nguồn sự thật; `STATUS.md`, `NEEDS_PHOTO.csv`, `ASK_OWNER.md`, `review/*.html`
  là file sinh ra — **không sửa tay**.
- Không commit `inbox/`, `work/`, `originals/` (dữ liệu thô). Chỉ commit thành phẩm + `meta.json`.

## `meta.json` (mỗi SP một file)
```jsonc
{
  "kiotProductId": "…", "code": "…", "barcode": "…", "name": "…", "brand": "…", "unit": "…",
  "category": { "kiotCategoryId": "…", "name": "…", "path": "…" },
  "revenue90d": 0,
  "current": { "imageUrl": "…", "description": "…", "exportedAt": "…" },   // tool ghi, đừng sửa
  "status": "TODO | NO_CHANGE | ASK_OWNER | IN_PROGRESS | NEEDS_PHOTO | READY | APPROVED | UPLOADED",
  "image":       { "decision": "KEEP|CROP|REPLACE|ASK_OWNER", "reason": "I4: nền không trắng",
                   "source": { "url": "https://<trang hãng>/…", "fetchedAt": "…" } | { "staffPhoto": true, "takenAt": "…" } | null,
                   "rubricVersion": "v1" },
  "description": { "decision": "KEEP|REWRITE|WRITE_NEW|ASK_OWNER", "reason": "…",
                   "source": { "url": "…", "fetchedAt": "…" } | null, "rubricVersion": "v1" },
  "master": { "name": "Mì Hảo Hảo tôm chua cay 75g", "weightGram": 75, "brand": "Hảo Hảo",   // đề xuất ghi lên KiotViet
              "reason": "…", "rubricVersion": "v4" },                                      // (tên HĐĐT không bao giờ đổi)
  "submitted": { "at": "…", "fields": ["name", "…"] },                                       // tool ghi khi gửi đề xuất
  "review": { "status": "APPLIED|REJECTED|FAILED", "reviewedBy": "…", "reviewedAt": "…", "note": "…" }, // tool sync ghi
  "uploaded": { "at": "…", "by": "…", "kiotviet": { … }, "unexpectedChanges": { … } },        // khi chủ đã áp dụng
  "question": null,
  "history": [ { "at": "ISO", "by": "ai|owner|init", "status": "…", "note": "…" } ]
}
```
Thành phẩm nằm cạnh `meta.json`: `image.webp` (1000×1000, chuẩn trong RUBRIC) và `description.md`.

## Công cụ
| Lệnh | Việc |
|---|---|
| `node tools/init-from-export.mjs inbox/<export>` | tạo/cập nhật thư mục từ file export của tram8-hub |
| `node tools/status.mjs` | sinh lại STATUS.md / NEEDS_PHOTO.csv / ASK_OWNER.md, báo bản ghi lỗi |
| `node tools/review-page.mjs <category>` | trang duyệt trước/sau cho chủ → `review/` (ảnh mới nhúng sẵn) |
| `python3 tools/cutout.py <ảnh> <out.webp> [--box X0,Y0,X1,Y1]` | tách nền màu/banner (ảnh nhân viên chụp, ảnh hãng có nền/chữ khuyến mãi) rồi chuẩn hoá như `make_image.py`; cần `pip install "rembg[cpu]"`. **Mở ảnh ra xem viền** |
| `python3 tools/tone.py <image.webp> <out.webp>` · `--scan` | cân bằng trắng + độ sáng (chỉ chỉnh toàn ảnh, nền giữ trắng) cho ảnh thiếu sáng; `--scan` liệt kê ảnh thiếu sáng. **Mở ảnh so trước/sau** |
| `node tools/pull-from-hub.mjs` | kéo danh mục + SP từ API nội dung của Hub (chỉ GET) → `inbox/` |
| `node tools/proposals.mjs submit <category> [--only <id>] [--send]` | gửi SP **READY** vào hàng chờ duyệt trên Hub (mặc định chỉ liệt kê) |
| `node tools/proposals.mjs sync` | đọc quyết định của chủ về: áp dụng → `UPLOADED`, từ chối → `IN_PROGRESS` + lý do |

## Ngôn ngữ
Tài liệu tiếng Việt. Code, comment, commit message tiếng Anh.
Commit theo lô: `review(<category-dir>): <n> products — X keep, Y fixed, Z need photo, W asked`.
