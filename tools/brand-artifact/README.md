# Trang duyệt thương hiệu (Artifact)

Trang Artifact riêng tư cho chủ duyệt trên điện thoại: https://claude.ai/artifact/XGAYbaKuBMAnD5p9pk5ggh
(`review/thuong-hieu.html` cần mở từ máy có repo; Artifact thì không).

Ảnh từ CDN bị CSP của Artifact chặn → ảnh thu nhỏ 88 px được ghép thành `sprites/<n>.jpg` (150 SP/tệp) đăng kèm trang.
Ghi chú của chủ lưu ở database của Artifact:

- `brands/<b + fnv1a(tên)>` — `{name, ok, note, at}`: nhãn đúng hết / ghi chú tách-gộp.
- `products/<kiotProductId>` — `{brand, name, proposed, at}`: SP chủ báo sai, `brand` = thương hiệu đúng ("" = Khác).

Claude đọc lại bằng công cụ `ArtifactData` (`list` hai collection trên), sửa `data/brand-canon.json` /
danh sách sửa tay, chạy lại `brand-propose`, rồi dựng lại trang: tải ảnh thu nhỏ, ghép sprite, chèn
`de-xuat-tung-sp.csv` vào `template.html` ở chỗ `__DATA__` (mảng hàng `[id, code, name, category, active,
current, proposed, confidence, note, brandLine, sprite, slot]`), đăng lại cùng URL.
