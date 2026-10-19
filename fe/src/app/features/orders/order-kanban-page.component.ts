import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VndPipe } from '../../lib/vnd.pipe';
import { ButtonDirective } from '../../components/atoms/button/button.directive';
import { BadgeDirective } from '../../components/atoms/badge/badge.directive';
import { InputDirective } from '../../components/atoms/input/input.directive';
import { AppIconModule } from '../../components/atoms/icon/icon.module';

type KanbanOrderType = 'pc' | 'parts' | 'workstation';
type KanbanBranch = 'hcm' | 'hn' | 'delivery';
type KanbanStage = 'pending' | 'preparing' | 'assembling' | 'ready' | 'completed';

type KanbanOrder = {
  id: string;
  code: string;
  type: KanbanOrderType;
  typeName: string;
  title: string;
  subtitle: string;
  thumbnail: string;
  totalAmount: number;
  stage: KanbanStage;
  branch: KanbanBranch;
  branchName: string;
  createdAtText: string;
  technician: {
    initials: string;
    name: string;
  };
  highlight?: {
    type: 'warning' | 'info' | 'telemetry' | 'otp' | 'success';
    text: string;
    badge?: string;
    progress?: number;
    metrics?: { label: string; value: string }[];
  };
};

const INITIAL_KANBAN_ORDERS: KanbanOrder[] = [
  {
    id: '1',
    code: 'ELT-91024',
    type: 'pc',
    typeName: 'PC Custom Build',
    title: 'Custom Rig: Core Ultra 9 / RTX 5080 OC',
    subtitle: 'Z890 Dark Hero · 64GB DDR5 Dominator',
    thumbnail: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80',
    totalAmount: 36500000,
    stage: 'pending',
    branch: 'hn',
    branchName: 'Hub 45 Thái Hà, Hà Nội',
    createdAtText: '14:22 · Hôm nay',
    technician: { initials: 'VH', name: 'Vũ Hoàng (Kỹ thuật)' },
    highlight: {
      type: 'warning',
      text: 'Cọc 10% VietQR: 3.650.000₫',
      badge: '17:48',
    },
  },
  {
    id: '2',
    code: 'ELT-91105',
    type: 'parts',
    typeName: 'Linh kiện lẻ',
    title: 'Màn hình LG 27GP850-B Nano IPS',
    subtitle: 'QHD 2K 180Hz 1ms G-Sync Compatible',
    thumbnail: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=400&q=80',
    totalAmount: 7490000,
    stage: 'pending',
    branch: 'delivery',
    branchName: 'Giao hỏa tốc 2H (Nội thành)',
    createdAtText: '11:05 · Hôm nay',
    technician: { initials: 'HN', name: 'Kho Hà Nội' },
    highlight: {
      type: 'info',
      text: 'COD · Kỹ thuật đang kiểm đếm tồn kho tại kho Thái Hà.',
    },
  },
  {
    id: '3',
    code: 'ELT-89820',
    type: 'parts',
    typeName: 'Combo Nâng Cấp',
    title: 'Main ASUS ROG Z790-E + RAM 64GB',
    subtitle: 'Corsair Dominator Titanium 6000MHz White',
    thumbnail: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=400&q=80',
    totalAmount: 19250000,
    stage: 'preparing',
    branch: 'hcm',
    branchName: 'Hub 280 Ba Tháng Hai, TP.HCM',
    createdAtText: 'Hôm qua, 18:20',
    technician: { initials: 'MN', name: 'Minh Nhật (Thủ kho)' },
    highlight: {
      type: 'telemetry',
      text: 'Quét tem Serial & BH (2/2 kiện)',
      progress: 100,
      badge: 'SN-ASUS-99120',
    },
  },
  {
    id: '4',
    code: 'ELT-89552',
    type: 'workstation',
    typeName: 'Workstation AI',
    title: 'Trạm AI: i9-14900K / RTX 4090 24G',
    subtitle: 'Tản Custom EKWB · Nguồn Corsair 1200W',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
    totalAmount: 98500000,
    stage: 'assembling',
    branch: 'hcm',
    branchName: 'Hub 280 Ba Tháng Hai, TP.HCM',
    createdAtText: '2 ngày trước',
    technician: { initials: 'TN', name: 'Trần Nam (Lead Tech)' },
    highlight: {
      type: 'telemetry',
      text: 'STRESS TEST 24H: 75% (18/24h)',
      progress: 75,
      metrics: [
        { label: 'Cinebench R23', value: '39,810 pts (78°C)' },
        { label: 'Furmark GPU', value: 'Pass 100% (64°C)' },
      ],
    },
  },
  {
    id: '5',
    code: 'ELT-88910',
    type: 'pc',
    typeName: 'PC Custom Build',
    title: 'PC Gaming RTX 4070 Ti Super / Ryzen 7 7800X3D',
    subtitle: 'NZXT H9 Flow White · Tản nước Kraken Elite 360',
    thumbnail: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=400&q=80',
    totalAmount: 48900000,
    stage: 'ready',
    branch: 'hn',
    branchName: 'Hub 45 Thái Hà, Hà Nội',
    createdAtText: '3 ngày trước',
    technician: { initials: 'LP', name: 'Lê Phúc' },
    highlight: {
      type: 'otp',
      text: 'Mã OTP nhận tại quầy: OTP-981240',
      badge: 'Sẵn sàng nhận',
    },
  },
  {
    id: '6',
    code: 'ELT-87621',
    type: 'pc',
    typeName: 'PC Custom Build',
    title: 'PC Gaming eSports: Core i5-14400F / RTX 4060',
    subtitle: 'B760M Aorus Elite · 32GB Kingston Fury Beast',
    thumbnail: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=400&q=80',
    totalAmount: 22800000,
    stage: 'completed',
    branch: 'delivery',
    branchName: 'Đã giao hỏa tốc thành công',
    createdAtText: '5 ngày trước',
    technician: { initials: 'DQ', name: 'Đoàn Quân' },
    highlight: {
      type: 'success',
      text: 'Đã kích hoạt bảo hành điện tử 36 tháng',
    },
  },
];

