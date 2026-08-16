# Contributing

This file documents how work is organized in this repository. It is written primarily as a personal reference for the single maintainer, and will be expanded when collaborators are added.

## Branch model

- `main` — source of truth. Changes only land via reviewed PRs from `develop`.
- `develop` — integration branch for day-to-day work. Direct pushes are allowed; see *Branch protection* below.
- `project/<area>/<name>` — per-project views, both publishable *and* writable. Push to either side of the relationship and the other follows via CI.

### Bidirectional subtree sync

`develop` and `project/<area>/<name>` branches are kept in sync by two workflows sharing a `concurrency: subtree-sync` group (so they cannot run at the same time):

- **`.github/workflows/publish-subtrees.yml`** — fires on push to `develop` (when paths under `python/*/**`, `webprojects/*/**`, or `ai_workflows/*/**` change). For each affected prefix, splits `develop` and `git subtree push`-es the result to the corresponding `project/<area>/<name>` branch. Includes a divergence guard that fail-fasts if the project branch's remote SHA does not match `develop`'s synthetic SHA for that prefix.
- **`.github/workflows/sync-from-subtree.yml`** — fires on push to any `project/**` branch. Resolves the branch name to its prefix via `scripts/subtree-map.sh`, then `git subtree pull`s the project branch into `develop` and pushes `develop` directly. Aborts (no push to `develop`) if the pull reports a merge conflict — the operator resolves locally and pushes the result.

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
