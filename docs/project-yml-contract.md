# `project.yml` contract

A `project.yml` is the single source of truth for the metadata of every
project and collection in this repository. It is consumed by documentation
builders, the GitHub Pages index, and any future tooling that needs to
list, classify, or filter projects.

## 1. Location

- Every project directory contains **exactly one** `project.yml` at its
  root.
- A folder whose `project.yml` has `type: collection` is a **collection**:
  its subfolders each carry their own `project.yml`.
- Submodule mount points (e.g. `webprojects/kepler_page/`) are **not**
  given a `project.yml` here. Their metadata lives in the submodule's own
  repository.

```text

riwi_projects/                                  # project.yml (type: collection)
├── python/                                     # project.yml (type: collection)
│   ├── user_story_1/                           # project.yml (type: script)
│   └── ...
└── webprojects/                                # project.yml (type: collection)
    └── kfc/                                    # project.yml (type: static-site)
```

## 2. File shape

The file is a single YAML document whose only top-level key is `project`.
All fields live under that key.

```yaml
project:
  id: my-project
  name: My Project
  ...
```

## 3. Field reference

| Path | Type | Required | Notes |
| --- | --- | --- | --- |
| `project.id` | `str` | yes | Kebab-case unique identifier (e.g. `python-workshop-1`). |
| `project.name` | `str` | yes | Human-readable title. |
| `project.description` | `str` | yes | One-paragraph summary; used by listing pages. |
| `project.type` | `str` | yes | One of the values listed in §4. |
| `project.categories` | `list<str>` | yes | Coarse buckets (e.g. `python`, `module-1`, `education`). |
| `project.tags` | `list<str>` | yes | Free-form descriptors (tech, concepts, format). |
| `project.status` | `str` | optional | One of the values listed in §5. Omit for collections. |
| `project.created_at` | `date` | optional | ISO 8601 (`YYYY-MM-DD`). |
| `project.tech_stack` | `map<str, list<str>>` | yes | See §6. |
| `project.repository` | `object` | yes | See §7. |
| `project.deployment` | `object` | optional | See §8. Omit if the project is not deployed. |
| `project.demo` | `object` | optional | See §9. |
| `project.documentation` | `object` | yes | See §10. |
| `project.presentation` | `object` | optional | See §11. |

## 4. `type` values

Use the value that best describes the **shape** of the project. New
values may be added; pick the closest existing one when in doubt.

| Value | Use for |
| --- | --- |
| `collection` | A folder whose subfolders each have their own `project.yml`. |
| `script` | A single-file program (typically Python or JavaScript). |
| `cli` | A multi-file command-line program. |
| `static-site` | Pure HTML/CSS/JS with no backend. |
| `web-app` | Frontend that talks to a backend (mock or real). |
| `api` | Backend service exposed over HTTP. |
| `automation` | A workflow or orchestration system (e.g. n8n). |
| `ai-application` | A user-facing product whose core is an LLM or ML model. |
| `documentation` | A documentation site or wiki. |
| `library` | A reusable package intended to be imported. |
| `framework` | An opinionated platform other projects build on. |

## 5. `status` values

`status` describes lifecycle. Collections should **not** carry a
`status`; their state is the aggregate of their subprojects.

| Value | Meaning |
| --- | --- |
| `completed` | Meets the assignment requirements; no improvements planned. |
| `in progress` | Has versions and may receive further work. |
| `incomplete` | Does not yet meet the assignment requirements. |
| `released` | Published to a stable audience. |
| `hiatus` | Paused; no active work but not abandoned. |
| `unsatisfactory` | Meets the requirements but is known to need improvement. *(reserved; not currently used)* |

## 6. `tech_stack`

A map from category to a list of entries. Use the same category name
across the repository whenever possible so the indexer can group by it.

Recommended categories:

