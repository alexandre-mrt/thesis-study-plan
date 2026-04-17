#!/usr/bin/env bash
# weekly-update.sh — digest research-log entries into sota-chXX.js files
#
# Usage:
#   ./scripts/weekly-update.sh             # dry-run (no side effects)
#   ./scripts/weekly-update.sh --apply     # append items to sota-*.js
#   ./scripts/weekly-update.sh --apply --commit  # also git commit + push
#
set -euo pipefail

# ---------------------------------------------------------------------------
# 0. Resolve project root from script location
#
# When this script lives at <repo>/scripts/weekly-update.sh the project root
# is simply one level up.  The git rev-parse fallback handles edge cases such
# as running from a git worktree (.claude/worktrees/…) where the script's
# parent is not the repo root.
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Prefer the git top-level so the script works from any worktree location
if git -C "${SCRIPT_DIR}" rev-parse --show-toplevel &>/dev/null; then
  PROJECT_ROOT="$(git -C "${SCRIPT_DIR}" rev-parse --show-toplevel)"
else
  PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
fi
cd "${PROJECT_ROOT}"

# ---------------------------------------------------------------------------
# 1. Parse flags
# ---------------------------------------------------------------------------
APPLY=false
COMMIT=false
for arg in "$@"; do
  case "${arg}" in
    --apply)  APPLY=true ;;
    --commit) COMMIT=true ;;
    *)
      echo "ERROR: unknown flag '${arg}'. Accepted: --apply, --commit" >&2
      exit 1
      ;;
  esac
done

if ${COMMIT} && ! ${APPLY}; then
  echo "ERROR: --commit requires --apply" >&2
  exit 1
fi

# ---------------------------------------------------------------------------
# 2. Constants
# ---------------------------------------------------------------------------
TODAY="$(date +%Y-%m-%d)"
RESEARCH_LOG_DIR="${PROJECT_ROOT}/research-log"
RESEARCH_QUEUE="${PROJECT_ROOT}/research-queue.md"
SEARCH_JS="${PROJECT_ROOT}/search.js"
MARKER_START="/* AUTO-APPEND START */"
MARKER_END="/* AUTO-APPEND END */"

# Chapter keys (bash 3 compatible — no associative arrays)
CHAPTER_KEYS="ch21 ch22 ch23 ch24 ch25 ch26 rust"

# Lookup: chapter key -> label
chapter_label() {
  case "$1" in
    ch21) echo "Ch 2.1 Anonymous Credentials" ;;
    ch22) echo "Ch 2.2 Confidential TX / Bulletproofs++" ;;
    ch23) echo "Ch 2.3 TEE / Attestation" ;;
    ch24) echo "Ch 2.4 Private Payments" ;;
    ch25) echo "Ch 2.5 ZK Proof Systems / Folding" ;;
    ch26) echo "Ch 2.6 Sui Primitives" ;;
    rust) echo "Rust Track" ;;
    *)    echo "Unknown (${1})" ;;
  esac
}

# Lookup: chapter key -> sota filename
chapter_sota_file() {
  case "$1" in
    ch21) echo "sota-ch21.js" ;;
    ch22) echo "sota-ch22.js" ;;
    ch23) echo "sota-ch23.js" ;;
    ch24) echo "sota-ch24.js" ;;
    ch25) echo "sota-ch25.js" ;;
    ch26) echo "sota-ch26.js" ;;
    rust) echo "sota-rust.js" ;;
    *)    echo "" ;;
  esac
}

# ---------------------------------------------------------------------------
# 3. Collect research-log files modified in the last 7 days
# ---------------------------------------------------------------------------
echo ""
echo "=== Weekly Research Digest — ${TODAY} ==="
echo ""

# Compute 7-days-ago date (BSD date on macOS)
CUTOFF_DATE="$(date -v-7d +%Y-%m-%d 2>/dev/null || date -d '7 days ago' +%Y-%m-%d)"

