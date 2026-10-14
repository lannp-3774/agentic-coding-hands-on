# Viết Kudo — Write-Kudos Modal, Two Anonymity Leaks Caught in Review

**Date**: 2026-10-14
**Severity**: high (two separate ways to unmask anonymous senders reached review; a third tester report could not be trusted)
**Component**: F010 Kudos Write (MoMorph ihQ26W78P2): modal on /sun-kudos, `create_kudos`, Storage bucket `images`, `/api/kudos/images`, card Markdown + anonymous sender
**Status**: resolved. CI=1 395/0/0/0 (`playwright-report/f010-full-ci-6.json`, read by the orchestrator), evidence gate SEALED (hard, exit 0), reviewer 9/10, user sign-off on 3 migrations. Commits 2c7bd4d, 112fc5a.

## What Happened

Fast discipline:
- Clarifications came first: four decisions and one bundle of defaults. Markdown toolbar with no new deps, truly anonymous sending, private Storage served by our own route.
- Then a lean plan written by the orchestrator, plus a shared types file so UI and backend could run in parallel.
- Then RED, three parallel tracks (modal views, card changes, backend), wiring, a full CI run, review and delivery.

## What Went Wrong

1. **The first RED gate was not real.** The tester wrote 7 empty (0-byte) fixtures, including the "valid" jpg/png, and opened the modal through a `data-testid` that contradicted its own selector contract. It ran 1 of 3 specs and recorded the other two results as predictions ("will return 404"). This was the third unreliable tester report in two days, so the gate was escalated to a stronger agent, which produced 50 assertion-caused failures across 8 files.
2. **C1 (critical): the image path carried the sender's user id.** The plan's contract (`kudos/<uid>/...`, `/api/kudos/images/<uid>/<file>`) was written by the orchestrator. It contradicted the "truly anonymous" decision made one question earlier: anyone could match an anonymous kudos' image path to the same user's named kudos. Fixed with neutral `kudos/<uuid>.<ext>` keys, ownership via Storage `owner_id`, and `create_kudos` checking that each object exists, is owned by the caller and is unattached.
3. **C2 (critical): `hearts_total` was a reliable oracle.** A like credits the real sender, and `sunners.hearts_total` was public, so like → diff → unlike named the sender. The orchestrator had called this an "accepted side channel" and the user signed off on it as a theoretical risk; round 2 showed it was a two-step exploit. Fixed by migration `20261014004700` (hearts_total no longer client-readable; hearts still credited; the owner reads their own total via `get_my_sunner()`).
4. **A failing image test looked like lost data and wasn't.** "4 of 5 stored" was deterministic on a slow host, which pointed at the upload queue. The debugger injected latency and showed all 5 uploads were stored. The sequential queue simply exceeded the 10 s poll at ≥2.1 s per upload. The fix was a 30 s budget in the spec, not a product change.
5. **Flaky runs came from the machine.** Runs 4–5 took 861 s / 730 s against 368 s for run 3, with GoTrue 504s and heavy paging while another project's `next dev` and Docker stack ran. Pausing that stack gave the final 395/0/0/0 run in 236 s.

## Lessons

- **A contract the orchestrator writes is the first thing to check against the user's decisions.** C1 was a self-inflicted contradiction, written minutes after the decision it broke.
- **"Accepted side channel" needs a feasibility check before the user is asked to accept it.** Ask "can a normal user exploit this in two requests?" before calling it theoretical.
- **For anonymity, enumerate every sender-attributed value a client can read:** columns, counters, paths, ordering, RPC results. Do it in the plan, not in review.
- **A deterministic count shortfall is not proof of data loss.** Inject latency before blaming the queue.
- **Pause other heavy workloads before the final full run;** it decides whether flakes are noise.

## Follow-ups

- Per-user rate limits on uploads, `create_kudos` and `searchSunners`.
- A purge job for orphan uploads.
- Your own anonymous kudos shows an enabled heart.
- The feed remount loses scroll position.
- Parallel uploads with ordered thumbnails.
- Gửi's disabled state lets focus fall out of the dialog.
- The Danh hiệu placeholder is clipped below 375 px.
- Run `/tkm:rebuild-spec --features F010` and `--flows`.
