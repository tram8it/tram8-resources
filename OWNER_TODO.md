# Việc chủ hẹn làm sau

Danh sách việc chủ đã nói "tính sau". **Mọi phiên AI:** khi xong hết sản phẩm (hoặc khi chủ hỏi
còn gì), đọc file này và **nhắc chủ từng mục còn mở**. Ghi thêm việc mới chủ hẹn; mục xong thì
đánh `[x]` kèm ngày. File viết tay — không phải file sinh ra.

## Khi đã làm xong tất cả sản phẩm

- [ ] **Chuyển danh mục "Rong biển ăn liền" sang "Đồ ăn vặt"** trên KiotViet. Hiện nằm ở
      `Đồ khô - Mì Gói > Rong biển ăn liền` (KiotViet id 2549391). Chủ dặn 14/10/2026.
      Sau khi chủ chuyển: chạy `node tools/pull-from-hub.mjs` + `init-from-export` để thư mục
      `categories/2549391-…` nhận đường dẫn mới.

- [ ] **Chỉnh sáng/cân bằng trắng hàng loạt** bằng `tools/tone.py` (chủ dặn "sau này làm lại 1 thể",
      14/10/2026). `python3 tools/tone.py --scan` lúc tạo công cụ: 274 ảnh thiếu sáng. Chỉnh, xem
      so trước/sau từng danh mục, rồi gửi lại đề xuất ảnh.

## Gấp — thuế bị KiotViet tự đổi khi áp dụng ảnh/mô tả (phát hiện 17/10/2026)

- [ ] **40 SP đồ uống đang VAT 10% bị KiotViet tự chuyển sang VAT 8%** ngay khi Hub ghi ảnh/mô tả
      (Hub chỉ gửi `description` + `images`; KiotViet tự áp thuế mặc định 8% và tính lại giá trước thuế,
      giá sau thuế giữ nguyên). Danh sách: `reports/vat-doi-10-sang-8-khi-ap-dung.csv`. Chủ/kế toán kiểm tra
      thuế đúng của từng SP (bia, rượu, nước ngọt… thường không được giảm VAT) và sửa lại trên KiotViet.
      Cần sửa Hub để không áp dụng tiếp SP VAT ≠ 8% cho tới khi có cách giữ thuế (repo tram8-hub).

## Đổi danh mục trên KiotViet

- [ ] 65175893 "Mì ý xúc xích xốt bò bằm" (món làm sẵn, không có mã vạch): chuyển khỏi "Mì trộn / mì khô / spaghetti (Gói)" sang danh mục món ăn sẵn (chủ dặn 14/10/2026)

## Sửa tay trên KiotViet (Hub không ghi tên/thương hiệu)

- [ ] Tên cũ sai khối lượng/loại (chủ: "vụ tên tính sau", 14/10/2026):
  - 64865699 Omachi ly Sườn hầm ngũ quả: tên ghi 70gr, bao bì mới 72 g
  - 64865694 "Mỳ tô Cung Đình vị sườn heo 80g": thực tế thố khoai tây sườn heo hầm măng 79 g
  - 65139544 "Mỳ Cung Đình Bát Vị Gà Hầm 80g" (mã …0487): thực tế thố khoai tây gà hầm 79 g
  - 65139690 "…Khoai Tây Vị Gà Hầm 12 Thố Tròn" (mã …0500): thực tế **thịt hầm nấm** 79 g
  - 65977051 "Rượu Jim Beam trắng 750ml": nhãn chai in **70 cl** (700 ml) — tên nên ghi 700ml
  - 65205357 "Mì cay 7 cấp độ": đang gắn mã vạch **8936028643481 = túi Koreno Jumbo 10 gói**; gói lẻ 101 g đang bán có mã **8936028643498** (hồ sơ tự công bố Paldo Vina) — thêm/sửa mã để quầy quét được gói lẻ; tên nên ghi 'Koreno Jumbo … 101g'
  - 65205413 "My an lien Paldo WANGTTUGEUNG JJAMPPONG 110g": thực tế là **tô Pororo 짜장 77 g** (chủ xác nhận ảnh) — sửa tên
  - 65455154 "Mì lẩu Jumbo KORENO vị kim Chi Nongshim": thực tế là **tô Nongshim 김치사발면** (không phải Koreno) — sửa tên/thương hiệu
  - 66610094 "Bánh gạo Pororo Hàn Quốc Vị phô mai 115g" (mã 8809380344474): thực tế là **vị Rosé** (ảnh lúc tạo SP là ly 로제 떡볶이; vị phô mai là mã …3408)
  - 67200390 "Bánh gạo tokpokki… vị phô mai O'food ly 105g" (mã 8935304200608): thực tế là ly **tròn vị phô mai, không cay** — tên nên ghi rõ để khỏi nhầm với …0141
  - 67647264 "Bánh Snack V /UH (Bim Pillows Oishi nhân sữa dừa gói 45g)" (mã 8934803042177): chủ xác nhận là gói **80g** — sửa tên trên KiotViet (ghi 17/10/2026)
