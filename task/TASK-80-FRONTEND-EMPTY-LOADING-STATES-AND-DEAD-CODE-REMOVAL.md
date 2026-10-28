# Task: TASK-80 - Hoan Thien Khung Trang Thai Rong, Bo Dem Tai Va Xoa Ma Nguon Ton Dong

- Feature: Empty/Loading States & Dead Code Removal
- Governing Spec: [report/frontend_impeccable_polish_report.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/report/frontend_impeccable_polish_report.md) (Nhom 5), [.agents/skills/flow-empty-states/SKILL.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/flow-empty-states/SKILL.md), [.agents/skills/flow-errors/SKILL.md](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/.agents/skills/flow-errors/SKILL.md)
- Scope: frontend
- Priority: P2 (Medium)
- Status: Complete

## Traceability & Graph Links

- Task Type: `ui-ux-polish`
- Issue References: Polish Audit Group 5 (Empty/Loading Resilience & Code Cleanup)
- Related Tasks:
  - [[TASK-71-ADMIN-SHELL-LIGHT-THEME-AND-CLEANUP]]
  - [[TASK-73-ADMIN-ORDERS-OPERATIONS-AND-MODALS]]

## Objective

1. Hoan thien khung hien thi trang thai rong (Empty States) va bo dem tai (Loading Skeletons) tren cac man hinh:
   - [order-lookup-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/orders/order-lookup-page.component.ts): Hien thi trang thai rong ro rang khi chua tra cuu hoac khong tim thay don hang; them skeleton loading trong thoi gian cho API phan hoi.
   - [order-kanban-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/orders/order-kanban-page.component.ts): Bo sung the empty state thanh manh ben trong moi cot trang thai khi cot khong co don hang nao.
   - [refund-page.component.ts](file:///c:/University/Education%20program/HK1-nam-4/web-nang-cao/project/fe/src/app/features/refund/refund-page.component.ts): Bo sung loading indicator khi dang gui yeu cau doi tra hoac tai lich su RMA.
   - Cac nut submit trong toan bo he thong: Khi `isSubmitting()` la true, hien thi icon spinner `<lucide-icon name="loader-2" class="size-4 animate-spin" />` va vo hieu hoa nut bam.
2. Xoa ma nguon thua va tep ton dong (Dead code removal):
   - Xoa bo tep `admin-placeholder-page.component.ts` tai `fe/src/app/features/admin/pages` do khong con bat ky route nao tro toi.
   - Xoa bo tep re-export trung lap `admin/pages/admin-dashboard-page.component.ts` va don dep thu muc `fe/src/app/features/admin/pages`.

## Technical Context And Dependencies

- Target Files:
  - `fe/src/app/features/orders/order-lookup-page.component.ts`
  - `fe/src/app/features/orders/order-kanban-page.component.ts`
  - `fe/src/app/features/refund/refund-page.component.ts`
  - `fe/src/app/features/admin/pages/admin-placeholder-page.component.ts` (xoa)
  - `fe/src/app/features/admin/pages/admin-dashboard-page.component.ts` (xoa)

## Checklist

- [x] Bo sung skeleton loading va empty state truc quan trong `order-lookup-page.component.ts`.
- [x] Bo sung empty placeholder cho cac cot trong `order-kanban-page.component.ts`.
- [x] Bo sung loading feedback khi thao tac tren `refund-page.component.ts`.
- [x] Dong bo spinner `loader-2` tren toan bo cac nut co trang thai submitting.
- [x] Xoa bo `fe/src/app/features/admin/pages/admin-placeholder-page.component.ts` va `admin-dashboard-page.component.ts`.
- [x] Chay kiem tra `npm run check:fe` voi exit code 0.
