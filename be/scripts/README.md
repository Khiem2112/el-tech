# Dữ liệu mẫu cửa hàng điện tử

Bộ seed tạo **158 sản phẩm tiếng Việt** thuộc 14 danh mục, 34 thương hiệu và
87 định nghĩa thông số kỹ thuật. Giá bán là dữ liệu tham khảo theo mặt bằng
bán lẻ điện tử tại Việt Nam; đây không phải bảng giá đồng bộ thời gian thực.

Mốc giá được rà soát ngày 18/10/2026 theo trang danh mục/sản phẩm công khai của
[Thế Giới Di Động](https://www.thegioididong.com/) và
[Điện Máy Xanh](https://www.dienmayxanh.com/). Giá khuyến mãi thay đổi theo thời
điểm, khu vực và chính sách thành viên nên dữ liệu seed được làm tròn theo các
mức bán lẻ hợp lý; cần tích hợp API/crawler riêng nếu muốn giá thời gian thực.

## Thành phần

- `seed_mock_data.py`: kiểm tra dữ liệu và upsert vào PostgreSQL/Supabase.
- `mock_catalog_meta.py`: chi nhánh, thương hiệu, danh mục và schema thông số.
- `mock_products_pc_components.py`: CPU, mainboard, RAM, VGA, SSD, PSU, case,
  tản nhiệt.
- `mock_products_peripherals_devices.py`: màn hình, bàn phím, chuột, tai nghe,
  laptop và điện thoại.
- `requirements.txt`: driver PostgreSQL cần cho script.

Phân bổ mỗi danh mục từ 11 đến 12 sản phẩm, tổng cộng 158 SKU. Mỗi sản phẩm có
tên, mô tả, model, SKU, barcode EAN-13, giá VND, ảnh, tồn kho và thông số riêng.

## Cấu trúc thông số tùy biến

`category.specification_schema` lưu danh sách định nghĩa của từng ngành hàng:

```json
{
  "stable_key": "refresh_rate",
  "label": "Tần số quét",
  "data_type": "NUMBER",
  "unit": "Hz",
  "is_required": true,
  "is_filterable": true,
  "is_comparable": true,
  "allowed_values": []
}
```

Giá trị thực của sản phẩm nằm ở `product_template.common_spec`, ví dụ màn hình:

```json
{
  "screen_size": 27,
  "resolution": "2K QHD (2560x1440)",
  "refresh_rate": 180,
  "panel_type": "Fast IPS",
  "response_time": 1,
  "aspect_ratio": "16:9",
  "curved": false
}
```

Các nhóm đã có schema riêng: màn hình, bàn phím, chuột, tai nghe, CPU,
mainboard, RAM, VGA, SSD, PSU, case, tản nhiệt, laptop và điện thoại.

## Chạy script

Từ thư mục `be`:

```bash
pip install -r scripts/requirements.txt
python scripts/seed_mock_data.py --dry-run
python scripts/seed_mock_data.py
```

Script ưu tiên `DIRECT_URL`, sau đó mới dùng `DATABASE_URL`, từ biến môi trường
hoặc file `be/.env`. Có thể chạy qua npm:

```bash
npm run seed:mock:check
npm run seed:mock
```

Script dùng upsert nên có thể chạy lại. Tồn kho được sinh ổn định với seed mặc
định; có thể thay đổi bằng `--random-seed 1234`.

## Reset catalog

```bash
python scripts/seed_mock_data.py --reset
```

`--reset` dùng `TRUNCATE ... CASCADE` đối với catalog, vì vậy có thể xóa cả dữ
liệu nghiệp vụ đang tham chiếu đến sản phẩm. Chỉ dùng trên database phát triển
hoặc database mà bạn đã sao lưu. Không cần `--reset` cho lần chạy thông thường.

## Bảng Prisma được ghi

- `branch`
- `brand`
- `category` (`specification_schema`)
- `product_template` (`common_spec`, `media`)
- `product_variant` (`selling_price`)
- `stock_quant`

Toàn bộ thao tác ghi nằm trong một transaction: nếu một bản ghi lỗi, script sẽ
rollback tất cả thay đổi của lần chạy đó.
