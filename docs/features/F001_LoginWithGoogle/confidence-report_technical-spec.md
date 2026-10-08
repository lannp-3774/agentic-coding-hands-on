---
source_artifact: docs\features\F001_LoginWithGoogle\technical-spec.md
claims_total: 35
claims_with_evidence: 35
confidence_derived: 1.0
generated_by: derive_confidence_report.py
---

# Confidence Report -- docs\features\F001_LoginWithGoogle\technical-spec.md

> **Self-reported citation-coverage stat -- NOT a correctness verification.** This report is derived deterministically by parsing the artifact's own inline `**Source:** file:line` citations and `[UNVERIFIED]`/`[INFERRED]`/`[NEEDS_DOMAIN_CONFIRMATION]` marker tags. It does NOT verify that citations are accurate or that claims are true. For blind truth verification, see `claude/skills/audit-doc-parity/`.

## Claims ↔ Evidence

Legend: `○` = cited (Source file:line present) · `△` = marker-tagged (uncertain, no citation).

| Claim | Section | Evidence (file:line) | Status ○/△ |
|---|---|---|---|
| (unlabeled claim) | 3. Actions | app/login/page.tsx:15-44 | ○ |
| (unlabeled claim) | 3. Actions | app/login/_components/login-screen.tsx:20-109 | ○ |
| (unlabeled claim) | 3. Actions | app/login/_components/google-button.tsx:13-60 | ○ |
| (unlabeled claim) | 3. Actions | lib/i18n/get-locale.ts:9-12 | ○ |
| (unlabeled claim) | 3. Actions | lib/i18n/dictionary.ts:25-41 | ○ |
| (unlabeled claim) | 3. Actions | app/login/_components/google-button.tsx:13-60 | ○ |
| (unlabeled claim) | 3. Actions | app/login/actions.ts:29-61 | ○ |
| (unlabeled claim) | 3. Actions | lib/supabase/server.ts:19-50 | ○ |
| (unlabeled claim) | 3. Actions | app/auth/callback/route.ts:24-60 | ○ |
| (unlabeled claim) | 3. Actions | lib/supabase/server.ts:19-50 | ○ |
| (unlabeled claim) | 3. Actions | supabase/migrations/20261008045415_create_profiles.sql:41-58 | ○ |
| (unlabeled claim) | 3. Actions | app/_components/site/language-selector.tsx:24-146 | ○ |
| (unlabeled claim) | 3. Actions | lib/i18n/actions.ts:8-17 | ○ |
| (unlabeled claim) | 3. Actions | lib/i18n/locales.ts:1-11 | ○ |
| (unlabeled claim) | 3. Actions | app/_components/html-lang.tsx:10-35 | ○ |
| (unlabeled claim) | 3. Actions | proxy.ts:9-19 | ○ |
| (unlabeled claim) | 3. Actions | lib/supabase/proxy-session.ts:30-105 | ○ |
| (unlabeled claim) | 3. Actions | lib/supabase/session-cookie-options.ts:11-16 | ○ |
| (unlabeled claim) | 4. Shared Foundation | app/auth/callback/route.ts:4 | ○ |
| (unlabeled claim) | 4. Shared Foundation | app/auth/callback/route.ts:26-29 | ○ |
| (unlabeled claim) | 4. Shared Foundation | lib/supabase/proxy-session.ts:6-10 | ○ |
| (unlabeled claim) | 4. Shared Foundation | lib/supabase/proxy-session.ts:102 | ○ |
| (unlabeled claim) | 4. Shared Foundation | app/auth/callback/route.ts:8 | ○ |
| (unlabeled claim) | 4. Shared Foundation | app/auth/callback/route.ts:26-29 | ○ |
| (unlabeled claim) | 4. Shared Foundation | app/login/page.tsx:9-11 | ○ |
| (unlabeled claim) | 4. Shared Foundation | app/login/page.tsx:28-30 | ○ |
| (unlabeled claim) | 4. Shared Foundation | lib/i18n/locales.ts:1-11 | ○ |
| (unlabeled claim) | 4. Shared Foundation | lib/i18n/get-locale.ts:9-12 | ○ |
| (unlabeled claim) | 4. Shared Foundation | lib/i18n/actions.ts:8-17 | ○ |
| (unlabeled claim) | 4. Shared Foundation | lib/supabase/session-cookie-options.ts:11-16 | ○ |
| (unlabeled claim) | 4. Shared Foundation | lib/supabase/server.ts:24 | ○ |
| (unlabeled claim) | 4. Shared Foundation | lib/supabase/proxy-session.ts:67 | ○ |
| (unlabeled claim) | 4. Shared Foundation | app/login/actions.ts:39-43 | ○ |
| (unlabeled claim) | 4. Shared Foundation | app/auth/callback/route.ts:46-47 | ○ |
| (unlabeled claim) | 4. Shared Foundation | lib/supabase/proxy-session.ts:65-82 | ○ |

## Missing Info

Candidate sections to check for `△` (marker-tagged) claims -- best-effort only, not authoritative:

_(none -- no marker-tagged claims)_

## Risk Flags

_(none)_
