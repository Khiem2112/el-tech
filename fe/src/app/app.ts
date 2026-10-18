import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { checkoutSchema } from './forms/checkout.schema';
import { zodValidator } from './forms/zod-validator';
import { VndPipe } from './lib/vnd.pipe';
import { CartService } from './services/cart.service';
import { PRODUCTS, type Product } from './data/product.data';

type Category = { id: string; label: string };

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, VndPipe],
  providers: [CartService],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly cart = inject(CartService);
  private readonly formBuilder = inject(FormBuilder);
  protected readonly categories: readonly Category[] = [{ id: 'all', label: 'Tất cả' }, { id: 'gpu', label: 'Card đồ hoạ' }, { id: 'cpu', label: 'CPU' }, { id: 'pc', label: 'PC bộ' }, { id: 'memory', label: 'RAM & SSD' }];
  protected readonly selectedCategory = signal<string>('all');
  protected readonly searchQuery = signal<string>('');
  protected readonly cartOpen = signal<boolean>(false);
  protected readonly showCheckout = signal<boolean>(false);
  protected readonly showSuccess = signal<boolean>(false);
  protected readonly isSubmitting = signal<boolean>(false);
  protected readonly submissionError = signal<string | null>(null);
  protected readonly orderCode = signal<string>('');
  protected readonly filteredProducts = computed<readonly Product[]>(() => {
    const query = this.searchQuery().trim().toLocaleLowerCase('vi');
    return PRODUCTS.filter((product) => (this.selectedCategory() === 'all' || product.category === this.selectedCategory()) && (!query || `${product.name} ${product.brand} ${product.spec}`.toLocaleLowerCase('vi').includes(query)));
  });
  protected readonly checkoutForm = this.formBuilder.nonNullable.group({
    name: ['', [zodValidator(checkoutSchema.shape.name)]], phone: ['', [zodValidator(checkoutSchema.shape.phone)]], email: ['', [zodValidator(checkoutSchema.shape.email)]], isVerified: [false, [zodValidator(checkoutSchema.shape.isVerified)]], fulfillment: ['delivery' as 'delivery' | 'pickup'], address: ['', [zodValidator(checkoutSchema.shape.address)]], payment: ['qr' as 'qr' | 'cod'],
  });
  protected updateSearch(event: Event): void { this.searchQuery.set((event.target as HTMLInputElement).value); }
  protected selectCategory(categoryId: string): void { this.selectedCategory.set(categoryId); this.scrollToCatalog(); }
  protected clearFilters(): void { this.selectedCategory.set('all'); this.searchQuery.set(''); }
  protected toggleCart(): void { this.cartOpen.update((open) => !open); }
  protected openCheckout(): void { if (!this.cart.items().length) return; this.cartOpen.set(false); this.showCheckout.set(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  protected backToShop(): void { this.showCheckout.set(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  protected deliveryFee(): number { return this.checkoutForm.controls.fulfillment.value === 'delivery' ? 35000 : 0; }
  protected showError(controlName: keyof typeof this.checkoutForm.controls): boolean { const control = this.checkoutForm.controls[controlName]; return control.invalid && (control.touched || control.dirty); }
  protected fieldError(controlName: keyof typeof this.checkoutForm.controls): string { return this.checkoutForm.controls[controlName].errors?.['zodError'] ?? 'Vui lòng kiểm tra lại thông tin.'; }
  protected submitOrder(): void {
    if (this.checkoutForm.controls.fulfillment.value === 'pickup') this.checkoutForm.controls.address.clearValidators(); else this.checkoutForm.controls.address.setValidators([zodValidator(checkoutSchema.shape.address)]);
    this.checkoutForm.controls.address.updateValueAndValidity();
    if (this.checkoutForm.invalid) { this.checkoutForm.markAllAsTouched(); this.submissionError.set('Hãy kiểm tra lại các trường được đánh dấu trước khi đặt hàng.'); return; }
    if (!this.cart.items().length) { this.submissionError.set('Giỏ hàng đã trống, hãy chọn sản phẩm trước khi đặt hàng.'); return; }
    this.isSubmitting.set(true); this.submissionError.set(null);
    window.setTimeout(() => { this.orderCode.set(`EL${Date.now().toString().slice(-8)}`); this.isSubmitting.set(false); this.showCheckout.set(false); this.showSuccess.set(true); this.cart.clear(); window.scrollTo({ top: 0, behavior: 'smooth' }); }, 650);
  }
  protected startOver(): void { this.showSuccess.set(false); this.checkoutForm.reset({ name: '', phone: '', email: '', isVerified: false, fulfillment: 'delivery', address: '', payment: 'qr' }); }
  protected scrollToCatalog(): void { window.setTimeout(() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' })); }
}
