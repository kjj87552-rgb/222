#!/usr/bin/env bash
set -euo pipefail

export LANG="${LANG:-en_US.UTF-8}"
export LC_ALL="${LC_ALL:-en_US.UTF-8}"

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root_dir="$(cd "$script_dir/.." && pwd)"
release_dir="$root_dir/release"
platform_dir="$(node -p "process.platform + '-' + process.arch")"
tmp_dir=""
backend_pid=""
dmg_mounted=0
dmg_mount_dir=""

fail() {
  echo "macOS package verification failed: $*" >&2
  exit 1
}

cleanup() {
  if [ -n "${backend_pid:-}" ] && kill -0 "$backend_pid" 2>/dev/null; then
    kill "$backend_pid" 2>/dev/null || true
    wait "$backend_pid" 2>/dev/null || true
  fi
  if [ "$dmg_mounted" -eq 1 ] && [ -n "$dmg_mount_dir" ]; then
    hdiutil detach "$dmg_mount_dir" -quiet 2>/dev/null || true
  fi
  if [ -n "$tmp_dir" ] && [ -d "$tmp_dir" ]; then
    rm -rf "$tmp_dir"
  fi
}
trap cleanup EXIT

require_file() {
  local file_path="$1"
  local label="$2"
  [ -f "$file_path" ] || fail "Missing $label: $file_path"
  [ -s "$file_path" ] || fail "$label is empty: $file_path"
}

require_dir() {
  local dir_path="$1"
  local label="$2"
  [ -d "$dir_path" ] || fail "Missing $label: $dir_path"
}

require_executable() {
  local file_path="$1"
  local label="$2"
  [ -x "$file_path" ] || fail "Missing executable $label: $file_path"
}

first_release_file() {
  local pattern="$1"
  local label="$2"
  local found_file
  found_file="$(find "$release_dir" -type f -name "$pattern" -print -quit)"
  [ -n "$found_file" ] || fail "Missing $label matching $pattern in $release_dir"
  printf "%s\n" "$found_file"
}

cd "$root_dir"

require_dir "$release_dir" "release directory"

dmg_file="$(first_release_file "*.dmg" "DMG artifact")"
zip_file="$(first_release_file "*.zip" "zip artifact")"
latest_file="$release_dir/latest-mac.yml"

require_file "$dmg_file" "DMG artifact"
require_file "$zip_file" "zip artifact"
require_file "$latest_file" "latest-mac.yml"

grep -q "\.dmg" "$latest_file" || fail "latest-mac.yml does not reference the DMG artifact"
grep -q "sha512:" "$latest_file" || fail "latest-mac.yml does not include sha512 metadata"

blockmap_count="$(find "$release_dir" -type f -name "*.blockmap" | wc -l | tr -d " ")"
[ "${blockmap_count:-0}" -ge 1 ] || fail "Missing electron-updater blockmap files"

tmp_dir="$(mktemp -d "${TMPDIR:-/tmp}/libai-mac-package.XXXXXX")"
unzip_dir="$tmp_dir/unzipped"
dmg_mount_dir="$tmp_dir/dmg"
backend_log="$tmp_dir/backend-smoke.log"
mkdir -p "$unzip_dir" "$dmg_mount_dir"

ditto -x -k "$zip_file" "$unzip_dir"
app_path="$(find "$unzip_dir" -type d -name "*.app" -print -quit)"
[ -n "$app_path" ] || fail "Zip artifact does not contain an .app bundle"

hdiutil attach "$dmg_file" -mountpoint "$dmg_mount_dir" -nobrowse -readonly >/dev/null
dmg_mounted=1
dmg_app_path="$(find "$dmg_mount_dir" -type d -name "*.app" -print -quit)"
[ -n "$dmg_app_path" ] || fail "DMG artifact does not contain an .app bundle"

plist_file="$app_path/Contents/Info.plist"
require_file "$plist_file" "Info.plist"

