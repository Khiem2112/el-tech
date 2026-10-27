import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-smart-bi-analytics-cards',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 bg-primary rounded-full"></span>
          <h2 class="text-xs font-bold uppercase tracking-wider text-foreground">
            Báo Cáo & Phân Tích Thông Minh
          </h2>
        </div>
        <span class="text-xs text-muted">Điều hướng nhanh sang các màn hình phân tích kinh doanh</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          [routerLink]="['/admin/orders']"
          class="bg-surface border border-line hover:border-primary rounded-lg p-5 shadow-xs block group transition-all"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase text-muted group-hover:text-primary transition-colors">
              Báo Cáo Doanh Thu
            </span>
            <span class="text-xs font-mono px-1.5 py-0.5 rounded bg-surface-alt font-bold text-foreground">
              BI-01
            </span>
          </div>
          <div class="text-xl font-bold text-foreground mt-2 tabular-nums">
            1.845.200.000 đ
          </div>
          <p class="text-xs text-muted mt-1 leading-relaxed">
            Tỷ trọng thanh toán qua VietQR đạt 72%, lợi nhuận gộp biên 18.5%
          </p>
          <div class="mt-3 text-xs font-semibold text-primary group-hover:underline">
            Xem chi tiết doanh số &rarr;
          </div>
        </a>

        <a
          [routerLink]="['/admin/catalog/templates']"
          class="bg-surface border border-line hover:border-primary rounded-lg p-5 shadow-xs block group transition-all"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase text-muted group-hover:text-primary transition-colors">
              Phân Tích Sản Phẩm
            </span>
            <span class="text-xs font-mono px-1.5 py-0.5 rounded bg-surface-alt font-bold text-foreground">
              BI-02
            </span>
          </div>
          <div class="text-xl font-bold text-foreground mt-2">
            VGA & CPU Dẫn Đầu
          </div>
          <p class="text-xs text-muted mt-1 leading-relaxed">
            Tỷ lệ bán lẻ 62% so với PC Builder 38%, ASUS đóng góp 21.4% lãi
          </p>
          <div class="mt-3 text-xs font-semibold text-primary group-hover:underline">
            Xem xếp hạng linh kiện &rarr;
          </div>
        </a>

        <a
          [routerLink]="['/admin/inventory/balances']"
          class="bg-surface border border-line hover:border-primary rounded-lg p-5 shadow-xs block group transition-all"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase text-muted group-hover:text-primary transition-colors">
              Báo Cáo Tồn Kho
            </span>
            <span class="text-xs font-mono px-1.5 py-0.5 rounded bg-surface-alt font-bold text-foreground">
              BI-03
            </span>
          </div>
          <div class="text-xl font-bold text-foreground mt-2 tabular-nums">
            Vòng Quay 4.2x/năm
          </div>
          <p class="text-xs text-muted mt-1 leading-relaxed">
            4.28 tỷ hàng hóa lưu kho, tốc độ điều chuyển nội bộ 14.2 giờ
          </p>
          <div class="mt-3 text-xs font-semibold text-primary group-hover:underline">
            Xem luân chuyển kho &rarr;
          </div>
        </a>
      </div>
    </div>
  `,
})
export class SmartBiAnalyticsCardsComponent {}
