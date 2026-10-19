import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AppIconModule, BadgeDirective, ButtonDirective } from '../../components/atoms';
import { VndPipe } from '../../lib/vnd.pipe';
import { CartService } from '../../services/cart.service';
import { ComponentSwapModalComponent, SwapItem, SwapSlotItem } from './component-swap-modal.component';

export type BomCategory = 'cpu' | 'mainboard' | 'ram' | 'ssd' | 'vga' | 'psu' | 'cooling' | 'case';

export type BomSlot = {
  readonly key: BomCategory;
  readonly number: string;
  readonly categoryName: string;
  readonly defaultSpecTag: string;
  item: SwapItem | null;
};

const HARDWARE_CATALOG: Record<BomCategory, readonly SwapItem[]> = {
  cpu: [
    {
      id: 'cpu-i7-14700k',
      skuId: 101,
      name: 'Intel Core i7-14700K (3.4GHz turbo 5.6GHz, 20C/28T)',
      brand: 'Intel',
      category: 'cpu',
      price: 10490000,
      tdp: 253,
      socket: 'LGA1700',
      specs: 'Socket LGA1700 • Cache 33MB • Intel UHD 770 • Box Chính Hãng 36T',
      tag: 'TDP 253W',
      stockStatus: 'Sẵn hàng HN & HCM',
    },
    {
      id: 'cpu-i9-14900k',
      skuId: 102,
      name: 'Intel Core i9-14900K (3.2GHz turbo 6.0GHz, 24C/32T)',
      brand: 'Intel',
      category: 'cpu',
      price: 14890000,
      tdp: 253,
      socket: 'LGA1700',
      specs: 'Socket LGA1700 • Cache 36MB • Flagship Gaming & Rendering',
      tag: 'TDP 253W',
      stockStatus: 'Sẵn hàng HN & HCM',
    },
    {
      id: 'cpu-i5-14600k',
      skuId: 103,
      name: 'Intel Core i5-14600K (3.5GHz turbo 5.3GHz, 14C/20T)',
      brand: 'Intel',
      category: 'cpu',
      price: 7890000,
      tdp: 181,
      socket: 'LGA1700',
      specs: 'Socket LGA1700 • Cache 24MB • Cân bằng gaming giá tốt',
      tag: 'TDP 181W',
      stockStatus: 'Sẵn hàng HN, HCM, ĐN',
    },
    {
      id: 'cpu-r7-9800x3d',
      skuId: 104,
      name: 'AMD Ryzen 7 9800X3D (4.7GHz turbo 5.2GHz, 8C/16T)',
      brand: 'AMD',
      category: 'cpu',
      price: 14990000,
      tdp: 120,
      socket: 'AM5',
      specs: 'Socket AM5 • 3D V-Cache 104MB • Vua Gaming thế hệ mới',
      tag: 'TDP 120W',
      stockStatus: 'Sẵn hàng HN & HCM',
    },
    {
      id: 'cpu-r9-9950x',
      skuId: 105,
      name: 'AMD Ryzen 9 9950X (4.3GHz turbo 5.7GHz, 16C/32T)',
      brand: 'AMD',
      category: 'cpu',
      price: 17590000,
      tdp: 170,
      socket: 'AM5',
      specs: 'Socket AM5 • Cache 80MB • Đỉnh cao Render 3D & AI Training',
      tag: 'TDP 170W',
      stockStatus: 'Sẵn hàng HN & HCM',
    },
  ],
  mainboard: [
    {
      id: 'mb-asus-z790-a',
      skuId: 201,
      name: 'ASUS ROG STRIX Z790-A GAMING WIFI II DDR5',
      brand: 'ASUS',
      category: 'mainboard',
      price: 8990000,
      tdp: 45,
      socket: 'LGA1700',
      memoryType: 'DDR5',
      specs: 'ATX • 4x DDR5 Max 192GB • PCIe 5.0 x16 • WiFi 7 + 2.5Gb LAN',
      tag: 'Socket LGA1700',
      stockStatus: 'Sẵn hàng HN & HCM',
    },
    {
      id: 'mb-msi-b760-tomahawk',
      skuId: 202,
      name: 'MSI MAG B760 TOMAHAWK WIFI DDR5',
      brand: 'MSI',
      category: 'mainboard',
      price: 4990000,
      tdp: 35,
      socket: 'LGA1700',
      memoryType: 'DDR5',
      specs: 'ATX • 4x DDR5 • PCIe 5.0 • WiFi 6E • Phân khúc cận cao cấp bền bỉ',
      tag: 'Socket LGA1700',
      stockStatus: 'Sẵn hàng HN & HCM',
    },
    {
      id: 'mb-asus-b650-plus',
      skuId: 203,
      name: 'ASUS TUF GAMING B650-PLUS WIFI DDR5',
      brand: 'ASUS',
      category: 'mainboard',
      price: 5290000,
      tdp: 35,
      socket: 'AM5',
      memoryType: 'DDR5',
      specs: 'ATX • Socket AM5 • 4x DDR5 EXPO • Chuẩn độ bền quân sự TUF',
      tag: 'Socket AM5',
      stockStatus: 'Sẵn hàng HN & HCM',
    },
    {
      id: 'mb-gigabyte-x670-aorus',
      skuId: 204,
      name: 'GIGABYTE X670 AORUS ELITE AX DDR5',
      brand: 'GIGABYTE',
      category: 'mainboard',
      price: 7990000,
      tdp: 45,
      socket: 'AM5',
      memoryType: 'DDR5',
      specs: 'ATX • Socket AM5 • PCIe 5.0 M.2 • Tản nhiệt VRM kép dày dặn',
      tag: 'Socket AM5',
      stockStatus: 'Sẵn hàng HN & HCM',
    },
  ],
  ram: [
    {
      id: 'ram-corsair-dominator-32',
      skuId: 301,
      name: 'Corsair Dominator Titanium RGB 32GB (2x16GB) DDR5 6000MHz',
      brand: 'Corsair',
      category: 'ram',
      price: 4250000,
      tdp: 15,
      memoryType: 'DDR5',
      specs: 'CL30-36-36-76 • Intel XMP 3.0 & AMD EXPO • Led RGB Đổi màu',
      tag: 'DDR5 Dual Channel',
      stockStatus: 'Sẵn hàng HN & HCM',
    },
    {
      id: 'ram-kingston-fury-32',
      skuId: 302,
      name: 'Kingston Fury Beast RGB 32GB (2x16GB) DDR5 6000MHz',
      brand: 'Kingston',
      category: 'ram',
      price: 3290000,
      tdp: 15,
      memoryType: 'DDR5',
      specs: 'CL30 • Tương thích cao mọi bo mạch DDR5 • Giá tốt hiệu năng cao',
      tag: 'DDR5 Dual Channel',
      stockStatus: 'Sẵn hàng HN, HCM, ĐN',
    },
    {
      id: 'ram-gskill-trident-64',
      skuId: 303,
      name: 'G.SKILL Trident Z5 RGB 64GB (2x32GB) DDR5 6400MHz',
      brand: 'G.SKILL',
      category: 'ram',
      price: 6490000,
      tdp: 20,
      memoryType: 'DDR5',
      specs: 'CL32 • Dung lượng lớn chuyên dựng phim 4K và chạy máy ảo nặng',
      tag: 'DDR5 64GB Kit',
      stockStatus: 'Sẵn hàng HN & HCM',
    },
  ],
  ssd: [
    {
      id: 'ssd-samsung-990pro-1tb',
      skuId: 401,
      name: 'Samsung 990 PRO 1TB PCIe Gen 4.0 NVMe M.2',
      brand: 'Samsung',
      category: 'ssd',
      price: 2890000,
      tdp: 10,
      specs: 'Đọc 7.450 MB/s • Ghi 6.900 MB/s • TBW 600TB • Bảo hành 5 năm 1 đổi 1',
      tag: 'Gen 4.0 x4',
      stockStatus: 'Sẵn hàng HN, HCM, ĐN',
    },
    {
      id: 'ssd-samsung-990pro-2tb',
      skuId: 402,
      name: 'Samsung 990 PRO 2TB PCIe Gen 4.0 NVMe M.2',
      brand: 'Samsung',
      category: 'ssd',
      price: 4990000,
      tdp: 10,
      specs: 'Đọc 7.450 MB/s • Ghi 6.900 MB/s • Dung lượng lớn lưu trữ đồ họa',
      tag: 'Gen 4.0 x4 2TB',
      stockStatus: 'Sẵn hàng HN & HCM',
    },
    {
      id: 'ssd-wd-black-sn850x-1tb',
      skuId: 403,
      name: 'WD Black SN850X 1TB PCIe Gen 4.0 NVMe M.2',
      brand: 'Western Digital',
      category: 'ssd',
      price: 2490000,
      tdp: 10,
      specs: 'Đọc 7.300 MB/s • Ghi 6.300 MB/s • Chế độ Game Mode 2.0 tối ưu',
      tag: 'Gen 4.0 x4',
      stockStatus: 'Sẵn hàng HN & HCM',
    },
  ],
  vga: [
    {
      id: 'vga-asus-tuf-5070ti',
      skuId: 501,
      name: 'ASUS TUF Gaming GeForce RTX 5070 Ti 16GB GDDR7',
      brand: 'ASUS',
      category: 'vga',
      price: 23990000,
      tdp: 285,
      lengthMm: 305,
      specs: '256-bit • 3x DisplayPort 2.1, 1x HDMI 2.1a • Yêu cầu nguồn 750W+ ATX 3.0',
      tag: 'Length 305mm',
      stockStatus: 'Sẵn hàng HN & HCM',
    },
    {
      id: 'vga-msi-4080super',
      skuId: 502,
      name: 'MSI GeForce RTX 4080 SUPER 16G GAMING X SLIM',
      brand: 'MSI',
      category: 'vga',
      price: 26990000,
      tdp: 320,
      lengthMm: 322,
      specs: '16GB GDDR6X • TRI FROZR 3 • Cần nguồn 750W-850W • Thiết kế mỏng nhẹ 3 Fan',
      tag: 'Length 322mm',
      stockStatus: 'Sẵn hàng HN & HCM',
    },
    {
      id: 'vga-gigabyte-5080',
      skuId: 503,
      name: 'GIGABYTE GeForce RTX 5080 GAMING OC 16GB GDDR7',
      brand: 'GIGABYTE',
      category: 'vga',
      price: 32490000,
      tdp: 360,
      lengthMm: 338,
      specs: 'Kiến trúc Blackwell • DLSS 4 • Ray Tracing thế hệ mới • Cần nguồn 850W+',
      tag: 'Length 338mm',
      stockStatus: 'Sẵn hàng HN & HCM',
    },
    {
      id: 'vga-sapphire-9070xt',
      skuId: 504,
      name: 'SAPPHIRE Nitro+ Radeon RX 9070 XT 16GB GDDR6',
      brand: 'SAPPHIRE',
      category: 'vga',
      price: 21590000,
      tdp: 304,
      lengthMm: 320,
      specs: 'Kiến trúc RDNA 4 • FSR 4.0 AI Frame Gen • Khung vỏ kim loại nguyên khối',
      tag: 'Length 320mm',
      stockStatus: 'Sẵn hàng HN, HCM',
    },
  ],
  psu: [
    {
      id: 'psu-corsair-rm850x',
      skuId: 601,
      name: 'Corsair RM850x 850W 80 Plus Gold Fully Modular ATX 3.0',
      brand: 'Corsair',
      category: 'psu',
      price: 3490000,
      tdp: 850,
      specs: '80 Plus Gold • Chuẩn PCIe 5.0 12V-2x6 Native • Tụ điện Nhật Bản 105°C',
      tag: '850W Gold ATX3.0',
      stockStatus: 'Sẵn hàng HN, HCM, ĐN',
    },
    {
      id: 'psu-seasonic-1000',
      skuId: 602,
      name: 'Seasonic Focus GX-1000 1000W 80 Plus Gold ATX 3.0',
      brand: 'Seasonic',
      category: 'psu',
      price: 4690000,
      tdp: 1000,
      specs: '1000W Gold • Dư tải an toàn cho cấu hình RTX 5080 / RTX 5090 • Bảo hành 10 năm',
      tag: '1000W Gold',
      stockStatus: 'Sẵn hàng HN & HCM',
    },
    {
      id: 'psu-msi-750',
      skuId: 603,
      name: 'MSI MAG A750GL 750W 80 Plus Gold PCIe 5.0',
      brand: 'MSI',
      category: 'psu',
      price: 2590000,
      tdp: 750,
      specs: '750W Gold • Chuẩn ATX 3.0 • Phù hợp cấu hình tầm trung RTX 5070 / RX 9070',
      tag: '750W Gold',
      stockStatus: 'Sẵn hàng HN, HCM, ĐN',
    },
  ],
  cooling: [
    {
      id: 'cool-thermalright-360',
      skuId: 701,
      name: 'Thermalright Frozen Horizon 360 ARGB Black',
      brand: 'Thermalright',
      category: 'cooling',
      price: 2390000,
      tdp: 20,
      specs: 'Tản nhiệt nước AIO 360mm • 3x Fan ARGB hiệu suất cao • Hỗ trợ LGA1700 & AM5',
      tag: 'Radiator 360mm',
      stockStatus: 'Sẵn hàng HN & HCM',
    },
    {
      id: 'cool-nzxt-kraken-360',
      skuId: 702,
      name: 'NZXT Kraken Elite 360 RGB Black (Màn hình LCD 2.36")',
      brand: 'NZXT',
      category: 'cooling',
      price: 6890000,
      tdp: 25,
      specs: 'Màn hình LCD hiển thị nhiệt độ & ảnh GIF • Bơm Asetek Gen 7 cực êm',
      tag: 'LCD Screen AIO',
      stockStatus: 'Sẵn hàng HN & HCM',
    },
    {
      id: 'cool-noctua-d15',
      skuId: 703,
      name: 'Noctua NH-D15 chromax.black Dual Tower Cooler',
      brand: 'Noctua',
      category: 'cooling',
      price: 2890000,
      tdp: 15,
      specs: 'Vua tản khí thế giới • 2 tháp tản 140mm • Độ bền trọn đời không lo rò rỉ',
      tag: 'Dual Tower Air',
      stockStatus: 'Sẵn hàng HN & HCM',
    },
  ],
  case: [
    {
      id: 'case-lianli-o11',
      skuId: 801,
      name: 'Lian Li O11 Vision Chrome Panoramic Glass',
      brand: 'Lian Li',
      category: 'case',
      price: 3690000,
      tdp: 0,
      specs: '3 mặt kính cường lực không cột góc • Hỗ trợ Rad 360mm • VGA dài tới 455mm',
      tag: 'Max GPU 455mm',
      stockStatus: 'Sẵn hàng HN & HCM',
    },
    {
      id: 'case-nzxt-h6-flow',
      skuId: 802,
      name: 'NZXT H6 Flow RGB Dual-Chamber Mid-Tower Black',
      brand: 'NZXT',
      category: 'case',
      price: 2890000,
      tdp: 0,
      specs: 'Thiết kế 2 khoang khí động học • Kèm 3 quạt góc hút gió trực tiếp cho VGA',
      tag: 'Max GPU 365mm',
      stockStatus: 'Sẵn hàng HN, HCM',
    },
    {
      id: 'case-corsair-4000d',
      skuId: 803,
      name: 'Corsair 4000D Airflow Tempered Glass Black',
      brand: 'Corsair',
      category: 'case',
      price: 2190000,
      tdp: 0,
      specs: 'Mặt lưới thông gió tối ưu • Khung thép SPCC chắc chắn • Hỗ trợ VGA 360mm',
      tag: 'Max GPU 360mm',
      stockStatus: 'Sẵn hàng HN, HCM, ĐN',
    },
  ],
};

