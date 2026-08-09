# Contributing

This file documents how work is organized in this repository. It is written primarily as a personal reference for the single maintainer, and will be expanded when collaborators are added.

## Branch model

- `main` — source of truth. Changes only land via reviewed PRs from `develop`.
- `develop` — integration branch for day-to-day work.

Per-project branches (`project/<area>/<name>`) are published automatically by `.github/workflows/publish-subtrees.yml` when changes under `python/*`, `webprojects/*`, or `ai_workflows/*` land on `develop`.

Submodules (`webprojects/kepler_page`, `webprojects/portfolio`) are refreshed weekly by `.github/workflows/submodules_sync.yml`.

## Branch protection

Both `main` and `develop` have the same protection rules configured in the repository settings:

- Pull request required to merge (no direct pushes).
- Required status checks: `actionlint`, `Markdown lint`, `Relative link check`.
- Linear history (rebase or squash merges).
- All PR conversation comments must be resolved before merge.
- No force pushes, no branch deletion.

The pull-request approval requirement is set to zero for the moment. This repository is currently a personal (non-organization) repo, where GitHub does not allow a self-bypass of the approval rule; and self-approval is blocked anyway. When collaborators are added, raise `required_approving_review_count` from `0` to `1` and the rule activates immediately.

## Working until collaborators are accepted

The repository is single-maintainer for now. The following pieces are deliberately deferred until collaborators join:

- Issue and PR templates
- The `project.yml` metadata contract (referenced by the root README's "Should know" section)
- Per-project branch naming conventions
- Express/MySQL subtree special-handling notes (the `--ignore-joins` push)
- Tighter approval requirements (raise `required_approving_review_count` from `0` to `1`)

The CI workflows already in place (`lint-workflows`, `docs-check`, Dependabot) should continue to gate every change regardless of who pushes.

## Local checks

The same CI checks can be run locally before pushing. See the `Local checks` section in `README.md`.
