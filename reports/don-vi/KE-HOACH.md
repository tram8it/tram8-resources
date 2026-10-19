# Chuẩn hoá đơn vị tính (ĐVT) — kế hoạch

Cùng cách đã làm với thương hiệu: chụp trước → lô nhỏ → so sánh trước/sau → tăng dần.
Bản chụp dùng để lập kế hoạch: 19/10/2026 12:40 UTC (3.966 dòng hàng: 2.701 hàng gốc, 1.265 lốc/thùng).

## 1. Lỗi "Bim lay ống" trên web — nguyên nhân

- Trên KiotViet có **199 hàng gốc không có ĐVT** (163 đang bán, 36 ngừng). Lỗi này có từ trước, không phải
  do đợt sửa thương hiệu: không có dòng nào bị mất ĐVT giữa các bản chụp.
- Web lấy ĐVT làm tên quy cách (nút "Gói", "Ống", "Thùng"). Khi ĐVT trống, Hub lấy **tên hàng** điền vào chỗ đó.
  Vì vậy trên trang có một nút quy cách mang nguyên tên SP.
- **Đã sửa Hub** (repo tram8-hub, nhánh `claude/loving-einstein-ry7ul8`, chưa mở PR):
  - ĐVT trống thì để tên quy cách trống, web hiện "Quy cách".
  - Có thêm test cho trường hợp này.
- **Sửa dữ liệu:** điền ĐVT cho cả 199 SP, xem `de-xuat-199-sp-thieu-dvt.csv`.
  - Căn cứ:
    - 131 SP lấy từ dòng quy cách trong mô tả.
    - 68 SP đọc từ ảnh. Ảnh thiếu thì so với SP cùng loại đang có ĐVT.
  - `level`:
    - `CHAC` (chắc): 171 SP.
    - `KIEM` (theo SP cùng loại): 28 SP.
  - Theo nguyên tắc "không rõ thì xếp mặc định, chủ chuyển dần sau":
    - Pizza ghi Cái (8 pizza khác đang ghi Cái).
    - Mì Ý ăn sẵn ghi Hộp.
    - Bánh tam giác ghi Cái.
    - Bàn chải ghi Cái.
    - Rejoice dạng dây ghi Dây.
    - Combo rượu ghi Phần.
- Sau khi điền xong ĐVT: tên đầy đủ trên KiotViet tự thành `Tên hàng (ĐVT)`, giống mọi SP khác.
  - "Tên hàng" giữ nguyên.
  - "Tên hàng trên HĐĐT" giữ nguyên: file nhập chép nguyên ô này.

### Cách làm (giống lô thương hiệu)
1. Chủ xuất toàn bộ danh sách hàng hoá (một lần bấm), gửi file. **Từ lúc xuất đến lúc nhập:**
   - không sửa hàng hoá;
   - không bấm "Áp dụng" trên Hub.
2. Tôi cắt **lô thử 3 SP**: `python3 -I tools/brand_excel.py <xuất.xlsx> <bản chụp> de-xuat-199-sp-thieu-dvt.csv --units --ids …`.
   - File chỉ đổi ô ĐVT; thương hiệu và trọng lượng để nguyên như lúc xuất.
   - Dòng nào đã bị sửa sau lúc xuất, hoặc lệch với bản chụp, thì bị loại.
   - SP có lốc/thùng cũng bị loại (199 SP này không có SP nào như vậy).
3. Nhập file với tuỳ chọn như cũ: xử lý trùng = Báo lỗi và dừng; tồn kho / mô tả / giá vốn = Không.
4. Chụp lại, rồi chạy `node tools/brand-diff.mjs trước.json sau.json lo.csv`. Kế hoạch dạng `unit` kiểm tra:
   - ĐVT đúng chữ;
   - tên đầy đủ đúng `Tên (ĐVT)`;
   - **không trường nào khác đổi**, kể cả thuế, giá, tên, thương hiệu.
5. Đạt thì làm 196 SP còn lại bằng `--all` trên **cùng file xuất**. Ba SP thử bị sửa sau lúc xuất nên tự bị loại.

## 2. Hiện trạng toàn bộ hệ thống đơn vị

- **Hàng gốc:** 65 cách ghi khác nhau, phần lớn chỉ do viết hoa/thường hoặc gõ sai. Ví dụ:
  - Gói 705 / gói 96 / Goi / goi / Hói;
  - Hộp / hộp / hộp lẻ;
  - Lọ / lọ / Lo;
  - Túi / Tui;
  - BỘ.
- **Lốc/thùng:** 49 cách ghi. Ví dụ:
  - Thùng 815 / thùng 16 / Thung / Thùng ( Két ) / Thùng nhỏ / Thùng 30 gói;
  - Lốc 6H, Hộp 12 Thanh, gói 5 cái, túi 6c…
