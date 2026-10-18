"""Nạp dữ liệu mẫu cho danh mục cửa hàng điện tử.

Script bám trực tiếp schema Prisma hiện tại, có thể chạy lặp lại nhờ upsert và
có chế độ --dry-run để kiểm tra toàn bộ dữ liệu mà không cần kết nối database.
"""

from __future__ import annotations

import argparse
import os
import random
import sys
import uuid
from collections import Counter
from decimal import Decimal
from pathlib import Path
from typing import Any

for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, "reconfigure"):
        stream.reconfigure(encoding="utf-8", errors="replace")

CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from mock_catalog_meta import (  # noqa: E402
    BRANCHES_DATA,
    BRANDS_DATA,
    CATEGORIES_DATA,
    SPEC_DEFINITIONS_DATA,
)
from mock_products_pc_components import PC_COMPONENTS_PRODUCTS  # noqa: E402
from mock_products_peripherals_devices import (  # noqa: E402
    PERIPHERALS_DEVICES_PRODUCTS,
)

ALL_PRODUCTS = PC_COMPONENTS_PRODUCTS + PERIPHERALS_DEVICES_PRODUCTS
REQUIRED_PRODUCT_FIELDS = {
    "category_slug",
    "brand_slug",
    "name",
    "slug",
    "model",
    "description",
    "common_specs",
    "price",
    "sku",
    "serial_required",
    "image_url",
}
SPEC_PYTHON_TYPES = {
    "STRING": (str,),
    "ENUM": (str,),
    "NUMBER": (int, float, Decimal),
    "BOOLEAN": (bool,),
}


def resolve_database_url() -> str:
    """Đọc DIRECT_URL/DATABASE_URL từ môi trường hoặc file .env của backend."""
    direct_url = os.getenv("DIRECT_URL")
    database_url = os.getenv("DATABASE_URL")
    if direct_url or database_url:
        return direct_url or database_url or ""

    possible_env_paths = (
        CURRENT_DIR.parent / ".env",
        CURRENT_DIR / ".env",
        Path.cwd() / ".env",
    )
    for env_path in possible_env_paths:
        if not env_path.exists():
            continue
        for raw_line in env_path.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            value = value.strip().strip("\"'")
            if key.strip() == "DIRECT_URL":
                direct_url = value
            elif key.strip() == "DATABASE_URL":
                database_url = value
        if direct_url or database_url:
            return direct_url or database_url or ""

    raise FileNotFoundError(
        "Không tìm thấy DIRECT_URL hoặc DATABASE_URL trong biến môi trường/.env."
    )


