# Prompt cho Claude Desktop — đặt lại VAT 10% trên KiotViet (17/10/2026)

Bạn đang điều khiển trình duyệt Chrome của tôi (đã đăng nhập sẵn KiotViet của cửa hàng Trạm 8). Việc cần làm: **đặt lại thuế VAT về 10% cho 49 sản phẩm** bị KiotViet tự đổi sang 8%. KHÔNG sửa bất cứ thứ gì khác.

Cách làm cho TỪNG sản phẩm (làm lần lượt, không làm song song):
1. Vào KiotViet quản lý → **Hàng hóa → Danh sách hàng hóa**. Ô tìm kiếm: gõ đúng **Mã hàng** trong danh sách dưới, Enter.
2. Mở đúng dòng có mã hàng đó (đối chiếu cả tên). Bấm **Cập nhật / Sửa**.
3. Ghi lại trạng thái trước khi sửa: VAT hàng bán, VAT hàng nhập, Giá bán trước thuế, Giá bán sau thuế.
4. Đổi **VAT hàng bán = 10%** và **VAT hàng nhập = 10%**. Không đụng tên hàng, tên hoá đơn điện tử, mã, mã vạch, giá vốn, tồn kho, nhóm hàng, đơn vị, ảnh, mô tả.
5. Kiểm tra **Giá bán sau thuế vẫn đúng số trong danh sách** (đây là giá khách trả, phải giữ nguyên). Nếu KiotViet tự đổi giá sau thuế khi đổi VAT, sửa lại để giá sau thuế đúng số trong danh sách (giá trước thuế khi đó sẽ ≈ số ghi trong danh sách).
6. Bấm **Lưu**. Mở lại sản phẩm để xác nhận: VAT bán 10%, VAT nhập 10%, giá sau thuế đúng.
7. Nếu sản phẩm có nhiều đơn vị (lốc/thùng): chỉ sửa đúng mã hàng trong danh sách; báo lại cho tôi nếu đơn vị khác cũng đang 8% chứ không tự sửa.

Dừng lại và hỏi tôi nếu: không tìm thấy mã hàng; tìm ra nhiều hơn 1 sản phẩm; VAT hiện tại không phải 8% (có thể đã có người sửa); giá sau thuế hiện tại khác số trong danh sách; KiotViet báo lỗi khi lưu.

Cuối cùng trả cho tôi một bảng: STT · Mã hàng · Tên · VAT trước → sau · Giá sau thuế trước → sau · Kết quả (OK / bỏ qua + lý do).