| Category | Examples |
| --- | --- |
| `languages` | `python`, `typescript`, `sql` |
| `frameworks` | `react`, `express`, `docusaurus`, `bootstrap` |
| `databases` | `mysql`, `mongodb`, `postgresql`, `sqlite` |
| `tools` | `docker`, `n8n`, `json-server`, `git` |
| `ai` | `gemini`, `nvidia-nim`, `deepseek` |

```yaml
tech_stack:
  languages:
    - python
  frameworks:
    - fastapi
  databases:
    - sqlite
  tools:
    - git
  ai:
    - gemini
```

## 7. `repository`

The repository that hosts the project. The default branch is used for
collections; individual projects should name the per-project branch
when one exists (see `CONTRIBUTING.md` for the `project/<area>/<name>`
convention).

```yaml
repository:
  provider: github
  owner: SrLampi1001
  name: riwi_projects
  branch: project/web/kfc
```

| Sub-field | Type | Required | Notes |
| --- | --- | --- | --- |
| `provider` | `str` | yes | Currently only `github` is used. |
| `owner` | `str` | yes | GitHub user or organization. |
| `name` | `str` | yes | Repository name. |
| `branch` | `str` | yes | Branch where the project lives. |

## 8. `deployment`

Optional. Omit the whole `deployment` block if the project is not
deployed. When present, use one key per deployable component
(`frontend`, `backend`, `docs`, etc.).

```yaml
deployment:
  frontend:
    type: static-site
    url: https://example.com
    active: true
  backend:
    type: api
    url: https://api.example.com
    active: true
```

| Sub-field | Type | Required | Notes |
| --- | --- | --- | --- |
| `<component>.type` | `str` | yes | Free-form (e.g. `static-site`, `api`, `container`). |
| `<component>.url` | `str` | yes | Public URL. |
| `<component>.active` | `bool` | yes | `false` if the deployment is dead but kept for reference. |

## 9. `demo`

Optional. Describes an in-browser demo runner (for example a Pyodide
playground for a Python script).

```yaml
demo:
  enabled: true
  type: python
  runtime: pyodide
  entrypoint: python/user_story_1/main.py
```

| Sub-field | Type | Required | Notes |
| --- | --- | --- | --- |
| `enabled` | `bool` | yes | Toggle without removing the rest of the block. |
| `type` | `str` | yes | Demo language or platform. |
| `runtime` | `str` | yes | Runner identifier (`pyodide`, `node-wasm`, `browser`, ...). |
| `entrypoint` | `str` | yes | Path (relative to repo root) of the file that boots the demo. |

## 10. `documentation`

| Sub-field | Type | Required | Notes |
| --- | --- | --- | --- |
| `readme` | `bool` | yes | Whether a `README.md` exists. |
| `documentation-folder` | `list<{path: str}>` | optional | One entry per docs folder, e.g. architecture, API. |

```yaml
documentation:
  readme: true
  documentation-folder:
    - path: webprojects/assessment_test_4/docs
    - path: webprojects/assessment_test_4/uploads
```

## 11. `presentation`

Optional. Controls how the project appears in galleries and indexes.

| Sub-field | Type | Required | Notes |
| --- | --- | --- | --- |
| `featured` | `bool` | yes | Whether to highlight the project on landing pages. |
| `order` | `int` | yes | Lower numbers appear first. |
| `thumbnail` | `str` | optional | Path (relative to repo root) of a preview image. |

## 12. Adding a new project

1. Create the project folder and its `README.md`.
2. Copy [`project-yml-example.yml`](./project-yml-example.yml) into
   `<folder>/project.yml` and fill in the fields.
3. Add a row to the appropriate collection's `README.md` index table.
4. Run the local checks from the root:

   ```bash
   npm install
   npm run lint:md
   npm run check:links
   ```

5. Open a pull request against `develop`.

## 13. Validation checklist

A `project.yml` is considered valid when **all** of the following hold:

- The file parses as YAML.
- The top-level `project:` key is present.
- All required fields from §3 are present.
- `type` is one of the values in §4.
- If `status` is present, it is one of the values in §5.
- `repository` has the four required sub-fields.
- Any deployment entry has `type`, `url`, and `active`.
