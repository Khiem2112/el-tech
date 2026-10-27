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
        <h2 class="text-xs font-bold uppercase tracking-wider text-muted">
          Báo Cáo &amp; Phân Tích BI
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          [routerLink]="['/admin/orders']"
          class="bg-surface border border-line hover:border-primary/60 rounded-lg p-4 block group transition-colors"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-muted uppercase tracking-wider group-hover:text-primary transition-colors">
              Báo Cáo Doanh Thu
            </span>
            <span class="text-xs font-bold text-primary tabular-nums">+14.2%</span>
          </div>
          <div class="text-2xl font-bold text-foreground mt-2 tabular-nums">
            1.845.200.000 đ
          </div>
          <div class="text-xs text-muted mt-1 tabular-nums">
            VietQR 72% &bull; Biên lợi nhuận gộp 18.5%
          </div>
          <div class="mt-3 text-xs font-semibold text-primary group-hover:underline flex items-center gap-1">
            <span>Xem chi tiết doanh số</span>
            <lucide-icon name="arrow-right" class="w-3.5 h-3.5" aria-hidden="true"></lucide-icon>
          </div>
        </a>

        <a
          [routerLink]="['/admin/catalog/templates']"
          class="bg-surface border border-line hover:border-primary/60 rounded-lg p-4 block group transition-colors"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-muted uppercase tracking-wider group-hover:text-primary transition-colors">
              Cơ Cấu Sản Phẩm
            </span>
            <span class="text-xs font-bold text-primary tabular-nums">+8.6%</span>
          </div>
          <div class="text-2xl font-bold text-foreground mt-2 tabular-nums">
            62% Bán Lẻ / 38% PC Build
          </div>
          <div class="text-xs text-muted mt-1 tabular-nums">
            VGA &amp; CPU dẫn đầu &bull; ASUS đóng góp 21.4%
          </div>
          <div class="mt-3 text-xs font-semibold text-primary group-hover:underline flex items-center gap-1">
            <span>Xem xếp hạng linh kiện</span>
            <lucide-icon name="arrow-right" class="w-3.5 h-3.5" aria-hidden="true"></lucide-icon>
          </div>
        </a>

        <a
          [routerLink]="['/admin/inventory/balances']"
          class="bg-surface border border-line hover:border-primary/60 rounded-lg p-4 block group transition-colors"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-muted uppercase tracking-wider group-hover:text-primary transition-colors">
              Tốc Độ Vòng Quay Kho
            </span>
            <span class="text-xs font-bold text-primary tabular-nums">+0.4x</span>
          </div>
          <div class="text-2xl font-bold text-foreground mt-2 tabular-nums">
            4.2x / năm
          </div>
          <div class="text-xs text-muted mt-1 tabular-nums">
            Giá trị kho 4.28 tỷ đ &bull; Luân chuyển 14.2h
          </div>
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
