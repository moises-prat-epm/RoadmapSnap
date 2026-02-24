# RoadmapSnap configuration schema

## What the schema is for

`config.schema.json` is a [JSON Schema](https://json-schema.org/) (draft-07) that describes the **RoadmapSnap CONFIG** object. It mirrors the validation rules in `js/core/configValidator.js` so that:

- **Editors** can provide autocomplete and inline validation when editing config.
- **Tools** (e.g. AJV) can validate a config file against the schema.
- **Docs** stay aligned with the app (required fields, formats, structure).

The schema covers `TIMELINE`, `WORKFLOW`, `DELIVERABLES`, and optional top-level keys such as `ENTITY_LABELS`, `DASHBOARD_TEXT`, `NON_FILTERABLE_GROUPS`, `GROUP_ORDER`, `VERSION`, and `BUILD_DATE`. Rules that depend on runtime data (e.g. WORKFLOW alternation, first-milestone key in every deliverable, unique deliverable names) are documented in the schema but enforced by `configValidator.js`.

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

**Note:** `js/config.js` is **not** pure JSON (it’s JavaScript: `const CONFIG = { ... };`). So you cannot point `-d js/config.js` at it directly. Workarounds:

1. **Export JSON:** If you have or create a `.json` version of the config (e.g. copy the object into `config.json`), validate that file with the command above.
2. **Extract then validate:** Use a small script or tool to parse `config.js`, extract the `CONFIG` object, write it to a temp `.json` file, then run `ajv-cli` on that file.
3. **Runtime validation:** Use the app’s own `validateConfig(CONFIG)` from `js/core/configValidator.js` in the browser or in Node after loading the script; that covers all rules (including alternation and first-milestone), not only what the schema can express.
