#!/usr/bin/env bash
# Diagnostic: walk every project branch, compute develop's current synthetic
# SHA for the corresponding prefix, and classify the relationship.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"
source scripts/subtree-map.sh

printf '%-55s | %-10s | %s\n' "branch" "tip=?=expected" "relation"
printf '%-55s-+-%-10s-+-%s\n' "$(printf '%.0s-' {1..55})" "$(printf '%.0s-' {1..10})" "$(printf '%.0s-' {1..40})"

equal=0; ahead=0; diverged=0; nosynth=0; nobranch=0
for prefix in "${!BRANCHES_MAP[@]}"; do
  branch="${BRANCHES_MAP[$prefix]}"
  tip=$(git rev-parse "refs/remotes/origin/$branch" 2>/dev/null || true)
  if [ -z "$tip" ]; then
    nobranch=$((nobranch+1))
    printf '%-55s | %-10s | %s\n' "$branch" "n/a" "BRANCH_MISSING"
    continue
  fi
  git branch -D tmp_check 2>/dev/null || true
  if ! git subtree split --prefix="$prefix" -b tmp_check >/dev/null 2>&1; then
    git branch -D tmp_check 2>/dev/null || true
    nosynth=$((nosynth+1))
    printf '%-55s | %-10s | %s\n' "$branch" "?" "NO_SYNTHETIC"
    continue
  fi
  expected=$(git rev-parse tmp_check)
  git branch -D tmp_check 2>/dev/null || true

  if [ "$tip" = "$expected" ]; then
    equal=$((equal+1)); rel="equal"
  elif git merge-base --is-ancestor "$tip" "$expected"; then
    ahead=$((ahead+1)); rel="DEV_AHEAD (publish fast-forwards branch)"
  else
    diverged=$((diverged+1)); rel="DIVERGED"
  fi
  short_tip=${tip:0:8}
  short_exp=${expected:0:8}
  same=$([ "$tip" = "$expected" ] && echo "==" || echo "!=")
  printf '%-55s | %s | %s  tip=%s exp=%s\n' "$branch" "$same" "$rel" "$short_tip" "$short_exp"
done
echo
echo "equal=$equal  dev_ahead=$ahead  diverged=$diverged  no_synthetic=$nosynth  missing_branch=$nobranch"