Danh sách (49 sản phẩm):
1. Mã hàng `SP000319` — Bia 1664 — giá sau thuế phải giữ **27.500** — giá trước thuế sau khi sửa ≈ 25.000
2. Mã hàng `8936000442064` — Bia Trúc Bạch lon cao 330ml — giá sau thuế phải giữ **26.500** — giá trước thuế sau khi sửa ≈ 24.090,91
3. Mã hàng `8934692040056` — Bia Tuborg — giá sau thuế phải giữ **22.000** — giá trước thuế sau khi sửa ≈ 20.000
4. Mã hàng `8934692040018` — Bia Tuborg lon 330ml — giá sau thuế phải giữ **22.000** — giá trước thuế sau khi sửa ≈ 20.000
5. Mã hàng `8935012413338` — Bia lon 333 (PAT2) — giá sau thuế phải giữ **18.500** — giá trước thuế sau khi sửa ≈ 16.818,18
6. Mã hàng `SP000542` — BonCha Vị Tắc — giá sau thuế phải giữ **11.500** — giá trước thuế sau khi sửa ≈ 10.454,55
7. Mã hàng `8936048476885` — Boncha Nhật — giá sau thuế phải giữ **13.000** — giá trước thuế sau khi sửa ≈ 11.818,18
8. Mã hàng `8936221042944` — Hồng trà TEA365 hương đào 4bl x 6chai x 500ml — giá sau thuế phải giữ **12.000** — giá trước thuế sau khi sửa ≈ 10.909,09
9. Mã hàng `8934673701761` — Kobucham Táo đào vàng — giá sau thuế phải giữ **33.000** — giá trước thuế sau khi sửa ≈ 30.000
10. Mã hàng `8934673701723` — Kombucha có gaz VNM lon vị trà đen — giá sau thuế phải giữ **39.000** — giá trước thuế sau khi sửa ≈ 35.454,55
11. Mã hàng `SP000545` — Kombucha có gaz Vị Vải Hoa Hồng — giá sau thuế phải giữ **44.000** — giá trước thuế sau khi sửa ≈ 40.000
12. Mã hàng `8934673701747` — Kombucha có gaz vị Atiso Đỏ 320ml Vinamilk — giá sau thuế phải giữ **39.000** — giá trước thuế sau khi sửa ≈ 35.454,55
13. Mã hàng `8934673701730` — Kombucha có gaz vị hoa đậu biếc hayđấy 320ml — giá sau thuế phải giữ **39.000** — giá trước thuế sau khi sửa ≈ 35.454,55
14. Mã hàng `8934804027784` — Milo Lon — giá sau thuế phải giữ **21.000** — giá trước thuế sau khi sửa ≈ 19.090,91
15. Mã hàng `8935049511021` — NUTRI cam — giá sau thuế phải giữ **13.000** — giá trước thuế sau khi sửa ≈ 11.818,18
16. Mã hàng `8935049500131` — NUTRI dâu — giá sau thuế phải giữ **13.000** — giá trước thuế sau khi sửa ≈ 11.818,18
17. Mã hàng `8936193070105` — Number 1 dâu chai nhựa — giá sau thuế phải giữ **12.100** — giá trước thuế sau khi sửa ≈ 11.000
18. Mã hàng `8935049510024` — Nutriboost nước uống sữa trái cây vị bánh quy kem 297ml — giá sau thuế phải giữ **13.000** — giá trước thuế sau khi sửa ≈ 11.818,18
19. Mã hàng `8850228003046` — Nuớc tăng lực đen Red Bull — giá sau thuế phải giữ **18.000** — giá trước thuế sau khi sửa ≈ 16.363,64
20. Mã hàng `8934588253119` — Nước Trái Cây Sữa Twister Juicy Milk Vị Cam 330ml — giá sau thuế phải giữ **12.500** — giá trước thuế sau khi sửa ≈ 11.363,64
21. Mã hàng `8934803055542` — Nước Uống DP - 180ml ( Nước Túi Oishi Lê Đường Phèn ) — giá sau thuế phải giữ **6.000** — giá trước thuế sau khi sửa ≈ 5.454,55
22. Mã hàng `SP877668` — Nước Uống DP - 180ml ( Trà Xanh Oshi Tea go vị đào - Thùng 50 gói x 180ml ) — giá sau thuế phải giữ **6.000** — giá trước thuế sau khi sửa ≈ 5.454,55
23. Mã hàng `SP877660` — Nước Uống DP - 180ml ( Trái cây Oishi Sundays hương táo) — giá sau thuế phải giữ **6.000** — giá trước thuế sau khi sửa ≈ 5.454,55
24. Mã hàng `SP877662` — Nước Uống DP - 180ml (Trà Xanh Oshi Tea go vị chanh - Thùng 50 gói x 180ml) — giá sau thuế phải giữ **6.000** — giá trước thuế sau khi sửa ≈ 5.454,55
25. Mã hàng `8935049510659` — Nước cam có tép Teppy 327ml — giá sau thuế phải giữ **12.000** — giá trước thuế sau khi sửa ≈ 10.909,09
26. Mã hàng `8809184805577` — Nước trái cây Ice Tea vị đào-ice tea sweet peach — giá sau thuế phải giữ **26.500** — giá trước thuế sau khi sửa ≈ 24.090,91
27. Mã hàng `8809713911601` — Nước Ép Dưa Hấu Nha Đam OKF 340ml — giá sau thuế phải giữ **28.000** — giá trước thuế sau khi sửa ≈ 25.454,55
28. Mã hàng `8934588662119` — Pepsi Black Lon 320x24 TRAY Lốc 6 - MT — giá sau thuế phải giữ **12.500** — giá trước thuế sau khi sửa ≈ 11.363,64
29. Mã hàng `4901061107201` — Rượu Sake Ozeki Hozonjo Karatamba 15% 720ml — giá sau thuế phải giữ **815.000** — giá trước thuế sau khi sửa ≈ 740.909,09
30. Mã hàng `9002490267551` — THỰC PHẨM BỔ SUNG : NƯỚC TĂNG LỰC RED BULL 250ML — giá sau thuế phải giữ **37.500** — giá trước thuế sau khi sửa ≈ 34.090,91
31. Mã hàng `8934588793554` — Tea+ Trà Ô Long Đào Nhiệt Đới Chai Nhựa 450ml — giá sau thuế phải giữ **12.500** — giá trước thuế sau khi sửa ≈ 11.363,64
32. Mã hàng `8936193070082` — Thùng nước ngọt number chanh 330ml*24chai — giá sau thuế phải giữ **12.100** — giá trước thuế sau khi sửa ≈ 11.000
33. Mã hàng `8936127790475` — Thức uống TH Hương Đào True Tea Không Đường — giá sau thuế phải giữ **13.000** — giá trước thuế sau khi sửa ≈ 11.818,18
34. Mã hàng `8938556329035` — Thức uống bổ sung ION POCARISWEAT Chai 350ml ×24 — giá sau thuế phải giữ **16.000** — giá trước thuế sau khi sửa ≈ 14.545,45
35. Mã hàng `8997035601505` — Thức uống bổ sung ION POCARISWEAT Lon 330ml — giá sau thuế phải giữ **17.000** — giá trước thuế sau khi sửa ≈ 15.454,55
36. Mã hàng `4936494070013` — Tra Xanh Chanh PET Chai 455ml — giá sau thuế phải giữ **12.100** — giá trước thuế sau khi sửa ≈ 11.000
37. Mã hàng `8936236472651` — Trà Bupnon TEA365 Lài Vị Chanh 4bl × 6 chai × 500ml — giá sau thuế phải giữ **12.000** — giá trước thuế sau khi sửa ≈ 10.909,09
38. Mã hàng `8936236472613` — Trà TEA365 hương mãng cầu 4bl x 6chai x 500ml — giá sau thuế phải giữ **12.000** — giá trước thuế sau khi sửa ≈ 10.909,09
39. Mã hàng `8936221042906` — Trà TEA365 hương mật ong 4bl x 6chai x 500ml — giá sau thuế phải giữ **12.000** — giá trước thuế sau khi sửa ≈ 10.909,09
40. Mã hàng `8936127796613` — Trà Vải TH 350ML×24 — giá sau thuế phải giữ **13.500** — giá trước thuế sau khi sửa ≈ 12.272,73
41. Mã hàng `8936048474577` — Trà mật ong Boncha Vị Việt quất blueberry 450ml — giá sau thuế phải giữ **12.000** — giá trước thuế sau khi sửa ≈ 10.909,09
42. Mã hàng `8936010532236` — Trà tắc mật ong cozy 320ml — giá sau thuế phải giữ **12.500** — giá trước thuế sau khi sửa ≈ 11.363,64
43. Mã hàng `8936127796514` — Trà Đào TH 350ml×24 — giá sau thuế phải giữ **13.000** — giá trước thuế sau khi sửa ≈ 11.818,18
44. Mã hàng `8934588192227` — Twister Cam Lon 320x24 — giá sau thuế phải giữ **12.000** — giá trước thuế sau khi sửa ≈ 10.909,09
45. Mã hàng `8934588243110` — Twister Juicy Milk Dâu Chai 320ml — giá sau thuế phải giữ **12.500** — giá trước thuế sau khi sửa ≈ 11.363,64
46. Mã hàng `6956367338680` — Wang lao ji herbal tea — giá sau thuế phải giữ **17.500** — giá trước thuế sau khi sửa ≈ 15.909,09
47. Mã hàng `8935049501503` — Đồ uống COKE 320ML 4×6 SLEEK CAN SF FFWC — giá sau thuế phải giữ **12.000** — giá trước thuế sau khi sửa ≈ 10.909,09
48. Mã hàng `8935049501480` — Đồ uống MM SPLASH ORANGE 320ML — giá sau thuế phải giữ **11.500** — giá trước thuế sau khi sửa ≈ 10.454,55
49. Mã hàng `8935049510727` — Đồ uống minute maid teppy 1L — giá sau thuế phải giữ **25.000** — giá trước thuế sau khi sửa ≈ 22.727,27