def validate_seed_data() -> dict[str, Any]:
    """Kiểm tra khóa, kiểu dữ liệu, enum và tính duy nhất trước khi ghi DB."""
    errors: list[str] = []
    category_slugs = {item["slug"] for item in CATEGORIES_DATA}
    brand_slugs = {item["slug"] for item in BRANDS_DATA}

    if category_slugs != set(SPEC_DEFINITIONS_DATA):
        missing = sorted(category_slugs - set(SPEC_DEFINITIONS_DATA))
        extra = sorted(set(SPEC_DEFINITIONS_DATA) - category_slugs)
        errors.append(f"Schema thông số lệch danh mục; thiếu={missing}, dư={extra}")

    seen_slugs: set[str] = set()
    seen_skus: set[str] = set()
    for product in ALL_PRODUCTS:
        identity = product.get("sku") or product.get("name") or "<không tên>"
        missing_fields = sorted(REQUIRED_PRODUCT_FIELDS - set(product))
        if missing_fields:
            errors.append(f"{identity}: thiếu trường {missing_fields}")
            continue

        if product["slug"] in seen_slugs:
            errors.append(f"{identity}: trùng slug {product['slug']}")
        if product["sku"] in seen_skus:
            errors.append(f"{identity}: trùng SKU {product['sku']}")
        seen_slugs.add(product["slug"])
        seen_skus.add(product["sku"])

        if product["category_slug"] not in category_slugs:
            errors.append(f"{identity}: danh mục không tồn tại")
            continue
        if product["brand_slug"] not in brand_slugs:
            errors.append(f"{identity}: thương hiệu không tồn tại")
        if not isinstance(product["price"], (int, Decimal)) or product["price"] <= 0:
            errors.append(f"{identity}: giá phải là số nguyên/Decimal dương")

        definitions = {
            item["stable_key"]: item
            for item in SPEC_DEFINITIONS_DATA[product["category_slug"]]
        }
        specifications = product["common_specs"]
        unknown_keys = sorted(set(specifications) - set(definitions))
        if unknown_keys:
            errors.append(f"{identity}: thông số chưa khai báo {unknown_keys}")

        for stable_key, definition in definitions.items():
            if definition["is_required"] and stable_key not in specifications:
                errors.append(f"{identity}: thiếu thông số bắt buộc {stable_key}")
                continue
            if stable_key not in specifications:
                continue

            value = specifications[stable_key]
            expected_types = SPEC_PYTHON_TYPES[definition["data_type"]]
            if not isinstance(value, expected_types) or (
                definition["data_type"] == "NUMBER" and isinstance(value, bool)
            ):
                errors.append(
                    f"{identity}: {stable_key} sai kiểu {definition['data_type']}"
                )
            allowed_values = definition["allowed_values"]
            if allowed_values and value not in allowed_values:
                errors.append(
                    f"{identity}: {stable_key}={value!r} không nằm trong allowed_values"
                )

    if errors:
        details = "\n- ".join(errors)
        raise ValueError(f"Dữ liệu seed không hợp lệ:\n- {details}")

    return {
        "products": len(ALL_PRODUCTS),
        "categories": len(CATEGORIES_DATA),
        "brands": len(BRANDS_DATA),
        "specifications": sum(len(items) for items in SPEC_DEFINITIONS_DATA.values()),
        "products_by_category": dict(
            sorted(Counter(item["category_slug"] for item in ALL_PRODUCTS).items())
        ),
    }


def clear_existing_catalog_data(cursor: Any) -> None:
    """Xóa dữ liệu catalog; CASCADE có thể xóa dữ liệu nghiệp vụ liên quan."""
    cursor.execute(
        """
        TRUNCATE TABLE
            "stock_quant",
            "product_variant",
            "product_template",
            "category",
            "brand"
        RESTART IDENTITY CASCADE;
        """
    )


def seed_branches(cursor: Any, json_adapter: Any) -> dict[str, int]:
    branch_map: dict[str, int] = {}
    query = """
        INSERT INTO "branch" (
            code, name, address, opening_hour, delivery_priority,
            delivery_area_codes, is_active, updated_at
        )
        VALUES (%s, %s, %s, %s, %s, %s, TRUE, NOW())
        ON CONFLICT (code) DO UPDATE
        SET name = EXCLUDED.name,
            address = EXCLUDED.address,
            opening_hour = EXCLUDED.opening_hour,
            delivery_priority = EXCLUDED.delivery_priority,
            delivery_area_codes = EXCLUDED.delivery_area_codes,
            is_active = TRUE,
            updated_at = NOW()
        RETURNING id, code;
    """
    for branch in BRANCHES_DATA:
        cursor.execute(
            query,
            (
                branch["code"],
                branch["name"],
                branch["address"],
                json_adapter(branch["opening_hours"]),
                branch["delivery_priority"],
                branch.get("delivery_area_codes", []),
            ),
        )
        branch_id, code = cursor.fetchone()
        branch_map[code] = branch_id
    return branch_map


def seed_brands(cursor: Any) -> dict[str, int]:
    brand_map: dict[str, int] = {}
    query = """
        INSERT INTO "brand" (name, slug, description, is_active, updated_at)
        VALUES (%s, %s, %s, TRUE, NOW())
        ON CONFLICT (slug) DO UPDATE
        SET name = EXCLUDED.name,
            description = EXCLUDED.description,
            is_active = TRUE,
            updated_at = NOW()
        RETURNING id, slug;
    """
    for brand in BRANDS_DATA:
        cursor.execute(
            query,
            (brand["name"], brand["slug"], brand["description"]),
        )
        brand_id, slug = cursor.fetchone()
        brand_map[slug] = brand_id
    return brand_map


