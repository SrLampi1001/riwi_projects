#!/usr/bin/env bash
# Single source of truth for the prefix <-> project-branch mapping.
#
# Sourced by both .github/workflows/publish-subtrees.yml (develop -> project/*)
# and .github/workflows/sync-from-subtree.yml (project/* -> develop).
#
# Bash associative array iteration order is implementation-defined, so do not
# rely on it. Both workflows iterate to detect changed prefixes, and order
# does not affect correctness.

declare -A BRANCHES_MAP
BRANCHES_MAP["python/user_story_1"]="project/python/user_story_1"
BRANCHES_MAP["python/user_story_2"]="project/python/user_story_2"
BRANCHES_MAP["python/user_story_3"]="project/python/user_story_3"
BRANCHES_MAP["python/workshop_1"]="project/python/workshop_1"
BRANCHES_MAP["python/workshop_2"]="project/python/workshop_2"
BRANCHES_MAP["python/mini-projects"]="project/python/mini-projects"
BRANCHES_MAP["python/grades_management_workshop"]="project/python/grades_management_workshop"
BRANCHES_MAP["python/assessment_test_1_simulacrum"]="project/python/assessment_test_1_simulacrum"
BRANCHES_MAP["python/assessment_test_1"]="project/python/assessment_test_1"
BRANCHES_MAP["webprojects/form_only_css_html"]="project/web/form_only_css_html"
BRANCHES_MAP["webprojects/assessment_test_2"]="project/web/assessment_test_2"
BRANCHES_MAP["webprojects/user_story_4"]="project/web/user_story_4"
BRANCHES_MAP["webprojects/simple_storage"]="project/web/simple_storage"
BRANCHES_MAP["webprojects/user_story_5"]="project/web/user_story_5"
BRANCHES_MAP["webprojects/kfc"]="project/web/kfc"
BRANCHES_MAP["webprojects/assessment_test_3_simulacrum"]="project/web/assessment_test_3_simulacrum"
BRANCHES_MAP["webprojects/assessment_test_3"]="project/web/assessment_test_3"
BRANCHES_MAP["webprojects/user_story_6"]="project/web/user_story_6"
BRANCHES_MAP["webprojects/user_story_7"]="project/web/user_story_7"
BRANCHES_MAP["webprojects/express_mysql_practice"]="project/web/express_mysql_practice"
BRANCHES_MAP["webprojects/assessment_test_4"]="project/web/assessment_test_4"
BRANCHES_MAP["webprojects/docusaurus_documentation"]="project/web/docusaurus_documentation"
BRANCHES_MAP["ai_workflows/ai_assessment_test_simulacrum"]="project/ai_workflows/ai_assessment_test_simulacrum"
BRANCHES_MAP["ai_workflows/ai_assessment_test_1"]="project/ai_workflows/ai_assessment_test_1"
BRANCHES_MAP["ai_workflows/ai_assessment_test_2"]="project/ai_workflows/ai_assessment_test_2"

# Reverse lookup: given a project branch name (e.g. "project/python/user_story_1"),
# print the corresponding prefix (e.g. "python/user_story_1"). Returns non-zero
# if no mapping exists.
prefix_for_branch() {
  local branch="$1"
  local prefix
  for prefix in "${!BRANCHES_MAP[@]}"; do
    if [[ "${BRANCHES_MAP[$prefix]}" == "$branch" ]]; then
      printf '%s' "$prefix"
      return 0
    fi
  done
  return 1
}