@Component({
  selector: 'app-order-kanban-page',
  imports: [NgTemplateOutlet, FormsModule, RouterLink, VndPipe, ButtonDirective, BadgeDirective, InputDirective, AppIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <!-- Breadcrumb & Top Bar -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-line">
        <div>
          <nav class="text-xs text-muted mb-1">
            <a routerLink="/" class="hover:text-foreground">Trang chủ</a> / 
            <span class="text-foreground font-bold">Tiến độ đơn hàng</span>
          </nav>
          <h1 class="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Theo Dõi Tiến Độ Lắp Ráp & Giao Hàng
          </h1>
          <p class="text-xs text-muted mt-1">
            Bảng điều phối Kanban thời gian thực 5 giai đoạn: từ xác nhận, chuẩn bị seal, test tải đến sẵn sàng giao nhận.
          </p>
        </div>

        <!-- Quick Status Metrics & View Switcher -->
        <div class="flex items-center gap-3 flex-wrap">
          <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-alt border border-line">
            <span class="size-2 rounded-full bg-primary animate-pulse"></span>
            <span class="text-xs font-bold text-foreground">{{ activeOrdersCount() }} đơn hàng đang xử lý</span>
          </div>

          <!-- View Mode Toggle -->
          <div class="flex items-center bg-surface-alt p-1 rounded-lg border border-line">
            <button
              type="button"
              class="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all"
              [class.bg-surface]="viewMode() === 'kanban'"
              [class.shadow-sm]="viewMode() === 'kanban'"
              [class.text-foreground]="viewMode() === 'kanban'"
              [class.text-muted]="viewMode() !== 'kanban'"
              (click)="viewMode.set('kanban')"
            >
              <lucide-icon name="LayoutGrid" class="size-3.5" aria-hidden="true"></lucide-icon>
              <span>Kanban</span>
            </button>
            <button
              type="button"
              class="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all"
              [class.bg-surface]="viewMode() === 'list'"
              [class.shadow-sm]="viewMode() === 'list'"
              [class.text-foreground]="viewMode() === 'list'"
              [class.text-muted]="viewMode() !== 'list'"
              (click)="viewMode.set('list')"
            >
              <lucide-icon name="List" class="size-3.5" aria-hidden="true"></lucide-icon>
              <span>Danh sách</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Quick Filter Strip -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 bg-surface-alt p-3.5 rounded-xl border border-line">
        <!-- Search Input -->
        <div class="lg:col-span-5 relative flex items-center">
          <input
            appInput
            class="w-full text-xs font-medium pl-8"
            [(ngModel)]="searchQuery"
            placeholder="Nhập mã đơn (VD: ELT-91024, ELT-89552)..."
          >
          <lucide-icon name="Search" class="size-4 text-muted absolute left-2.5 pointer-events-none" aria-hidden="true"></lucide-icon>
        </div>

        <!-- Type Select -->
        <div class="lg:col-span-3">
          <select
            appInput
            class="w-full text-xs font-medium"
            [(ngModel)]="selectedType"
          >
            <option value="all">Tất cả loại đơn</option>
            <option value="pc">PC Custom Build</option>
            <option value="parts">Linh kiện rời</option>
            <option value="workstation">Workstation & AI Server</option>
          </select>
        </div>

        <!-- Branch Select -->
        <div class="lg:col-span-3">
          <select
            appInput
            class="w-full text-xs font-medium"
            [(ngModel)]="selectedBranch"
          >
            <option value="all">Tất cả chi nhánh & Hub</option>
            <option value="hcm">Hub TP.HCM (280 3/2, Q.10)</option>
            <option value="hn">Hub Hà Nội (45 Thái Hà)</option>
            <option value="delivery">Giao tận nơi (Hỏa tốc 2H)</option>
          </select>
        </div>

        <!-- Refresh Button -->
        <div class="lg:col-span-1 flex items-center">
          <button
            type="button"
            appButton
            variant="outline"
            size="sm"
            class="w-full"
            title="Làm mới bảng"
            (click)="resetFilters()"
          >
            <lucide-icon name="RefreshCw" class="size-3.5" aria-hidden="true"></lucide-icon>
          </button>
        </div>
      </div>

      <!-- KANBAN VIEW -->
      @if (viewMode() === 'kanban') {
        <div class="w-full overflow-x-auto pb-6">
          <div class="min-w-[1240px] grid grid-cols-5 gap-4 items-start">
            <!-- Stage 1: Chờ TT & Xác nhận -->
            <div class="flex flex-col bg-surface-alt/70 p-3 rounded-xl border border-line min-h-[640px]">
              <div class="flex items-center justify-between px-2 py-1.5 mb-3 border-b border-line-dark/60">
                <div class="flex items-center gap-2">
                  <span class="size-2.5 rounded-full bg-warning"></span>
                  <span class="text-xs font-bold text-foreground">Chờ TT & Xác nhận</span>
                </div>
                <span class="px-2 py-0.5 rounded-full bg-surface text-warning font-bold text-[10px] border border-line">
                  {{ pendingOrders().length }} đơn
                </span>
              </div>
              <div class="flex flex-col gap-3">
                @for (item of pendingOrders(); track item.id) {
                  <ng-container *ngTemplateOutlet="cardTemplate; context: { $implicit: item }"></ng-container>
                }
              </div>
            </div>

            <!-- Stage 2: Chuẩn bị linh kiện -->
            <div class="flex flex-col bg-surface-alt/70 p-3 rounded-xl border border-line min-h-[640px]">
              <div class="flex items-center justify-between px-2 py-1.5 mb-3 border-b border-line-dark/60">
                <div class="flex items-center gap-2">
                  <span class="size-2.5 rounded-full bg-slate-400"></span>
                  <span class="text-xs font-bold text-foreground">Chuẩn bị linh kiện</span>
                </div>
                <span class="px-2 py-0.5 rounded-full bg-surface text-foreground font-bold text-[10px] border border-line">
                  {{ preparingOrders().length }} đơn
                </span>
              </div>
              <div class="flex flex-col gap-3">
                @for (item of preparingOrders(); track item.id) {
                  <ng-container *ngTemplateOutlet="cardTemplate; context: { $implicit: item }"></ng-container>
                }
              </div>
            </div>

            <!-- Stage 3: Lắp ráp & Stress Test -->
            <div class="flex flex-col bg-surface-alt/70 p-3 rounded-xl border border-line min-h-[640px]">
              <div class="flex items-center justify-between px-2 py-1.5 mb-3 border-b border-line-dark/60">
                <div class="flex items-center gap-2">
                  <span class="size-2.5 rounded-full bg-primary"></span>
                  <span class="text-xs font-bold text-foreground">Lắp ráp & Stress Test</span>
                </div>
                <span class="px-2 py-0.5 rounded-full bg-surface text-primary font-bold text-[10px] border border-line">
                  {{ assemblingOrders().length }} đơn
                </span>
              </div>
              <div class="flex flex-col gap-3">
                @for (item of assemblingOrders(); track item.id) {
                  <ng-container *ngTemplateOutlet="cardTemplate; context: { $implicit: item }"></ng-container>
                }
              </div>
            </div>

            <!-- Stage 4: Sẵn sàng giao / Hub -->
            <div class="flex flex-col bg-surface-alt/70 p-3 rounded-xl border border-line min-h-[640px]">
              <div class="flex items-center justify-between px-2 py-1.5 mb-3 border-b border-line-dark/60">
                <div class="flex items-center gap-2">
                  <span class="size-2.5 rounded-full bg-sky-500"></span>
                  <span class="text-xs font-bold text-foreground">Sẵn sàng / Hub</span>
                </div>
                <span class="px-2 py-0.5 rounded-full bg-surface text-sky-500 font-bold text-[10px] border border-line">
                  {{ readyOrders().length }} đơn
                </span>
              </div>
              <div class="flex flex-col gap-3">
                @for (item of readyOrders(); track item.id) {
                  <ng-container *ngTemplateOutlet="cardTemplate; context: { $implicit: item }"></ng-container>
                }
              </div>
            </div>

            <!-- Stage 5: Hoàn tất -->
            <div class="flex flex-col bg-surface-alt/70 p-3 rounded-xl border border-line min-h-[640px]">
              <div class="flex items-center justify-between px-2 py-1.5 mb-3 border-b border-line-dark/60">
                <div class="flex items-center gap-2">
                  <span class="size-2.5 rounded-full bg-primary"></span>
                  <span class="text-xs font-bold text-foreground">Hoàn tất</span>
                </div>
                <span class="px-2 py-0.5 rounded-full bg-surface text-primary font-bold text-[10px] border border-line">
                  {{ completedOrders().length }} đơn
                </span>
              </div>
              <div class="flex flex-col gap-3">
                @for (item of completedOrders(); track item.id) {
                  <ng-container *ngTemplateOutlet="cardTemplate; context: { $implicit: item }"></ng-container>
                }
              </div>
            </div>
          </div>
        </div>
      } @else {
        <!-- LIST VIEW -->
        <div class="bg-surface rounded-xl border border-line divide-y divide-border overflow-hidden shadow-sm">
          @for (item of filteredOrders(); track item.id) {
            <div class="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div class="flex items-center gap-3 min-w-0">
                <img
                  [src]="item.thumbnail"
                  [alt]="item.title"
                  class="size-14 rounded-md object-cover border border-line shrink-0"
                >
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-xs font-bold text-foreground">#{{ item.code }}</span>
                    <span appBadge variant="outline" class="text-[10px]">{{ item.typeName }}</span>
                    <span class="text-[10px] text-muted">{{ item.branchName }}</span>
                  </div>
                  <h4 class="text-xs font-bold text-foreground truncate mt-0.5">{{ item.title }}</h4>
                  <p class="text-[11px] text-muted truncate">{{ item.subtitle }}</p>
                </div>
              </div>

              <div class="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                <div class="text-right">
                  <span class="text-[10px] text-muted block uppercase font-bold">Tổng thanh toán</span>
                  <span class="font-bold text-xs text-primary tabular">{{ item.totalAmount | vnd }}</span>
                </div>
                <a
                  routerLink="/tra-cuu-don"
                  appButton
                  variant="outline"
                  size="sm"
                >
                  <span>Chi tiết</span>
                  <lucide-icon name="ChevronRight" class="size-3.5" aria-hidden="true"></lucide-icon>
                </a>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <!-- Reusable Kanban Card Template -->
    <ng-template #cardTemplate let-item>
      <div class="bg-surface rounded-xl p-3.5 border border-line shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group space-y-2.5">
        <!-- Top Status Indicator -->
        <div class="flex items-center justify-between text-[11px]">
          <span class="font-mono font-bold text-foreground bg-surface-alt px-2 py-0.5 rounded border border-line">
            #{{ item.code }}
          </span>
          <span class="text-muted text-[10px]">{{ item.createdAtText }}</span>
        </div>

        <!-- Thumbnail & Specs -->
        <div class="flex items-start gap-2.5">
          <img
            [src]="item.thumbnail"
            [alt]="item.title"
            class="size-12 rounded-lg object-cover bg-surface-alt shrink-0 border border-line"
          >
          <div class="min-w-0 flex-1">
            <span class="inline-block px-1.5 py-0.5 rounded bg-surface-alt text-muted text-[9px] font-bold uppercase tracking-wider mb-0.5">
              {{ item.typeName }}
            </span>
            <h4 class="text-xs font-bold text-foreground truncate leading-tight">{{ item.title }}</h4>
            <p class="text-[10px] text-muted truncate mt-0.5">{{ item.subtitle }}</p>
          </div>
        </div>

        <!-- Context Highlight Block -->
        @if (item.highlight; as hl) {
          @if (hl.type === 'warning') {
            <div class="bg-warning/10 border border-amber-500/20 p-2 rounded-lg flex items-center justify-between text-[10px] text-warning font-bold">
              <span>{{ hl.text }}</span>
              @if (hl.badge) {
                <span class="font-mono bg-surface px-1.5 py-0.5 rounded shadow-xs text-foreground">{{ hl.badge }}</span>
              }
            </div>
          } @else if (hl.type === 'telemetry') {
            <div class="bg-surface-dark text-white p-2.5 rounded-lg text-[10px] space-y-1.5 font-mono">
              <div class="flex items-center justify-between text-primary">
                <span>{{ hl.text }}</span>
                @if (hl.progress) {
                  <span class="text-white font-bold">{{ hl.progress }}%</span>
                }
              </div>
              @if (hl.progress) {
                <div class="w-full h-1 bg-line-dark rounded-full overflow-hidden">
                  <div class="h-full bg-primary rounded-full" [style.width.%]="hl.progress"></div>
                </div>
              }
              @if (hl.metrics) {
                <div class="grid grid-cols-2 gap-1 pt-1 border-t border-line-dark text-[9px] text-muted">
                  @for (m of hl.metrics; track m.label) {
                    <div>
                      <span class="block text-slate-500">{{ m.label }}</span>
                      <strong class="text-slate-200">{{ m.value }}</strong>
                    </div>
                  }
                </div>
              }
            </div>
          } @else if (hl.type === 'otp') {
            <div class="bg-sky-500/10 border border-sky-500/20 p-2 rounded-lg text-[10px] text-sky-500 font-bold flex items-center justify-between">
              <span>{{ hl.text }}</span>
              <span class="bg-surface text-foreground px-1.5 py-0.5 rounded text-[9px]">{{ hl.badge }}</span>
            </div>
          } @else if (hl.type === 'success') {
            <div class="bg-primary/10 border border-primary/20 p-2 rounded-lg text-[10px] text-primary font-bold flex items-center gap-1.5">
              <lucide-icon name="ShieldCheck" class="size-3.5 shrink-0" aria-hidden="true"></lucide-icon>
              <span>{{ hl.text }}</span>
            </div>
          } @else {
            <div class="bg-surface-alt p-2 rounded-lg text-[10px] text-muted">
              {{ hl.text }}
            </div>
          }
        }

        <!-- Technician & Branch Details -->
        <div class="flex items-center justify-between pt-1 border-t border-line text-[10px]">
          <div>
            <span class="text-muted block text-[9px]">Tổng thanh toán</span>
            <span class="font-bold text-xs text-foreground tabular">{{ item.totalAmount | vnd }}</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="size-6 rounded-full bg-surface-alt border border-line flex items-center justify-center font-bold text-[10px] text-foreground" [title]="item.technician.name">
              {{ item.technician.initials }}
            </span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="grid grid-cols-2 gap-2 pt-1">
          <a
            routerLink="/tra-cuu-don"
            appButton
            variant="outline"
            size="sm"
            class="text-[11px] h-7 px-2"
          >
            Chi tiết
          </a>
          @if (item.stage === 'pending') {
            <a
              routerLink="/tra-cuu-don"
              appButton
              variant="primary"
              size="sm"
              class="text-[11px] h-7 px-2"
            >
              <lucide-icon name="QrCode" class="size-3" aria-hidden="true"></lucide-icon>
              <span>VietQR</span>
            </a>
          } @else {
            <a
              routerLink="/tra-cuu-don"
              appButton
              variant="secondary"
              size="sm"
              class="text-[11px] h-7 px-2"
            >
              <span>Nhật ký</span>
            </a>
          }
        </div>
      </div>
    </ng-template>
  `,
})
export class OrderKanbanPageComponent {
  protected readonly viewMode = signal<'kanban' | 'list'>('kanban');
  protected searchQuery = '';
  protected selectedType = 'all';
  protected selectedBranch = 'all';

  private readonly orders = signal<KanbanOrder[]>(INITIAL_KANBAN_ORDERS);

  protected readonly filteredOrders = computed(() => {
    const q = this.searchQuery.trim().toLowerCase();
    const type = this.selectedType;
    const branch = this.selectedBranch;

    return this.orders().filter((order) => {
      if (q && !order.code.toLowerCase().includes(q) && !order.title.toLowerCase().includes(q)) {
        return false;
      }
      if (type !== 'all' && order.type !== type) {
        return false;
      }
      if (branch !== 'all' && order.branch !== branch) {
        return false;
      }
      return true;
    });
  });

  protected readonly pendingOrders = computed(() => this.filteredOrders().filter((o) => o.stage === 'pending'));
  protected readonly preparingOrders = computed(() => this.filteredOrders().filter((o) => o.stage === 'preparing'));
  protected readonly assemblingOrders = computed(() => this.filteredOrders().filter((o) => o.stage === 'assembling'));
  protected readonly readyOrders = computed(() => this.filteredOrders().filter((o) => o.stage === 'ready'));
  protected readonly completedOrders = computed(() => this.filteredOrders().filter((o) => o.stage === 'completed'));

  protected readonly activeOrdersCount = computed(() => {
    return this.filteredOrders().filter((o) => o.stage !== 'completed').length;
  });

  protected resetFilters(): void {
    this.searchQuery = '';
    this.selectedType = 'all';
    this.selectedBranch = 'all';
  }
}
