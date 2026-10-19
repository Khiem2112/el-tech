import { Pipe, PipeTransform } from '@angular/core';
import { resolveProductImageUrl } from '../core/constants/product.constants';

@Pipe({
  name: 'productImage',
  standalone: true,
})
export class ProductImagePipe implements PipeTransform {
  transform(media: unknown): string {
    return resolveProductImageUrl(media);
  }
}
