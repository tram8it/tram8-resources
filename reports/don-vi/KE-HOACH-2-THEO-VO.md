# Đợt 2: ĐVT phải đúng với vỏ hàng

Bản chụp KiotViet sau lô 9 (20/10/2026). Đợt 1 đã chuẩn hoá *cách viết*; đợt này sửa ĐVT ghi *sai loại vỏ*.
Ví dụ: Slide đựng ống nhưng ghi Hộp, kem que ghi Cái.

## Chủ chốt 20/10/2026 → đề xuất cuối: `de-xuat-dot-2.csv` (370 SP; 180 SP có lốc/thùng)
- **B1** cốc → **Ly**, tô → **Tô**: áp cho mọi hàng gốc còn ghi Cốc hoặc Bát (110 SP).
- **B2** kem que → **Que** (54 SP).
- **B3** đồ ăn đựng hũ: vỏ **tròn → Lọ**, vỏ **vuông → Hộp**.
  - Đồ dưỡng (sáp nẻ, kem, Vaseline, mặt nạ, gel dạng hũ) và kem hộp 240 g (Oreo, Milo, KitKat) giữ **Hũ**. Tiếng Việt gọi những thứ này là hũ.
  - Đã xem ảnh từng SP. Ô mai Phương Huyền và đậu Goody vỏ vuông → Hộp. Xúc xích lắc Heo Cao Bồi là cốc có nắp → Ly.
- **B4** túi/bịch → **Gói** (24 SP).
- **B5** giữ **Thanh** cho kẹo cuộn, không đổi.
- **Yakult** giữ **Lọ**: giá 7.000 đ là giá 1 lọ, chỉ dòng quy cách trong mô tả ghi nhầm "lốc 5 chai".
- **Coolkick** → **Thỏi**. **Bim ống YeGam** → **Ống**.
- Lốc/thùng đã kiểm: không SP nào có hai dòng trùng hệ số; không có dòng lốc/thùng nào bị ngừng bán trong khi hàng gốc còn bán.
- Sau đợt này, ĐVT hàng gốc còn 30 từ. Ngoài các từ chính, chỉ còn vài từ hiếm, đều có lý do:
  - Bánh: xà bông cục.
  - Lần: phí vận chuyển.
  - Đôi: pin, ủng.
  - Quả: trứng socola.
  - Bình: bia 2 L.
  - Phần: combo.
  - Không còn Cốc, Bát, Túi, Bịch ở hàng gốc. Ở dòng lốc/thùng, Bịch/Túi vẫn dùng làm vỏ ngoài chứa nhiều gói.

## Cách rà
- Với mỗi hàng gốc, so ĐVT với từ chỉ vỏ trong dòng **Quy cách** của mô tả. Đây là dòng đã viết khi xem ảnh từng SP.
  - 2.221 / 2.701 hàng gốc có dòng quy cách.
  - 492 SP có ĐVT khác vỏ ghi trong quy cách.
- Loại ra các trường hợp ĐVT đang đúng:
  - Vỏ chỉ là bao ngoài của **một** món: "vỉ 1 cây", "gói 1 miếng". SP bán theo món, nên giữ Cái hoặc Miếng.
  - Quy cách tả cả **gói/hộp** mà gói/hộp đó là dòng lốc/thùng của SP. Ví dụ bánh bao: hàng gốc là 1 cái, dòng "Gói" chứa 4 cái.
  - Các ca đã chốt từ trước: bàn chải = Cái, pizza = Cái, mặt nạ = Miếng.
- Còn **383 SP cần đổi**: `ra-soat-dvt-theo-vo.csv`.
  - Cột `level = KIEM` (187 SP): SP có lốc/thùng. Đổi ĐVT gốc thì web hiện, ví dụ, "Thùng 24 Ly" thay "Thùng 24 Hộp".
  - 6 SP đã ngừng bán, vẫn làm.

## A. Đã chốt: snack vỏ ống → **Ống** (14 SP)
Chủ chốt: Lay's Stax là Ống, thì Slide và Pringles cũng là Ống.

| Hiện | Số SP | Ví dụ |
|---|---|---|
| Hộp | 7 | Slide (cả loại 60 g và 90 g), Pringles Hi Cheese 95 g |
| Lon | 5 | Slide BBQ, Slide Hot & Spicy 60 g, Slide sò điệp bào ngư |
| Cốc | 2 | Bắp bơ cốc (vỏ ống giấy) |

