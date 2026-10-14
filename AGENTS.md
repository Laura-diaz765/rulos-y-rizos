# Git Flow — AI Assistant Instructions

These instructions work with **any AI coding assistant** (Claude, Cursor, Copilot, Codex, Gemini, etc.) that has:

- Ability to run **read-only local shell commands** (`git diff`, `git status`, `git log`, `git branch`) to inspect the current repo state.
- Optionally, access to a **GitHub MCP server** (or equivalent) connected to this repository — only required when the work is tied to a GitHub Issue.

Purpose: generate three text artifacts a developer needs to work under **GitHub Flow** + **Conventional Commits v1.0.0**:

1. Branch name
2. Commit message
3. Pull request description

This assistant behavior is **read-only with respect to git and GitHub**: it never runs `git checkout -b`, `git commit`, `git push`, or creates a PR itself. It only reads state and returns text. The developer always executes the actual git/GitHub actions manually (e.g. in VS Code).

## GitHub Flow always applies — Issues/Projects/Milestones/Labels are optional

**GitHub Flow itself (short-lived branch from `main` → PR → merge → delete branch) is mandatory in every repo this file is used in.**

Whether that work is tracked with **GitHub Issues, Milestones, Labels, and Projects is a per-repo, sometimes per-task, decision** — some repos use full tracking, others (quick prototypes, personal challenges, solo experiments) just want clean branches, Conventional Commits, and a good PR description with no GitHub Issue behind it.

Before Mode 1, determine which case applies:

- **Tracked mode**: the user gives an issue number, or a GitHub MCP server is connected and issues exist for this repo/task.
- **Untracked mode**: the user does not mention an issue number, explicitly says there's no issue for this, or no GitHub MCP server is available/relevant for this task.

If it's ambiguous, ask once: _"Is this tied to a GitHub issue, or should I skip issue tracking for this one?"_ Do not assume tracked mode just because a GitHub MCP server happens to be connected — the user may still want untracked work in that repo.

## Prerequisites to check first

- The current working directory is inside the git repository, with a GitHub remote (`origin`).
- Base branch is `main` (GitHub Flow, no `develop`).
- Only in **tracked mode**: a GitHub MCP server is connected and available in the tool list. If not available, tell the user and offer to continue in untracked mode instead — do not fall back to guessing issue data.

## CRITICAL VALIDATION RULE

**Before any Mode is triggered, ALWAYS run this check:**

```bash
git diff HEAD
```

If the output is **empty** (no changes to any files since the last commit):

- **STOP immediately**. Do not proceed to any Mode.
- Tell the user: _"No changes detected in the repository. Make some code changes first, then ask for a branch name, commit message, or PR description."_
- Do not guess, invent, or fall back to partial data.

If the output is **not empty**, continue to the requested Mode.

## Mode 1 — Branch name (start of the work)

Trigger: user asks for a branch name, with or without an issue number.

**Before anything: validate that changes exist**

1. Run `git diff HEAD` to see if there are any changes. If empty, stop and tell the user to make changes first.

**Tracked mode:**

1. Use the GitHub MCP tool to fetch the issue (title, labels, milestone, state) for issue `#N`.
2. If the issue is already closed, warn the user before continuing.
3. Look at `git diff HEAD` to understand what was changed (helps refine the branch name to match actual work, not just issue title).
4. Derive `type` from the issue's labels using this mapping (first match wins):
   - `bug` → `fix`
   - `enhancement`, `feature` → `feat`
   - `documentation` → `docs`
   - `chore`, `maintenance` → `chore`
   - `refactor` → `refactor`
   - no matching label → ask the user which type applies (feat/fix/docs/chore/refactor/test/perf/build/ci)
5. Build a 3-6 word kebab-case English slug from the issue title (refined by what the diff shows was actually touched).
6. Output:

```
Branch: <type>/<N>-<slug>
```

**Untracked mode:**

1. Analyze `git diff HEAD` to understand what changed.
2. Infer the type (feat/fix/docs/chore/refactor/test/perf/build/ci) from the nature of the changes.
3. Build a 3-6 word kebab-case English slug based on what the diff shows was changed.
4. Output:

```
Branch: <type>/<slug>
```

(no issue number in the name)

Either way: do not run any other git command. Just give the name.

## Mode 2 — Commit message (end of the work)

Trigger: user asks for the commit message, after finishing the changes.

**Before anything: validate that changes exist**

1. Run `git diff HEAD`. If it's empty, stop and tell the user to make changes first.

Steps common to both modes:

1. Analyze the diff from `git diff HEAD` to understand what changed.
2. Identify every top-level directory/module touched in the diff (e.g. `server/`, `client/`, `server/routes/`, `server/models/`). If the diff spans clearly unrelated areas, flag this to the user as a possible sign the change should have been split into more than one commit (though if they chose "one commit per issue", proceed anyway, listing all touched areas in the body).

**Tracked mode:** 3. Determine the issue number: if the current branch name (`git branch --show-current`) matches `<type>/<N>-<slug>`, extract `N` automatically and tell the user which issue was detected. Otherwise ask. 4. Use the GitHub MCP tool to fetch the issue again (title, labels, milestone) for type/scope context. 5. Build the message based on the diff content:

```
<type>(<scope>): <imperative, lowercase, no period, English, ≤72 chars total>

<optional body: 1-3 short paragraphs explaining what and why, derived from the diff and the issue context>

Closes #<N>
```

(use `Closes #<N>`, not `Refs`, since this is the final commit for the tracked work)

**Untracked mode:** 3. No issue lookup, no footer referencing an issue. 4. Build the message based purely on the diff content:

```
<type>(<scope>): <imperative, lowercase, no period, English, ≤72 chars total>

<optional body: 1-3 short paragraphs explaining what and why, derived from the diff>
```

Both modes:

- If the diff includes a breaking change, use `<type>(<scope>)!:` and add a `BREAKING CHANGE: <explanation>` line in the footer (before `Closes #<N>` if tracked).
- Scope: infer from the touched directory (`server`, `client`, `db`, `auth`, `routes`, `models`, `ui`, etc.). Omit scope only if the change is truly repo-wide (e.g. initial `chore: initialize project structure`).
- Do not run any other git command. Just give the message, ready to paste.

## Mode 3 — Pull request description (ready to open the PR)

Trigger: user asks for the PR description/title, normally right after Mode 2, once the commit is already pushed to the remote branch.

**Before anything: validate that changes exist**

1. Run `git diff main...HEAD` (three-dot diff against the merge-base with `main`). If it's empty, stop and tell the user there are no commits on this branch yet, or the branch is already up to date with main.

Steps common to both modes:

1. Analyze `git diff main...HEAD` to see the full technical change.
2. Build **Changes** as a bullet list derived from that diff, grouped by directory/module if more than one.

**Tracked mode:** 3. Determine the issue number the same way as Mode 2 (from branch name or ask). 4. Use the GitHub MCP tool to fetch the issue's title, body, labels, and milestone. 5. **Summary**: paraphrase the issue's body (the original requirement) in 1-3 sentences. 6. Output:

```
PR title: <type>(<scope>): <description> (issue #<N>)

## Summary
<1-3 sentences based on the issue body>

## Changes
- <change 1>
- <change 2>

## Testing
- [ ] Manually tested locally
- [ ] Tested on mobile viewport
- [ ] Tested on desktop viewport
- [ ] Automated tests added/updated

**Test notes:**
<based on what the user reports, or leave placeholder if not provided>

## Related issues
Closes #<N>
Milestone: <milestone name, or "none">
Labels: <comma-separated labels, or "none">

## Type of change
- [ ] feat
- [ ] fix
- [ ] refactor
- [ ] docs
- [ ] chore
- [ ] breaking change

## Checklist
- [ ] Commit message follows Conventional Commits
- [ ] Documentation updated if needed
- [ ] No unrelated changes included in this PR
```

**Untracked mode:** 3. **Summary**: infer the purpose directly from the diff and from what the user has said in conversation — no issue body to paraphrase. 4. Output the same template as above, but:

- Omit the `(issue #<N>)` suffix in the PR title.
- Replace the `## Related issues` section with just: `Related issues: none`.

Either way: do not push the branch or create the PR yourself. Just give the text.

## General rules

- All generated text (branch name, commit message, PR title/body) is always in **English**, regardless of the language used to talk to the assistant.
- Never execute `git checkout`, `git branch <new>`, `git commit`, `git push`, or any command/tool call that changes repo or GitHub state. Only read: `git diff`, `git status`, `git log`, `git branch --show-current`, and (tracked mode only) GitHub MCP read tools.
- In tracked mode, if the issue number can't be determined and isn't provided, ask for it before producing any output — don't guess.
- Never invent an issue number or fetch issue data in untracked mode.
- **If any of the required diffs (`git diff HEAD`, `git diff main...HEAD`) is empty: STOP immediately and tell the user no changes were found. Do NOT invent content, guess data, or fall back to assumptions.**
- Keep the commit's first line ≤72 characters total (`type(scope): description`).

---

## Manual command reference (for the developer — not executed by the assistant)

This is the sequence you run yourself in VS Code's terminal, using the text the assistant generates above. Works the same whether you're in tracked or untracked mode — only the branch name and the `Closes #N` line change.

### 1. Start the work — create the branch

```bash
git checkout main
git pull origin main
git checkout -b feat/12-user-crud        # tracked: name from Mode 1
git checkout -b feat/user-crud           # untracked: name from Mode 1, no issue number
```

### 2. Work and stage your changes

```bash
git add server/models/User.js server/routes/users.js
# or: git add .
```

### 3. Commit — using the message from Mode 2

```bash
# tracked
git commit -m "feat(server): add User model and CRUD routes" -m "Add Mongoose schema for User and Express routes for create, read, update and delete operations." -m "Closes #12"

# untracked
git commit -m "feat(server): add User model and CRUD routes" -m "Add Mongoose schema for User and Express routes for create, read, update and delete operations."
```

(each `-m` becomes a paragraph, so subject / body / footer stay separated, matching Conventional Commits)

### 4. Push the branch to GitHub

```bash
git push -u origin feat/12-user-crud
```

### 5. Open the PR

Use the GitHub UI, or from the terminal with GitHub CLI if you have it installed:

```bash
gh pr create --base main --head feat/12-user-crud \
  --title "feat(server): add User model and CRUD routes (issue #12)" \
  --body "$(cat pr-description.txt)"   # paste the text from Mode 3
```

### 6. Merge (after review/CI, if applicable)

```bash
gh pr merge feat/12-user-crud --merge      # or --squash / --rebase, pick one strategy and keep it consistent
```

(in tracked mode, `Closes #12` in the PR body auto-closes the issue and moves the Project card, if the automation is enabled)

### 7. Clean up locally

```bash
git checkout main
git pull origin main
git branch -d feat/12-user-crud            # delete local branch
git push origin --delete feat/12-user-crud # delete remote branch (skip if "delete branch on merge" is enabled in GitHub)
```

Repeat from step 1 for the next unit of work.
