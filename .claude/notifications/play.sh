#!/usr/bin/env bash


exit 0;

set -euo pipefail

# Usage: play.sh [sound-file]
AUDIO_FILE="${1}"
FULL_AUDIO_PATH=".claude/notifications/$AUDIO_FILE"

if [[ ! -f "$FULL_AUDIO_PATH" ]]; then
  echo "Error: $FULL_AUDIO_PATH not found." >&2
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

echo "Playing $(basename "$FULL_AUDIO_PATH")..."
if ! play_audio "$FULL_AUDIO_PATH"; then
  echo "Error: No suitable audio player found. Please install 'ffplay' (ffmpeg), 'mpg123', or 'mpv'." >&2
  exit 1
fi

echo "Done."
