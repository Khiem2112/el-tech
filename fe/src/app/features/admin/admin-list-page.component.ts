import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AppIconModule } from '../../components/atoms';

type ListRow = { code: string; name: string; meta: string; value: string; status: string; tone: string };

@Component({ selector: 'app-admin-list-page', imports: [AppIconModule], templateUrl: './admin-list-page.component.html', styleUrl: './admin-list-page.component.css', changeDetection: ChangeDetectionStrategy.OnPush })
export class AdminListPageComponent {
  readonly title = input('Danh sách dữ liệu');
  readonly description = input('Tra cứu và quản lý dữ liệu vận hành.');
  readonly eyebrow = input('OPERATIONS');
  readonly actionLabel = input('Tạo mới');
  readonly rows = input<readonly ListRow[]>([]);
}
