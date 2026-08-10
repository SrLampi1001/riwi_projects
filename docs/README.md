# docs/

Persistent documentation that lives at the root of the repository. This folder is for **project-wide** information that does not belong to any single project and is not safe to push to a per-project subtree.

## Contents

| File | Purpose |
| --- | --- |
| [`project-yml-contract.md`](./project-yml-contract.md) | Field-by-field reference for the `project.yml` metadata contract. |
| [`project-yml-example.yml`](./project-yml-example.yml) | Annotated, copy-pasteable example of a `project.yml` with every field shown. |

## What belongs here

- The metadata contract and any future schema definitions.
- Cross-cutting guides that apply to the whole repository (e.g. release process, branching model supplements).
- Indexes or tables that aggregate data from per-project `project.yml` files.

## What does **not** belong here

- Per-project documentation. That lives inside the project's own folder and is pushed with the project subtree.
- Submodule-internal docs (`ai_workflows/insight-monitor/docs/`, `infrastructure/centinela/docs/`, etc.) are owned by their respective submodules and must not be modified from here.
- Transient notes, sprint logs, or work-in-progress drafts. Use GitHub Issues for those.
