export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  categoryLabel: string;
  price: number;
  stock: number;
  spec: string;
  badge: string;
  visual: string;
  imageUrl?: string;
  media?: unknown;
};

export const PRODUCTS: readonly Product[] = [
  { id: 'gpu-rtx-5070', name: 'GeForce RTX 5070 Windforce OC 12G', brand: 'GIGABYTE', category: 'gpu', categoryLabel: 'Card đồ hoạ', price: 18490000, stock: 8, spec: '12GB GDDR7 · DLSS 4 · 250W', badge: 'Mới về', visual: 'GPU' },
  { id: 'gpu-rx-9070', name: 'Radeon RX 9070 XT Nitro+ 16GB', brand: 'SAPPHIRE', category: 'gpu', categoryLabel: 'Card đồ hoạ', price: 21590000, stock: 4, spec: '16GB GDDR6 · 304W', badge: 'Hiệu năng cao', visual: 'GPU' },
  { id: 'cpu-r7-9800x3d', name: 'AMD Ryzen 7 9800X3D', brand: 'AMD', category: 'cpu', categoryLabel: 'CPU', price: 14990000, stock: 12, spec: '8 nhân · 16 luồng · AM5', badge: 'Gaming choice', visual: 'CPU' },
  { id: 'cpu-i7-14700k', name: 'Intel Core i7-14700K', brand: 'INTEL', category: 'cpu', categoryLabel: 'CPU', price: 10490000, stock: 10, spec: '20 nhân · LGA 1700 · 253W', badge: 'Bán chạy', visual: 'CPU' },
  { id: 'pc-apex', name: 'EL APEX · Ryzen 7 / RTX 5070', brand: 'EL-TECH', category: 'pc', categoryLabel: 'PC bộ', price: 36990000, stock: 3, spec: '32GB DDR5 · 1TB NVMe · B650', badge: 'Build sẵn', visual: 'PC' },
  { id: 'pc-nova', name: 'EL NOVA · Core i5 / RTX 5060 Ti', brand: 'EL-TECH', category: 'pc', categoryLabel: 'PC bộ', price: 25990000, stock: 5, spec: '32GB DDR5 · 1TB NVMe · B760', badge: 'Value build', visual: 'PC' },
  { id: 'ram-fury', name: 'Kingston Fury Beast DDR5 32GB', brand: 'KINGSTON', category: 'memory', categoryLabel: 'RAM & SSD', price: 3290000, stock: 24, spec: '6000MT/s · CL30 · 2×16GB', badge: 'DDR5', visual: 'RAM' },
  { id: 'ssd-sn850x', name: 'WD Black SN850X 1TB NVMe Gen4', brand: 'WESTERN DIGITAL', category: 'memory', categoryLabel: 'RAM & SSD', price: 2490000, stock: 16, spec: '7300MB/s · M.2 2280 · Gen4', badge: 'Gen 4', visual: 'SSD' },
];