- **ĐVT ghi kèm số lượng nhưng số lệch hệ số quy đổi:** 4 dòng.
  - Ví dụ "Pizza BomB Bò (Hộp 6 Cái)" có hệ số 8.
  - Xem `bat-thuong-quy-doi.md`.
- **Giá lốc/thùng lệch hẳn so với giá lẻ × hệ số:** 24 dòng. Hai dòng gần như chắc chắn sai:
  - "Snack sườn cừu (Bịch)": hệ số 20 nhưng giá bịch = giá lẻ 6.000đ;
  - "Corn chip (Bịch)": hệ số 10, giá 660.000đ.
  - **Hệ số sai làm tồn kho quy đổi sai**, nên phần này chủ xem, không tự sửa.
- **Hàng gốc mang ĐVT là tên đơn vị lớn hoặc số:**
  - 18000 (bánh tráng cuộn);
  - Cá (kem Gallant);
  - Hói (trứng cút);
  - Lốc (thạch);
  - Lọ ( Chai ) (Yakult 65ml×5);
  - Vỉ 1 / Vỉ 2 / Vỉ 4 (pin);
  - Chai 1L / Chai 2L (bia Camel).

## 3. Bảng ĐVT chuẩn (đề xuất)

Nguyên tắc: **Viết Hoa Chữ Đầu**, mỗi loại vỏ một tên, không ghi số trong ĐVT hàng gốc.

| Nhóm | ĐVT chuẩn | Gộp từ |
|---|---|---|
| Hàng gốc | Gói | gói, Goi, goi, Hói |
| | Hộp | hộp, hộp lẻ |
| | Lọ | lọ, Lo |
| | Chai | chai, Chai 1L, Chai 2L (dung tích đã có trong tên/mô tả) |
| | Cái | cái, 1 cái |
| | Miếng | 1 Miếng, 1 miếng |
| | Túi | Tui |
| | Bộ | BỘ |
| | Thanh, Lon, Ly, Tô, Cuộn, Cây, Vỉ, Tuýp | bản viết thường của từng loại |
| | Giữ riêng | Ống, Thỏi, Que, Bao, Viên, Hũ, Quả, Bát, Đôi, Khay, Bịch, Dây, Bánh (xà bông), Lần (phí vận chuyển) |
| Lốc/thùng | Thùng, Lốc, Hộp, Bịch, Dây, Túi, Vỉ, Gói, Cây, Khay | thùng, Thung, Thùng ( Két ), lốc, dây, bịch… |

**Cần chủ chốt trước khi làm phần lốc/thùng.** Có hai cách:

- **(A) — khuyên dùng.** ĐVT lốc/thùng chỉ ghi tên vỏ: "Thùng", "Lốc".
  - Web tự ghép số lượng từ hệ số quy đổi và ĐVT gốc, ví dụ "Thùng 24 Lon".
  - Số không thể lệch hệ số nữa.
- **(B)** Giữ số trong ĐVT: "Lốc 6H", "Hộp 12 Thanh".
  - Phải đi kiểm từng dòng cho khớp hệ số.

## 4. Thứ tự làm

1. **Ngay:** điền ĐVT cho 199 SP thiếu (mục 1). Merge bản sửa Hub.
2. Chủ xem `bat-thuong-quy-doi.md`:
   - sửa hệ số/giá sai trên web KiotViet;
   - các trường hợp ĐVT lạ ở mục 2 (18000, Cá, Hói, Lọ ( Chai ), Vỉ n, Lốc gốc) cho tôi biết đúng là gì.
3. **Hàng gốc — đổi chữ hoa/thường và gõ sai:** 325 dòng, nhập Excel cột ĐVT.
   - **Đổi ĐVT hàng gốc có lốc/thùng phải thử riêng trước.** Ô "Mã ĐVT Cơ bản" và "Quy đổi" của dòng lốc/thùng tham chiếu
     tới hàng gốc. Thử trên 1 SP có lốc, xem hệ số và tồn có giữ nguyên không, rồi mới làm loạt.
4. Lốc/thùng theo cách chủ chọn (A/B). Cũng làm lô 3 → 30 → tất cả.
5. Hub/web:
   - hiển thị "Thùng 24 Lon" (nếu chọn A);
   - thêm cảnh báo trong catalog sync khi có SP đang bán mà ĐVT trống hoặc ngoài bảng chuẩn, để lỗi kiểu "Bim lay ống" không lặp lại âm thầm.

## 5. Kiểm soát (như vụ VAT 17/10)

- Chỉ nhập Excel; không lưu form web hàng loạt (lưu form tự đặt lại VAT và đổi định dạng mô tả).
- Mỗi lô có bản chụp trước/sau và `brand-diff` phải **ĐẠT**. Bất kỳ trường nào ngoài kế hoạch đổi là dừng.
- Bản chụp trước lô là bản để hoàn tác.
