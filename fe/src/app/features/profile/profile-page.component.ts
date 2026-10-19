import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ButtonDirective } from '../../components/atoms/button/button.directive';
import { BadgeDirective } from '../../components/atoms/badge/badge.directive';
import { InputDirective } from '../../components/atoms/input/input.directive';
import { AppIconModule } from '../../components/atoms/icon/icon.module';

@Component({
  selector: 'app-profile-page',
  imports: [FormsModule, RouterLink, ButtonDirective, BadgeDirective, InputDirective, AppIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full bg-canvas min-h-screen py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <!-- Breadcrumb & Top Indicator -->
        <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border text-xs">
          <nav class="flex items-center gap-1.5 text-muted">
            <a routerLink="/" class="hover:text-foreground">Trang chủ</a>
            <lucide-icon name="ChevronRight" class="size-3 text-muted" aria-hidden="true"></lucide-icon>
            <span class="text-foreground font-bold">Tài khoản & Bảo mật</span>
          </nav>
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[10px] border border-primary/20">
              <span class="size-1.5 rounded-full bg-primary animate-pulse"></span>
              Bảo mật 2 bước: Đang bật
            </span>
            <span class="text-[11px] text-muted">Lần đăng nhập cuối: 09:42 Hôm nay</span>
          </div>
        </div>

        <!-- Main 2-Column Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <!-- Sidebar Navigation (4 cols) -->
          <aside class="lg:col-span-4 xl:col-span-3 flex flex-col gap-5 sticky top-24">
            
            <!-- User Summary Card -->
            <div class="bg-surface rounded-xl p-5 border border-border shadow-xs space-y-4">
              <div class="flex items-center gap-3.5">
                <div class="relative shrink-0">
                  <div class="size-14 rounded-xl overflow-hidden bg-surface-alt border border-border">
                    <img
                      [src]="user()?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'"
                      alt="Ảnh đại diện"
                      class="size-full object-cover"
                    >
                  </div>
                  <span class="absolute -bottom-1 -right-1 size-5 rounded-full bg-primary flex items-center justify-center text-slate-950 font-bold shadow-xs">
                    <lucide-icon name="ShieldCheck" class="size-3" aria-hidden="true"></lucide-icon>
                  </span>
                </div>
                <div class="min-w-0 flex-1">
                  <h2 class="text-sm font-bold text-foreground truncate">{{ user()?.name || 'Khách hàng EL-TECH' }}</h2>
                  <p class="text-xs text-muted truncate">{{ user()?.email || 'customer@eltech.vn' }}</p>
                  <p class="text-[11px] text-primary font-bold mt-0.5">{{ user()?.phone || '0988 234 567' }}</p>
                </div>
              </div>

              <!-- Membership Status Badge -->
              <div class="bg-surface-alt rounded-lg p-3 border border-border flex items-center justify-between">
                <div>
                  <span class="text-[10px] text-muted uppercase font-bold tracking-wider block">Hạng thành viên</span>
                  <span class="text-xs font-bold text-foreground">Pro Builder VIP</span>
                </div>
                <span appBadge variant="success" class="text-[10px] font-bold">Đã kích hoạt</span>
              </div>
            </div>

            <!-- Navigation Links -->
            <nav class="bg-surface rounded-xl p-2 border border-border shadow-xs flex flex-col gap-1 text-xs font-medium" aria-label="Menu tài khoản">
              <button
                type="button"
                class="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-primary text-slate-950 font-bold shadow-xs"
              >
                <div class="flex items-center gap-2.5">
                  <lucide-icon name="User" class="size-4" aria-hidden="true"></lucide-icon>
                  <span>Thông tin & Bảo mật</span>
                </div>
                <lucide-icon name="ChevronRight" class="size-4" aria-hidden="true"></lucide-icon>
              </button>

              <a
                routerLink="/tien-do-don"
                class="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-alt transition-colors"
              >
                <div class="flex items-center gap-2.5">
                  <lucide-icon name="Package" class="size-4" aria-hidden="true"></lucide-icon>
                  <span>Đơn hàng của tôi</span>
                </div>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  2 đơn
                </span>
              </a>

              <a
                routerLink="/tra-cuu-don"
                class="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-alt transition-colors"
              >
                <div class="flex items-center gap-2.5">
                  <lucide-icon name="Search" class="size-4" aria-hidden="true"></lucide-icon>
                  <span>Tra cứu nhận hàng</span>
                </div>
                <lucide-icon name="ChevronRight" class="size-4 text-muted" aria-hidden="true"></lucide-icon>
              </a>

              <a
                routerLink="/chinh-sach"
                class="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-alt transition-colors"
              >
                <div class="flex items-center gap-2.5">
                  <lucide-icon name="ShieldCheck" class="size-4" aria-hidden="true"></lucide-icon>
                  <span>Bảo hành & Đổi trả</span>
                </div>
                <lucide-icon name="ChevronRight" class="size-4 text-muted" aria-hidden="true"></lucide-icon>
              </a>

              <div class="my-1 h-px bg-border"></div>

              <button
                type="button"
                class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-danger hover:bg-danger/10 transition-colors text-left"
                (click)="handleLogout()"
              >
                <div class="flex items-center gap-2.5">
                  <lucide-icon name="RotateCcw" class="size-4" aria-hidden="true"></lucide-icon>
                  <span>Đăng xuất</span>
                </div>
              </button>
            </nav>

            <!-- Showroom Hub Telemetry Widget -->
            <div class="bg-slate-900 text-white rounded-xl p-4 border border-slate-800 shadow-xs space-y-1.5 text-xs">
              <div class="flex items-center justify-between">
                <span class="text-[10px] text-primary uppercase tracking-wider font-bold">Showroom gần nhất</span>
                <span class="size-2 rounded-full bg-primary animate-pulse"></span>
              </div>
              <p class="font-bold text-white">EL-TECH Q10 Hub</p>
              <p class="text-[11px] text-slate-400">280 Ba Tháng Hai, P.12, Q.10, TP.HCM</p>
              <div class="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span>Mở cửa: 08:30 - 21:30</span>
                <span class="text-primary font-bold">Cách 3.2km</span>
              </div>
            </div>

          </aside>

          <!-- Main Content Area (8 cols) -->
          <div class="lg:col-span-8 xl:col-span-9 flex flex-col gap-6 min-w-0">
            
            <!-- Active Order Tracker Card with Prominent OTP Pickup -->
            <section class="bg-surface rounded-xl p-5 sm:p-6 border border-border shadow-xs relative overflow-hidden space-y-5">
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div class="flex items-center gap-2 mb-1">
                    <span appBadge variant="outline" class="text-[10px] font-bold">Đơn hàng mới nhất</span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] bg-primary text-slate-950 font-bold flex items-center gap-1">
                      <span class="size-1.5 rounded-full bg-slate-950 animate-ping"></span>
                      Sẵn sàng nhận máy
                    </span>
                  </div>
                  <div class="flex items-baseline gap-2 flex-wrap">
                    <h3 class="text-xl font-black text-foreground tracking-tight">#ELT-89241</h3>
                    <span class="text-base font-bold text-primary tabular">54.200.000₫</span>
                    <span class="text-xs text-muted">· Đã cọc 100% VietQR</span>
                  </div>
                  <p class="text-xs text-muted mt-1 flex items-center gap-1.5">
                    <lucide-icon name="Store" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
                    <span>Điểm nhận máy: <strong class="text-foreground">Showroom 280 Ba Tháng Hai, P.12, Q.10, TP.HCM</strong></span>
                  </p>
                </div>

                <!-- Prominent OTP Pickup Box -->
                <div class="bg-slate-900 text-white px-5 py-3 rounded-xl border border-slate-800 flex flex-col items-center justify-center shadow-md">
                  <span class="text-[10px] text-slate-400 uppercase tracking-widest font-bold">OTP nhận máy</span>
                  <div class="flex items-center gap-1 text-2xl font-black text-primary font-mono tracking-wider my-0.5">
                    <span>489</span>
                    <span class="text-slate-600">-</span>
                    <span>102</span>
                  </div>
                  <span class="text-[10px] text-slate-400 flex items-center gap-1">
                    <lucide-icon name="QrCode" class="size-3 text-primary" aria-hidden="true"></lucide-icon>
                    <span>Xuất trình tại quầy Hub</span>
                  </span>
                </div>
              </div>

              <!-- Mini 4-Step Interactive Timeline -->
              <div class="bg-surface-alt rounded-xl p-4 border border-border">
                <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                  <!-- Step 1 -->
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <div class="size-6 rounded-full bg-primary text-slate-950 flex items-center justify-center font-bold text-xs">
                        <lucide-icon name="Check" class="size-3.5" aria-hidden="true"></lucide-icon>
                      </div>
                      <div class="h-1 flex-1 bg-primary rounded-full hidden sm:block"></div>
                    </div>
                    <p class="font-bold text-foreground">Đã xác nhận</p>
                    <p class="text-[10px] text-muted">14:20 - 24/10</p>
                    <span class="inline-block px-1.5 py-0.5 rounded text-[10px] bg-surface text-muted border border-border">
                      Tồn kho chính hãng
                    </span>
                  </div>

                  <!-- Step 2 -->
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <div class="size-6 rounded-full bg-primary text-slate-950 flex items-center justify-center font-bold text-xs">
                        <lucide-icon name="Check" class="size-3.5" aria-hidden="true"></lucide-icon>
                      </div>
                      <div class="h-1 flex-1 bg-primary rounded-full hidden sm:block"></div>
                    </div>
                    <p class="font-bold text-foreground">Soạn linh kiện</p>
                    <p class="text-[10px] text-muted">16:05 - 24/10</p>
                    <span class="inline-block px-1.5 py-0.5 rounded text-[10px] bg-surface text-muted border border-border">
                      Quét 7 Serial Barcode
                    </span>
                  </div>

                  <!-- Step 3 -->
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <div class="size-6 rounded-full bg-primary text-slate-950 flex items-center justify-center font-bold text-xs">
                        <lucide-icon name="Check" class="size-3.5" aria-hidden="true"></lucide-icon>
                      </div>
                      <div class="h-1 flex-1 bg-primary rounded-full hidden sm:block"></div>
                    </div>
                    <p class="font-bold text-foreground">Lắp ráp & Test</p>
                    <p class="text-[10px] text-primary font-bold">Đạt chuẩn 24h</p>
                    <span class="inline-block px-1.5 py-0.5 rounded text-[10px] bg-primary/15 text-primary font-bold">
                      FurMark: Max 64°C
                    </span>
                  </div>

                  <!-- Step 4 -->
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <div class="size-6 rounded-full bg-slate-950 text-primary border border-primary flex items-center justify-center font-bold text-xs">
                        4
                      </div>
                    </div>
                    <p class="font-bold text-foreground">Sẵn sàng nhận</p>
                    <p class="text-[10px] text-primary font-bold">Nhận ngay tại Hub</p>
                    <span class="inline-block px-1.5 py-0.5 rounded text-[10px] bg-primary text-slate-950 font-bold">
                      Đóng thùng hoàn tất
                    </span>
                  </div>
                </div>
              </div>

              <!-- Quick Action Links -->
              <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
                <a
                  routerLink="/tra-cuu-don"
                  appButton
                  variant="outline"
                  size="sm"
                >
                  <lucide-icon name="FileText" class="size-3.5" aria-hidden="true"></lucide-icon>
                  <span>Chi tiết đơn hàng</span>
                </a>
                <a
                  routerLink="/tien-do-don"
                  appButton
                  variant="primary"
                  size="sm"
                >
                  <span>Xem bảng tiến độ Kanban</span>
                  <lucide-icon name="ArrowRight" class="size-3.5" aria-hidden="true"></lucide-icon>
                </a>
              </div>
            </section>

            <!-- Hardware Metrics -->
            <section class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div class="bg-surface rounded-xl p-4 border border-border shadow-xs flex items-center gap-3">
                <div class="size-11 rounded-lg bg-surface-alt border border-border flex items-center justify-center text-primary shrink-0">
                  <lucide-icon name="Cpu" class="size-5" aria-hidden="true"></lucide-icon>
                </div>
                <div>
                  <span class="text-[10px] text-muted uppercase font-bold">Linh kiện đã mua</span>
                  <p class="text-lg font-black text-foreground">05 <span class="text-xs font-bold text-primary">Chính hãng</span></p>
                  <p class="text-[10px] text-muted">Bảo hành 36T 1-đổi-1</p>
                </div>
              </div>

              <div class="bg-surface rounded-xl p-4 border border-border shadow-xs flex items-center gap-3">
                <div class="size-11 rounded-lg bg-surface-alt border border-border flex items-center justify-center text-primary shrink-0">
                  <lucide-icon name="ShieldCheck" class="size-5" aria-hidden="true"></lucide-icon>
                </div>
                <div>
                  <span class="text-[10px] text-muted uppercase font-bold">Yêu cầu bảo hành</span>
                  <p class="text-lg font-black text-foreground">00 <span class="text-xs font-normal text-muted">Hồ sơ lỗi</span></p>
                  <p class="text-[10px] text-primary font-bold">Tỷ lệ ổn định 100%</p>
                </div>
              </div>

              <div class="bg-surface rounded-xl p-4 border border-border shadow-xs flex items-center gap-3">
                <div class="size-11 rounded-lg bg-surface-alt border border-border flex items-center justify-center text-amber-500 shrink-0">
                  <lucide-icon name="Wrench" class="size-5" aria-hidden="true"></lucide-icon>
                </div>
                <div>
                  <span class="text-[10px] text-muted uppercase font-bold">Kỹ thuật viên</span>
                  <p class="text-sm font-bold text-foreground">Lê Tuấn Vũ</p>
                  <p class="text-[10px] text-muted">Nhánh 104 · Hardware Lead</p>
                </div>
              </div>
            </section>

            <!-- Profile Form & Security Settings Section -->
            <section class="bg-surface rounded-xl p-5 sm:p-6 border border-border shadow-xs space-y-6">
              <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
                <div>
                  <h3 class="text-base font-bold text-foreground">Thông tin cá nhân & Bảo mật</h3>
                  <p class="text-xs text-muted">Quản lý định danh tài khoản, liên kết đăng nhập và địa chỉ giao hàng</p>
                </div>
                <button
                  type="button"
                  appButton
                  variant="primary"
                  size="sm"
                  (click)="saveProfileChanges()"
                >
                  <lucide-icon name="Check" class="size-3.5" aria-hidden="true"></lucide-icon>
                  <span>Lưu thay đổi</span>
                </button>
              </div>

              @if (saveSuccessMessage()) {
                <div class="p-3.5 rounded-lg bg-primary/10 border border-primary/30 text-xs font-bold text-primary flex items-center gap-2 animate-in fade-in">
                  <lucide-icon name="Check" class="size-4 shrink-0" aria-hidden="true"></lucide-icon>
                  <span>{{ saveSuccessMessage() }}</span>
                </div>
              }

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <!-- Personal Info Column -->
                <div class="space-y-4">
                  <h4 class="font-bold text-foreground flex items-center gap-2">
                    <lucide-icon name="User" class="size-4 text-primary" aria-hidden="true"></lucide-icon>
                    <span>Thông tin liên hệ</span>
                  </h4>

                  <div class="space-y-1">
                    <label class="block font-bold text-muted text-[11px] uppercase" for="profileName">Họ và tên</label>
                    <input
                      id="profileName"
                      appInput
                      class="w-full text-xs font-bold"
                      [(ngModel)]="fullName"
                    >
                  </div>

                  <div class="space-y-1">
                    <label class="block font-bold text-muted text-[11px] uppercase" for="profileEmail">Email liên hệ & Hóa đơn VAT</label>
                    <input
                      id="profileEmail"
                      appInput
                      class="w-full text-xs"
                      [(ngModel)]="email"
                    >
                  </div>

                  <div class="space-y-1">
                    <label class="block font-bold text-muted text-[11px] uppercase" for="profilePhone">Số điện thoại nhận OTP</label>
                    <input
                      id="profilePhone"
                      appInput
                      class="w-full text-xs font-mono font-bold"
                      [(ngModel)]="phone"
                    >
                  </div>

                  <div class="space-y-1">
                    <label class="block font-bold text-muted text-[11px] uppercase" for="profileAddress">Địa chỉ giao hàng mặc định</label>
                    <textarea
                      id="profileAddress"
                      appInput
                      class="w-full text-xs resize-none"
                      rows="3"
                      [(ngModel)]="deliveryAddress"
                    ></textarea>
                  </div>
                </div>

                <!-- Security Column -->
                <div class="space-y-4">
                  <h4 class="font-bold text-foreground flex items-center gap-2">
                    <lucide-icon name="ShieldCheck" class="size-4 text-primary" aria-hidden="true"></lucide-icon>
                    <span>Tài khoản liên kết & Bảo mật</span>
                  </h4>

                  <!-- Google OAuth Link Status -->
                  <div class="p-3.5 bg-surface-alt rounded-lg border border-border flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="size-9 rounded-lg bg-surface border border-border flex items-center justify-center shadow-xs">
                        <svg class="size-4 shrink-0" viewBox="0 0 24 24">
                          <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" fill="#4285F4"/>
                          <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z" fill="#34A853"/>
                          <path d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z" fill="#FBBC05"/>
                          <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" fill="#EA4335"/>
                        </svg>
                      </div>
                      <div>
                        <div class="flex items-center gap-1.5">
                          <span class="font-bold text-foreground">Google OAuth</span>
                          <span appBadge variant="success" class="text-[9px]">ĐÃ LIÊN KẾT</span>
                        </div>
                        <span class="text-[11px] text-muted">{{ email }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Change Password Box -->
                  <div class="p-3.5 bg-surface-alt rounded-lg border border-border space-y-3">
                    <span class="font-bold text-foreground block">Đổi mật khẩu tài khoản</span>
                    <div class="space-y-2">
                      <input
                        appInput
                        type="password"
                        class="w-full text-xs"
                        placeholder="Mật khẩu hiện tại"
                        [(ngModel)]="currentPass"
                      >
                      <input
                        appInput
                        type="password"
                        class="w-full text-xs"
                        placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                        [(ngModel)]="newPass"
                      >
                    </div>
                    <button
                      type="button"
                      appButton
                      variant="outline"
                      size="sm"
                      (click)="handleChangePassword()"
                    >
                      <span>Cập nhật mật khẩu</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

          </div>

        </div>
      </div>
    </div>
  `,
})
export class ProfilePageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly user = computed(() => this.auth.currentUser());

  protected fullName = this.user()?.name || 'Nguyễn Hoàng Nam';
  protected email = this.user()?.email || 'hoangnam.tech@gmail.com';
  protected phone = this.user()?.phone || '0988 234 567';
  protected deliveryAddress = this.user()?.address || 'Căn hộ Landmark 4, 720A Điện Biên Phủ, Phường 22, Quận Bình Thạnh, TP. Hồ Chí Minh';
  protected currentPass = '';
  protected newPass = '';
  protected readonly saveSuccessMessage = signal<string | null>(null);

  protected saveProfileChanges(): void {
    this.auth.updateProfile({
      name: this.fullName.trim(),
      email: this.email.trim(),
      phone: this.phone.trim(),
      address: this.deliveryAddress.trim(),
    });
    this.saveSuccessMessage.set('Đã lưu các thay đổi hồ sơ cá nhân thành công!');
    setTimeout(() => this.saveSuccessMessage.set(null), 3000);
  }

  protected handleChangePassword(): void {
    if (this.newPass.length < 6) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    this.saveSuccessMessage.set('Đã cập nhật mật khẩu mới thành công!');
    this.currentPass = '';
    this.newPass = '';
    setTimeout(() => this.saveSuccessMessage.set(null), 3000);
  }

  protected handleLogout(): void {
    this.auth.logout();
    void this.router.navigate(['/']);
  }
}
