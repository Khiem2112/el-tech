# EL-TECH Frontend Interaction Patterns v1

## Status

- **State:** Active baseline
- **Confirmed:** 2026-10-19
- **Basis:** `ecommerce_integrate/.agents`, EL-TECH Angular repository, WAI-ARIA APG, Angular CDK, and Spartan UI documentation

These patterns are defaults for customer-facing EL-TECH web features. Feature
designs cite their IDs and record any approved deviation.

## Surface choice

### SURFACE-001 — Routed page

Use for multi-step work, stable deep links, refresh/re-auth recovery, outcomes
that need history, long reading, or forms with more than about eight fields.
The route owns prerequisites and recoverable state. Do not strand a quick,
atomic action on a sparse page merely to avoid implementing an overlay.

### SURFACE-002 — Dialog

Use for an atomic confirmation or roughly one to five focused fields when the
underlying page context must remain intact. The dialog has an accessible title,
inert background, focus trap, safe initial focus, Escape behavior when safe,
dirty-state protection when needed, and focus restoration. Do not use for
browsing, multi-step checkout, stable URLs, or large structured content.

### SURFACE-003 — Sheet or drawer

Use for quick inspection, filtering, or selection that benefits from retaining
the parent context. On narrow screens, complex selection may become full-screen
and may own one history entry so Back closes it. A sheet is not a hidden routed
page and must not grow into an unbounded multi-step workflow.

### SURFACE-004 — Popover

Use for a small transient choice, menu, or hint. Never use it for
validation-heavy forms or consequential workflows. Render through a verified
Spartan/CDK overlay so it does not change parent scroll dimensions or get
clipped.

## Selection controls

### SELECT-001 — Visible single choice

Use radio buttons or a segmented control for two to four short, mutually
exclusive choices when seeing every option improves the decision. Do not hide
these choices in a dropdown.

### SELECT-002 — Visible multiple choice

Use a checkbox group for two to five short options. A selected checkbox is not
a navigational tab or toggle button. Group controls with a visible question and
programmatic label.

### SELECT-003 — Searchable single combobox

Use when the value must come from a larger predefined set and search materially
reduces effort. Preserve the committed value while the user explores; Escape
closes without an unintended change. Define loading, no-result, error, clear,
and disabled behavior. Use stable IDs and a verified component primitive.

### SELECT-004 — Searchable multi-select

Use for a larger multi-choice set. Focus and selected state remain distinct;
keyboard users can navigate without losing prior selections. Show up to three
short selected values as removable chips; otherwise use a count summary plus a
review/remove surface. Provide explicit Select all/Clear all only when the
meaning and scope are safe. Rich options containing links, buttons, or several
interactive fields require a selection page or sheet, not a listbox option.

## Filter and search

### FILTER-001 — Catalog filter bar

Keep text search and the highest-value filters visible on desktop; place less
frequent filters behind `Thêm bộ lọc`. Show applied values as removable chips
or an equivalent summary, result count, and `Xóa tất cả` when at least two
filters are active. Combine fields with AND and multiple values in one field
with OR unless the feature design states otherwise.

Store shareable `q`, filter, sort, and page state in the URL. A filter or sort
change resets page to one. Debounce only text input, normally 250–300 ms; direct
choices respond immediately. On mobile, use a sheet/full-screen filter surface
with Apply and Reset when live updates would cause repeated layout or network
churn. First-use empty, filtered zero-result, loading, and load failure remain
distinct and preserve applicable filter state.

## Sorting and manual ordering

### ORDER-001 — Data sorting

Sorting changes presentation, not stored business order. Provide a meaningful,
deterministic default; expose only allow-listed fields and directions; show the
active sort clearly; persist it in the URL when it changes returned results;
and reset pagination after a change. Do not expose multi-column sorting unless
a proven customer task requires it.

### ORDER-002 — Manual reordering

Manual reordering changes persisted sequence. Use Angular CDK drag/drop with a
dedicated handle, not a whole clickable row. Provide visible or discoverable
Move up/Move down keyboard controls, keep focus on the moved item, announce its
new position, update the data model after drop, and roll back with useful error
feedback if persistence fails. Dragging is an enhancement, never the only input
method.

## Pagination and progressive loading

### PAGE-001 — Product catalog pagination

Use server-side pagination by default for product catalog and search when users
must share, refresh, or return to a result position. Default to 24 products per
page; offer 24/48 only when evidence supports a page-size choice. Keep query,
filters, and sort in page links; mark the current page with `aria-current`; and
move scroll/focus to the result heading after navigation without discarding
safe stale results during loading. Handle an out-of-range page separately from
a genuinely empty catalog.

### PAGE-002 — Account collection pagination

Use 20 items per page for customer orders or saved configurations unless the
approved design chooses a simpler Previous/Next contract. Preserve URL state
and do not inherit the 25/50/100 density used by admin directories.

### PAGE-003 — Load more

Use a user-triggered Load more control for a discovery list where stable page
numbers are unnecessary but the footer and user control must remain reachable.
Restore position on Back. Infinite scroll is not the default for catalog,
checkout, orders, or any collection with bulk actions or a meaningful footer.

## Shared verification

Every adopted pattern must be verified for keyboard operation, visible focus,
long Vietnamese labels, 200% zoom, 360/768/1024/1280 widths, loading and
failure recovery, URL restoration where promised, and the installed Angular /
Spartan versions. Pattern compliance does not replace feature acceptance tests.

## Primary references

- WAI-ARIA APG: https://www.w3.org/WAI/ARIA/apg/patterns/
- Angular CDK drag/drop: https://angular.dev/guide/drag-drop
- Spartan components: https://spartan.ng/components
