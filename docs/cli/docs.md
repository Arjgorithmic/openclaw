---
summary: "CLI reference for `kibo docs` (search the live docs index)"
read_when:
  - You want to search the live Kibo docs from the terminal
title: "docs"
---

# `kibo docs`

Search the live docs index.

Arguments:

- `[query...]`: search terms to send to the live docs index

Examples:

```bash
kibo docs
kibo docs browser existing-session
kibo docs sandbox allowHostControl
kibo docs gateway token secretref
```

Notes:

- With no query, `kibo docs` opens the live docs search entrypoint.
- Multi-word queries are passed through as one search request.