def seed_categories(cursor: Any, json_adapter: Any) -> dict[str, int]:
    category_map: dict[str, int] = {}
    query = """
        INSERT INTO "category" (
            name, slug, description, specification_schema,
            specification_schema_version, is_active, updated_at
        )
        VALUES (%s, %s, %s, %s, 1, TRUE, NOW())
        ON CONFLICT (slug) DO UPDATE
        SET name = EXCLUDED.name,
            description = EXCLUDED.description,
            specification_schema = EXCLUDED.specification_schema,
            specification_schema_version = EXCLUDED.specification_schema_version,
            is_active = TRUE,
            updated_at = NOW()
        RETURNING id, slug;
    """
    for category in CATEGORIES_DATA:
        specification_schema = SPEC_DEFINITIONS_DATA[category["slug"]]
        cursor.execute(
            query,
            (
                category["name"],
                category["slug"],
                category["description"],
                json_adapter(specification_schema),
            ),
        )
        category_id, slug = cursor.fetchone()
        category_map[slug] = category_id
    return category_map


def generate_ean13_barcode(sequence_number: int) -> str:
    """Sinh EAN-13 với prefix 893 của GS1 Việt Nam."""
    body = f"893{sequence_number:09d}"
    odd_sum = sum(int(body[index]) for index in range(0, 12, 2))
    even_sum = sum(int(body[index]) for index in range(1, 12, 2)) * 3
    check_digit = (10 - ((odd_sum + even_sum) % 10)) % 10
    return f"{body}{check_digit}"


def seed_products(
    cursor: Any,
    category_map: dict[str, int],
    brand_map: dict[str, int],
    branch_map: dict[str, int],
    json_adapter: Any,
    random_seed: int,
) -> dict[str, int]:
    template_query = """
        INSERT INTO "product_template" (
            category_id, brand_id, name, slug, model, chipset_family,
            description, common_spec, media, lifecycle_state, is_active, updated_at
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s,
                'ACTIVE'::"ProductLifecycle", TRUE, NOW())
        ON CONFLICT (slug) DO UPDATE
        SET category_id = EXCLUDED.category_id,
            brand_id = EXCLUDED.brand_id,
            name = EXCLUDED.name,
            model = EXCLUDED.model,
            chipset_family = EXCLUDED.chipset_family,
            description = EXCLUDED.description,
            common_spec = EXCLUDED.common_spec,
            media = EXCLUDED.media,
            lifecycle_state = EXCLUDED.lifecycle_state,
            is_active = TRUE,
            updated_at = NOW()
        RETURNING id;
    """
    variant_query = """
        INSERT INTO "product_variant" (
            product_template_id, sku, barcode, variation_label, variant_spec,
            serial_required, selling_price, lifecycle_state, is_active, updated_at
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s,
                'ACTIVE'::"ProductLifecycle", TRUE, NOW())
        ON CONFLICT (sku) DO UPDATE
        SET product_template_id = EXCLUDED.product_template_id,
            barcode = EXCLUDED.barcode,
            variation_label = EXCLUDED.variation_label,
            variant_spec = EXCLUDED.variant_spec,
            serial_required = EXCLUDED.serial_required,
            selling_price = EXCLUDED.selling_price,
            lifecycle_state = EXCLUDED.lifecycle_state,
            is_active = TRUE,
            updated_at = NOW()
        RETURNING id;
    """
    stock_query = """
        INSERT INTO "stock_quant" (
            id, branch_id, sku_id, on_hand, reserved, quarantine_damaged,
            weighted_average_cost, version, is_active, updated_at
        )
        VALUES (%s, %s, %s, %s, 0, 0, %s, 0, TRUE, NOW())
        ON CONFLICT (branch_id, sku_id) DO UPDATE
        SET on_hand = GREATEST(EXCLUDED.on_hand, "stock_quant".reserved),
            weighted_average_cost = EXCLUDED.weighted_average_cost,
            is_active = TRUE,
            updated_at = NOW();
    """

    rng = random.Random(random_seed)
    stats = {"templates": 0, "variants": 0, "inventory": 0}
    branch_ids = list(branch_map.values())

    for index, product in enumerate(ALL_PRODUCTS, start=1):
        media = [
            {
                "type": "IMAGE",
                "url": product["image_url"],
                "alt": f"Hình ảnh {product['name']}",
                "sort_order": 0,
            }
        ]
        cursor.execute(
            template_query,
            (
                category_map[product["category_slug"]],
                brand_map[product["brand_slug"]],
                product["name"],
                product["slug"],
                product["model"],
                product.get("chipset_family"),
                product["description"],
                json_adapter(product["common_specs"]),
                json_adapter(media),
            ),
        )
        template_id = cursor.fetchone()[0]
        stats["templates"] += 1

        cursor.execute(
            variant_query,
            (
                template_id,
                product["sku"],
                generate_ean13_barcode(index),
                "Tiêu chuẩn",
                json_adapter({}),
                product["serial_required"],
                Decimal(product["price"]),
            ),
        )
        variant_id = cursor.fetchone()[0]
        stats["variants"] += 1

        for branch_id in branch_ids:
            cursor.execute(
                stock_query,
                (
                    str(uuid.uuid4()),
                    branch_id,
                    variant_id,
                    rng.randint(15, 65),
                    (Decimal(product["price"]) * Decimal("0.78")).quantize(
                        Decimal("0.01")
                    ),
                ),
            )
            stats["inventory"] += 1
    return stats


