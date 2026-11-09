# Thuộc tính "LÀM NÓNG" (chủ chốt 9/11/2026)

Nguồn sự thật là KiotViet: thuộc tính SP **`LÀM NÓNG`**, giá trị **`Có`**, nhập bằng Excel giống
`NỒNG ĐỘ CỒN` (reports/do-con). Hub đọc thuộc tính này vào `products.heat_up`; web hiện tag "Làm nóng" và
công tắc trong giỏ (mặc định bật, miễn phí, cả giao tận nơi lẫn nhận tại cửa hàng).

## Danh sách đã duyệt — `danh-sach.csv` (101 SP gốc, lấy từ catalog web 9/11/2026)

- Có: cơm nắm/cơm cuộn, bánh mì nướng nhân Cobi, món ăn no (cơm rang, mì Ý, sandwich/hamburger ATB),
  món hấp (bánh bao, bánh giò, mía hấp), pizza, hamburger, bánh mì que có nhân, sandwich kẹp thịt,
  mì Ý / cơm nắm đông lạnh.
- Không: hotdog Ponnie (ăn liền; xúc xích nóng làm sau), salad, bánh mì kem tươi, bánh mì trơn.

## Các bước

1. Chủ xuất file "Danh sách sản phẩm" mới nhất từ KiotViet → `inbox/` (giữ tên `KVddmmyyyy-hhmmss`).
2. Dựng `de-xuat.csv` từ `danh-sach.csv` + ô "Thuộc tính" hiện tại trong file export
   (SP đã có thuộc tính khác → nối thêm `|LÀM NÓNG:Có`, không ghi đè).
3. `python3 tools/brand_excel.py --attribute …` → lô thử 2–3 SP, chủ nhập, kiểm tra Hub đọc được; rồi cả lô.
4. Sau khi nhập: kiểm tra web có tag "Làm nóng" trên đúng các SP này.

## Lưu ý

- Thêm thuộc tính làm KiotViet đổi **tên đầy đủ** thành "Tên - Có (đơn vị)". Tên này in lên HĐĐT nếu ô
  "Tên hàng hoá trên HĐĐT" để trống (đã gặp với NỒNG ĐỘ CỒN).
- Dòng lốc/thùng tự theo SP gốc.