# Find .md files in research-log (not TEMPLATE.md) modified in last 7 days
RECENT_LOGS=""
for f in "${RESEARCH_LOG_DIR}"/*.md; do
  [[ "$(basename "${f}")" == "TEMPLATE.md" ]] && continue
  [[ "$(basename "${f}")" == "README.md" ]] && continue
  [[ -f "${f}" ]] || continue
  # Compare filename date (YYYY-MM-DD.md) with cutoff — works for standard log naming
  file_date="$(basename "${f}" .md)"
  if [[ "${file_date}" > "${CUTOFF_DATE}" || "${file_date}" == "${CUTOFF_DATE}" ]]; then
    RECENT_LOGS="${RECENT_LOGS} ${f}"
  else
    # Also include by mtime as fallback (using find -mtime)
    if find "${f}" -mtime -7 | grep -q .; then
      RECENT_LOGS="${RECENT_LOGS} ${f}"
    fi
  fi
done

# Deduplicate and sort
if [[ -n "${RECENT_LOGS}" ]]; then
  RECENT_LOGS="$(echo "${RECENT_LOGS}" | tr ' ' '\n' | sort -u | tr '\n' ' ')"
fi

LOG_COUNT=0
for f in ${RECENT_LOGS}; do
  [[ -f "${f}" ]] && (( LOG_COUNT++ )) || true
done

echo "Research logs modified in last 7 days: ${LOG_COUNT}"
if [[ ${LOG_COUNT} -eq 0 ]]; then
  echo "  (none — nothing to digest)"
  echo ""
  echo "Summary: 0 items added to 0 files."
  exit 0
fi

for f in ${RECENT_LOGS}; do
  [[ -f "${f}" ]] && echo "  - $(basename "${f}")"
done
echo ""

# ---------------------------------------------------------------------------
# 4. Extract discoveries from each log file
# ---------------------------------------------------------------------------
# Each discovery block in research-log:
#   ### N. <Title>
#   - Source: ...
#   - Summary: ...
#   - Relevance: ...
#   - Target chapter: chXX
#   - Queued for: ...
#
# We write extracted items to temp files: /tmp/digest-chXX.txt
# Each line: LOG_DATE|TITLE|SOURCE|SUMMARY

TMP_DIR="$(mktemp -d /tmp/weekly-digest-XXXXXX)"
trap 'rm -rf "${TMP_DIR}"' EXIT

for key in ${CHAPTER_KEYS}; do
  touch "${TMP_DIR}/${key}.txt"
done

TOTAL_CANDIDATES=0

for LOG_FILE in ${RECENT_LOGS}; do
  [[ -f "${LOG_FILE}" ]] || continue
  LOG_DATE="$(basename "${LOG_FILE}" .md)"

  # Extract content between ## Discoveries and next ## section
  discoveries_block="$(awk '/^## Discoveries/{found=1; next} found && /^## /{exit} found{print}' "${LOG_FILE}")"

  if [[ -z "${discoveries_block}" ]]; then
    echo "  [SKIP] $(basename "${LOG_FILE}") — no '## Discoveries' section found"
    continue
  fi

  # Parse discovery blocks (lines starting with "### ")
  current_title=""
  current_chapter=""
  current_source=""
  current_summary=""

  save_item() {
    local title="$1" chapter="$2" source="$3" summary="$4" log_date="$5"
    if [[ -n "${title}" && -n "${chapter}" ]]; then
      # Normalize chapter key: strip leading/trailing whitespace, lowercase
      chapter="$(echo "${chapter}" | tr '[:upper:]' '[:lower:]' | tr -d ' \r')"
      local target_file="${TMP_DIR}/${chapter}.txt"
      if [[ -f "${target_file}" ]]; then
        printf '%s|%s|%s|%s\n' "${log_date}" "${title}" "${source}" "${summary}" >> "${target_file}"
        return 0
      else
        echo "  [WARN] Unknown chapter key '${chapter}' in ${log_date} (title: ${title})" >&2
        return 1
      fi
    fi
    return 0
  }

  while IFS= read -r line; do
    if [[ "${line}" =~ ^###[[:space:]] ]]; then
      # Save previous block
      if save_item "${current_title}" "${current_chapter}" "${current_source}" "${current_summary}" "${LOG_DATE}"; then
        if [[ -n "${current_title}" && -n "${current_chapter}" ]]; then
          (( TOTAL_CANDIDATES++ )) || true
        fi
      fi
      # Start new block — strip "### " and leading number "N. "
      current_title="${line#\#\#\# }"
      current_title="$(echo "${current_title}" | sed 's/^[0-9][0-9]*\. //')"
      current_chapter=""
      current_source=""
      current_summary=""
    elif echo "${line}" | grep -qE '^\s*-\s+Source:\s'; then
      current_source="$(echo "${line}" | sed 's/.*Source:[[:space:]]*//')"
    elif echo "${line}" | grep -qE '^\s*-\s+Summary:\s'; then
      current_summary="$(echo "${line}" | sed 's/.*Summary:[[:space:]]*//')"
    elif echo "${line}" | grep -qE '^\s*-\s+Target chapter:\s'; then
      current_chapter="$(echo "${line}" | sed 's/.*Target chapter:[[:space:]]*//' | tr '[:upper:]' '[:lower:]' | tr -d ' \r')"
    fi
  done <<< "${discoveries_block}"

  # Save last block
  if save_item "${current_title}" "${current_chapter}" "${current_source}" "${current_summary}" "${LOG_DATE}"; then
    if [[ -n "${current_title}" && -n "${current_chapter}" ]]; then
      (( TOTAL_CANDIDATES++ )) || true
    fi
  fi