bundle_id="$(/usr/libexec/PlistBuddy -c "Print :CFBundleIdentifier" "$plist_file")"
[ "$bundle_id" = "com.manchuang.libai" ] || fail "Unexpected bundle identifier: $bundle_id"

bundle_executable="$(/usr/libexec/PlistBuddy -c "Print :CFBundleExecutable" "$plist_file")"
main_executable="$app_path/Contents/MacOS/$bundle_executable"
resources_dir="$app_path/Contents/Resources"

require_executable "$main_executable" "Electron main executable"
require_dir "$resources_dir" "app resources directory"
file "$main_executable" | grep -q "Mach-O" || fail "Electron main executable is not a Mach-O binary"

if [ ! -f "$resources_dir/app.asar" ] && [ ! -d "$resources_dir/app" ]; then
  fail "Missing packaged Electron app payload under Contents/Resources"
fi

backend_dir="$resources_dir/backend"
backend_exe="$backend_dir/libai-backend/libai-backend"
backend_internal_dir="$backend_dir/libai-backend/_internal"
template_dir="$backend_dir/design_prompt_templates"

require_dir "$backend_dir" "backend resource directory"
require_executable "$backend_exe" "packaged backend"
require_dir "$backend_internal_dir" "backend PyInstaller internal directory"
require_dir "$template_dir" "design prompt templates"
[ ! -f "$backend_dir/reference-storage.env" ] || fail "reference-storage.env must not be bundled into public macOS artifacts"

template_count="$(find "$template_dir" -type f -name "*.md" | wc -l | tr -d " ")"
[ "${template_count:-0}" -ge 1 ] || fail "No packaged design prompt templates found"

for runtime_path in boto3 botocore botocore/data s3transfer jmespath; do
  [ -e "$backend_internal_dir/$runtime_path" ] || fail "Packaged backend is missing runtime dependency: $runtime_path"
done

ffmpeg_dir="$resources_dir/tools/ffmpeg/$platform_dir"
ffmpeg_bin="$ffmpeg_dir/ffmpeg"
ffprobe_bin="$ffmpeg_dir/ffprobe"

require_dir "$ffmpeg_dir" "FFmpeg resource directory"
require_executable "$ffmpeg_bin" "ffmpeg"
require_executable "$ffprobe_bin" "ffprobe"
require_file "$ffmpeg_dir/manifest.json" "FFmpeg manifest"
"$ffmpeg_bin" -version >/dev/null
"$ffprobe_bin" -version >/dev/null

backend_port=18765
LIBAI_APP_DATA_DIR="$tmp_dir/app-data" \
LIBAI_BACKEND_RESOURCE_DIR="$backend_dir" \
LIBAI_DESIGN_PROMPT_TEMPLATE_DIR="$template_dir" \
LIBAI_FFMPEG_PATH="$ffmpeg_bin" \
LIBAI_FFPROBE_PATH="$ffprobe_bin" \
LIBAI_BACKEND_PORT="$backend_port" \
"$backend_exe" >"$backend_log" 2>&1 &
backend_pid="$!"

backend_ready=0
for _ in $(seq 1 90); do
  if ! kill -0 "$backend_pid" 2>/dev/null; then
    cat "$backend_log" >&2 || true
    fail "Packaged backend exited before the /health smoke test completed"
  fi
  health_response="$(curl -fsS "http://127.0.0.1:$backend_port/health" 2>/dev/null || true)"
  if [[ "$health_response" == *'"ok":true'* || "$health_response" == *'"ok": true'* ]]; then
    backend_ready=1
    break
  fi
  sleep 1
done

[ "$backend_ready" -eq 1 ] || {
  cat "$backend_log" >&2 || true
  fail "Packaged backend did not respond to /health"
}

kill "$backend_pid" 2>/dev/null || true
wait "$backend_pid" 2>/dev/null || true
backend_pid=""

echo "macOS package verification passed:"
echo "  DMG: $dmg_file"
echo "  Zip: $zip_file"
echo "  App: $app_path"
echo "  Backend: $backend_exe"
echo "  FFmpeg resources: $ffmpeg_dir"
