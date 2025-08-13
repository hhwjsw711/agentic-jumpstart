#!/usr/bin/env bash

set -euo pipefail

# Play the jobs-done.mp3 file using a suitable audio player
AUDIO_FILE=".claude/jobs-done/jobs-done.mp3"

if [[ ! -f "$AUDIO_FILE" ]]; then
  echo "Error: $AUDIO_FILE not found." >&2
  exit 1
fi

play_audio() {
  local file="$1"
  if command -v afplay >/dev/null 2>&1; then
    afplay "$file"
  elif command -v ffplay >/dev/null 2>&1; then
    ffplay -autoexit -nodisp -loglevel error "$file" </dev/null >/dev/null 2>&1
  elif command -v mpg123 >/dev/null 2>&1; then
    mpg123 -q "$file"
  elif command -v mpv >/dev/null 2>&1; then
    mpv --really-quiet --no-video "$file" </dev/null >/dev/null 2>&1
  else
    return 1
  fi
}

echo "Playing jobs-done.mp3..."
if ! play_audio "$AUDIO_FILE"; then
  echo "Error: No suitable audio player found. Please install 'ffplay' (ffmpeg), 'mpg123', or 'mpv'." >&2
  exit 1
fi

echo "Done."