def print_validation_summary(summary: dict[str, Any]) -> None:
    print("Dữ liệu hợp lệ.")
    print(
        f"Tổng cộng: {summary['products']} sản phẩm, "
        f"{summary['categories']} danh mục, {summary['brands']} thương hiệu, "
        f"{summary['specifications']} định nghĩa thông số."
    )
    print("Phân bổ sản phẩm:")
    for category_slug, count in summary["products_by_category"].items():
        print(f"  - {category_slug}: {count}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Khởi tạo dữ liệu mẫu cho cửa hàng đồ điện tử"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Chỉ kiểm tra dữ liệu, không kết nối hoặc ghi database",
    )
    parser.add_argument(
        "--reset",
        action="store_true",
        help="TRUNCATE catalog cũ trước khi seed (có CASCADE)",
    )
    parser.add_argument(
        "--random-seed",
        type=int,
        default=20261018,
        help="Seed dùng để sinh tồn kho ổn định (mặc định: 20261018)",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    summary = validate_seed_data()
    print_validation_summary(summary)
    if args.dry_run:
        print("Dry-run hoàn tất, database không bị thay đổi.")
        return

    try:
        import psycopg2
        from psycopg2.extras import Json
    except ModuleNotFoundError as exc:
        raise RuntimeError(
            "Thiếu psycopg2. Hãy chạy: pip install -r scripts/requirements.txt"
        ) from exc

    connection = psycopg2.connect(resolve_database_url())
    connection.autocommit = False
    cursor = connection.cursor()
    try:
        print("Bắt đầu nạp dữ liệu mẫu...")
        if args.reset:
            print("CẢNH BÁO: đang TRUNCATE catalog với CASCADE theo yêu cầu --reset.")
            clear_existing_catalog_data(cursor)

        branch_map = seed_branches(cursor, Json)
        brand_map = seed_brands(cursor)
        category_map = seed_categories(cursor, Json)
        stats = seed_products(
            cursor,
            category_map,
            brand_map,
            branch_map,
            Json,
            args.random_seed,
        )
        connection.commit()

        print(f"Đã upsert {len(branch_map)} chi nhánh.")
        print(f"Đã upsert {len(brand_map)} thương hiệu.")
        print(f"Đã upsert {len(category_map)} danh mục và schema thông số.")
        print(f"Đã upsert {stats['templates']} sản phẩm gốc.")
        print(f"Đã upsert {stats['variants']} SKU.")
        print(f"Đã upsert {stats['inventory']} bản ghi tồn kho.")
        print("Hoàn tất. Transaction đã được commit.")
    except Exception:
        connection.rollback()
        print("Seed thất bại. Toàn bộ transaction đã rollback.", file=sys.stderr)
        raise
    finally:
        cursor.close()
        connection.close()


if __name__ == "__main__":
    main()