- [ ] Thương hiệu sửa tay: xem `reports/thuong-hieu-can-sua-tay-mi-goi.csv`
- [ ] Ngừng kinh doanh: 64865678 Phở Gà Cung Đình mã 8936010681422 (chủ xác nhận đã lâu không
      bán) — từ chối đề xuất trên Hub và tắt trên KiotViet
- [ ] Mã trùng: 66923803 "Mì trộn tương đen cay Koreno Chajang" (mã vạch 6951454407706, đầu Trung Quốc) và 65205363 "… Koreno Chajang (Gói)" (8936028641654) cùng là gói Koreno Chajang cay 78 g — sửa mã vạch hoặc gộp
- [ ] Mã trùng: 66542636 "Mì xào vị Gà phomai" (mã 8936028643153) và 68270021 "Volcano Koreno gà phô mai 118g" (mã 8936028641104) cùng là gói Volcano gà phô mai 118 g theo ảnh chủ gửi; hồ sơ Paldo chỉ có …1104 (gói) và …1111 (lốc 4+1) — kiểm tra mã …3153 có đúng không, gộp nếu trùng
- [ ] Mã trùng: 4 cặp Feastables MrBeast (mã nội bộ 390000032… và mã vạch 85002788…) cùng một
      sản phẩm — gộp/tắt mã thừa
- [ ] Mã trùng: 64865792 "Pepsi Black Lon 320x24 TRAY Lốc 6 - MT" (mã 8934588662119) và 65588350
      "Nước ngọt Pepsi không calo 320ml" (mã 8934588662423) cùng là lon Pepsi không calo/không đường
      320 ml, dùng chung một ảnh — mã cũ/mới của cùng SP? gộp/tắt mã thừa (ghi 16/10/2026, rà ảnh trùng)
- [ ] Mã trùng: 64865480 "Mì dinh dưỡng khoai tây Omachi mì trộn xốt Spaghetti" (SP000661) và
      67872752 "Omachi trộn xốt spaghetti gói" (SP878109) cùng là gói Omachi mì trộn xốt Spaghetti
      90 g, dùng chung một ảnh — gộp/tắt mã thừa, thêm 90g vào tên mã SP878109 (ghi 16/10/2026)
- Ghi chú 16/10/2026 (rà ảnh trùng, RUBRIC v16): hai mã Phở Cung Đình gà Hà Nội (64865678 / 64865804)
  dùng chung ảnh nhưng 64865678 đã ngừng bán (mục "Ngừng kinh doanh" ở trên) nên không gắn nhãn khối
  lượng. Nếu 64865678 còn bán lại thì cần nhãn "79g"/"76g".
- [ ] Mã trùng: 64865370 và 64865766 "Bim bim Oishi snack tater thins khoai Tây siêu mỏng" (mã
      8934803070217 / 8934803053524) cùng là gói Tater Thins vị dưa leo, dùng chung một ảnh —
      gộp/tắt mã thừa, hoặc báo nếu khác cỡ để gắn nhãn khối lượng (ghi 16/10/2026)
- [ ] Kiểm tra: 65959293 / 65959357 cùng tên "Bim ống YeGam Oreon"; 65959293 tra mã ra vị Kim chi,
      65959357 suy ra vị Nguyên bản (ảnh cũ có 2 hộp). Nếu sai thì báo để đổi ảnh; nên thêm vị vào tên
      trên KiotViet (ghi 16/10/2026)
