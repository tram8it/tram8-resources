# Nồng độ cồn cho đồ uống có cồn (29/10/2026)

**Mục tiêu (chủ, 29/10):** mọi SP trong "Đồ uống có cồn (18+)" có thuộc tính `NỒNG ĐỘ CỒN` (kể cả bia 0 độ = `0%`).
Hub dùng thuộc tính này làm bộ lọc web: **dưới 15%** lên web (sau cổng 18+), **từ 15%** hoặc **chưa có thuộc tính** thì ẩn.

## Quy ước
- Ô "Thuộc tính" trong file Excel: `NỒNG ĐỘ CỒN:4.5%` (số, dấu chấm thập phân, có %).
- Chỉ điền số có căn cứ: tên hàng, mô tả, nhãn. "12%" của Steiger, "11.3P" của Corona là **độ Plato**, không phải độ cồn.
- SP không chắc → hỏi chủ, không đoán.

## Các bước
1. **Lô thử 3 SP** (`lo-thu-3-sp.csv`): Heineken 5% (có thùng), Soju Damso táo 12%, Budweiser 0.0 0% (có thùng).
   Cần biết: đơn vị thùng có tự nhận thuộc tính không; ngoài ô thuộc tính có trường nào khác đổi không.
2. Điền đủ 121 SP gốc (185 dòng gồm thùng/lốc), theo lô tăng dần.
3. Hub: lưu thuộc tính khi đồng bộ, lọc web theo độ cồn thay cho đánh dấu theo danh mục.
4. Web: gom các nhóm có cồn dưới một mục "Đồ uống có cồn (18+)", hiện nhãn độ cồn.

## Lưu ý đã thấy (Strongbow Dark Fruit, chủ sửa tay 29/10)
Thêm thuộc tính làm KiotViet đổi `hasVariants` false → true và tên đầy đủ thành "… - 4.5% (Lon)".
Tên đầy đủ được in trên HĐĐT **khi ô tên HĐĐT trống**: 69/185 dòng có cồn đang trống tên HĐĐT (đa số là dòng thùng).
Cả 3 SP lô thử đều đã có tên HĐĐT.
