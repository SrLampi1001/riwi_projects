#!/usr/bin/env bash
# Single source of truth for the prefix <-> project-branch mapping.
#
# Sourced by both .github/workflows/publish-subtrees.yml (develop -> project/*)
# and .github/workflows/sync-from-subtree.yml (project/* -> develop).
#
# Bash associative array iteration order is implementation-defined, so do not
# rely on it. Both workflows iterate to detect changed prefixes, and order
# does not affect correctness.

BRANCHES_MAP=(
  ["python/user_story_1"]="project/python/user_story_1"
  ["python/user_story_2"]="project/python/user_story_2"
  ["python/user_story_3"]="project/python/user_story_3"
  ["python/workshop_1"]="project/python/workshop_1"
  ["python/workshop_2"]="project/python/workshop_2"
  ["python/mini-projects"]="project/python/mini-projects"
  ["python/grades_management_workshop"]="project/python/grades_management_workshop"
  ["python/assessment_test_1_simulacrum"]="project/python/assessment_test_1_simulacrum"
  ["python/assessment_test_1"]="project/python/assessment_test_1"
  ["webprojects/form_only_css_html"]="project/web/form_only_css_html"
  ["webprojects/assessment_test_2"]="project/web/assessment_test_2"
  ["webprojects/user_story_4"]="project/web/user_story_4"
  ["webprojects/simple_storage"]="project/web/simple_storage"
  ["webprojects/user_story_5"]="project/web/user_story_5"
  ["webprojects/kfc"]="project/web/kfc"
  ["webprojects/assessment_test_3_simulacrum"]="project/web/assessment_test_3_simulacrum"
  ["webprojects/assessment_test_3"]="project/web/assessment_test_3"
  ["webprojects/user_story_6"]="project/web/user_story_6"
  ["webprojects/user_story_7"]="project/web/user_story_7"
  ["webprojects/express_mysql_practice"]="project/web/express_mysql_practice"
  ["webprojects/assessment_test_4"]="project/web/assessment_test_4"
  ["webprojects/docusaurus_documentation"]="project/web/docusaurus_documentation"
  ["ai_workflows/ai_assessment_test_simulacrum"]="project/ai_workflows/ai_assessment_test_simulacrum"
  ["ai_workflows/ai_assessment_test_1"]="project/ai_workflows/ai_assessment_test_1"
  ["ai_workflows/ai_assessment_test_2"]="project/ai_workflows/ai_assessment_test_2"
)

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