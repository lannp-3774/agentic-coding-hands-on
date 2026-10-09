# Traceability Matrix

**Project**: Project
**Generated**: 2026-10-08T10:02:24Z
**Scope**: Full codebase

> **Re-projection, not detection.** Every ID below already exists in its source-of-record artifact — this file invents nothing, and is never the first place an ID appears. Source of record per column: `F###` <- `generated/feature-list.md`; `SCR###` <- `generated/screen-list.md`; `US###` <- `generated/user-stories.md`; `BL###` <- `generated/behavior-logic.md`; `ROUTE###` <- `generated/route-list.md` (`Owner F###` column); `PERM###` <- `generated/permissions-matrix.md`.

---

## Matrix

| F### | SCR### | US### | BL### | ROUTE### | PERM### |
|---|---|---|---|---|---|
| F001 | SCR001, SCR002 | US001, US002, US012, US013, US014, US015 | BL001, BL002, BL003 | ROUTE003, ROUTE004, ROUTE005, ROUTE006, ROUTE007, ROUTE009 | PERM001, PERM002, PERM007, PERM008, PERM011 |
| F002 | SCR003 | US008, US009, US010, US011, US016, US017, US018, US019 | BL001 | ROUTE001, ROUTE003, ROUTE006, ROUTE009 | PERM008, PERM009 |
| F003 | SCR003 | US003, US004, US005, US006, US007, US020, US021 | BL001 | ROUTE002 | PERM003, PERM004, PERM005, PERM006, PERM010 |
| F004 | SCR004 | US022, US023, US024, US025, US026, US027 | BL001, BL003 | ROUTE008, ROUTE009 | PERM008, PERM009, PERM012 |

---

## Cross-Reference Validation

- [x] Every `SCR###`/`US###`/`BL###`/`PERM###` cell is projected from `generated/feature-list.md`'s own per-feature `**Related X**:` bullets
- [x] Every `ROUTE###` cell is projected from `generated/route-list.md`'s own `Owner F###` column
- [x] No ID in this matrix is invented — see `validate_traceability_matrix.py` for the WARN-first cross-check against each source-of-record inventory
