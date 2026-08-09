# Contributing to Riwi Projects

Author: RawNuke

Copyright (c) 2026 RawNuke. All rights reserved.

Thank you for helping improve this repository. This document tells you how to
contribute a new project, update an existing one, and run the automation that
publishes the subtrees.

## Branch model

This repository uses two main branches and one project-branch convention.

### main

The default branch. It holds the latest stable state of every project folder.
Do not push work directly to `main`. Open a pull request from `develop` instead.

### develop

The integration branch. All work starts here. When you push to `develop` and
change a tracked project folder, the GitHub Actions workflow
`publish-subtrees.yml` syncs that folder to its dedicated project branch.

### Project branches

Each project folder maps to one branch. The branch name follows the pattern
`project/<area>/<name>`. Examples:

- `project/python/user_story_1`
- `project/web/assessment_test_2`
- `project/ai_workflows/ai_assessment_test_1`

You can clone a single project branch without downloading every project in the
repository:

```bash
git clone --branch project/<area>/<name> --single-branch https://github.com/SrLampi1001/riwi_projects.git
```

### How to add a new subtree project

1. Create a new branch from `develop` for your work.
2. Add your project folder under the correct area (`python/`, `webprojects/`,
   or `ai_workflows/`).
3. Open `.github/workflows/publish-subtrees.yml`.
4. Add a new entry to the `branches` associative array. Use the branch name as
   the key and the project folder path as the value. Example:

   ```bash
   ["python/my_new_project"]="project/python/my_new_project"
   ```

5. Push to `develop` and open a pull request to `main`.

The workflow uses `git subtree push` to publish each changed folder to its
branch. When you add a project folder without updating the workflow, the
automation cannot sync that project.

### How to update an existing project

1. Create a new branch from `develop`.
2. Make your changes inside the project folder.
3. Push to `develop` and open a pull request to `main`.

After the pull request merges to `main`, push to `develop` to trigger the
`publish-subtrees.yml` workflow. The workflow detects which project folders
changed and syncs them to their branches.

### Special case: Express/MySQL subtree

The Express/MySQL project (`webprojects/express_mysql_practice`) uses a special
push command. Its commit history contains splits that `git subtree push` cannot
join automatically. The workflow uses `git subtree split --ignore-joins` for
this project:

```bash
git subtree split --prefix="webprojects/express_mysql_practice" --ignore-joins -b split_express_mysql
git push origin "split_express_mysql:project/web/express_mysql_practice" --force
git branch -D split_express_mysql
```

If your change to the Express/MySQL project fails to publish, check that you
have not introduced a commit that the split command cannot handle. In most cases
the `--ignore-joins` flag resolves the issue.

## Run GitHub Actions locally

Use [`act`](https://github.com/nektos/act) by Nektos to run the workflows on
your machine before you push.

Install `act`:

```bash
# macOS
brew install act

# Windows (with Chocolatey)
choco install act-cli
```

Run the subtree publish workflow:

```bash
act push -j sync-subtrees -W .github/workflows/publish-subtrees.yml
```

Run the submodule sync workflow:

```bash
act -j update-submodules -W .github/workflows/submodules_sync.yml
```

Run `act` with no arguments to run the default event (`push`) for every workflow.

## The `project.yml` metadata contract

Each project folder must contain a `project.yml` file. The file describes the
project for indexing and classification.

### Required fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | The project name. Match the folder name. |
| `area` | string | The area the project belongs to. One of `python`, `web`, or `ai_workflows`. |
| `status` | string | The project state. One of `Complete`, `Incomplete`, `Unsatisfactory`, or `In Progress`. |
| `description` | string | A short description of the project. |

### Optional fields

| Field | Type | Description |
|-------|------|-------------|
| `tech` | string[] | The main technologies used. Examples: `["Python", "pytest"]`, `["Node.js", "Express", "MySQL"]`. |
| `tags` | string[] | Extra tags for filtering. |
| `scrum_ceremony` | string | The Scrum ceremony the project relates to. Example: `Sprint 3 Review`. |
| `links` | object | External links. Use `repo` for a repository URL and `demo` for a live demo URL. |

### Example

```yaml
name: user_story_1
area: python
status: Complete
description: A command-line tool that reads a CSV file and prints a summary.
tech:
  - Python
  - csv
tags:
  - user-story
  - cli
scrum_ceremony: Sprint 1 Review
links:
  demo: https://example.com/demo
```

### Status tags

| Status | Meaning |
|--------|---------|
| Complete | The project meets every requirement and needs no improvement. |
| Incomplete | The project does not meet the full requirements and needs more work. |
| Unsatisfactory | The project meets the full requirements but can be improved. |
| In Progress | The project has versions and is actively worked on. |

These status tags should appear in the project README as well, for quick
reference.

## Pull request checklist

Before you open a pull request, confirm these items:

- [ ] Your branch is based on `develop`.
- [ ] You added or updated the `project.yml` file in your project folder.
- [ ] You updated `.github/workflows/publish-subtrees.yml` if you added a new
  project folder.
- [ ] You ran `act` locally to test the workflow.
- [ ] You completed the pull request template.
