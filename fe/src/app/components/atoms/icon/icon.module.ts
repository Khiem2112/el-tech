import { NgModule } from '@angular/core';
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  Eye,
  Filter,
  LucideAngularModule,
  Package,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  ShoppingCart,
  Trash2,
  X,
} from 'lucide-angular';

const ICONS = {
  ArrowUpDown,
  Check,
  ChevronDown,
  Eye,
  Filter,
  Package,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  ShoppingCart,
  Trash2,
  X,
};

@NgModule({
  imports: [LucideAngularModule.pick(ICONS)],
  exports: [LucideAngularModule],
})
export class AppIconModule {}
