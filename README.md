# Riwi Projects

This repository contains all small and medium size projects made in Riwi outside organizations.
`git subtrees` are the main project distribution and organization on the projects, this keeps the commit history separated while also allowing to show my contributions to those repositories
Organizations works and big projects (worth their own separate repository) are implemented as `git submodules` with external links, the small projects are implemented as `sub trees` too but their links point to this same repo dedicated branch.

If you want to explore this files more comfortably, you can see the [webpage](https://SrLampi1001@github.io/riwi_projects) to look the file more freely.  <!-- Soon -->

## Project folders

| Folder | Projects included |
| --- | --- |
| [Python projects](./python/README.md) | Python fundamentals, user stories, workshops, mini-projects, and the first assessment test. |
| [Web projects](./webprojects/README.md) | Frontend and backend exercises, web user stories, assessment tests, documentation, and portfolio projects. |
| [AI workflows](./ai_workflows/README.md) | AI-assisted applications and automation workflows created for AI assessment tests. |

## General tech

These projects are mainly composed of basic Python and Static websites with JavaScript + HTML + CSS
There are backend repositories mainly with Node.js and Express.js.

There are also some works that use frameworks like docusaurus (a documentation framework mainly). There will be new additions until Riwi finalization date that comes up on August 24th, 2026.

- Riwi prioritized the use of Scrum methodology for the project. So projects are mainly created around Scrum ceremonies and workflow.

## Should know

Each project is inside its own separated folder, and have a `project.yml` file that defines metadata required for indexing and classification. <!-- Not yet, soon `project.yml` contract will be created and files will be updated to have metadata-->

If you want to clone this repository, I would recommend:

```bash
    git clone --branch <branch-project> --single-branch https://github.com/SrLampi1001/riwi_projects.git
```

Instead of cloning every project in main, clone the specific branch dedicated to the project, that way you won't end with more projects than you care about.

### Tags

There are tags in each project that will tell you the project state. <!--They should be inside the `project.yml` file, but be reflected on the README for user friendly reasons-->

| Tag | Meaning |
| --- | ------- |
| Complete | The project is complete as per the requirements and doesn't need any improvement |
| Incomplete | The project doesn't fit the full requirements of the assignment and needs improvement |
| Unsatisfactory | The project fits the full requirements of the assigment but can be improved |
| In Progress | The project has versions, and can be actively worked on |

### Local checks

The top-level READMEs are linted and their relative links are validated in CI (see `.github/workflows/docs-check.yml`). To reproduce the same checks locally before pushing:

```bash
    npm install
    npm run lint:md        # markdownlint-cli2 on the four top-level READMEs
    npm run check:links    # remark + remark-validate-links on the same files
```
