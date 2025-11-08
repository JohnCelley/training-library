# SOP: Maintaining the Training Module Library

**Purpose:** Keep the library up to date by editing a single JSON file.

## Quick Start
1. Open the repo in GitHub.
2. Click `modules/modules.json` → Edit.
3. Add a new JSON object with:
   - `id`, `title`, `description`, `youtubeId`, `duration` (optional), `tags` (array), `sopUrl` (optional), `docUrl` (optional)
4. Commit to `main` (or open a PR for review).
5. Refresh the site to see changes.

## Example Entry
```json
{
  "id": "example-module",
  "title": "Example Title",
  "description": "One- or two-sentence summary.",
  "youtubeId": "AbCdEfGhIjk",
  "duration": "3:21",
  "tags": ["example","beginner"],
  "sopUrl": "docs/example.pdf",
  "docUrl": "https://your-erp.example.com/page"
}
```

## Tips
- Validate JSON formatting before committing.
- Use concise, consistent tags so filtering is helpful.
- Link longer SOPs or docs with `sopUrl`/`docUrl`.
