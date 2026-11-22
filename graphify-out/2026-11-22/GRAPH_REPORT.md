# Graph Report - .  (2026-11-22)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 911 nodes · 1218 edges · 126 communities (79 shown, 47 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5b72b034`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- write
- Beautiful Extension
- _support.py
- Path
- check-examples.py
- interface
- test_checker_failure_paths.py
- HarnessTest
- What You Must Do When Invoked
- YamlParser
- GateScript
- Chrome extension best practices (Manifest V3)
- 2. Categories, in ranking order
- package.json
- compilerOptions
- workflow_text
- Chrome MV3 digest
- BestPractices
- A worked review: the capture extension
- Extension patterns
- graphify reference: extra exports and benchmark
- TypeScript strict for extensions
- Extension port
- _load
- <app> Manifest Permissions Reviewer Agent
- <app> Messaging Reviewer Agent
- <app> Storage Migration Reviewer Agent
- <app> Architect Agent
- <app> Build Resolver Agent
- <app> Code Explorer Agent
- <app> Code Reviewer Agent
- <app> Planner Agent
- <app> TDD Guide Agent
- <app> Sender Validation Reviewer Agent
- <app> Test Author Agent
- <app> Add Message
- <app> Add Slice
- <app> Claim Check skill
- <app> Clean-Room Rebuild skill
- <app> Corpus Retrieval skill
- <app> Diagnosing Bugs skill
- <app> Domain Modeling skill
- <app> Grilling skill
- <app> Learn
- <app> Permission Change
- <app> Plan
- <app> Research skill
- <app> Review
- <app> Ship
- <app> Spec
- <app> Storage Migration
- <app> Test-Driven Development skill
- <app> Verified Status skill
- <app> Visual Review skill
- graphify reference: query, path, explain
- build
- beautifulextension — agent instructions
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- consistent-type-imports.ts
- index.ts
- check-lints.sh
- guard-bash.sh
- /add-message
- /add-slice
- /claim-check
- /clean-room-rebuild
- /corpus-retrieval
- /diagnosing-bugs
- /domain-modeling
- /grilling
- /learn
- /permission-change
- /plan
- /research
- /review
- /ship
- /spec
- /storage-migration
- /tdd
- /verified-status
- /visual-review
- Playbooks for `beautifulextension` — load on demand
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- index.ts
- switch-exhaustiveness.ts
- CLAUDE.md
- README.md
- CREDITS.md
- CREDITS.md
- CREDITS.md
- CREDITS.md
- CREDITS.md
- extraction-spec.md
- CREDITS.md
- CREDITS.md
- CREDITS.md
- CREDITS.md
- CREDITS.md
- eval.ts
- new-func.ts
- no-unnecessary-type-assertion.ts
- second
- captured
- platform
- captured
- client

## God Nodes (most connected - your core abstractions)
1. `write()` - 35 edges
2. `CheckSkillTests` - 35 edges
3. `build_valid_repo()` - 32 edges
4. `Checker` - 26 edges
5. `check_repo()` - 17 edges
6. `YamlParser` - 16 edges
7. `Chrome extension best practices (Manifest V3)` - 16 edges
8. `Beautiful Extension` - 15 edges
9. `interface` - 14 edges
10. `compilerOptions` - 12 edges

## Surprising Connections (you probably didn't know these)
- `add_portable_plugin()` --calls--> `write()`  [EXTRACTED]
  tests/unit/test_check_skill_unit.py → tests/_support.py
- `build_valid_repo()` --calls--> `write()`  [EXTRACTED]
  tests/unit/test_check_skill_unit.py → tests/_support.py

## Import Cycles
- None detected.

## Communities (126 total, 47 thin omitted)

### Community 0 - "write"
Cohesion: 0.14
Nodes (11): write(), DomainWallTest, EndToEndTest, add_portable_plugin(), build_valid_repo(), CheckSkillTests, error_messages(), formatted() (+3 more)

### Community 1 - "Beautiful Extension"
Cohesion: 0.04
Nodes (40): Added, Changelog, [Unreleased], Contributing, Good first contributions, License, Making a change, Style (+32 more)

### Community 2 - "_support.py"
Cohesion: 0.07
Nodes (17): ledger_data(), ledger_paths(), ledger_skip_count(), LedgerAgrees, LedgerShape, path -> the file entry, only for entries that are objects., Count of block specs that ledger a skip (the checker must match it)., The checker's skipped count must equal the ledger's skip count. (+9 more)

### Community 3 - "Path"
Cohesion: 0.16
Nodes (17): check_repo(), Checker, _fold_block(), format_problem(), _is_relative(), _json_key_line(), main(), _normalize_url() (+9 more)

### Community 4 - "check-examples.py"
Cohesion: 0.13
Nodes (33): apply_harness(), as_text(), Block, build_project(), check_brackets(), check_quotes(), check_repo(), doc_files() (+25 more)

### Community 5 - "interface"
Cohesion: 0.07
Nodes (29): author, name, url, interface, publication, description, extensions, com.openai (+21 more)

