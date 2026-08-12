# Research publishing architecture

The research area has three content levels backed by shared Jekyll components:

- `_research_projects/<project>.md` is the polished public project overview and the source of truth for project metadata, metrics, findings, milestones, and gallery assets.
- Experiment records are individual HTML reading pages. Older records may remain Markdown posts; long-form records use the `research_experiment` layout and can combine Markdown with structured HTML sections. Both use `content_type: experiment`, `project_id`, and `record_id`.
- `research/<project>/lab/index.md` is the project-level synthesis. It stores cross-record findings, the comparable run matrix, and the decision log. Its complete record list is assembled automatically from `project_id`.
- `/blog/` is the Research Hub. Its second section merges all experiment records into one chronological list; there is no separate report category.

## Add a project

1. Copy a document in `_research_projects/` and give it a unique `project_id`, permalink, and `lab_url`.
2. Copy a Lab Log under `research/<project-id>/lab/index.md` with the same `project_id`.
3. Tag related posts with `project_id: <project-id>`.
4. Add real project images under `img/` and reference them from the public project document.

## Add an experiment record

1. Create the Chinese and English record documents in the appropriate experiment collection or retain an existing post route.
2. Set `content_type: experiment`, the parent `project_id`, a stable `record_id`, the record date, summary, and reciprocal `alternate_url`.
3. Use the long-form `research_experiment` layout when the page needs a structured HTML record with figures, tables, sources, or a local table of contents.
4. Update the Lab synthesis or run matrix only when the new evidence changes a project-level conclusion. The Hub and the Lab record list require no manual entry.

No hub, navigation, metric, timeline, experiment-table, view-switcher, or project-card markup needs to be copied. Shared presentation lives in `_includes/research/`, page shells live in `_layouts/`, and all styling lives in `css/research.css`.
