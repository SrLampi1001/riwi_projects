#!/usr/bin/env bash
# Like diagnose-subtree-drift.sh, but reports what the *fixed* publish
# classification logic would do for each prefix. Read-only (never pushes).
# Useful as a sanity check after changes to .github/workflows/publish-subtrees.yml.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"
source scripts/subtree-map.sh

printf '%-55s | %-10s | %s\n' "branch" "action" "why"
printf '%-55s-+-%-10s-+-%s\n' "$(printf '%.0s-' {1..55})" "$(printf '%.0s-' {1..10})" "$(printf '%.0s-' {1..40})"

first_publish=0; would_push=0; in_sync=0; diverged=0; missing=0; no_synth=0
for prefix in "${!BRANCHES_MAP[@]}"; do
  branch="${BRANCHES_MAP[$prefix]}"
  tip=$(git rev-parse "refs/remotes/origin/$branch" 2>/dev/null || true)
  if [ -z "$tip" ]; then
    missing=$((missing+1))
    printf '%-55s | %-10s | %s\n' "$branch" "first_push" "branch does not exist yet"
    continue
  fi
  git branch -D tmp_check 2>/dev/null || true
  if ! git subtree split --prefix="$prefix" -b tmp_check >/dev/null 2>&1; then
    git branch -D tmp_check 2>/dev/null || true
    no_synth=$((no_synth+1))
    printf '%-55s | %-10s | %s\n' "$branch" "skip" "develop has no commits under $prefix"
    continue
  fi
  expected=$(git rev-parse tmp_check)
  git branch -D tmp_check 2>/dev/null || true

  if [ "$tip" = "$expected" ]; then
    in_sync=$((in_sync+1))
    printf '%-55s | %-10s | %s\n' "$branch" "skip" "branch tip equals develop synthetic SHA"
  elif git merge-base --is-ancestor "$tip" "$expected"; then
    would_push=$((would_push+1))
    printf '%-55s | %-10s | %s\n' "$branch" "push" "develop ahead; fast-forward possible"
  else
    diverged=$((diverged+1))
    printf '%-55s | %-10s | %s\n' "$branch" "FAIL" "no fast-forward: tip not reachable from expected"
  fi
done
echo
echo "first_push=$first_publish  push=$would_push  in_sync=$in_sync  diverged=$diverged  skip_no_synth=$no_synth  branch_missing=$missing"