### Community 6 - "test_checker_failure_paths.py"
Cohesion: 0.10
Nodes (15): BrokenTsBlock, CopiedRepoFailures, DeletedLints, GuardedRepoCase, has_eslint(), A broken ```ts block in a bare doc tree fails check-examples., Failure paths that mutate a full copy of the repo., Text surgery on a copy's lints: removing a pinned rule from BOTH the     drop-in (+7 more)

### Community 7 - "HarnessTest"
Cohesion: 0.13
Nodes (4): FindBlocksTest, HarnessTest, MappingTest, RepoTest

### Community 8 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 9 - "YamlParser"
Cohesion: 0.25
Nodes (8): Exception, _parse_quoted(), parse_yaml(), Any, Small YAML subset: maps, lists, quoted scalars, | and > blocks., _split_flow(), YamlError, YamlParser

### Community 10 - "GateScript"
Cohesion: 0.12
Nodes (7): ConfigPairing, explicit_rules(), GateScript, HarnessCoverage, marker_names(), The shell contract: bounded runs, surfaced stderr, explicit non-JSON., Rule ids configured at the top level of any rules block in the config.

### Community 11 - "Chrome extension best practices (Manifest V3)"
Cohesion: 0.12
Nodes (16): 10. UI surfaces, 11. Networking and authentication, 12. Enterprise, 13. Testing, 14. Cross-skill contract, 1. Mindset, 2. Before you hand back code, 3. Execution contexts (+8 more)

### Community 12 - "2. Categories, in ranking order"
Cohesion: 0.12
Nodes (15): 1. Report shape, 2. Categories, in ranking order, 3. Waived gates, 4. How to review, 5. Worked example, 6. Cross-skill contract, Architecture contracts (always Must fix, ranked first), Extension review (+7 more)

### Community 13 - "package.json"
Cohesion: 0.13
Nodes (14): description, devDependencies, eslint, @eslint-community/eslint-plugin-eslint-comments, @eslint/js, @types/chrome, typescript, typescript-eslint (+6 more)

### Community 14 - "compilerOptions"
Cohesion: 0.13
Nodes (14): compilerOptions, baseUrl, lib, module, moduleResolution, noEmit, noUncheckedIndexedAccess, paths (+6 more)

### Community 15 - "workflow_text"
Cohesion: 0.22
Nodes (5): CheckerSteps, Every existing CI job keeps its exact entrypoint and pin., The unittest gate: the full discovery is the CI job itself., TestsJob, workflow_text()

### Community 16 - "Chrome MV3 digest"
Cohesion: 0.17
Nodes (11): 10. Store and enterprise, 1. Execution contexts, 2. Service worker lifetime, 3. Storage areas, 4. Manifest essentials, 5. Permissions, 6. Content Security Policy, 7. Messaging (+3 more)

### Community 17 - "BestPractices"
Cohesion: 0.29
Nodes (4): BestPractices, bp_body(), ReviewSkill, rv_body()

### Community 18 - "A worked review: the capture extension"
Cohesion: 0.20
Nodes (9): A worked review: the capture extension, Must fix, Should fix, The fixed module, The module under review, The report, Verdict, Waived gates (+1 more)

### Community 19 - "Extension patterns"
Cohesion: 0.20
Nodes (9): 1. The typed RPC envelope, 2. Sender validation, 3. The service worker entry, 4. The job queue and alarms, 5. Typed storage and migrations, 6. The page bridge, 7. The side panel and popup, 8. Diagnostics and kill switch (+1 more)

### Community 20 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 21 - "TypeScript strict for extensions"
Cohesion: 0.22
Nodes (8): 1. The strict set, 2. Discriminated unions, 3. Branded ids, 4. Boundary types, 5. Result types, 6. Async discipline, 7. Type-level review questions, TypeScript strict for extensions

### Community 22 - "Extension port"
Cohesion: 0.22
Nodes (8): 1. The order of work, 2. MV2 → MV3 mapping, 3. Web app → extension, 4. Firefox / Edge / cross-browser, 5. Behavior parity checklist, 6. What not to do, 7. Cross-skill contract, Extension port

### Community 23 - "_load"
Cohesion: 0.36
Nodes (4): _load(), ManifestPairing, Path, skill_dirs()

### Community 24 - "<app> Manifest Permissions Reviewer Agent"
Cohesion: 0.29
Nodes (6): <app> Manifest Permissions Reviewer Agent, Core Mission, Expertise Areas, Guiding Principles, Output Format, Quality Standards

### Community 25 - "<app> Messaging Reviewer Agent"
Cohesion: 0.29
Nodes (6): <app> Messaging Reviewer Agent, Core Mission, Expertise Areas, Guiding Principles, Output Format, Quality Standards

### Community 26 - "<app> Storage Migration Reviewer Agent"
Cohesion: 0.29
Nodes (6): <app> Storage Migration Reviewer Agent, Core Mission, Expertise Areas, Guiding Principles, Output Format, Quality Standards

### Community 27 - "<app> Architect Agent"
Cohesion: 0.29
Nodes (6): <app> Architect Agent, Core Mission, Expertise Areas, Guiding Principles, Output Format, Quality Standards

### Community 28 - "<app> Build Resolver Agent"
Cohesion: 0.29
Nodes (6): <app> Build Resolver Agent, Core Mission, Expertise Areas, Guiding Principles, Output Format, Quality Standards

### Community 29 - "<app> Code Explorer Agent"
Cohesion: 0.29
Nodes (6): <app> Code Explorer Agent, Core Mission, Expertise Areas, Guiding Principles, Output Format, Quality Standards

### Community 30 - "<app> Code Reviewer Agent"
Cohesion: 0.29
Nodes (6): <app> Code Reviewer Agent, Core Mission, Expertise Areas, Guiding Principles, Output Format, Quality Standards

### Community 31 - "<app> Planner Agent"
Cohesion: 0.29
Nodes (6): <app> Planner Agent, Core Mission, Expertise Areas, Guiding Principles, Output Format, Quality Standards

### Community 32 - "<app> TDD Guide Agent"
Cohesion: 0.29
Nodes (6): <app> TDD Guide Agent, Core Mission, Expertise Areas, Guiding Principles, Output Format, Quality Standards

### Community 33 - "<app> Sender Validation Reviewer Agent"
Cohesion: 0.29
Nodes (6): <app> Sender Validation Reviewer Agent, Core Mission, Expertise Areas, Guiding Principles, Output Format, Quality Standards

### Community 34 - "<app> Test Author Agent"
Cohesion: 0.29
Nodes (6): <app> Test Author Agent, Core Mission, Expertise Areas, Guiding Principles, Output Format, Quality Standards

### Community 35 - "<app> Add Message"
Cohesion: 0.29
Nodes (6): <app> Add Message, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 36 - "<app> Add Slice"
Cohesion: 0.29
Nodes (6): <app> Add Slice, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 37 - "<app> Claim Check skill"
Cohesion: 0.29
Nodes (6): <app> Claim Check skill, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 38 - "<app> Clean-Room Rebuild skill"
Cohesion: 0.29
Nodes (6): <app> Clean-Room Rebuild skill, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 39 - "<app> Corpus Retrieval skill"
Cohesion: 0.29
Nodes (6): <app> Corpus Retrieval skill, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 40 - "<app> Diagnosing Bugs skill"
Cohesion: 0.29
Nodes (6): <app> Diagnosing Bugs skill, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 41 - "<app> Domain Modeling skill"
Cohesion: 0.29
Nodes (6): <app> Domain Modeling skill, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 42 - "<app> Grilling skill"
Cohesion: 0.29
Nodes (6): <app> Grilling skill, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 43 - "<app> Learn"
Cohesion: 0.29
Nodes (6): <app> Learn, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 44 - "<app> Permission Change"
Cohesion: 0.29
Nodes (6): <app> Permission Change, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 45 - "<app> Plan"
Cohesion: 0.29
Nodes (6): <app> Plan, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 46 - "<app> Research skill"
Cohesion: 0.29
Nodes (6): <app> Research skill, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 47 - "<app> Review"
Cohesion: 0.29
Nodes (6): <app> Review, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 48 - "<app> Ship"
Cohesion: 0.29
Nodes (6): <app> Ship, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 49 - "<app> Spec"
Cohesion: 0.29
Nodes (6): <app> Spec, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 50 - "<app> Storage Migration"
Cohesion: 0.29
Nodes (6): <app> Storage Migration, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 51 - "<app> Test-Driven Development skill"
Cohesion: 0.29
Nodes (6): <app> Test-Driven Development skill, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 52 - "<app> Verified Status skill"
Cohesion: 0.29
Nodes (6): <app> Verified Status skill, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 53 - "<app> Visual Review skill"
Cohesion: 0.29
Nodes (6): <app> Visual Review skill, Core Principles, Output Format, Research References, Rules, When to Activate

### Community 54 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 55 - "build"
Cohesion: 0.53
Nodes (5): build(), main(), package_files(), Path, Files to package, relative to root, in a stable order.

### Community 56 - "beautifulextension — agent instructions"
Cohesion: 0.50
Nodes (3): beautifulextension — agent instructions, graphify, Model routing (Claude Code + Ollama)

### Community 57 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 58 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 59 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 62 - "check-lints.sh"
Cohesion: 0.83
Nodes (3): bounded(), fail(), check-lints.sh script

### Community 63 - "guard-bash.sh"
Cohesion: 0.83
Nodes (3): has(), has_i(), guard-bash.sh script

## Knowledge Gaps
- **384 isolated node(s):** `name`, `version`, `private`, `type`, `description` (+379 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **47 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `write()` connect `write` to `_support.py`, `HarnessTest`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `render()` connect `check-examples.py` to `Path`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Why does `load_script()` connect `_support.py` to `write`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _414 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `write` be split into smaller, more focused modules?**
  _Cohesion score 0.13574660633484162 - nodes in this community are weakly interconnected._
- **Should `Beautiful Extension` be split into smaller, more focused modules?**
  _Cohesion score 0.0425531914893617 - nodes in this community are weakly interconnected._
- **Should `_support.py` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._