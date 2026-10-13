# tram8-resources

Ảnh và mô tả sản phẩm đã chuẩn hoá cho **tram8.vn**, chuẩn bị offline rồi mới đưa lên web qua
API hẹp của tram8-hub.

- Kế hoạch: [PLAYBOOK.md](PLAYBOOK.md) · Tiêu chí: [RUBRIC.md](RUBRIC.md) · Tiến độ: `STATUS.md`
- Cho nhân viên: [PHOTO-GUIDE.md](PHOTO-GUIDE.md) và `NEEDS_PHOTO.csv`
- Câu hỏi đang chờ chủ: `ASK_OWNER.md`

```
categories/<kiotCategoryId>-<slug>/
  _category.md                       khuôn mô tả riêng của nhóm, thương hiệu thường gặp
  <kiotProductId>-<slug>/
    meta.json                        trạng thái + quyết định + nguồn (nguồn sự thật)
    image.webp                       ảnh mới 1000×1000 (nếu có thay đổi)
    description.md                   mô tả mới (nếu có thay đổi)
data/brands.json                     thương hiệu → domain chính hãng được phép
data/blocked-domains.json            nhà bán lẻ/sàn — cấm dùng làm nguồn
review/<category>.html               trang duyệt trước/sau
```
