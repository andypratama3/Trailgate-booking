# YIELD — kontrak skema hasil antar-agent (§16.6)

Setiap agent mengembalikan **satu** objek JSON di dalam `<output>`-nya. Orchestrator mengurai ini.
Tanpa skema yang cocok, hasil tidak diterima.

## BuildReport (owner → Orchestrator)

```json
{
  "task_id": "T-121",
  "status": "done | blocked | needs_info",
  "branch": "agent/tg-data/T-121",
  "commit": "<sha>",
  "files_changed": ["..."],
  "checks": { "pint": "pass", "phpstan": "pass", "tests": "pass (42)", "tsc": "n/a" },
  "evidence": ["ringkasan output perintah"],
  "assumptions": ["..."],
  "open_questions": ["..."]
}
```

Aturan: `done` **wajib** disertai output perintah nyata di `evidence` (bukan klaim).
`phpstan`/`pint` boleh `"n/a"` hanya bila path tugas tidak menyentuh PHP.

## ReviewReport (reviewer → Orchestrator)

```json
{
  "task_id": "T-121",
  "reviewer": "tg-reviewer",
  "mode": "review | rereview",
  "verdict": "approve | changes_requested | reject",
  "findings": [{
    "id": "F-1",
    "severity": "P0 | P1 | P2 | P3",
    "confidence": 0.0,
    "category": "spec | contract | logic | security | perf | test | style | docs | domain",
    "path": "apps/api/app/Domain/Quota/ReserveSlot.php",
    "line": 42,
    "summary": "...",
    "fix_hint": "...",
    "fr": "FR-06"
  }]
}
```

Reviewer **tidak mengisi** `owner_agent` — Orchestrator menurunkannya dari `OWNERS.md`.

## VerifyReport (qa/auditor → Orchestrator)

```json
{
  "task_id": "T-121",
  "verifier": "tg-qa",
  "verdict": "pass | fail",
  "scenarios_run": ["..."],
  "failures": [{ "evidence": "...", "repro": "..." }],
  "trace": { "fr": ["FR-05"], "task": "T-121", "tests": ["tests/..."] }
}
```

## ReworkBundle (Orchestrator → owner)

```json
{
  "task_id": "T-121",
  "rework_round": 1,
  "owner": "tg-data",
  "findings": [ /* temuan terpilih dari ReviewReport/VerifyReport, sudah dipetakan ke owner */ ]
}
```

Balasan owner: satu baris per ID temuan — `F-1: fixed` atau `F-2: disputed — <alasan>` — lalu BuildReport baru.
