---
source_artifact: docs\generated\entities.md
claims_total: 6
claims_with_evidence: 6
confidence_derived: 1.0
generated_by: derive_confidence_report.py
---

# Confidence Report -- docs\generated\entities.md

> **Self-reported citation-coverage stat -- NOT a correctness verification.** This report is derived deterministically by parsing the artifact's own inline `**Source:** file:line` citations and `[UNVERIFIED]`/`[INFERRED]`/`[NEEDS_DOMAIN_CONFIRMATION]` marker tags. It does NOT verify that citations are accurate or that claims are true. For blind truth verification, see `claude/skills/audit-doc-parity/`.

## Claims ↔ Evidence

Legend: `○` = cited (Source file:line present) · `△` = marker-tagged (uncertain, no citation).

| Claim | Section | Evidence (file:line) | Status ○/△ |
|---|---|---|---|
| (`AWARD_COLUMNS`, `AwardRow`), guard `:34-44` (`isAwardRow`). | Entities | supabase/migrations/20261008045411_create_awards.sql:15-22 | ○ |
| (`AWARD_COLUMNS`, `AwardRow`), guard `:34-44` (`isAwardRow`). | Entities | supabase/seeds/common/01-awards.sql:4-28 | ○ |
| (`AWARD_COLUMNS`, `AwardRow`), guard `:34-44` (`isAwardRow`). | Entities | lib/awards/get-awards.ts:25-27 | ○ |
| (`AWARD_COLUMNS`, `AwardRow`), guard `:34-44` (`isAwardRow`). | Entities | lib/awards/award-card-mapping.ts:7-16 | ○ |
| (`readRole`), kiểu `UserRole` `:6`. | Entities | supabase/migrations/20261008045415_create_profiles.sql:18-23 | ○ |
| (`readRole`), kiểu `UserRole` `:6`. | Entities | lib/supabase/current-user.ts:61-83 | ○ |

## Missing Info

Candidate sections to check for `△` (marker-tagged) claims -- best-effort only, not authoritative:

_(none -- no marker-tagged claims)_

## Risk Flags

_(none)_