@Component({
  selector: 'app-custom-build-page',
  imports: [RouterLink, VndPipe, AppIconModule, ButtonDirective, BadgeDirective, ComponentSwapModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="w-full bg-canvas min-h-screen pb-16">
      <!-- Status & Utility Bar -->
      <header class="w-full px-4 sm:px-6 lg:px-8 py-4 bg-surface border-b border-border shadow-sm">
        <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="size-10 rounded-xl bg-surface-alt flex items-center justify-center text-foreground font-bold border border-border">
              <lucide-icon name="cpu" class="size-5 text-primary" aria-hidden="true"></lucide-icon>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h1 class="text-base sm:text-lg font-bold text-foreground">Xây Dựng Cấu Hình PC Builder</h1>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/15 text-primary tracking-wide border border-primary/20">
                  TƯƠNG THÍCH HOÀN TOÀN
                </span>
              </div>
              <p class="text-xs text-muted mt-0.5">Hệ thống kiểm tra điện áp nguồn, chuẩn socket LGA1700 / AM5 và kích thước vỏ case theo thời gian thực.</p>
            </div>
          </div>

          <!-- Action Toolbar -->
          <div class="flex items-center flex-wrap gap-2 text-xs">
            <button
              type="button"
              (click)="resetBuild()"
              class="h-9 px-3.5 rounded-lg bg-surface-alt hover:bg-border text-foreground font-bold flex items-center gap-1.5 transition-colors border border-border cursor-pointer"
              title="Đặt lại toàn bộ danh sách linh kiện"
            >
              <lucide-icon name="rotate-ccw" class="size-3.5 text-muted" aria-hidden="true"></lucide-icon>
              <span>Tạo mới</span>
            </button>

            <button
              type="button"
              (click)="togglePreset()"
              class="h-9 px-3.5 rounded-lg bg-surface-alt hover:bg-border text-foreground font-bold flex items-center gap-1.5 transition-colors border border-border cursor-pointer"
              title="Đổi giữa cấu hình Intel và AMD"
            >
              <lucide-icon name="refresh-cw" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
              <span>{{ activePreset() === 'intel' ? 'Mẫu Intel Core i7 / RTX 5070 Ti' : 'Mẫu AMD Ryzen 7 / RTX 5080' }}</span>
            </button>

            <button
              type="button"
              (click)="printQuotation()"
              class="h-9 px-3.5 rounded-lg bg-surface-alt hover:bg-border text-foreground font-bold flex items-center gap-1.5 transition-colors border border-border cursor-pointer"
              title="In báo giá cấu hình chi tiết"
            >
              <lucide-icon name="printer" class="size-3.5 text-muted" aria-hidden="true"></lucide-icon>
              <span>Xuất báo giá</span>
            </button>

            <button
              type="button"
              (click)="shareLink()"
              class="h-9 px-3.5 rounded-lg bg-surface-alt hover:bg-border text-foreground font-bold flex items-center gap-1.5 transition-colors border border-border cursor-pointer relative"
              title="Sao chép liên kết cấu hình"
            >
              <lucide-icon name="share-2" class="size-3.5 text-muted" aria-hidden="true"></lucide-icon>
              <span>{{ linkCopied() ? 'Đã sao chép link' : 'Chia sẻ link' }}</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Workspace (8 Cols BOM / 4 Cols Summary) -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <!-- Left Section: BOM Slots & Diagnostics (8 cols) -->
          <div class="lg:col-span-8 space-y-4">
            <!-- Compatibility & Wattage Metric Panel (PCB-006) -->
            <div class="rounded-xl p-4 sm:p-5 bg-surface shadow-sm border border-border space-y-4">
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border">
                <div class="flex items-center gap-2.5">
                  <lucide-icon name="shield-check" class="size-6 text-primary shrink-0" aria-hidden="true"></lucide-icon>
                  <div>
                    <span class="text-xs sm:text-sm font-bold text-foreground block">Kiểm tra tương thích & Công suất nguồn</span>
                    <p class="text-xs text-muted">
                      Socket {{ currentSocket() }} khớp với Bo mạch chủ, RAM {{ currentRamType() }} tương thích cấu hình XMP / EXPO.
                    </p>
                  </div>
                </div>
                <div class="px-2.5 py-1 rounded bg-surface-alt border border-border text-[11px] font-mono text-foreground whitespace-nowrap">
                  <span>PCIe Bandwidth: </span>
                  <strong class="text-primary font-bold">Gen 5.0 READY</strong>
                </div>
              </div>

              <!-- Wattage Bar -->
              <div class="space-y-1.5 text-xs">
                <div class="flex items-center justify-between text-[11px] sm:text-xs font-mono flex-wrap gap-2">
                  <span class="text-muted">Ước tính tiêu thụ tối đa: <strong class="text-foreground">{{ fullLoadTdp() }}W</strong></span>
                  <span class="text-muted">
                    PSU đề xuất: <strong class="text-foreground">{{ minPsuRecommended() }}W</strong> | PSU đã chọn:
                    <strong class="text-primary font-bold">{{ currentPsuWattage() }}W (Margin {{ marginPercent() >= 0 ? '+' : '' }}{{ marginPercent() }}%)</strong>
                  </span>
                </div>

                <!-- Progress Bar Graphic -->
                <div class="w-full h-3 bg-surface-alt rounded-full overflow-hidden flex p-0.5 border border-border">
                  <div
                    class="h-full rounded-full transition-all duration-500"
                    [class.bg-primary]="wattagePercent() <= 80"
                    [class.bg-amber-400]="wattagePercent() > 80 && wattagePercent() <= 100"
                    [class.bg-danger]="wattagePercent() > 100"
                    [style.width.%]="wattagePercent()"
                  ></div>
                </div>

                <div class="flex justify-between items-center text-[10px] text-muted font-mono pt-0.5 flex-wrap gap-1">
                  <span>0W (Idle 48W)</span>
                  <span>{{ fullLoadTdp() }}W (TDP Full Load)</span>
                  <span>{{ minPsuRecommended() }}W (Min Spec)</span>
                  <span class="text-primary font-bold">{{ currentPsuWattage() }}W Gold ({{ marginPercent() >= 20 ? 'Đạt chuẩn an toàn' : 'Cần chú ý công suất' }})</span>
                </div>
              </div>
            </div>

            <!-- BOM Hardware Rows List (8 Core Slots) -->
            <div class="rounded-xl bg-surface shadow-sm border border-border divide-y divide-border overflow-hidden">
              @for (slot of bomSlots(); track slot.key) {
                <div class="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-surface-alt/40 transition-colors">
                  <!-- Slot Identity & Hardware Info -->
                  <div class="flex items-start md:items-center gap-3 flex-1 min-w-0">
                    <div class="size-8 rounded-lg bg-surface-alt flex items-center justify-center shrink-0 border border-border font-bold text-xs text-muted">
                      {{ slot.number }}
                    </div>

                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-surface-alt text-muted border border-border">
                          {{ slot.categoryName }}
                        </span>
                        @if (slot.item?.tag; as tag) {
                          <span class="px-1.5 py-0.5 rounded text-[10px] font-mono text-primary font-bold bg-primary/10">
                            {{ tag }}
                          </span>
                        }
                      </div>

                      @if (slot.item; as item) {
                        <h2 class="text-xs sm:text-sm font-bold text-foreground truncate mt-1">{{ item.name }}</h2>
                        <p class="text-[11px] text-muted truncate mt-0.5">{{ item.specs }}</p>
                      } @else {
                        <p class="text-xs text-muted italic mt-1">Chưa chọn linh kiện cho vị trí này.</p>
                      }
                    </div>
                  </div>

                  <!-- Slot Price & Actions -->
                  <div class="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-border">
                    <div class="text-left md:text-right">
                      @if (slot.item; as item) {
                        <div class="text-xs sm:text-sm font-bold text-foreground tabular">{{ item.price | vnd }}</div>
                        <div class="text-[10px] text-muted">Bảo hành 36T</div>
                      } @else {
                        <div class="text-xs text-muted">0 đ</div>
                      }
                    </div>

                    <div class="flex items-center gap-1.5">
                      <button
                        type="button"
                        (click)="openSwapModal(slot)"
                        class="h-8 px-2.5 rounded-lg bg-surface-alt hover:bg-border text-foreground text-xs font-bold flex items-center gap-1 transition-colors border border-border cursor-pointer"
                        title="Thay đổi linh kiện"
                      >
                        <lucide-icon name="arrow-up-down" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
                        <span>{{ slot.item ? 'Đổi' : 'Chọn' }}</span>
                      </button>

                      @if (slot.item) {
                        <button
                          type="button"
                          (click)="clearSlot(slot.key)"
                          class="size-8 rounded-lg bg-surface-alt hover:bg-danger/20 text-muted hover:text-danger flex items-center justify-center transition-colors border border-border cursor-pointer"
                          title="Xóa linh kiện này"
                          aria-label="Xóa linh kiện"
                        >
                          <lucide-icon name="trash-2" class="size-3.5" aria-hidden="true"></lucide-icon>
                        </button>
                      }
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Free Technical Services Pack -->
            <div class="rounded-xl p-4 bg-surface shadow-sm border border-border space-y-2.5 text-xs text-muted">
              <div class="flex items-center gap-2 font-bold text-foreground">
                <lucide-icon name="wrench" class="size-4 text-primary" aria-hidden="true"></lucide-icon>
                <span>Gói Dịch Vụ Kỹ Thuật Đính Kèm Miễn Phí Tại EL-TECH</span>
              </div>
              <div class="grid sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                <div class="p-2.5 rounded-lg bg-surface-alt border border-border space-y-0.5">
                  <div class="font-bold text-foreground flex items-center justify-between">
                    <span>Lắp ráp & đi dây Pro</span>
                    <span class="text-primary font-bold">0 đ</span>
                  </div>
                  <p>Kỹ thuật viên đi dây nẹp gọn gàng, luồn dây âm thân case thẩm mỹ.</p>
                </div>
                <div class="p-2.5 rounded-lg bg-surface-alt border border-border space-y-0.5">
                  <div class="font-bold text-foreground flex items-center justify-between">
                    <span>Stress Test 24h & Cài đặt</span>
                    <span class="text-primary font-bold">0 đ</span>
                  </div>
                  <p>Chạy kiểm tra FurMark, Cinebench R23 và cập nhật BIOS bo mạch mới nhất.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Section: Sticky Summary & Checkout Drawer (4 cols) -->
          <div class="lg:col-span-4 sticky top-24 space-y-4">
            <div class="rounded-xl p-5 bg-surface shadow-sm border border-border space-y-4">
              <div class="border-b border-border pb-3">
                <span class="text-[10px] font-bold uppercase tracking-wider text-muted">TỔNG KẾT BẢO TOÀN DÀN MÁY</span>
                <h3 class="text-sm font-bold text-foreground mt-0.5">Báo Giá Chi Tiết PC Tự Ráp</h3>
              </div>

              <!-- Price Breakdown -->
              <div class="space-y-2 text-xs">
                <div class="flex items-center justify-between text-muted">
                  <span>Tổng tiền linh kiện ({{ activeItemCount() }} món):</span>
                  <span class="text-foreground font-bold tabular">{{ totalHardwarePrice() | vnd }}</span>
                </div>
                <div class="flex items-center justify-between text-muted">
                  <span>Công lắp ráp & stress test:</span>
                  <span class="text-primary font-bold">0 đ (Miễn phí)</span>
                </div>
                <div class="flex items-center justify-between text-muted">
                  <span>Phí vận chuyển bọc xốp cẩn thận:</span>
                  <span class="text-primary font-bold">MIỄN PHÍ</span>
                </div>
                <div class="w-full h-px bg-border my-1"></div>
                <div class="flex items-baseline justify-between pt-1">
                  <div>
                    <div class="text-xs font-black uppercase text-foreground">TỔNG THANH TOÁN</div>
                    <div class="text-[10px] text-muted">Bao gồm VAT 10% & Hóa đơn GTGT</div>
                  </div>
                  <div class="text-right">
                    <div class="text-xl sm:text-2xl font-black text-primary tabular">{{ totalHardwarePrice() | vnd }}</div>
                    <div class="text-[10px] text-emerald-400 font-bold">Tiết kiệm trọn gói 1.800.000 đ</div>
                  </div>
                </div>
              </div>

              <!-- Custom COD Regulations Policy (PAY-011) -->
              <div class="p-3 rounded-lg bg-surface-alt border border-border space-y-1.5 text-xs text-muted">
                <div class="flex items-center gap-1.5 text-foreground font-bold text-[11px]">
                  <lucide-icon name="shield-check" class="size-4 text-amber-400" aria-hidden="true"></lucide-icon>
                  <span>Quy định đặt cọc máy ráp (COD - PAY-011)</span>
                </div>
                <p class="text-[11px] leading-relaxed">
                  Máy tính ráp theo yêu cầu áp dụng quy tắc đặt cọc: Tối thiểu <strong class="text-foreground">10%</strong> để kỹ thuật bóc seal và lắp đặt an toàn.
                </p>
                <div class="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div class="bg-surface p-2 rounded border border-border">
                    <div class="text-muted text-[10px]">Cọc trước (VietQR):</div>
                    <div class="font-bold text-primary tabular text-xs mt-0.5">{{ depositAmount() | vnd }}</div>
                  </div>
                  <div class="bg-surface p-2 rounded border border-border">
                    <div class="text-muted text-[10px]">Còn lại COD khi nhận:</div>
                    <div class="font-bold text-foreground tabular text-xs mt-0.5">{{ remainingCodAmount() | vnd }}</div>
                  </div>
                </div>
              </div>

              <!-- Main CTA Buttons -->
              <div class="space-y-2 pt-1">
                <button
                  type="button"
                  appButton
                  variant="primary"
                  size="lg"
                  class="w-full text-xs font-bold uppercase tracking-wider"
                  [disabled]="activeItemCount() === 0 || adding()"
                  (click)="proceedToCheckout()"
                >
                  <lucide-icon name="shopping-cart" class="size-4" aria-hidden="true"></lucide-icon>
                  <span>{{ adding() ? 'Đang chuẩn bị...' : 'Đặt hàng ngay' }}</span>
                </button>

                <button
                  type="button"
                  appButton
                  variant="secondary"
                  size="md"
                  class="w-full text-xs font-bold"
                  [disabled]="activeItemCount() === 0 || adding()"
                  (click)="addToCartWhole()"
                >
                  <lucide-icon name="plus" class="size-4" aria-hidden="true"></lucide-icon>
                  <span>Thêm trọn bộ vào giỏ hàng</span>
                </button>
              </div>

              <!-- Assurance Micro Badges -->
              <div class="pt-2 flex items-center justify-between text-[11px] text-muted border-t border-border">
                <span class="flex items-center gap-1">
                  <lucide-icon name="rotate-ccw" class="size-3 text-primary" aria-hidden="true"></lucide-icon>
                  <span>Đổi mới 30 ngày</span>
                </span>
                <span class="size-1 rounded-full bg-border"></span>
                <span class="flex items-center gap-1">
                  <lucide-icon name="shield-check" class="size-3 text-primary" aria-hidden="true"></lucide-icon>
                  <span>Bảo hành tận nơi 12T</span>
                </span>
                <span class="size-1 rounded-full bg-border"></span>
                <span class="flex items-center gap-1">
                  <lucide-icon name="file-text" class="size-3 text-primary" aria-hidden="true"></lucide-icon>
                  <span>Hóa đơn VAT</span>
                </span>
              </div>
            </div>

            <!-- Diagnostics Card -->
            <div class="rounded-xl p-4 bg-surface shadow-sm border border-border space-y-1.5 text-xs text-muted">
              <div class="flex items-center justify-between text-foreground font-bold text-[11px]">
                <span class="flex items-center gap-1.5">
                  <lucide-icon name="cpu" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
                  <span>Kiến trúc hệ thống</span>
                </span>
                <span class="font-mono text-primary font-bold">x86-64 / PCIe 5.0</span>
              </div>
              <p class="text-[11px] leading-relaxed">
                Cấu hình tương thích các chuẩn tản nhiệt Radiator 360mm và khoảng không thông thoáng cho card đồ họa thế hệ mới nhất.
              </p>
            </div>
          </div>
        </div>
      </main>

      <!-- Interactive Hardware Swap Modal -->
      <app-component-swap-modal
        [isOpen]="swapModalOpen()"
        [categoryKey]="currentModalCategoryKey()"
        [categoryName]="currentModalCategoryName()"
        [currentSlot]="currentModalSlot()"
        [availableItems]="currentModalAvailableItems()"
        [currentPsuWattage]="currentPsuWattage()"
        (closeModal)="swapModalOpen.set(false)"
        (selectItem)="onComponentSelected($event)"
      ></app-component-swap-modal>
    </section>
  `,
})
export class CustomBuildPageComponent {
  private readonly router = inject(Router);
  private readonly cart = inject(CartService);

  protected readonly activePreset = signal<'intel' | 'amd'>('intel');
  protected readonly linkCopied = signal(false);
  protected readonly adding = signal(false);

  protected readonly swapModalOpen = signal(false);
  protected readonly currentModalCategoryKey = signal<string>('vga');
  protected readonly currentModalCategoryName = signal<string>('Card đồ họa / VGA');
  protected readonly currentModalSlot = signal<SwapSlotItem | null>(null);
  protected readonly currentModalAvailableItems = signal<readonly SwapItem[]>([]);

  protected readonly bomSlots = signal<readonly BomSlot[]>([
    { key: 'cpu', number: '01', categoryName: 'Vi xử lý / CPU', defaultSpecTag: 'LGA1700', item: HARDWARE_CATALOG.cpu[0] },
    { key: 'mainboard', number: '02', categoryName: 'Bo mạch chủ / Mainboard', defaultSpecTag: 'Socket LGA1700', item: HARDWARE_CATALOG.mainboard[0] },
    { key: 'ram', number: '03', categoryName: 'Bộ nhớ trong / RAM', defaultSpecTag: 'DDR5 Dual Channel', item: HARDWARE_CATALOG.ram[0] },
    { key: 'ssd', number: '04', categoryName: 'Ổ cứng thể rắn / SSD', defaultSpecTag: 'Gen 4.0 x4', item: HARDWARE_CATALOG.ssd[0] },
    { key: 'vga', number: '05', categoryName: 'Card đồ họa / VGA', defaultSpecTag: 'Length 305mm', item: HARDWARE_CATALOG.vga[0] },
    { key: 'psu', number: '06', categoryName: 'Nguồn máy tính / PSU', defaultSpecTag: '850W Gold ATX3.0', item: HARDWARE_CATALOG.psu[0] },
    { key: 'cooling', number: '07', categoryName: 'Tản nhiệt CPU / Cooling', defaultSpecTag: 'Radiator 360mm', item: HARDWARE_CATALOG.cooling[0] },
    { key: 'case', number: '08', categoryName: 'Vỏ máy tính / Case', defaultSpecTag: 'Max GPU 455mm', item: HARDWARE_CATALOG.case[0] },
  ]);

  protected readonly activeItemCount = computed<number>(() => {
    return this.bomSlots().filter((slot) => slot.item !== null).length;
  });

  protected readonly totalHardwarePrice = computed<number>(() => {
    return this.bomSlots().reduce((acc, slot) => acc + (slot.item?.price ?? 0), 0);
  });

  protected readonly depositAmount = computed<number>(() => {
    return Math.round(this.totalHardwarePrice() * 0.1);
  });

  protected readonly remainingCodAmount = computed<number>(() => {
    return this.totalHardwarePrice() - this.depositAmount();
  });

  protected readonly currentSocket = computed<string>(() => {
    const cpu = this.bomSlots().find((s) => s.key === 'cpu')?.item;
    return cpu?.socket || 'LGA1700';
  });

  protected readonly currentRamType = computed<string>(() => {
    const ram = this.bomSlots().find((s) => s.key === 'ram')?.item;
    return ram?.memoryType || 'DDR5';
  });

  protected readonly currentPsuWattage = computed<number>(() => {
    const psu = this.bomSlots().find((s) => s.key === 'psu')?.item;
    return psu?.tdp || 850;
  });

  protected readonly fullLoadTdp = computed<number>(() => {
    const cpuTdp = this.bomSlots().find((s) => s.key === 'cpu')?.item?.tdp || 253;
    const vgaTdp = this.bomSlots().find((s) => s.key === 'vga')?.item?.tdp || 285;
    const otherTdp = 100;
    return cpuTdp + vgaTdp + otherTdp;
  });

  protected readonly minPsuRecommended = computed<number>(() => {
    const minCalculated = Math.ceil((this.fullLoadTdp() * 1.25) / 50) * 50;
    return Math.max(650, minCalculated);
  });

  protected readonly marginPercent = computed<number>(() => {
    const chosen = this.currentPsuWattage();
    const load = this.fullLoadTdp();
    if (load <= 0) return 0;
    return Math.round(((chosen - load) / load) * 100);
  });

  protected readonly wattagePercent = computed<number>(() => {
    const chosen = this.currentPsuWattage();
    const load = this.fullLoadTdp();
    if (chosen <= 0) return 100;
    return Math.min(100, Math.round((load / chosen) * 100));
  });

  protected resetBuild(): void {
    this.activePreset.set('intel');
    this.applyIntelPreset();
  }

  protected togglePreset(): void {
    if (this.activePreset() === 'intel') {
      this.activePreset.set('amd');
      this.applyAmdPreset();
    } else {
      this.activePreset.set('intel');
      this.applyIntelPreset();
    }
  }

  private applyIntelPreset(): void {
    this.bomSlots.set([
      { key: 'cpu', number: '01', categoryName: 'Vi xử lý / CPU', defaultSpecTag: 'LGA1700', item: HARDWARE_CATALOG.cpu[0] },
      { key: 'mainboard', number: '02', categoryName: 'Bo mạch chủ / Mainboard', defaultSpecTag: 'Socket LGA1700', item: HARDWARE_CATALOG.mainboard[0] },
      { key: 'ram', number: '03', categoryName: 'Bộ nhớ trong / RAM', defaultSpecTag: 'DDR5 Dual Channel', item: HARDWARE_CATALOG.ram[0] },
      { key: 'ssd', number: '04', categoryName: 'Ổ cứng thể rắn / SSD', defaultSpecTag: 'Gen 4.0 x4', item: HARDWARE_CATALOG.ssd[0] },
      { key: 'vga', number: '05', categoryName: 'Card đồ họa / VGA', defaultSpecTag: 'Length 305mm', item: HARDWARE_CATALOG.vga[0] },
      { key: 'psu', number: '06', categoryName: 'Nguồn máy tính / PSU', defaultSpecTag: '850W Gold ATX3.0', item: HARDWARE_CATALOG.psu[0] },
      { key: 'cooling', number: '07', categoryName: 'Tản nhiệt CPU / Cooling', defaultSpecTag: 'Radiator 360mm', item: HARDWARE_CATALOG.cooling[0] },
      { key: 'case', number: '08', categoryName: 'Vỏ máy tính / Case', defaultSpecTag: 'Max GPU 455mm', item: HARDWARE_CATALOG.case[0] },
    ]);
  }

  private applyAmdPreset(): void {
    this.bomSlots.set([
      { key: 'cpu', number: '01', categoryName: 'Vi xử lý / CPU', defaultSpecTag: 'AM5', item: HARDWARE_CATALOG.cpu[3] },
      { key: 'mainboard', number: '02', categoryName: 'Bo mạch chủ / Mainboard', defaultSpecTag: 'Socket AM5', item: HARDWARE_CATALOG.mainboard[2] },
      { key: 'ram', number: '03', categoryName: 'Bộ nhớ trong / RAM', defaultSpecTag: 'DDR5 Dual Channel', item: HARDWARE_CATALOG.ram[1] },
      { key: 'ssd', number: '04', categoryName: 'Ổ cứng thể rắn / SSD', defaultSpecTag: 'Gen 4.0 x4', item: HARDWARE_CATALOG.ssd[1] },
      { key: 'vga', number: '05', categoryName: 'Card đồ họa / VGA', defaultSpecTag: 'Length 338mm', item: HARDWARE_CATALOG.vga[2] },
      { key: 'psu', number: '06', categoryName: 'Nguồn máy tính / PSU', defaultSpecTag: '1000W Gold', item: HARDWARE_CATALOG.psu[1] },
      { key: 'cooling', number: '07', categoryName: 'Tản nhiệt CPU / Cooling', defaultSpecTag: 'Radiator 360mm', item: HARDWARE_CATALOG.cooling[1] },
      { key: 'case', number: '08', categoryName: 'Vỏ máy tính / Case', defaultSpecTag: 'Max GPU 365mm', item: HARDWARE_CATALOG.case[1] },
    ]);
  }

  protected clearSlot(key: BomCategory): void {
    this.bomSlots.update((slots) =>
      slots.map((s) => (s.key === key ? { ...s, item: null } : s))
    );
  }

  protected openSwapModal(slot: BomSlot): void {
    this.currentModalCategoryKey.set(slot.key);
    this.currentModalCategoryName.set(slot.categoryName);
    this.currentModalSlot.set({
      slotKey: slot.key,
      slotName: slot.categoryName,
      item: slot.item,
    });

    const items = HARDWARE_CATALOG[slot.key] || [];
    this.currentModalAvailableItems.set(items);
    this.swapModalOpen.set(true);
  }

  protected onComponentSelected(item: SwapItem): void {
    const categoryKey = this.currentModalCategoryKey() as BomCategory;
    this.bomSlots.update((slots) =>
      slots.map((s) => (s.key === categoryKey ? { ...s, item } : s))
    );
  }

  protected printQuotation(): void {
    window.print();
  }

  protected shareLink(): void {
    const url = window.location.href;
    void navigator.clipboard.writeText(url);
    this.linkCopied.set(true);
    setTimeout(() => this.linkCopied.set(false), 3000);
  }

  protected async proceedToCheckout(): Promise<void> {
    await this.packageAndSendToCart();
    void this.router.navigate(['/checkout']);
  }

  protected async addToCartWhole(): Promise<void> {
    await this.packageAndSendToCart();
    this.cart.openDrawer();
  }

  private async packageAndSendToCart(): Promise<void> {
    const activeSlots = this.bomSlots().filter((s) => s.item !== null);
    if (activeSlots.length === 0) return;

    this.adding.set(true);
    try {
      const items = activeSlots.map((s) => ({
        skuId: s.item!.skuId,
        quantity: 1,
      }));

      const buildName =
        this.activePreset() === 'intel'
          ? 'EL-TECH Custom Intel Core i7 Gaming PC'
          : 'EL-TECH Custom AMD Ryzen 7 9800X3D PC';

      await this.cart.addBuild({
        buildName,
        buildType: 'CUSTOM',
        items,
        hasAssemblyService: true,
      });
    } finally {
      this.adding.set(false);
    }
  }
}
