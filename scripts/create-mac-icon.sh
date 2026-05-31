#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root_dir="$(cd "$script_dir/.." && pwd)"
source_path="$root_dir/assets/app-icon-source.png"
target_path="$root_dir/assets/app-icon.icns"
iconset_dir="$root_dir/build/app-icon.iconset"

if [ ! -f "$source_path" ]; then
  echo "Missing icon source: assets/app-icon-source.png" >&2
  exit 1
fi

mkdir -p "$root_dir/build"
rm -rf "$iconset_dir"
mkdir -p "$iconset_dir"

sips -z 16 16 "$source_path" --out "$iconset_dir/icon_16x16.png" >/dev/null
sips -z 32 32 "$source_path" --out "$iconset_dir/icon_16x16@2x.png" >/dev/null
sips -z 32 32 "$source_path" --out "$iconset_dir/icon_32x32.png" >/dev/null
sips -z 64 64 "$source_path" --out "$iconset_dir/icon_32x32@2x.png" >/dev/null
sips -z 128 128 "$source_path" --out "$iconset_dir/icon_128x128.png" >/dev/null
sips -z 256 256 "$source_path" --out "$iconset_dir/icon_128x128@2x.png" >/dev/null
sips -z 256 256 "$source_path" --out "$iconset_dir/icon_256x256.png" >/dev/null
sips -z 512 512 "$source_path" --out "$iconset_dir/icon_256x256@2x.png" >/dev/null
sips -z 512 512 "$source_path" --out "$iconset_dir/icon_512x512.png" >/dev/null
sips -z 1024 1024 "$source_path" --out "$iconset_dir/icon_512x512@2x.png" >/dev/null

iconutil -c icns "$iconset_dir" -o "$target_path"
echo "Created assets/app-icon.icns"
