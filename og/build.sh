#!/usr/bin/env bash
# Regenerate the social-preview images from the card sources.
#
#   ./og/build.sh
#
# Renders each card at exactly 1200×630 with headless Chromium. Brave is used
# because it is what's installed here; any Chromium build works — point BROWSER
# at it. The virtual-time budget gives Google Fonts time to load before capture.
set -euo pipefail

BROWSER="${BROWSER:-/Applications/Brave Browser.app/Contents/MacOS/Brave Browser}"
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ ! -x "$BROWSER" ]; then
  echo "No Chromium browser at: $BROWSER" >&2
  echo "Set BROWSER=/path/to/chromium and re-run." >&2
  exit 1
fi

for card in home blog; do
  "$BROWSER" \
    --headless \
    --disable-gpu \
    --hide-scrollbars \
    --force-device-scale-factor=1 \
    --window-size=1200,630 \
    --virtual-time-budget=6000 \
    --screenshot="$DIR/$card.png" \
    "file://$DIR/card-$card.html" >/dev/null 2>&1
  echo "rendered og/$card.png"
done
