import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonDirective } from '../../components/atoms/button/button.directive';
import { BadgeDirective } from '../../components/atoms/badge/badge.directive';
import { InputDirective } from '../../components/atoms/input/input.directive';
import { AppIconModule } from '../../components/atoms/icon/icon.module';

type FaqItem = {
  question: string;
  answer: string;
  isOpen: boolean;
};

@Component({
  selector: 'app-refund-page',
  imports: [FormsModule, RouterLink, ButtonDirective, BadgeDirective, InputDirective, AppIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full bg-canvas min-h-screen">
      <!-- Breadcrumb Bar -->
      <section class="w-full bg-surface-alt px-4 py-3 sm:px-6 lg:px-8 border-b border-border shadow-xs">
        <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-muted text-xs">
          <div class="flex items-center gap-1.5">
            <a routerLink="/" class="hover:text-foreground transition-colors">Trang chủ</a>
            <lucide-icon name="ChevronRight" class="size-3 text-muted" aria-hidden="true"></lucide-icon>
            <span class="text-foreground font-bold">Chính sách bảo hành & Hoàn tiền</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface text-primary font-bold text-[10px] border border-border">
              <span class="size-2 rounded-full bg-primary animate-pulse"></span>
              TIÊU CHUẨN KỸ THUẬT V2.4 - HIỆU LỰC 2025
            </span>
            <span class="hidden md:inline text-[11px] text-muted">Bảo hành linh kiện chính hãng 100%</span>
          </div>
        </div>
      </section>

      <!-- Engineering Header Banner -->
      <section class="w-full bg-slate-950 text-white px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden border-b border-slate-800">
        <div class="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div class="lg:col-span-8 space-y-3">
            <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-primary font-bold text-xs uppercase tracking-wider">
              <lucide-icon name="ShieldCheck" class="size-4" aria-hidden="true"></lucide-icon>
              <span>Minh bạch linh kiện & Quyền lợi Khách hàng</span>
            </div>
            <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Chính Sách Đổi Mới, Hoàn Tiền & Khiếu Nại Phần Cứng
            </h1>
            <p class="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              Cam kết bảo vệ tối đa quyền lợi người dùng máy trạm và linh kiện hi-end. Mọi quy trình xử lý hoàn tiền, khiếu nại thông số kỹ thuật và đổi mới đều được số hóa, chuẩn hóa theo các mã quy chuẩn vận hành nghiêm ngặt.
            </p>
          </div>

          <div class="lg:col-span-4 flex flex-col gap-2 p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <div class="flex items-center justify-between text-slate-400 text-xs">
              <span class="font-bold uppercase tracking-wider text-[10px]">TỐC ĐỘ XỬ LÝ RMA</span>
              <span class="text-primary font-black">&lt; 2 Giờ làm việc</span>
            </div>
            <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex my-1">
              <div class="bg-primary h-full w-[85%]"></div>
              <div class="bg-primary/40 h-full w-[15%]"></div>
            </div>
            <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span class="flex items-center gap-1.5 text-primary">
                <lucide-icon name="Check" class="size-3.5" aria-hidden="true"></lucide-icon>
                <span>Hoàn tất 85% trong ngày</span>
              </span>
              <span class="font-bold text-slate-200">98.6% Khách hài lòng</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Dual-Grid Section: Policy Articles & RMA Ticket Form -->
      <main class="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <!-- Left Column: Core Policy Bento Specifications (7 cols) -->
          <div class="lg:col-span-7 space-y-6">
            <div class="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h2 class="text-xl font-black text-foreground tracking-tight">Quy chuẩn Xử lý Phần cứng Chính thức</h2>
                <p class="text-xs text-muted">Chi tiết các điều khoản bảo vệ người mua theo tiêu chuẩn nhà phân phối</p>
              </div>
              <span appBadge variant="outline" class="font-bold text-xs uppercase">
                Quy định chính thức
              </span>
            </div>

            <!-- Policy Card 1: 30-Day Replacement -->
            <article class="p-5 rounded-xl bg-surface border border-border shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div class="flex items-start gap-3.5">
                <div class="size-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <lucide-icon name="RotateCcw" class="size-5" aria-hidden="true"></lucide-icon>
                </div>
                <div class="space-y-1.5 flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-2 flex-wrap">
                    <h3 class="text-sm font-bold text-foreground">Quy định Đổi mới 30 Ngày (Do Lỗi NSX)</h3>
                    <span appBadge variant="primary" class="text-[10px] font-bold">1-đổi-1 trong 30 ngày</span>
                  </div>
                  <p class="text-xs text-muted leading-relaxed">
                    Áp dụng cho tất cả linh kiện rời (CPU, GPU RTX 50/40-Series, Bo mạch chủ, RAM DDR5, SSD NVMe, Nguồn PSU) phát sinh lỗi vật lý hoặc lỗi kỹ thuật xác định từ Nhà sản xuất trong vòng 30 ngày kể từ thời điểm nhận hàng.
                  </p>
                  <div class="p-3 rounded-lg bg-surface-alt border border-border space-y-1.5 mt-2">
                    <div class="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <lucide-icon name="Check" class="size-4 text-primary shrink-0" aria-hidden="true"></lucide-icon>
                      <span>Điều kiện bắt buộc nhận đổi mới:</span>
                    </div>
                    <ul class="text-xs text-muted list-disc list-inside space-y-1 pl-1">
                      <li>Linh kiện còn nguyên vẹn tem bảo hành của EL-TECH và nhà phân phối chính thức (Synnex FPT, Viễn Sơn, Digiworld...).</li>
                      <li>Còn đủ vỏ hộp nguyên bản, khay mút định hình, đầy đủ phụ kiện kèm theo (cáp module, ăng-ten Wi-Fi, ốc bắt).</li>
                      <li>Không cong vênh chân socket, không nứt rạn PCB, không vào nước, không cháy nổ xung điện người dùng.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </article>

            <!-- Policy Card 2: Cancellation & Fast Refund -->
            <article class="p-5 rounded-xl bg-surface border border-border shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div class="flex items-start gap-3.5">
                <div class="size-10 rounded-lg bg-surface-alt border border-border flex items-center justify-center text-foreground shrink-0">
                  <lucide-icon name="CreditCard" class="size-5" aria-hidden="true"></lucide-icon>
                </div>
                <div class="space-y-1.5 flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-2 flex-wrap">
                    <h3 class="text-sm font-bold text-foreground">Hủy đơn & Hoàn tiền trước Chuẩn bị hàng</h3>
                    <span appBadge variant="outline" class="text-[10px] font-bold text-primary border-primary/30">Hoàn tiền 100%</span>
                  </div>
                  <p class="text-xs text-muted leading-relaxed">
                    Khách hàng có thể tự hủy đơn trực tuyến ngay trên hệ thống khi đơn hàng đang ở trạng thái
                    <code class="px-1.5 py-0.5 rounded bg-surface-alt text-foreground font-mono text-[11px] border border-border">PENDING_PAYMENT</code>,
                    <code class="px-1.5 py-0.5 rounded bg-surface-alt text-foreground font-mono text-[11px] border border-border">PENDING_COD_CONFIRMATION</code> hoặc
                    <code class="px-1.5 py-0.5 rounded bg-surface-alt text-foreground font-mono text-[11px] border border-border">CONFIRMED</code>.
                  </p>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div class="p-3 rounded-lg bg-surface-alt border border-border space-y-1">
                      <div class="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <lucide-icon name="Clock" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
                        <span>Hoàn tiền tự động 100%</span>
                      </div>
                      <p class="text-[11px] text-muted">
                        Hệ thống giải phóng hạn mức thẻ hoặc chuyển khoản ngân hàng hoàn tiền đúng 100% giá trị trong 24h làm việc.
                      </p>
                    </div>
                    <div class="p-3 rounded-lg bg-surface-alt border border-border space-y-1">
                      <div class="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <lucide-icon name="ShieldCheck" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
                        <span>Không thu phí giao dịch</span>
                      </div>
                      <p class="text-[11px] text-muted">
                        EL-TECH chi trả hoàn toàn chi phí cổng thanh toán (Visa/Mastercard/Napas), người mua nhận lại nguyên vẹn số tiền.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <!-- Policy Card 3: Custom Build Deposit Policy -->
            <article class="p-5 rounded-xl bg-surface border border-border shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div class="flex items-start gap-3.5">
                <div class="size-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                  <lucide-icon name="Wrench" class="size-5" aria-hidden="true"></lucide-icon>
                </div>
                <div class="space-y-1.5 flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-2 flex-wrap">
                    <h3 class="text-sm font-bold text-foreground">Quy định Cọc Cấu hình PC Custom Build</h3>
                    <span appBadge variant="outline" class="text-[10px] font-bold text-amber-500 border-amber-500/30">Quy định đặt cọc</span>
                  </div>
                  <p class="text-xs text-muted leading-relaxed">
                    Do đặc thù các cấu hình máy bàn lắp ráp theo yêu cầu sử dụng linh kiện đập hộp bóc seal riêng biệt (khui màng co seal vỏ hộp CPU, xé seal chống tĩnh điện VGA, cắt keo tản nhiệt), quý khách vui lòng nắm rõ tiến trình:
                  </p>
                  <div class="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                    <div class="flex items-center gap-1.5 text-amber-500 text-xs font-bold">
                      <lucide-icon name="RotateCcw" class="size-4" aria-hidden="true"></lucide-icon>
                      <span>Lưu ý quan trọng về Tiền Cọc ráp máy:</span>
                    </div>
                    <p class="text-xs text-foreground leading-relaxed">
                      Khi đơn hàng đã chuyển sang trạng thái kỹ thuật <strong class="text-amber-500 underline">PREPARING_COMPONENTS</strong> (Kỹ thuật viên bắt đầu xuất kho, unbox linh kiện và tiến hành đi dây, stress-test), hệ thống không thể hủy ngang hoàn cọc. Tiền đặt cọc sẽ được dùng để bù đắp giá trị hao mòn vỏ hộp đã tháo niêm phong của hãng.
                    </p>
                  </div>
                </div>
              </div>
            </article>

            <!-- Policy Card 4: Failed Delivery Protocol -->
            <article class="p-5 rounded-xl bg-surface border border-border shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div class="flex items-start gap-3.5">
                <div class="size-10 rounded-lg bg-surface-alt border border-border flex items-center justify-center text-foreground shrink-0">
                  <lucide-icon name="Truck" class="size-5" aria-hidden="true"></lucide-icon>
                </div>
                <div class="space-y-1.5 flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-2 flex-wrap">
                    <h3 class="text-sm font-bold text-foreground">Xử lý Giao hàng Không Thành công</h3>
                    <span appBadge variant="outline" class="text-[10px] font-bold text-muted">Hỗ trợ giao hàng</span>
                  </div>
                  <p class="text-xs text-muted leading-relaxed">
                    Trường hợp đơn vị vận chuyển công nghệ cao chuyên dụng của EL-TECH không thể liên lạc được với người nhận tại địa chỉ giao hàng:
                  </p>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div class="p-3 rounded-lg bg-surface-alt border border-border">
                      <div class="text-xs font-bold text-foreground">1. Thử giao lại tối đa 2 lần</div>
                      <p class="text-[11px] text-muted mt-0.5">Đơn vị vận chuyển liên hệ trước khi đến. Lần 2 diễn ra trong vòng 24h kế tiếp.</p>
                    </div>
                    <div class="p-3 rounded-lg bg-surface-alt border border-border">
                      <div class="text-xs font-bold text-foreground">2. Nhận tại Showroom gần nhất</div>
                      <p class="text-[11px] text-muted mt-0.5">Hàng được lưu kho an toàn tại Showroom khu vực trong 7 ngày để khách ghé nhận trực tiếp.</p>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <!-- Right Column: Interactive Ticket Request Form (5 cols) -->
          <div class="lg:col-span-5 sticky top-24 space-y-4">
            
            <!-- Ticket Form Card -->
            <div class="rounded-xl bg-surface p-5 sm:p-6 border border-border shadow-md space-y-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="size-2 rounded-full bg-primary animate-pulse"></span>
                  <span class="text-[10px] uppercase font-bold text-primary tracking-wider">HỆ THỐNG RMA TRỰC TUYẾN</span>
                </div>
                <h2 class="text-lg font-black text-foreground tracking-tight">Gửi Yêu Cầu Hỗ Trợ / Đổi Trả / Khiếu Nại</h2>
                <p class="text-xs text-muted">
                  Kỹ thuật viên EL-TECH sẽ tiếp nhận mã ticket và liên hệ giải quyết trong vòng <strong class="text-primary font-bold">2 giờ làm việc</strong>.
                </p>
              </div>

              <!-- Ticket Creation Form -->
              <form class="space-y-3.5" (ngSubmit)="submitTicket()">
                <div>
                  <label class="block text-xs font-bold text-foreground mb-1" for="ticketOrderId">
                    Mã Đơn Hàng <span class="text-danger">*</span>
                  </label>
                  <input
                    id="ticketOrderId"
                    appInput
                    class="w-full text-xs font-bold uppercase"
                    [(ngModel)]="orderId"
                    name="orderId"
                    placeholder="VD: ELT-91024"
                    required
                  >
                </div>

                <div>
                  <label class="block text-xs font-bold text-foreground mb-1" for="ticketPhone">
                    Số Điện Thoại Đặt Hàng <span class="text-danger">*</span>
                  </label>
                  <input
                    id="ticketPhone"
                    appInput
                    class="w-full text-xs"
                    [(ngModel)]="phone"
                    name="phone"
                    type="tel"
                    placeholder="VD: 0988 123 456"
                    required
                  >
                </div>

                <div>
                  <label class="block text-xs font-bold text-foreground mb-1" for="ticketSerial">
                    Mã Serial Number (S/N) linh kiện (tùy chọn)
                  </label>
                  <input
                    id="ticketSerial"
                    appInput
                    class="w-full text-xs font-mono"
                    [(ngModel)]="serialNumber"
                    name="serialNumber"
                    placeholder="VD: SN-ASUS-99120"
                  >
                </div>

                <div>
                  <label class="block text-xs font-bold text-foreground mb-1" for="ticketCategory">
                    Phân Loại Khiếu Nại / Yêu Cầu <span class="text-danger">*</span>
                  </label>
                  <select
                    id="ticketCategory"
                    appInput
                    class="w-full text-xs"
                    [(ngModel)]="category"
                    name="category"
                  >
                    <option value="hardware-fault">Lỗi kỹ thuật phần cứng (NSX)</option>
                    <option value="spec-mismatch">Sai thông số / linh kiện không khớp</option>
                    <option value="order-cancel-refund">Yêu cầu hoàn tiền đơn hủy (PENDING/CONFIRMED)</option>
                    <option value="serial-support">Hỗ trợ tra cứu bảo hành theo Serial / S/N</option>
                    <option value="shipping-damage">Hàng cấn móp trong quá trình vận chuyển</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-bold text-foreground mb-1" for="ticketDescription">
                    Mô Tả Tình Trạng Kỹ Thuật <span class="text-danger">*</span>
                  </label>
                  <textarea
                    id="ticketDescription"
                    appInput
                    class="w-full text-xs resize-none"
                    rows="3"
                    [(ngModel)]="description"
                    name="description"
                    placeholder="Vui lòng nêu rõ triệu chứng: VD: GPU không lên tín hiệu DisplayPort, quạt không quay, hoặc mã lỗi màn hình xanh..."
                    required
                  ></textarea>
                </div>

                <!-- Media Upload Drag & Drop Area -->
                <div>
                  <label class="block text-xs font-bold text-foreground mb-1">
                    Ảnh / Video Tem Serial & Hiện Trạng
                  </label>
                  <div
                    class="p-4 rounded-lg bg-surface-alt border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center text-center cursor-pointer relative"
                  >
                    <input
                      type="file"
                      class="absolute inset-0 opacity-0 cursor-pointer"
                      accept="image/*,video/*"
                      multiple
                      (change)="onFileSelected($event)"
                    >
                    <lucide-icon name="Camera" class="size-6 text-primary mb-1" aria-hidden="true"></lucide-icon>
                    <span class="text-xs font-bold text-foreground">
                      {{ uploadedFiles().length > 0 ? uploadedFiles().join(', ') : 'Chọn hoặc kéo thả hình ảnh/video vào đây' }}
                    </span>
                    <span class="text-[10px] text-muted mt-0.5">Hỗ trợ PNG, JPG, MP4 dung lượng tối đa 25MB</span>
                  </div>
                </div>

                <!-- Submit CTA -->
                <button
                  type="submit"
                  appButton
                  variant="primary"
                  size="md"
                  class="w-full"
                  [disabled]="isSubmitting() || !canSubmit()"
                >
                  @if (isSubmitting()) {
                    <lucide-icon name="RefreshCw" class="size-4 animate-spin" aria-hidden="true"></lucide-icon>
                    <span>Đang gửi yêu cầu...</span>
                  } @else {
                    <lucide-icon name="FileText" class="size-4" aria-hidden="true"></lucide-icon>
                    <span>Tạo Ticket Hỗ Trợ Kỹ Thuật</span>
                  }
                </button>
              </form>

              <!-- Ticket Success Confirmation Banner -->
              @if (createdTicketCode()) {
                <div class="p-4 rounded-lg bg-primary/10 border border-primary/30 space-y-1.5 animate-in fade-in">
                  <div class="flex items-center gap-2 text-xs font-bold text-primary">
                    <lucide-icon name="Check" class="size-4 shrink-0" aria-hidden="true"></lucide-icon>
                    <span>Ticket tiếp nhận thành công! Mã số: #{{ createdTicketCode() }}</span>
                  </div>
                  <p class="text-xs text-muted leading-relaxed">
                    Đội ngũ Kỹ thuật viên EL-TECH sẽ gọi lại đến số điện thoại của bạn trong vòng tối đa 2 giờ làm việc để xác nhận hướng xử lý đổi trả.
                  </p>
                </div>
              }

              <!-- SLA Commitment -->
              <div class="pt-3 border-t border-border flex items-center justify-between text-muted text-[11px]">
                <span class="flex items-center gap-1">
                  <lucide-icon name="Clock" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
                  Cam kết SLA 120 phút
                </span>
                <span class="flex items-center gap-1">
                  <lucide-icon name="Phone" class="size-3.5 text-primary" aria-hidden="true"></lucide-icon>
                  Hỗ trợ 7 ngày/tuần
                </span>
              </div>
            </div>

            <!-- Emergency Support Card -->
            <div class="rounded-xl bg-slate-900 text-white p-5 border border-slate-800 shadow-md space-y-2">
              <div class="flex items-center gap-2 text-primary font-bold text-xs">
                <lucide-icon name="Phone" class="size-4" aria-hidden="true"></lucide-icon>
                <span>Hỗ trợ gấp cho máy chủ hoặc phòng máy?</span>
              </div>
              <p class="text-xs text-slate-400 leading-relaxed">
                Kênh phản hồi sự cố khẩn cấp dành cho khách hàng Workstation & Doanh nghiệp. Tổng đài trực 24/7 không gián đoạn.
              </p>
              <div class="flex items-center justify-between pt-1">
                <a href="tel:19006868" class="text-base font-black text-primary hover:underline tracking-wide">
                  1900.6868 (Phím 2)
                </a>
                <span class="text-[10px] text-slate-400">Miễn phí cước gọi</span>
              </div>
            </div>

          </div>

        </div>
      </main>

      <!-- Physical Showrooms Grid & Direct Technical Centers -->
      <section class="w-full bg-surface-alt px-4 py-12 sm:px-6 lg:px-8 border-t border-border">
        <div class="max-w-7xl mx-auto space-y-8">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span class="text-[10px] font-bold uppercase text-primary tracking-wider">HỆ THỐNG TRỰC TIẾP</span>
              <h2 class="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-0.5">
                Trung Tâm Bảo Hành & Tiếp Nhận Showroom Toàn Quốc
              </h2>
              <p class="text-xs text-muted mt-1">Quý khách có thể mang linh kiện hoặc thùng máy PC đến trực tiếp để kỹ thuật viên test tải và đổi mới ngay</p>
            </div>
            <div class="flex items-center gap-2 text-xs text-muted">
              <span class="size-2 rounded-full bg-primary"></span>
              <span>Thời gian làm việc Showroom: 08:30 - 21:30 hàng ngày</span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Showroom 1: Hà Nội -->
            <div class="bg-surface rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div class="relative h-44 w-full overflow-hidden bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80"
                  alt="EL-TECH Hà Nội Flagship"
                  class="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
                >
                <div class="absolute top-3 left-3 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold uppercase">
                  Showroom Miền Bắc
                </div>
              </div>
              <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div class="space-y-1">
                  <h3 class="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <lucide-icon name="Store" class="size-4 text-primary" aria-hidden="true"></lucide-icon>
                    <span>EL-TECH Hà Nội (Flagship)</span>
                  </h3>
                  <p class="text-xs text-foreground font-medium">45 Thái Hà, Phường Trung Liệt, Quận Đống Đa</p>
                  <p class="text-[11px] text-muted">Khu kỹ thuật: Tầng 2 - Phòng Testbench & Đi dây Custom</p>
                </div>
                <div class="space-y-1 pt-2 border-t border-border text-xs">
                  <div class="flex items-center justify-between">
                    <span class="text-muted">Hotline Kỹ thuật:</span>
                    <a href="tel:02477779999" class="font-bold text-foreground hover:text-primary">024.7777.9999</a>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-muted">Kho tiếp nhận RMA:</span>
                    <span class="text-primary font-bold">Sẵn sàng (Đủ linh kiện)</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Showroom 2: TP. Hồ Chí Minh -->
            <div class="bg-surface rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div class="relative h-44 w-full overflow-hidden bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=600&q=80"
                  alt="EL-TECH TP. Hồ Chí Minh"
                  class="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
                >
                <div class="absolute top-3 left-3 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold uppercase">
                  Showroom Miền Nam
                </div>
              </div>
              <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div class="space-y-1">
                  <h3 class="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <lucide-icon name="Store" class="size-4 text-primary" aria-hidden="true"></lucide-icon>
                    <span>EL-TECH TP. Hồ Chí Minh</span>
                  </h3>
                  <p class="text-xs text-foreground font-medium">280 Ba Tháng Hai, Phường 12, Quận 10</p>
                  <p class="text-[11px] text-muted">Khu kỹ thuật: Tầng trệt - Trạm tiếp nhận kiểm định nhanh</p>
                </div>
                <div class="space-y-1 pt-2 border-t border-border text-xs">
                  <div class="flex items-center justify-between">
                    <span class="text-muted">Hotline Kỹ thuật:</span>
                    <a href="tel:02877778888" class="font-bold text-foreground hover:text-primary">028.7777.8888</a>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-muted">Kho tiếp nhận RMA:</span>
                    <span class="text-primary font-bold">Sẵn sàng (Đủ linh kiện)</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Showroom 3: Đà Nẵng -->
            <div class="bg-surface rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div class="relative h-44 w-full overflow-hidden bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80"
                  alt="EL-TECH Đà Nẵng"
                  class="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
                >
                <div class="absolute top-3 left-3 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold uppercase">
                  Showroom Miền Trung
                </div>
              </div>
              <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div class="space-y-1">
                  <h3 class="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <lucide-icon name="Store" class="size-4 text-primary" aria-hidden="true"></lucide-icon>
                    <span>EL-TECH Đà Nẵng</span>
                  </h3>
                  <p class="text-xs text-foreground font-medium">112 Hàm Nghi, Phường Thạc Gián, Quận Thanh Khê</p>
                  <p class="text-[11px] text-muted">Khu kỹ thuật: Quầy hỗ trợ kỹ thuật và nhận bảo hành linh kiện</p>
                </div>
                <div class="space-y-1 pt-2 border-t border-border text-xs">
                  <div class="flex items-center justify-between">
                    <span class="text-muted">Hotline Kỹ thuật:</span>
                    <a href="tel:02367776666" class="font-bold text-foreground hover:text-primary">0236.777.6666</a>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-muted">Kho tiếp nhận RMA:</span>
                    <span class="text-primary font-bold">Sẵn sàng (Đủ linh kiện)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ Accordion Section -->
      <section class="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        <div class="text-center space-y-1">
          <h2 class="text-2xl font-black text-foreground tracking-tight">Câu Hỏi Thường Gặp Về Khiếu Nại & Hoàn Tiền</h2>
          <p class="text-xs text-muted">Giải đáp chi tiết các tình huống xử lý kỹ thuật thường gặp nhất tại EL-TECH</p>
        </div>

        <div class="space-y-3">
          @for (faq of faqs(); track faq.question; let idx = $index) {
            <div class="rounded-xl bg-surface border border-border overflow-hidden transition-all shadow-xs">
              <button
                type="button"
                class="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-foreground hover:bg-surface-alt transition-colors"
                (click)="toggleFaq(idx)"
              >
                <span>{{ faq.question }}</span>
                <lucide-icon
                  name="ChevronDown"
                  class="size-4 text-muted transition-transform duration-200"
                  [class.rotate-180]="faq.isOpen"
                  aria-hidden="true"
                ></lucide-icon>
              </button>
              @if (faq.isOpen) {
                <div class="px-4 pb-4 text-xs text-muted leading-relaxed border-t border-border/50 pt-3">
                  {{ faq.answer }}
                </div>
              }
            </div>
          }
        </div>
      </section>
    </div>
  `,
})
export class RefundPageComponent {
  protected orderId = '';
  protected phone = '';
  protected serialNumber = '';
  protected category = 'hardware-fault';
  protected description = '';
  protected readonly uploadedFiles = signal<string[]>([]);
  protected readonly isSubmitting = signal(false);
  protected readonly createdTicketCode = signal<string | null>(null);

  protected readonly faqs = signal<FaqItem[]>([
    {
      question: 'Thời gian hoàn tiền thực tế mất bao lâu sau khi đơn hàng hủy thành công?',
      answer: 'Đối với các thanh toán qua QR Code / Chuyển khoản ngân hàng 247, số tiền được hoàn trả trong vòng 2 đến 24 giờ làm việc. Với thẻ Visa/Mastercard, EL-TECH sẽ phát lệnh void giao dịch ngay tức khắc, thời gian tiền về thẻ phụ thuộc vào ngân hàng phát hành (thông thường từ 3 - 7 ngày làm việc).',
      isOpen: true,
    },
    {
      question: 'Linh kiện bị trầy xước nhẹ vỏ hộp bên ngoài trong lúc ship có được đổi mới?',
      answer: 'Nếu tình trạng móp méo hộp bên ngoài gây nghi ngờ ảnh hưởng đến bảng mạch bên trong, quý khách vui lòng từ chối nhận hàng từ shipper hoặc lập biên bản đồng kiểm có chữ ký nhân viên giao hàng. EL-TECH sẽ tiến hành gửi ngay một sản phẩm nguyên seal khác mà không phụ thu bất kỳ chi phí nào.',
      isOpen: false,
    },
    {
      question: 'Tôi ở tỉnh xa thì gửi bảo hành linh kiện như thế nào?',
      answer: 'Quý khách tạo Ticket RMA trên trang này, sau đó dán mã ticket lên gói hàng và gửi về chi nhánh EL-TECH gần nhất thông qua các đơn vị vận chuyển Viettel Post hoặc GHTK. EL-TECH hỗ trợ chi phí vận chuyển 2 chiều đối với sản phẩm trong thời hạn bảo hành 30 ngày đổi mới.',
      isOpen: false,
    },
    {
      question: 'Thùng máy PC Custom Build gửi đi bảo hành có cần gửi nguyên bộ không?',
      answer: 'Nếu quý khách xác định được linh kiện lỗi (ví dụ RAM hoặc Card màn hình), chỉ cần tháo linh kiện đó gửi về theo hướng dẫn từ chuyên viên kỹ thuật. Trường hợp không rõ nguyên nhân, quý khách có thể gửi nguyên thùng máy về showroom để chạy bài test tải chuyên sâu 24 giờ.',
      isOpen: false,
    },
  ]);

  protected canSubmit(): boolean {
    return (
      this.orderId.trim().length > 0 &&
      this.phone.trim().length > 0 &&
      this.description.trim().length > 5
    );
  }

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const names: string[] = [];
      for (let i = 0; i < input.files.length; i++) {
        names.push(input.files[i].name);
      }
      this.uploadedFiles.set(names);
    }
  }

  protected submitTicket(): void {
    if (!this.canSubmit() || this.isSubmitting()) return;
    this.isSubmitting.set(true);

    setTimeout(() => {
      const ticketNumber = Math.floor(1000 + Math.random() * 9000);
      this.createdTicketCode.set(`TK-${ticketNumber}`);
      this.isSubmitting.set(false);
      this.orderId = '';
      this.phone = '';
      this.serialNumber = '';
      this.description = '';
      this.uploadedFiles.set([]);
    }, 600);
  }

  protected toggleFaq(index: number): void {
    const updated = this.faqs().map((item, i) => {
      if (i === index) {
        return { ...item, isOpen: !item.isOpen };
      }
      return item;
    });
    this.faqs.set(updated);
  }
}
