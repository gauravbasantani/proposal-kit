#!/bin/bash
# Runs one eval round: 5 fresh Claude Code runs without the docs layer, 5 with it.
#   evals/harness/run-round.sh <round-name> <work-dir-outside-this-repo> <prompt-file>
# Each run gets its own fresh copy. The work dir must be outside this repo, so a run can't find
# this repo's AGENTS.md by walking up the folder tree.
set -u
ROUND="$1"; WORK="$2"; PROMPT_FILE="$3"
KIT="$(cd "$(dirname "$0")/../.." && pwd)"
CLAUDE="${CLAUDE_BIN:-claude}"
PROMPT="$(cat "$PROMPT_FILE")"
mkdir -p "$WORK/$ROUND" "$KIT/evals/runs/$ROUND"

run_one() {
  local cond="$1" i="$2"
  local dir="$WORK/$ROUND/$cond-$i" out="$KIT/evals/runs/$ROUND/$cond-$i"
  node "$KIT/evals/harness/make-copy.mjs" "$cond" "$dir" >/dev/null
  mkdir -p "$out"
  local start=$(date +%s)
  # File tools only, confined to the copy. No Bash, no web, no MCP servers, no user or project settings.
  ( cd "$dir" && timeout 900 "$CLAUDE" -p "$PROMPT" \
      --restricted --strict-mcp-config \
      --tools "Read,Write,Edit,Glob,Grep" \
      --allowedTools "Read,Write,Edit,Glob,Grep" \
      --permission-mode acceptEdits \
      --no-session-persistence --max-budget-usd 4 \
      --output-format stream-json --verbose \
      > "$out/transcript.jsonl" 2> "$out/stderr.log" )
  echo "exit=$? seconds=$(( $(date +%s) - start ))" > "$out/run.log"
}

for i in 1 2 3 4 5; do
  run_one without "$i" &
  run_one with "$i" &
  wait
done
echo "round $ROUND done"