Pringles còn lại, Lay's Stax và Bugles đã là Ống. Chữ "ống" trong tên **không** đủ để đổi: "Mực Ống" là con mực; "Bánh Ống Rong Biển" là bánh cuộn hình ống. Riêng "Bim ống YeGam Oreon" (2 SP, đang Hộp) chưa có quy cách, cần chủ xem vỏ.

## B. Cần chủ chốt từ dùng — đề xuất đứng đầu

| # | Loại hàng | Đang lẫn | Đề xuất | Số SP |
|---|---|---|---|---|
| B1 | Mì, tokbokki, bún ăn liền đựng cốc/ly; tô lớn | Hộp, Cốc, Lọ, Bát, Tô | **Ly** cho cốc/ly, **Tô** cho tô (khớp nhóm hàng "Mì ly / tô / cốc") | 95 |
| B2 | Kem que | Cái, Cây | **Que** (kem ốc quế giữ Cái) | 54 |
| B3 | Hạt, kẹo cao su, thịt chua, khô gà đựng hũ miệng rộng | Lọ, Hộp | **Hũ** (Lọ để cho chai nhỏ) | 31 |
| B4 | Bánh gạo, BVS, sữa đựng túi/bịch | Túi, Bịch | **Gói**: một từ cho mọi bao mềm | 23 |
| B5 | Kẹo Alpenliebe, Hi-Chew dạng cuộn | Thanh | **Thỏi**. Thanh để cho socola, bánh | 10 |

## C. Sửa theo vỏ ghi rõ trong quy cách (156 SP)
Phần lớn rõ ràng, không cần chốt từ:

| Hiện → Đổi | Số SP | Ví dụ |
|---|---|---|
| Cái → Gói | 30 | Hotdog Ponnie, bánh mì nướng 85 g, ức gà ăn liền, kem viên Vinamilk 4 viên |
| Lọ → Chai | 38 | xịt chống nắng, xịt khử mùi, kem chống nắng chai; DDVS Dạ Hương (chai trong hộp) |
| Cái → Hộp | 15 | bánh su ATB hộp |
| Cái/Gói → Thanh | 14 | socola thanh 40 g, Cadbury Dairy Milk, Ritter Sport |
| Cái → Khay | 6 | bánh bao TP hình con vật, khay 200 g |
| Thỏi → Ống | 5 | ống hít pastel |
| Lọ/Chai/Lo → Thỏi | 6 | sáp khử mùi Nivea, Old Spice, **Coolkick** |
| **Lọ → Lốc** | 3 | **Yakult 65 ml × 5**: quy cách ghi "lốc 5 chai", nghĩa là một dòng hàng là một lốc |
| Hộp → Chai / Tuýp / Lon / Khay / Bộ | 13 | sữa TH chai 300 ml, kem đánh răng tuýp, demisoda lon, mì xào khay, tai nghe bộ |
| khác | ~16 | Xylitol gói lớn (Viên → Gói), chân gà lốc 3 gói (Gói → Lốc), bia Camel 2 L (Chai → Bình)… |

Hai SP mới đổi ở đợt 1 theo chủ quyết, nhưng mô tả nói khác:
- **Yakult**: chủ chọn Lọ, nhưng quy cách ghi một dòng là lốc 5 chai. Chủ xem lại: nếu đúng là bán theo lốc thì đổi thành **Lốc**.
- **Coolkick**: đợt 1 định đổi Lo → Lọ. Nhưng đây là sáp dạng thỏi, nên đề xuất đổi thành **Thỏi**, cùng với 3 sáp Nivea.

## D. Chưa rà được (519 SP không có dòng quy cách)
- Đối chiếu bằng tên hàng: 27 SP có tên chỉ vỏ khác với ĐVT. Ví dụ "Bánh Ống Rong Biển" đang ghi Gói, "Kem Celano Que" đang ghi Cái.
- Tên hàng không đáng tin bằng quy cách, nên phần này để vòng sau, cùng lúc viết mô tả cho các SP đó.

## Cách làm
Giống đợt 1, mỗi lô đều có bản chụp trước/sau và `brand-diff` phải ĐẠT.
1. Chủ chốt B1–B5, Yakult và Coolkick.
2. Lô thử 3 SP: 1 Slide, 1 kem que, 1 SP có thùng.
3. Lô A + C cho các SP không có lốc/thùng.
4. Lô cho các SP có lốc/thùng.
5. Lô B sau khi chủ chốt.
6. Thêm cảnh báo trong Hub: SP đang bán mà ĐVT không thuộc bảng chuẩn, hoặc khác vỏ ghi trong quy cách.
