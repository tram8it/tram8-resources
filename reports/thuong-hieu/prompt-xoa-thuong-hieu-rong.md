# Prompt cho Claude in Chrome — xoá 130 thương hiệu không còn hàng hoá

Danh sách lấy từ bản chụp sau khi đổi tên (19/10/2026): mọi thương hiệu có **0 dòng hàng** (kể cả lốc/thùng, hàng ngừng kinh
doanh). Thương hiệu xoá rồi mà sau này cần thì nhập file tự tạo lại. Kiểm: `brand-diff <trước> <sau> xoa-thuong-hieu-rong.csv`.

---

Bạn đang điều khiển Chrome của tôi (đã đăng nhập KiotViet Trạm 8, dữ liệu thật). Việc: **xoá 130 thương hiệu** trong bảng dưới.
Không xoá thương hiệu nào khác, không đổi tên, không tạo, không sửa hàng hoá.

Mở **Thiết lập (bánh răng) → Hàng hóa → Thương hiệu**. Với TỪNG dòng, lần lượt:
1. Tìm dòng có tên **y hệt** cột "Thương hiệu" (kể cả hoa/thường và dấu — ví dụ xoá `KINH DO` chứ KHÔNG xoá `Kinh Đô`).
2. Cột **SL hàng hóa** phải là **0**. Khác 0 → **KHÔNG xoá**, bỏ qua, ghi lại.
3. Bấm **thùng rác** của đúng dòng đó → xác nhận xoá.
4. Kiểm: dòng đó biến mất, các dòng khác còn nguyên.

Dừng và hỏi tôi nếu: SL hàng hóa khác 0; KiotViet báo lỗi hoặc cảnh báo có hàng hoá đang dùng; có 2 dòng gần giống nhau mà không
chắc dòng nào. Cứ sau khoảng 30 dòng, báo tôi tiến độ một câu.
Cuối cùng trả bảng: STT · Thương hiệu · SL · Đã xoá / bỏ qua + lý do.

| STT | Thương hiệu |
|---|---|
| 1 | `ACECOOK` |
| 2 | `AJINOMOTO` |
| 3 | `AKUS` |
| 4 | `AN FOOD` |
| 5 | `ANNA LALA` |
| 6 | `APIA CAKE` |
| 7 | `ASTINI` |
| 8 | `ATABLE` |
| 9 | `AZAM` |
| 10 | `BEIYIN` |
| 11 | `Bibi go` |
| 12 | `biswel` |
| 13 | `Blue star` |
| 14 | `Bích chi` |
| 15 | `CHADU` |
| 16 | `chinsu` |
| 17 | `Chivas` |
| 18 | `Chuppa Chuđ` |
| 19 | `CLEAR` |
| 20 | `Cocacola` |
| 21 | `Coke` |
| 22 | `Coolair` |
| 23 | `Coolgate` |
| 24 | `Công nghệ thực phẩm Châu Á` |
| 25 | `DAINISA` |
| 26 | `DAIRY MILK` |
| 27 | `DARS MORINAGA` |
| 28 | `DIANA` |
| 29 | `Downy` |
| 30 | `DP An Phú` |
| 31 | `DP Hoa Linh` |
| 32 | `Dược phẩm Nam Hà` |
| 33 | `Feastable` |
| 34 | `Firm Filter Smooth Taste` |
| 35 | `GARUDA FOOD` |
| 36 | `Goody Group` |
| 37 | `HABECO` |
| 38 | `HAI HA` |
| 39 | `HAKKA` |
| 40 | `Halal` |
| 41 | `Happy-tos` |
| 42 | `Hatomugi` |
| 43 | `Hershey’s` |
| 44 | `Hisamitsu` |
| 45 | `Hoa Việt` |
| 46 | `HoCoTeck` |
| 47 | `Hoàng Gia` |
| 48 | `HS` |
| 49 | `HURA` |
| 50 | `Hà Việt` |
| 51 | `HÒA AN` |
| 52 | `Hạ Long Saphhire` |
| 53 | `Hải Châu` |
| 54 | `Interfood` |
| 55 | `IPHONE` |
| 56 | `Jagermeister` |
| 57 | `JELLY` |
| 58 | `K-Y` |
| 59 | `KAMEDA` |
| 60 | `Kent` |
| 61 | `Khác` |
| 62 | `KIDO` |
| 63 | `KINH DO` |
| 64 | `koko ya` |
| 65 | `KoKoYa` |
| 66 | `Kotex` |
| 67 | `Kronenbourg 1664` |
| 68 | `Kwangtung` |
| 69 | `Lays` |
| 70 | `Lc Food` |
| 71 | `Lottte` |
| 72 | `Love minimart` |
| 73 | `Masan Consumer` |
| 74 | `Masan jinju` |
| 75 | `MAYORA` |
| 76 | `MEoW` |
| 77 | `my lan` |
| 78 | `Mèo Foods` |
| 79 | `Navi Tongue Cleaner` |
| 80 | `Nestle` |
| 81 | `Nghĩa` |
| 82 | `Nước giải khát Sài Gòn` |
| 83 | `O MO` |
| 84 | `Oat milk` |
| 85 | `ONE ONE` |
| 86 | `Onigiri` |
| 87 | `OREON` |
| 88 | `Pepsico` |
| 89 | `PHƯƠNG HUYỀN FOOD` |
| 90 | `Pizza 4Ps` |
| 91 | `PONDS` |
| 92 | `Procter & Gamble` |
| 93 | `Purité De Prôvence` |
| 94 | `QUABLUE PHARMA` |
| 95 | `QUANG THANH FOODS` |
| 96 | `RJC` |
| 97 | `ROHTO` |
| 98 | `SABECO` |
| 99 | `SAL SUN` |
| 100 | `Sao Thái Dương` |
| 101 | `SAPPI` |
| 102 | `Sato Grona` |
| 103 | `Senka` |
| 104 | `SEOJU FOODS` |
| 105 | `SHADOR` |
| 106 | `SIMPLE` |
| 107 | `Slice` |
| 108 | `Sugus` |
| 109 | `Sunsilk` |
| 110 | `Suntory` |
| 111 | `T.A.P FOOD` |
| 112 | `Teemoon` |
| 113 | `Tennessee Whiskey` |
| 114 | `Thien Huong Food` |
| 115 | `Thiên Long` |
| 116 | `THO Group` |
| 117 | `Thảo Kiên Thủ Đô` |
| 118 | `Tiger Beer` |
| 119 | `TRƯỜNG FOOD` |
| 120 | `Uniben` |
| 121 | `Unicharm` |
| 122 | `VIET SUN` |
| 123 | `Vinataba` |
| 124 | `vivant` |
| 125 | `Vodka` |
| 126 | `Weisiel` |
| 127 | `Whisky` |
| 128 | `X men` |
| 129 | `Xuân Xuân` |
| 130 | `YUMMY` |
