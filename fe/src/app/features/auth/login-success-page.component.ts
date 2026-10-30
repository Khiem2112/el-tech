import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { AppIconModule, BadgeDirective, ButtonDirective } from '../../components/atoms';

@Component({
  selector: 'app-login-success-page',
  standalone: true,
  imports: [RouterLink, AppIconModule, ButtonDirective, BadgeDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="w-full bg-canvas min-h-[calc(100vh-4rem)] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto space-y-6">

        @if (auth.isLoggedIn() && auth.currentUser(); as user) {
          <!-- Main Success Banner Card -->
          <div class="relative bg-surface rounded-2xl border border-line shadow-sm overflow-hidden">
            <!-- Accent Top Line -->
            <div class="h-1.5 w-full bg-gradient-to-r from-primary via-primary-pale to-primary-strong"></div>

            <div class="p-6 sm:p-8">
              <!-- Header Section -->
              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-line">
                <div class="size-16 rounded-2xl bg-surface-dark border border-line-dark flex items-center justify-center shrink-0 shadow-md">
                  <lucide-icon name="ShieldCheck" class="size-8 text-primary" aria-hidden="true"></lucide-icon>
                </div>
                <div class="space-y-1 flex-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span appBadge variant="primary" size="sm">
                      XÁC THỰC THÀNH CÔNG
                    </span>
                    <span class="text-xs text-muted flex items-center gap-1">
                      <lucide-icon name="Lock" class="size-3 text-primary" aria-hidden="true"></lucide-icon>
                      <span>Bảo mật SSL 256-bit</span>
                    </span>
                  </div>
                  <h1 class="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                    Đăng Nhập Thành Công
                  </h1>
                  <p class="text-sm text-muted">
                    Chào mừng bạn đã trở lại với hệ sinh thái linh kiện phần cứng EL-TECH.
                  </p>
                </div>
              </div>

              <!-- User Information Grid -->
              <div class="py-6 border-b border-line">
                <h2 class="text-xs font-bold uppercase tracking-wider text-muted mb-4">
                  Thông tin phiên đăng nhập
                </h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <!-- Name & Role -->
                  <div class="p-4 rounded-xl bg-surface-alt/70 border border-line flex items-center gap-3">
                    <div class="size-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 text-primary font-bold">
                      <lucide-icon name="User" class="size-5" aria-hidden="true"></lucide-icon>
                    </div>
                    <div class="min-w-0">
                      <div class="text-xs text-muted">Tài khoản</div>
                      <div class="text-sm font-bold text-foreground truncate">{{ user.name }}</div>
                      <div class="text-xs text-primary font-semibold">{{ getRoleBadgeText(user.role) }}</div>
                    </div>
                  </div>

                  <!-- Email -->
                  <div class="p-4 rounded-xl bg-surface-alt/70 border border-line flex items-center gap-3">
                    <div class="size-10 rounded-full bg-surface border border-line flex items-center justify-center shrink-0 text-muted">
                      <lucide-icon name="Mail" class="size-5" aria-hidden="true"></lucide-icon>
                    </div>
                    <div class="min-w-0">
                      <div class="text-xs text-muted">Email liên hệ</div>
                      <div class="text-sm font-medium text-foreground truncate" [title]="user.email">
                        {{ user.email || 'Chưa cập nhật' }}
                      </div>
                    </div>
                  </div>

                  <!-- Phone -->
                  <div class="p-4 rounded-xl bg-surface-alt/70 border border-line flex items-center gap-3">
                    <div class="size-10 rounded-full bg-surface border border-line flex items-center justify-center shrink-0 text-muted">
                      <lucide-icon name="Phone" class="size-5" aria-hidden="true"></lucide-icon>
                    </div>
                    <div class="min-w-0">
                      <div class="text-xs text-muted">Số điện thoại</div>
                      <div class="text-sm font-medium text-foreground truncate">
                        {{ user.phone || 'Chưa cập nhật' }}
                      </div>
                    </div>
                  </div>

                  <!-- Login Timestamp -->
                  <div class="p-4 rounded-xl bg-surface-alt/70 border border-line flex items-center gap-3">
                    <div class="size-10 rounded-full bg-surface border border-line flex items-center justify-center shrink-0 text-muted">
                      <lucide-icon name="Clock" class="size-5" aria-hidden="true"></lucide-icon>
                    </div>
                    <div class="min-w-0">
                      <div class="text-xs text-muted">Thời điểm đăng nhập</div>
                      <div class="text-sm font-medium text-foreground tabular">
                        {{ loginTime() }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Auto-redirect Countdown Control Panel -->
              <div class="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                  <div class="size-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <span class="text-xs font-bold text-primary tabular">{{ countdown() }}</span>
                  </div>
                  <div>
                    @if (isAutoRedirectActive()) {
                      <p class="text-xs font-medium text-foreground">
                        Tự động chuyển tiếp sau <strong class="text-primary font-bold">{{ countdown() }}s</strong> đến
                        <span class="text-muted">{{ targetDestinationLabel() }}</span>
                      </p>
                    } @else {
                      <p class="text-xs font-medium text-muted">
                        Đã tạm dừng tự động chuyển hướng. Bạn có thể chọn điều hướng bên dưới.
                      </p>
                    }
                  </div>
                </div>

                <div class="flex items-center gap-2 w-full sm:w-auto">
                  @if (isAutoRedirectActive()) {
                    <button
                      type="button"
                      appButton
                      variant="outline"
                      size="sm"
                      class="flex-1 sm:flex-none"
                      (click)="toggleAutoRedirect()"
                    >
                      <span>Tạm dừng</span>
                    </button>
                  } @else {
                    <button
                      type="button"
                      appButton
                      variant="outline"
                      size="sm"
                      class="flex-1 sm:flex-none"
                      (click)="toggleAutoRedirect()"
                    >
                      <span>Bật tự động</span>
                    </button>
                  }

                  <button
                    type="button"
                    appButton
                    variant="primary"
                    size="sm"
                    class="flex-1 sm:flex-none"
                    (click)="proceedNow()"
                  >
                    <span>Chuyển ngay</span>
                    <lucide-icon name="ArrowRight" class="size-4" aria-hidden="true"></lucide-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Navigation Hub -->
          <div class="space-y-3">
            <h2 class="text-xs font-bold uppercase tracking-wider text-muted px-1">
              Truy cập nhanh các khu vực chức năng
            </h2>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <!-- Home link -->
              <a
                routerLink="/"
                class="group p-4 bg-surface hover:bg-surface-alt rounded-xl border border-line hover:border-primary/50 transition-all duration-150 flex flex-col justify-between gap-3 shadow-xs"
              >
                <div class="flex items-center justify-between">
                  <div class="size-9 rounded-lg bg-surface-alt group-hover:bg-primary/20 flex items-center justify-center text-foreground group-hover:text-primary transition-colors">
                    <lucide-icon name="House" class="size-4.5" aria-hidden="true"></lucide-icon>
                  </div>
                  <lucide-icon name="ArrowRight" class="size-4 text-muted group-hover:text-primary transition-colors" aria-hidden="true"></lucide-icon>
                </div>
                <div>
                  <div class="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Trang chủ</div>
                  <div class="text-xs text-muted mt-0.5">Khám phá linh kiện mới nhất và khuyến mãi hấp dẫn</div>
                </div>
              </a>

              <!-- PC Builder link -->
              <a
                routerLink="/tu-lap-pc"
                class="group p-4 bg-surface hover:bg-surface-alt rounded-xl border border-line hover:border-primary/50 transition-all duration-150 flex flex-col justify-between gap-3 shadow-xs"
              >
                <div class="flex items-center justify-between">
                  <div class="size-9 rounded-lg bg-surface-alt group-hover:bg-primary/20 flex items-center justify-center text-foreground group-hover:text-primary transition-colors">
                    <lucide-icon name="Cpu" class="size-4.5" aria-hidden="true"></lucide-icon>
                  </div>
                  <lucide-icon name="ArrowRight" class="size-4 text-muted group-hover:text-primary transition-colors" aria-hidden="true"></lucide-icon>
                </div>
                <div>
                  <div class="text-sm font-bold text-foreground group-hover:text-primary transition-colors">PC Builder</div>
                  <div class="text-xs text-muted mt-0.5">Cấu hình máy tính với thuật toán kiểm tra tương thích</div>
                </div>
              </a>

              <!-- Profile link -->
              <a
                routerLink="/tai-khoan"
                class="group p-4 bg-surface hover:bg-surface-alt rounded-xl border border-line hover:border-primary/50 transition-all duration-150 flex flex-col justify-between gap-3 shadow-xs"
              >
                <div class="flex items-center justify-between">
                  <div class="size-9 rounded-lg bg-surface-alt group-hover:bg-primary/20 flex items-center justify-center text-foreground group-hover:text-primary transition-colors">
                    <lucide-icon name="User" class="size-4.5" aria-hidden="true"></lucide-icon>
                  </div>
                  <lucide-icon name="ArrowRight" class="size-4 text-muted group-hover:text-primary transition-colors" aria-hidden="true"></lucide-icon>
                </div>
                <div>
                  <div class="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Tài khoản</div>
                  <div class="text-xs text-muted mt-0.5">Quản lý sổ địa chỉ, bảo hành điện tử và thông tin cá nhân</div>
                </div>
              </a>

              <!-- Shopping Cart link -->
              <a
                routerLink="/gio-hang"
                class="group p-4 bg-surface hover:bg-surface-alt rounded-xl border border-line hover:border-primary/50 transition-all duration-150 flex flex-col justify-between gap-3 shadow-xs"
              >
                <div class="flex items-center justify-between">
                  <div class="size-9 rounded-lg bg-surface-alt group-hover:bg-primary/20 flex items-center justify-center text-foreground group-hover:text-primary transition-colors">
                    <lucide-icon name="ShoppingCart" class="size-4.5" aria-hidden="true"></lucide-icon>
                  </div>
                  <lucide-icon name="ArrowRight" class="size-4 text-muted group-hover:text-primary transition-colors" aria-hidden="true"></lucide-icon>
                </div>
                <div>
                  <div class="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Giỏ hàng</div>
                  <div class="text-xs text-muted mt-0.5">Kiểm tra danh mục linh kiện đã chọn và tiến hành đặt mua</div>
                </div>
              </a>
            </div>
          </div>

          <!-- Exclusive Member Privileges Card -->
          <div class="p-5 bg-surface rounded-xl border border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="space-y-1">
              <span class="text-xs font-bold uppercase tracking-wider text-primary">Quyền lợi thành viên EL-TECH</span>
              <p class="text-xs text-muted max-w-2xl leading-relaxed">
                Tài khoản của bạn đã kích hoạt chính sách bảo hành phần cứng điện tử tự động, hỗ trợ lưu tối đa 10 bộ cấu hình PC custom và nhận cảnh báo tương thích trực tiếp từ phòng lab.
              </p>
            </div>
            <a
              routerLink="/chinh-sach"
              class="text-xs font-bold text-foreground hover:text-primary shrink-0 flex items-center gap-1 transition-colors"
            >
              <span>Xem chính sách bảo hành</span>
              <lucide-icon name="ArrowRight" class="size-3.5" aria-hidden="true"></lucide-icon>
            </a>
          </div>

        } @else {
          <!-- Fallback when not logged in -->
          <div class="bg-surface rounded-2xl border border-line shadow-sm p-8 text-center space-y-4 max-w-lg mx-auto">
            <div class="size-16 rounded-2xl bg-surface-alt border border-line flex items-center justify-center mx-auto text-muted">
              <lucide-icon name="Lock" class="size-8" aria-hidden="true"></lucide-icon>
            </div>
            <div class="space-y-1">
              <h1 class="text-xl font-bold text-foreground">Chưa ghi nhận phiên đăng nhập</h1>
              <p class="text-xs text-muted leading-relaxed">
                Bạn hiện chưa đăng nhập vào hệ thống hoặc phiên làm việc đã kết thúc. Vui lòng đăng nhập để tiếp tục sử dụng đầy đủ các tính năng.
              </p>
            </div>
            <div class="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                appButton
                variant="primary"
                size="md"
                (click)="openLoginModal()"
              >
                <span>Đăng nhập ngay</span>
                <lucide-icon name="ArrowRight" class="size-4" aria-hidden="true"></lucide-icon>
              </button>
              <a
                routerLink="/"
                appButton
                variant="outline"
                size="md"
              >
                <span>Về trang chủ</span>
              </a>
            </div>
          </div>
        }

      </div>
    </section>
  `,
})
export class LoginSuccessPageComponent implements OnInit, OnDestroy {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly countdown = signal(5);
  protected readonly isAutoRedirectActive = signal(true);
  protected readonly targetUrl = signal('/');
  protected readonly targetDestinationLabel = signal('trang chủ');
  protected readonly loginTime = signal('');

  private timerRef: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.recordLoginTimestamp();
    this.determineTargetDestination();
    this.startCountdownTimer();
  }

  ngOnDestroy(): void {
    this.stopCountdownTimer();
  }

  protected toggleAutoRedirect(): void {
    const nextState = !this.isAutoRedirectActive();
    this.isAutoRedirectActive.set(nextState);
    if (!nextState) {
      this.stopCountdownTimer();
    } else {
      this.startCountdownTimer();
    }
  }

  protected proceedNow(): void {
    this.stopCountdownTimer();
    void this.router.navigateByUrl(this.targetUrl());
  }

  protected openLoginModal(): void {
    this.auth.openAuthModal();
  }

  protected getRoleBadgeText(role?: string): string {
    switch (role) {
      case 'pro_builder':
        return 'Kỹ sư Pro Builder';
      case 'admin':
        return 'Quản trị viên';
      default:
        return 'Thành viên EL-TECH';
    }
  }

  private recordLoginTimestamp(): void {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    this.loginTime.set(`${hours}:${minutes} - ${day}/${month}/${year}`);
  }

  private determineTargetDestination(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('/dang-nhap-thanh-cong') && !returnUrl.startsWith('/login-success')) {
      this.targetUrl.set(returnUrl);
      if (returnUrl.startsWith('/tai-khoan')) {
        this.targetDestinationLabel.set('trang tài khoản');
      } else if (returnUrl.startsWith('/checkout') || returnUrl.startsWith('/thanh-toan')) {
        this.targetDestinationLabel.set('trang thanh toán');
      } else if (returnUrl.startsWith('/gio-hang')) {
        this.targetDestinationLabel.set('giỏ hàng');
      } else if (returnUrl.startsWith('/tu-lap-pc')) {
        this.targetDestinationLabel.set('PC Builder');
      } else {
        this.targetDestinationLabel.set('trang trước đó');
      }
    } else {
      this.targetUrl.set('/');
      this.targetDestinationLabel.set('trang chủ');
    }
  }

  private startCountdownTimer(): void {
    this.stopCountdownTimer();
    if (!this.auth.isLoggedIn()) return;

    this.timerRef = setInterval(() => {
      const current = this.countdown();
      if (current <= 1) {
        this.proceedNow();
      } else {
        this.countdown.set(current - 1);
      }
    }, 1000);
  }

  private stopCountdownTimer(): void {
    if (this.timerRef) {
      clearInterval(this.timerRef);
      this.timerRef = null;
    }
  }
}

