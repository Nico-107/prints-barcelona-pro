# Checkpoint run: what you do

One long Claude Code run (plan for 20+ hours) that works through 92 checklist items covering everything on your list: order emails, the admin, purchase blockers, pricing, Sevilla pickup, the price window, Packlink, emails, and tests on every page. It cannot finish early. A Stop hook blocks every "I'm done" until `scripts/checkpoint/verify.mjs` confirms each item. The `/goal` check also needs the raw proof in the transcript.

## Before you start (10 minutes)

1. **Update Claude Code:** run `claude update`, then `claude --version`. `/goal` needs a recent version, and automatic continue after a usage limit needs v2.1.234 or later.
2. **Clean repo:**
   ```bash
   cd ~/Projects/prints-barcelona-pro
   git checkout main && git pull && git status
   ```
   `git status` must say "nothing to commit". If it doesn't, commit or stash first.
3. **`.env` present:** `ls .env` must show the file. The build and some tests need it.
4. **Keep the Mac awake:** plugged in, lid open. The start command uses `caffeinate`, so the Mac won't sleep while Claude runs.
5. **Hands off during the run:** don't use Lovable on this project (it pushes to `lovable-sync` and causes conflicts), and don't edit the repo yourself.

## Start

1. **Unpack** (if the zip isn't in Downloads, change the path):
   ```bash
   cd ~/Projects/prints-barcelona-pro
   git checkout main && git pull
   unzip -o ~/Downloads/dimension3d-checkpoint-2026-11-25.zip -d .
   ```
2. **Optional, now:**
   - Change any decision in the table at the bottom of this file by editing `docs/checkpoint/MASTER_PROMPT.md` §0.4.
   - Put the architecture student's real STL in `test-fixtures/checkpoint/private/` (create the folder). Git ignores it, so the file is never uploaded, and the run uses it as an extra test.
3. **Install the hook, commit, start:**
   ```bash
   node scripts/checkpoint/install-hook.mjs
   git add docs/checkpoint scripts/checkpoint test-fixtures/checkpoint .claude/settings.json
   git commit -m "checkpoint: kickoff files"
   git push
   pbcopy < docs/checkpoint/GOAL.txt
   caffeinate -dims claude --model opus --dangerously-skip-permissions
   ```
4. **Set the goal:** in Claude Code, type `/goal`, add a space, paste with Cmd+V, and press Enter. The work starts right away. To check that the whole condition was taken, type `/goal` with nothing after it: it should show the full text.

## While it runs

- **Hotfix first:** the hotfix (phase H) goes live on main within the first hours.
  - Buy always equals what Stripe charges.
  - Too-big parts can no longer be bought at a wrong price.
  - Sevilla pickup works.
  - Errors are friendly and never a dead end.
  - The admin shows the customer's data, and file downloads work.
- **Progress:** open `docs/checkpoint/PROGRESS.md`, or run `node scripts/checkpoint/verify.mjs` in a second terminal (✔ done, … pending, ✘ failing).
- **Test orders:** the live checks create up to 6 unpaid test orders, listed in PROGRESS.md. Delete them in the admin afterwards.
- **Talking to it:** you can type a message at any time. It answers, then carries on.

## If it stops

| You see | Do this |
|---|---|
| `Usage limit reached · continuing automatically at …` | Nothing. Keep the Mac awake. |
| `Your usage limit has reset` / `Press enter to continue` | Press Enter. |
| `Automatic continue stopped after repeated usage-limit hits` | Type `continue`, or run `/rate-limit-options` and choose "Wait here, then continue automatically". |
| Weekly limit reached | Wait for the reset, then type `continue`. |
| A warning about no progress, goal still set | Type `continue`. |
| `Goal cleared after an unrecoverable error` | Type `/goal`, a space, then paste GOAL.txt again. It resumes from the checklist. |
| Terminal closed or Mac restarted | Run `cd ~/Projects/prints-barcelona-pro && caffeinate -dims claude --continue --model opus --dangerously-skip-permissions` and type `continue`. The goal comes back by itself. If `/goal` shows nothing, paste it again. |

## Stopping it on purpose

1. Run `rm docs/checkpoint/ACTIVE`.
2. In Claude Code, run `/goal clear`. Esc interrupts the current step.

As long as `docs/checkpoint/ACTIVE` exists, every Claude Code session in this repo keeps working on the checkpoint. That is on purpose. The run deletes the file itself at the very end.

To resume later: run `git checkout docs/checkpoint/ACTIVE`, start Claude Code with the same command as above, then paste the goal again.

## When it's done

It prints `CHECKPOINT VERIFIED`, the proof commands and your to-do list (also in `docs/checkpoint/FINAL_REPORT.md`). Then:

1. **Lovable:** paste the prompt from `docs/checkpoint/LOVABLE_DEPLOY.md`. It switches Lovable to `main`, runs the SQL and deploys every function. Until you do this, the site runs correctly in "legacy" mode: same prices as today's server, and everything still works.
2. **Check the deploy:** run `npm run verify:deploy`. Everything should be green.
3. **Admin:** in Estado del sistema, everything should be green. Then run "Sincronizar Stripe" to backfill the older orders.
4. **Optional, Packlink:** set up Zapier with `docs/checkpoint/ZAPIER_PACKLINK_SETUP.md`, and export one example CSV from Packlink PRO.
5. **Clean up:** delete the test orders.
6. **Next prompt:** security.

## Decisions you can still change (Start, step 2)

Edit the table in `docs/checkpoint/MASTER_PROMPT.md` §0.4 before the kickoff commit. The run follows it.

| ID | Current decision |
|---|---|
| D-1 | Edge functions are edited in the repo. Lovable only deploys them, in one step at the end. This is what fixes the "pushed but never deployed" problem. |
| D-2 | Shipping v5: 4,90 €, free from 30 €. Non-local pages show the price with delivery included. Local pages test A/B. Active only after the Lovable deploy. |
| D-3 | Pickup in Barcelona (Les Corts) on the homepage, the Barcelona pages, "cerca de mí" and the about pages. Pickup in Sevilla on the two Sevilla pages. Shipping only everywhere else. |
| D-4 | Lead times come from one place: "Lista en 1–3 días laborables · urgente: al día siguiente". |
| D-7 | 9,90 € entry price stays. |
| D-8 | Order emails go to `011107miko@gmail.com` and `dimension3dprintsbcn@gmail.com`. Sevilla orders also go to Daniel. The repo is public, so these addresses become visible in the code until you make it private (security prompt). |
| D-9 | Trust numbers: about 300 orders, 25 Google reviews (24 of them 5★), rating 4,8. |
| D-11 | Instant Buy up to 200 €. Above that, a free review with "Te confirmo en < 1 h". |
