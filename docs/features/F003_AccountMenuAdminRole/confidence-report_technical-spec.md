---
source_artifact: docs\features\F003_AccountMenuAdminRole\technical-spec.md
claims_total: 25
claims_with_evidence: 24
confidence_derived: 0.96
generated_by: derive_confidence_report.py
---

# Confidence Report -- docs\features\F003_AccountMenuAdminRole\technical-spec.md

> **Self-reported citation-coverage stat -- NOT a correctness verification.** This report is derived deterministically by parsing the artifact's own inline `**Source:** file:line` citations and `[UNVERIFIED]`/`[INFERRED]`/`[NEEDS_DOMAIN_CONFIRMATION]` marker tags. It does NOT verify that citations are accurate or that claims are true. For blind truth verification, see `claude/skills/audit-doc-parity/`.

## Claims ↔ Evidence

Legend: `○` = cited (Source file:line present) · `△` = marker-tagged (uncertain, no citation).

| Claim | Section | Evidence (file:line) | Status ○/△ |
|---|---|---|---|
| (unlabeled claim) | 3. Actions | app/_components/header-behaviour/account-region.tsx:24-73 | ○ |
| (unlabeled claim) | 3. Actions | app/_components/site/account-slot-parts.tsx:9-33 | ○ |
| (unlabeled claim) | 3. Actions | app/_components/site/site-header.tsx:46-52 | ○ |
| (unlabeled claim) | 3. Actions | app/_components/site/account-menu-view.tsx:26-58 | ○ |
| (unlabeled claim) | 3. Actions | app/_components/header-behaviour/account-menu.tsx:16-33 | ○ |
| (unlabeled claim) | 3. Actions | lib/ui/use-menu-disclosure.ts:23-74 | ○ |
| (unlabeled claim) | 3. Actions | app/_components/site/account-menu-view.tsx:52-56 | ○ |
| (unlabeled claim) | 3. Actions | lib/auth/actions.ts:19-33 | ○ |
| (unlabeled claim) | 3. Actions | lib/supabase/server.ts:19-50 | ○ |
| (unlabeled claim) | 3. Actions | lib/supabase/current-user.ts:16-58 | ○ |
| (unlabeled claim) | 3. Actions | lib/supabase/current-user.ts:60-83 | ○ |
| (unlabeled claim) | 3. Actions | lib/supabase/server.ts:19-50 | ○ |
| (unlabeled claim) | 3. Actions | supabase/migrations/20261008045415_create_profiles.sql:41-58 | ○ |
| (unlabeled claim) | 3. Actions | supabase/migrations/20261008045415_create_profiles.sql:60-63 | ○ |
| (unlabeled claim) | 4. Shared Foundation | lib/ui/use-menu-disclosure.ts:23-74 | ○ |
| (unlabeled claim) | 4. Shared Foundation | lib/supabase/current-user.ts:26-27 | ○ |
| (unlabeled claim) | 4. Shared Foundation | app/_components/header-behaviour/account-region.tsx:64-68 | ○ |
| (unlabeled claim) | 4. Shared Foundation | supabase/migrations/20261008045415_create_profiles.sql:18-23 | ○ |
| (unlabeled claim) | 4. Shared Foundation | lib/supabase/current-user.ts:76-77 | ○ |
| (unlabeled claim) | 4. Shared Foundation | supabase/migrations/20261008045415_create_profiles.sql:15-16 | ○ |
| (unlabeled claim) | 4. Shared Foundation | supabase/migrations/20261008045415_create_profiles.sql:27-37 | ○ |
| (unlabeled claim) | 4. Shared Foundation | lib/supabase/current-user.ts:38 | ○ |
| (unlabeled claim) | 4. Shared Foundation | lib/auth/actions.ts:22 | ○ |
| (unlabeled claim) | 4. Shared Foundation | lib/supabase/current-user.ts:63-67 | ○ |
| *(A1, A4)* Proxy làm mới phiên cho `/` (matcher `["/", "/login"]`, thuộc F001/BL003) là điều kiện đ… | 5. Verification & Technical Notes | — | △ |

## Missing Info

Candidate sections to check for `△` (marker-tagged) claims -- best-effort only, not authoritative:

- 5. Verification & Technical Notes: *(A1, A4)* Proxy làm mới phiên cho `/` (matcher `["/", "/login"]`, thuộc F001/BL003) là điều kiện đ…

## Risk Flags

_(none)_