done

# ---------------------------------------------------------------------------
# 5. Dry-run summary
# ---------------------------------------------------------------------------
echo "--- Candidate additions by chapter ---"
echo ""

CHAPTERS_WITH_ITEMS=0

for key in ${CHAPTER_KEYS}; do
  item_file="${TMP_DIR}/${key}.txt"
  if [[ ! -s "${item_file}" ]]; then
    continue
  fi
  (( CHAPTERS_WITH_ITEMS++ )) || true
  sota_fname="$(chapter_sota_file "${key}")"
  echo "[$(chapter_label "${key}")]  ->  ${sota_fname}"
  while IFS='|' read -r log_date title source summary; do
    [[ -z "${title}" ]] && continue
    echo "  * ${title}"
    echo "    from log: ${log_date}  source: ${source}"
  done < "${item_file}"
  echo ""
done

if [[ ${TOTAL_CANDIDATES} -eq 0 ]]; then
  echo "  (no candidates with 'Target chapter' found in recent logs)"
  echo ""
fi

# ---------------------------------------------------------------------------
# 6. Count still-queued items in research-queue.md
# ---------------------------------------------------------------------------
QUEUED_P0=0
QUEUED_P1=0
QUEUED_P2=0
if [[ -f "${RESEARCH_QUEUE}" ]]; then
  QUEUED_P0="$(grep -c '\[P0\]' "${RESEARCH_QUEUE}" 2>/dev/null || true)"
  QUEUED_P1="$(grep -c '\[P1\]' "${RESEARCH_QUEUE}" 2>/dev/null || true)"
  QUEUED_P2="$(grep -c '\[P2\]' "${RESEARCH_QUEUE}" 2>/dev/null || true)"
fi
QUEUED_TOTAL=$(( QUEUED_P0 + QUEUED_P1 + QUEUED_P2 ))

echo "research-queue.md: ${QUEUED_P0} P0 / ${QUEUED_P1} P1 / ${QUEUED_P2} P2 items still queued (${QUEUED_TOTAL} total)"
echo ""

# ---------------------------------------------------------------------------
# Stop here if dry-run
# ---------------------------------------------------------------------------
if ! ${APPLY}; then
  echo "Dry-run complete. No files were modified."
  echo "Run with --apply to append items to sota-*.js."
  echo ""
  echo "Summary: ${TOTAL_CANDIDATES} candidate item(s) across ${CHAPTERS_WITH_ITEMS} chapter(s). ${QUEUED_TOTAL} item(s) still queued in research-queue.md."
  exit 0
