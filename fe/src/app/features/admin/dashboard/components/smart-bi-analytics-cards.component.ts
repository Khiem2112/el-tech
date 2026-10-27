import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppIconModule } from '../../../../components/atoms/icon/icon.module';

@Component({
  selector: 'app-smart-bi-analytics-cards',
  standalone: true,
  imports: [CommonModule, RouterModule, AppIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-xs font-bold uppercase tracking-wider text-foreground">
          Báo Cáo &amp; Phân Tích
        </h2>
        <span class="text-xs text-muted">Điều hướng nhanh sang màn hình phân tích số liệu</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          [routerLink]="['/admin/orders']"
          class="bg-surface border border-line hover:border-primary rounded-lg p-5 shadow-xs block group transition-all"
        >
          <div class="text-xs font-bold uppercase text-muted group-hover:text-primary transition-colors">
            Báo Cáo Doanh Thu
          </div>
          <div class="text-xl font-bold text-foreground mt-2 tabular-nums">
            1.845.200.000 đ
          </div>
          <p class="text-xs text-muted mt-1 leading-relaxed">
            Tỷ trọng thanh toán qua VietQR đạt 72%, lợi nhuận gộp biên 18.5%
          </p>
          <div class="mt-3 text-xs font-semibold text-primary group-hover:underline flex items-center gap-1">
            <span>Xem chi tiết doanh số</span>
            <lucide-icon name="arrow-right" class="w-3.5 h-3.5" aria-hidden="true"></lucide-icon>
          </div>
        </a>

        <a
          [routerLink]="['/admin/catalog/templates']"
          class="bg-surface border border-line hover:border-primary rounded-lg p-5 shadow-xs block group transition-all"
        >
          <div class="text-xs font-bold uppercase text-muted group-hover:text-primary transition-colors">
            Phân Tích Sản Phẩm
          </div>
          <div class="text-xl font-bold text-foreground mt-2">
            VGA &amp; CPU Dẫn Đầu
          </div>
          <p class="text-xs text-muted mt-1 leading-relaxed">
            Tỷ lệ bán lẻ 62% so với PC Builder 38%, ASUS đóng góp 21.4% lãi
          </p>
          <div class="mt-3 text-xs font-semibold text-primary group-hover:underline flex items-center gap-1">
            <span>Xem xếp hạng linh kiện</span>
            <lucide-icon name="arrow-right" class="w-3.5 h-3.5" aria-hidden="true"></lucide-icon>
          </div>
        </a>

        <a
          [routerLink]="['/admin/inventory/balances']"
          class="bg-surface border border-line hover:border-primary rounded-lg p-5 shadow-xs block group transition-all"
        >
          <div class="text-xs font-bold uppercase text-muted group-hover:text-primary transition-colors">
            Báo Cáo Tồn Kho
          </div>
          <div class="text-xl font-bold text-foreground mt-2 tabular-nums">
            Vòng Quay 4.2x/năm
          </div>
          <p class="text-xs text-muted mt-1 leading-relaxed">
            4.28 tỷ hàng hóa lưu kho, tốc độ điều chuyển nội bộ 14.2 giờ
          </p>
          <div class="mt-3 text-xs font-semibold text-primary group-hover:underline flex items-center gap-1">
            <span>Xem luân chuyển kho</span>
            <lucide-icon name="arrow-right" class="w-3.5 h-3.5" aria-hidden="true"></lucide-icon>
          </div>
        </a>
      </div>
    </div>
  `,
})
export class SmartBiAnalyticsCardsComponent {}
