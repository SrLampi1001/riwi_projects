#!/usr/bin/env bash
# Verify the post-rebootstrap state by walking each project branch against
# develop's current SYNTHETIC SHA (not develop's full tip — synthetic SHAs
# are not always reachable from develop's current tip; only the prefix's
# history is shared).
#
# For each prefix:
#   - develop's synthetic SHA = the result of `git subtree split --prefix=X`
#     running on develop.
#   - project branch tip = `origin/<branch>`.
#   - Classification against the synthetic-history relationship:
#       equal         : already in sync
#       tip ancestor  : develop ahead; publish-subtrees owns it (fast-forward)
#       synthetic anc : project branch ahead; sync-to-develop handles it
#       diverged      : real divergence (refuses force-push)
#       orphaned      : tip IS in develop's history but develop's tip cannot
#                       reach the synthetic SHA via parent chain. Equivalently:
#                       the branch is older than develop and disconnected.
#                       `git subtree push`/`pull` will still work because git-
#                       subtree operates at the prefix level, not the full
#                       history.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"
source scripts/subtree-map.sh

declare -i equal=0 ahead=0 branch_ahead=0 diverged=0 orphaned=0 missing=0
for prefix in "${!BRANCHES_MAP[@]}"; do
  branch="${BRANCHES_MAP[$prefix]}"
  tip=$(git rev-parse "refs/remotes/origin/$branch" 2>/dev/null || true)
  if [[ -z "$tip" ]]; then
    missing=$((missing+1))
    printf "%-50s MISSING\n" "$branch"
    continue
  fi

  git branch -D recheck_tmp 2>/dev/null || true
  if ! git subtree split --prefix="$prefix" -b recheck_tmp >/dev/null 2>&1; then
    git branch -D recheck_tmp 2>/dev/null || true
    echo "no synthetic SHA for $prefix"; continue
  fi
  expected=$(git rev-parse recheck_tmp)
  git branch -D recheck_tmp 2>/dev/null || true

  if [[ "$tip" == "$expected" ]]; then
    equal=$((equal+1))
    printf "%-50s in_sync\n" "$branch"
  elif git merge-base --is-ancestor "$expected" "$tip" 2>/dev/null; then
    branch_ahead=$((branch_ahead+1))
    printf "%-50s branch_ahead\n" "$branch"
  elif git merge-base --is-ancestor "$tip" "$expected" 2>/dev/null; then
    ahead=$((ahead+1))
    printf "%-50s develop_ahead\n" "$branch"
  elif [[ -n "$(git merge-base "$tip" "$expected")" ]]; then
    diverged=$((diverged+1))
    printf "%-50s DIVERGED\n" "$branch"
  else
    orphaned=$((orphaned+1))
    printf "%-50s orphaned\n" "$branch"
  fi
done
echo
echo "in_sync=$equal  develop_ahead=$ahead  branch_ahead=$branch_ahead  diverged=$diverged  orphaned=$orphaned  branch_missing=$missing"