fi

# ---------------------------------------------------------------------------
# 7. --apply: append items to sota-*.js files
# ---------------------------------------------------------------------------
echo "--- Applying changes ---"
echo ""

ITEMS_ADDED=0
FILES_MODIFIED=0
MODIFIED_FILES=""

for key in ${CHAPTER_KEYS}; do
  item_file="${TMP_DIR}/${key}.txt"
  if [[ ! -s "${item_file}" ]]; then
    continue
  fi

  sota_fname="$(chapter_sota_file "${key}")"
  sota_path="${PROJECT_ROOT}/${sota_fname}"

  if [[ ! -f "${sota_path}" ]]; then
    echo "  [WARN] ${sota_path} does not exist — skipping ${key} items. Hand-edit required." >&2
    continue
  fi

  # Count items to add
  item_count=0
  while IFS= read -r line; do
    [[ -n "${line}" ]] && (( item_count++ )) || true
  done < "${item_file}"

  if [[ ${item_count} -eq 0 ]]; then
    continue
  fi

  # Build JS entries using Python (handles escaping + multi-line reliably)
  js_block="$(python3 - "${item_file}" "${key}" <<'PYEOF'
import sys, re

item_file = sys.argv[1]
chapter_key = sys.argv[2]

with open(item_file, 'r') as f:
    lines = [l.rstrip('\n') for l in f if l.strip()]

blocks = []
for line in lines:
    parts = line.split('|', 3)
    if len(parts) < 4:
        parts += [''] * (4 - len(parts))
    log_date, title, source, summary = parts

    def js_str(s):
        return s.replace('\\', '\\\\').replace("'", "\\'")

    year = log_date[:4] if len(log_date) >= 4 else '2026'
    b = f"""    /* AUTO-ADDED from research-log/{log_date}.md */
    {{
      name: '{js_str(title)}',
      authors: '',
      venue: '(auto-digest {log_date})',
      year: {year},
      link: '{js_str(source)}',
      recap_short: '{js_str(summary)}',
      recap_long: '{js_str(summary)}',
      math_highlight: '',
      why_for_thesis: '(auto-digest — review and expand)',
      tags: ['auto-digest']
    }},"""
    blocks.append(b)

print('\n'.join(blocks))
PYEOF
)"

  if [[ -z "${js_block}" ]]; then
    continue
  fi

  # Insert into sota file
  python3 - "${sota_path}" "${js_block}" "${MARKER_START}" "${MARKER_END}" <<'PYEOF'
import sys, re

sota_path = sys.argv[1]
js_block = sys.argv[2]
marker_start = sys.argv[3]
marker_end = sys.argv[4]

with open(sota_path, 'r') as f:
    content = f.read()

if marker_start in content and marker_end in content:
    # Marker exists — append new items inside the AUTO-APPEND block (before MARKER_END)
    new_content = content.replace(
        marker_end,
        js_block + '\n    ' + marker_end
    )
else:
    # No marker — find the last "]" (with optional trailing comma) closing
    # the items array, followed by optional whitespace and "};"
    # Handles both `]` and `],` array closing styles.
    pattern = r'(\n[ \t]*\],?\s*\n?\s*\};)'
    match = None
    for m in re.finditer(pattern, content):
        match = m
    if match is None:
        # Fallback: cannot auto-insert — warn and leave file unchanged
        sys.stderr.write(f'WARN: could not locate items array closing bracket in {sota_path} — no changes made\n')
        sys.exit(0)

    insert_pos = match.start(1)
    # Ensure the last existing array item has a trailing comma before the new block
    prefix = content[:insert_pos].rstrip()
    if prefix and prefix[-1] == '}':
        # Last item closes with } but no comma — add one
        content = content[:len(prefix)] + ',' + content[len(prefix):]
        # Recalculate insert_pos after the comma insertion
        match = None
        for m in re.finditer(pattern, content):
            match = m
        insert_pos = match.start(1)

    full_block = '\n    ' + marker_start + '\n' + js_block + '\n    ' + marker_end
    new_content = content[:insert_pos] + full_block + content[insert_pos:]

