import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({ name: 'vnd' })
export class VndPipe implements PipeTransform {
  transform(value: number): string { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value); }
}
