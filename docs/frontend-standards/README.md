# Frontend standards

This directory is the tracked source of truth for reusable EL-TECH frontend
interaction decisions. Project skills route agents here; `.agents/` is ignored
by Git and therefore must not be the only place that stores binding standards.

## Active baseline

- [Interaction patterns v1](interaction-patterns-v1.md)
- [Component registry v1](component-registry-v1.md)

Feature designs and technical specifications cite pattern IDs from the active
baseline. A feature-specific approved deviation overrides the default only for
that feature and must not weaken accessibility, security, business rules, or
the governing flow.

Material changes create a new version or a version diff; do not silently
rewrite a standard already used by an approved feature design.
