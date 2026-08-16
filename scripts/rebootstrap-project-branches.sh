#!/usr/bin/env bash
# Re-bootstrap orphaned project branches.
#
# For every prefix in scripts/subtree-map.sh, compute develop's current synthetic
# SHA and compare against origin/<project-branch>'s tip:
#
#   - missing on origin (first publish of this prefix): push develop's synthetic
#     SHA as a fresh fast-forward to create the branch.
#   - tip already equals develop's synthetic SHA: no-op (already in sync).
#   - tip is a descendant of develop's synthetic SHA (branch is ahead of develop):
#     no-op (publish-subtrees.yml owns the develop->project direction).
#   - tip is an ancestor of develop's synthetic SHA (typical orphan, develop is
#     ahead but the branch's lineage is disconnected): force-push develop's
#     synthetic SHA.
#   - neither is an ancestor of the other BUT they share a common ancestor (real
#     divergence, e.g., manual force-push with non-subtree history): REPORT and
#     SKIP. A force-push here would lose direct commits on the project branch.
#   - neither is ancestor and no common ancestor (true orphan): force-push
#     develop's synthetic SHA, same as above (no direct commits to preserve).
#
# Usage:
#   scripts/rebootstrap-project-branches.sh           # dry run, prints actions
#   scripts/rebootstrap-project-branches.sh --apply   # actually push
#
# Requires: a clone where `git push origin <sha>:refs/heads/<branch>` works
# with full credentials (the user, not GITHUB_TOKEN — the user has repo admin).
set -uo pipefail
cd "$(git rev-parse --show-toplevel)"
source scripts/subtree-map.sh

apply=0
if [[ "${1:-}" == "--apply" ]]; then
  apply=1
elif [[ -n "${1:-}" ]]; then
  echo "unknown argument: $1" >&2; exit 2
fi

verdict() { printf "  [%s] %s: %s\n" "$1" "$2" "$3"; }

declare -i count_create=0 count_force=0 count_skip=0 count_diverge=0 count_already=0 count_ahead=0 count_error=0

for prefix in "${!BRANCHES_MAP[@]}"; do
  branch="${BRANCHES_MAP[$prefix]}"
  tmp_branch="reboot_tmp_$$_${RANDOM}"

  # Compute develop's current synthetic SHA for this prefix.
  if ! git subtree split --prefix="$prefix" -b "$tmp_branch" >/dev/null 2>&1; then
    git branch -D "$tmp_branch" 2>/dev/null || true
    verdict "ERR " "$branch" "develop has no synthetic SHA for $prefix"
    count_error=$((count_error+1))
    continue
  fi
  expected=$(git rev-parse "$tmp_branch")
  git branch -D "$tmp_branch" 2>/dev/null || true

  tip=$(git rev-parse "refs/remotes/origin/$branch" 2>/dev/null || true)

  if [[ -z "$tip" ]]; then
    # Branch doesn't exist on origin — push to create.
    if (( apply )); then
      if git push origin "$expected:refs/heads/$branch" 2>/dev/null; then
        verdict "OK  " "$branch" "created at $expected (was missing)"
        count_create=$((count_create+1))
      else
        verdict "FAIL" "$branch" "create push failed for expected=$expected"
        count_error=$((count_error+1))
      fi
    else
      verdict "DO  " "$branch" "would create at $expected (currently missing)"
      count_create=$((count_create+1))
    fi
    continue
  fi

  if [[ "$tip" == "$expected" ]]; then
    verdict "OK  " "$branch" "already in sync at $expected"
    count_already=$((count_already+1))
    continue
  fi

  # Is develop's synthetic SHA an ancestor of the project branch tip?
  # (Branch is ahead of develop; publish-subtrees.yml's reverse check at publish
  #  time will pick this up and do nothing.)
  if git merge-base --is-ancestor "$expected" "$tip" 2>/dev/null; then
    verdict "OK  " "$branch" "tip $tip is descendant of expected $expected (branch ahead; publish-subtrees handles this direction; no-op)"
    count_ahead=$((count_ahead+1))
    continue
  fi

  # Is the project branch tip an ancestor of develop's synthetic SHA?
  # (Simple fast-forward, develop is ahead but histories are clean. No --force
  #  needed: a normal `git subtree push` will fast-forward the project branch
  #  to develop's synthetic SHA. Safe to push without --force; the orphan state
  #  we were worried about is actually fine in this case.)
  if git merge-base --is-ancestor "$tip" "$expected" 2>/dev/null; then
    if (( apply )); then
      if git push origin "$expected:refs/heads/$branch" 2>/dev/null; then
        verdict "OK  " "$branch" "fast-forwarded $tip -> $expected (no --force; tip was an ancestor of expected)"
        count_skip=$((count_skip+1))  # this is a normal push, not a skip; but it advances the branch
      else
        verdict "FAIL" "$branch" "fast-forward push failed for expected=$expected"
        count_error=$((count_error+1))
      fi
    else
      verdict "DO  " "$branch" "would fast-forward (no --force) $tip -> $expected (tip is ancestor of expected)"
      count_skip=$((count_skip+1))
    fi
    continue
  fi

  # Neither is an ancestor of the other. Distinguish:
  #   - shared common ancestor: real divergence, manual recovery needed (refuse)
  #   - no shared ancestor:     true orphan, force-push is safe
  shared_ancestor=$(git merge-base "$tip" "$expected" 2>/dev/null || true)

  if [[ -z "$shared_ancestor" ]]; then
    # True orphan: no common ancestor. Safe to force-push (nothing to preserve).
    if (( apply )); then
      if git push --force origin "$expected:refs/heads/$branch" 2>/dev/null; then
        verdict "OK  " "$branch" "force-pushed $tip -> $expected (orphan; no shared ancestor)"
        count_force=$((count_force+1))
      else
        verdict "FAIL" "$branch" "force-push failed for expected=$expected"
        count_error=$((count_error+1))
      fi
    else
      verdict "DO  " "$branch" "would force-push $tip -> $expected (orphan; no shared ancestor)"
      count_force=$((count_force+1))
    fi
  else
    # Real divergence: they share history but neither is reachable from the other.
    # A force-push would lose commits the user (or someone) made directly on the
    # project branch. Refuse to act without explicit intervention.
    verdict "DVRG" "$branch" "DIVERGED: tip=$tip, expected=$expected, shared ancestor=$shared_ancestor — DO NOT force-push; manual recovery required"
    count_diverge=$((count_diverge+1))
  fi
done

echo
echo "summary: create=$count_create force=$count_force already=$count_already ahead=$count_ahead diverge=$count_diverge error=$count_error"
if (( !apply )); then
  echo "(dry run; pass --apply to perform the listed force / create operations)"
fi
