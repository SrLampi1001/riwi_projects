# Contributing

This file documents how work is organized in this repository. It is written primarily as a personal reference for the single maintainer, and will be expanded when collaborators are added.

## Branch model

- `main` — source of truth. Changes only land via reviewed PRs from `develop`.
- `develop` — integration branch for day-to-day work. Direct pushes are allowed; see *Branch protection* below.
- `project/<area>/<name>` — per-project views, both publishable *and* writable. Push to either side of the relationship and the other follows via CI.

### Bidirectional subtree sync

`develop` and `project/<area>/<name>` branches are kept in sync by two workflows sharing a `concurrency: subtree-sync` group (so they cannot run at the same time):

- **`.github/workflows/publish-subtrees.yml`** — fires on push to `develop` (when paths under `python/*/**`, `webprojects/*/**`, or `ai_workflows/*/**` change). For each affected prefix, splits `develop` and `git subtree push`-es the result to the corresponding `project/<area>/<name>` branch. Includes a divergence guard that fail-fasts if the project branch's remote SHA does not match `develop`'s synthetic SHA for that prefix.
- **`.github/workflows/sync-from-subtree.yml`** — fires every 5 minutes via cron and on `workflow_dispatch`. Polls every tracked `project/*` branch; for each, compares the remote SHA against `develop`'s synthetic SHA for the corresponding prefix. If the project branch is strictly ahead, `git subtree pull --squash`-es it into `develop` and pushes `develop`. No-ops if they already match or if `develop` is ahead (publish-subtrees handles that direction). Fails loudly if the histories have diverged (no common ancestor) — the operator must resolve manually.

#### Why polling instead of push trigger

The reverse direction cannot use `on: push: branches: ['project/**']`. Project branches are synthetic `git subtree split` views: they contain only the files under the prefix, so `.github/workflows/sync-from-subtree.yml` is not present at the push SHA. GitHub Actions evaluates the workflow file at the push SHA, which means the trigger would never fire. The scheduled poll sidesteps this by checking every branch from inside the workflow.

Push latency from a project branch to `develop` is therefore up to ~5 minutes. For a single-writer repo this is acceptable. If real-time becomes necessary, a repo webhook + `repository_dispatch` can be added later.

The mapping between prefixes and project branches lives in `scripts/subtree-map.sh` (single source of truth, sourced by both workflows).

Submodules (`webprojects/kepler_page`, `webprojects/portfolio`) are refreshed weekly by `.github/workflows/submodules_sync.yml`.

> **Note on `project/*` branches and GitHub's deleted-branch cache.** GitHub keeps a UI cache of recently deleted branches under the *Branches* view, with a *Restore* button. If you click *Restore* on a `project/*` branch that was deleted to recover from drift, GitHub will re-create the branch at its old (pre-deletion) commit, undoing the fresh bootstrap. The publish workflow detects this case (it compares the remote SHA against develop's synthetic SHA before pushing) and fails with a recovery message instead of silently overwriting. If that happens, delete the branch again on origin and re-run the workflow.

## Branch protection

`main` and `develop` are protected asymmetrically:

- **`main`** — full protection: pull request required to merge, required status checks (`Markdown lint`, `Relative link check`), linear history, conversation resolution required, no force pushes, no branch deletion. (`actionlint` runs whenever a workflow file under `.github/workflows/` is changed, but it is not a merge gate because it has nothing to validate on PRs that don't touch workflow files.)
- **`develop`** — relaxed protection: direct pushes are allowed (used by `sync-from-subtree.yml` to land subtree pulls, and by humans via PRs the same way `main` accepts them). Still enforced: no force pushes, no branch deletion. Status checks still run but do not gate.

`project/<area>/<name>` branches have no protection; both humans and the publish workflow can push to them freely.

When collaborators join, re-tighten `develop` (re-enable pull-request required and status checks) and raise the approval count on `main` from `0` to `1`.

## Working until collaborators are accepted

The repository is single-maintainer for now. The following pieces are deliberately deferred until collaborators join:

- Issue and PR templates
- The `project.yml` metadata contract (referenced by the root README's "Should know" section)
- Per-project branch naming conventions
- Tighter approval requirements (raise `required_approving_review_count` from `0` to `1`)

The CI workflows already in place (`lint-workflows`, `docs-check`, Dependabot) should continue to gate every change regardless of who pushes.

## Local checks

The same CI checks can be run locally before pushing. See the `Local checks` section in `README.md`.
