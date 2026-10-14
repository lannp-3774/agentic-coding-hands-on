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
| F005 | SCR005 | US028, US029, US030, US031, US032, US033 | BL003 | ROUTE010 | PERM010, PERM013, PERM014 |
| F006 | SCR006 | US034, US035, US036, US037, US038, US039, US040, US041 | BL001, BL003 | ROUTE011, ROUTE014, ROUTE015 | PERM008, PERM014, PERM015, PERM016 |
| F007 | SCR006 | US042, US043, US044, US045, US046, US047 | — | ROUTE012, ROUTE013, ROUTE021 | PERM015, PERM017, PERM019, PERM025, PERM026 |
| F008 | SCR006 | US048, US049, US050, US051, US052, US053 | — | ROUTE011 | PERM015 |
| F009 | SCR006 | US054, US055, US056, US057 | — | ROUTE011 | PERM016, PERM018, PERM021 |
| F010 | SCR006 | US058, US059, US060, US061, US062, US063 | — | ROUTE016, ROUTE017, ROUTE018, ROUTE019, ROUTE020, ROUTE021 | PERM015, PERM016, PERM020, PERM021, PERM022, PERM023, PERM024, PERM025, PERM026 |

---

## Cross-Reference Validation

- [x] Every `SCR###`/`US###`/`BL###`/`PERM###` cell is projected from `generated/feature-list.md`'s own per-feature `**Related X**:` bullets
- [x] Every `ROUTE###` cell is projected from `generated/route-list.md`'s own `Owner F###` column
- [x] No ID in this matrix is invented — see `validate_traceability_matrix.py` for the WARN-first cross-check against each source-of-record inventory
