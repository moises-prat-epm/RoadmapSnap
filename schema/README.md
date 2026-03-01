# RoadmapSnap configuration schema

## What the schema is for

`config.schema.json` is a [JSON Schema](https://json-schema.org/) (draft-07) that describes the **RoadmapSnap CONFIG** object. It mirrors the validation rules in `js/core/configValidator.js` so that:

- **Editors** can provide autocomplete and inline validation when editing config.
- **Tools** (e.g. AJV) can validate a config file against the schema.
- **AI** can generate a valid `config.js` from a project description — the schema is the output contract.
- **Docs** stay aligned with the app (required fields, formats, structure).

The schema covers `TIMELINE`, `WORKFLOW`, `DELIVERABLES`, and optional top-level keys such as `ENTITY_LABELS`, `DASHBOARD_TEXT`, `NON_FILTERABLE_GROUPS`, `GROUP_ORDER`, `VERSION`, and `BUILD_DATE`. Rules that depend on runtime data (e.g. WORKFLOW alternation, first-milestone key in every deliverable, unique deliverable names) are documented in the schema but enforced by `configValidator.js`.

---

## Using the schema with AI (current workflow)

The most practical way to create a new roadmap is to give Claude this schema plus a description of your project. Claude generates a complete, valid `config.js` that you can drop straight into the tool.

### Step-by-step

1. Open `schema/ai-generation-prompt.md` — it contains a ready-to-use prompt template.
2. Fill in your project description (resources, effort estimates, dependencies, contract type, risks, deadlines).
3. Paste the completed prompt into [Claude.ai](https://claude.ai) or any Claude API call.
4. Copy the returned `const CONFIG = { ... };` block into `js/config.js`.
5. Refresh RoadmapSnap — your roadmap is live.
6. Iterate: "Make the backend phase 3 weeks shorter" / "Add a QA milestone" / "Flag the data migration as at-risk."

### What makes this work

The schema constrains Claude's output to exactly what the tool can render. `configValidator.js` catches any rule violations before the page renders. Because the schema and the validator live in the same repo as the tool, they stay in sync automatically.

The key runtime rules that the schema documents but cannot enforce by itself are:
- **WORKFLOW alternation**: even indices must be `state`, odd indices `milestone`; must start and end with `state`
- **First milestone key**: the first `milestone` key in WORKFLOW must appear in every deliverable's `milestones` object
- **Unique names**: all deliverable `name` values must be distinct

These rules are summarised in the prompt template so Claude applies them correctly.

### Embedded AI Builder (roadmap)

The manual copy-paste workflow above will be embedded directly in the tool as the **AI Roadmap Builder** (Phase 1 of the evolution roadmap):
- A "Generate with AI" panel accepts your project brief (natural language or structured form)
- The schema is passed automatically as the system prompt constraint
- Claude's output is validated immediately with `configValidator.js`
- Valid configs render instantly; invalid outputs trigger an automatic self-correction round
- Multi-turn refinement stays in context: "shorten phase 2 by 3 weeks"

See `docs/ROADMAP.md` — Phase 1 (Lite, user provides API key) and Phase 2 (SaaS, no API key required).

---

## Enabling schema in VS Code

To get autocomplete and validation for a JSON config file in VS Code:

1. Create or edit `.vscode/settings.json` in the project root.
2. Add a `json.schemas` entry that maps the schema to your config file(s), for example:

```json
{
  "json.schemas": [
    {
      "fileMatch": ["**/config.json", "**/config.sample.json"],
      "url": "./schema/config.schema.json"
    }
  ]
}
```

Adjust `fileMatch` to the paths you use (e.g. `js/config.json` if you use JSON). For **JavaScript** config files like `js/config.js`, VS Code does not apply JSON Schema to the object inside the file; the schema is still useful for any `.json` config you maintain (e.g. a sample or export).

---

## Validating a config file with AJV

You can validate a config file with [ajv-cli](https://github.com/ajv-validator/ajv-cli):

```bash
npx ajv-cli validate -s schema/config.schema.json -d path/to/config.json
```

**Note:** `js/config.js` is **not** pure JSON (it's JavaScript: `const CONFIG = { ... };`). So you cannot point `-d js/config.js` at it directly. Workarounds:

1. **Export JSON:** If you have or create a `.json` version of the config (e.g. copy the object into `config.json`), validate that file with the command above.
2. **Extract then validate:** Use a small script or tool to parse `config.js`, extract the `CONFIG` object, write it to a temp `.json` file, then run `ajv-cli` on that file.
3. **Runtime validation:** Use the app's own `validateConfig(CONFIG)` from `js/core/configValidator.js` in the browser or in Node after loading the script; that covers all rules (including alternation and first-milestone), not only what the schema can express.