with open(sota_path, 'w') as f:
    f.write(new_content)
PYEOF

  (( ITEMS_ADDED += item_count )) || true
  (( FILES_MODIFIED++ )) || true
  MODIFIED_FILES="${MODIFIED_FILES} ${sota_path}"
  echo "  [OK] Appended ${item_count} item(s) to ${sota_fname}"
  echo "       NOTE: auto-digest entries have empty authors/math_highlight — manual review required."
done

# ---------------------------------------------------------------------------
# 8. Touch search.js if changes were made
# ---------------------------------------------------------------------------
if [[ ${FILES_MODIFIED} -gt 0 ]] && [[ -f "${SEARCH_JS}" ]]; then
  touch "${SEARCH_JS}"
  echo ""
  echo "  [REMINDER] search.js modification time updated."
  echo "  The full search index is NOT auto-regenerated — run a manual rebuild if needed."
fi

echo ""

# ---------------------------------------------------------------------------
# 9. --commit: git stage + commit + push
# ---------------------------------------------------------------------------
if ${COMMIT}; then
  if [[ ${FILES_MODIFIED} -eq 0 ]]; then
    echo "No files modified — nothing to commit."
  else
    # Check for unexpected dirty files (outside our modified sota files)
    UNEXPECTED_DIRTY=false
    while IFS= read -r dirty_line; do
      [[ -z "${dirty_line}" ]] && continue
      # git status --porcelain: "XY filename"
      dirty_file="${dirty_line:3}"
      IS_OUR_FILE=false
      for mf in ${MODIFIED_FILES}; do
        rel_path="${mf#${PROJECT_ROOT}/}"
        if [[ "${dirty_file}" == "${rel_path}" ]]; then
          IS_OUR_FILE=true
          break
        fi
      done
      if ! ${IS_OUR_FILE}; then
        echo "  [WARN] Unexpected dirty file: ${dirty_file}" >&2
        UNEXPECTED_DIRTY=true
      fi
    done < <(git -C "${PROJECT_ROOT}" status --porcelain | grep -v '^??')

    if ${UNEXPECTED_DIRTY}; then
      echo "ERROR: Working tree has unexpected changes. Aborting commit to avoid staging unrelated files." >&2
      exit 1
    fi

    # Stage only the sota files we modified
    for mf in ${MODIFIED_FILES}; do
      git -C "${PROJECT_ROOT}" add "${mf}"
    done

    COMMIT_MSG="chore(sota): weekly research digest integration ${TODAY}"
    git -C "${PROJECT_ROOT}" commit -m "${COMMIT_MSG}"
    echo "  [OK] Committed: ${COMMIT_MSG}"

    CURRENT_BRANCH="$(git -C "${PROJECT_ROOT}" branch --show-current)"
    git -C "${PROJECT_ROOT}" push origin "${CURRENT_BRANCH}"
    echo "  [OK] Pushed to origin/${CURRENT_BRANCH}"
  fi
fi

# ---------------------------------------------------------------------------
# 10. Final summary
# ---------------------------------------------------------------------------
echo "Summary: ${ITEMS_ADDED} item(s) added to ${FILES_MODIFIED} file(s). ${QUEUED_TOTAL} item(s) still queued in research-queue.md."
echo ""
if [[ ${ITEMS_ADDED} -gt 0 ]]; then
  echo "IMPORTANT: Auto-digest entries require manual review:"
  echo "  - Fill in 'authors', 'math_highlight', 'why_for_thesis' fields"
  echo "  - Verify 'link' URLs are correct"
  echo "  - P0 items (security-critical) must be reviewed before pushing to prod"
fi
