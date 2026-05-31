#!/usr/bin/env bash
set -euo pipefail

export PYTHONUTF8=1
export PYTHONIOENCODING=utf-8
export ELECTRON_BUILDER_DISABLE_UPDATE_NOTIFIER=true
export CSC_IDENTITY_AUTO_DISCOVERY="${CSC_IDENTITY_AUTO_DISCOVERY:-false}"

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root_dir="$(cd "$script_dir/.." && pwd)"
python_cmd="${PYTHON:-python3}"
renderer_output_dir="$root_dir/dist"
electron_output_dir="$root_dir/release"

remove_workspace_child() {
  local path_to_remove="$1"
  local root_full
  local target_full
  root_full="$("$python_cmd" -c 'import os,sys; print(os.path.realpath(sys.argv[1]))' "$root_dir")"
  target_full="$("$python_cmd" -c 'import os,sys; print(os.path.realpath(sys.argv[1]))' "$path_to_remove")"
  case "$target_full" in
    "$root_full"/*)
      rm -rf "$target_full"
      ;;
    *)
      echo "Refusing to remove path outside project: $target_full" >&2
      exit 1
      ;;
  esac
}

cd "$root_dir"

if [ ! -d node_modules ]; then
  npm ci
fi

remove_workspace_child "$electron_output_dir"
npm run ffmpeg:prepare
npm run ffmpeg:check
npm run backend:package:mac
npm run backend:check
npm run icon:mac
remove_workspace_child "$renderer_output_dir"
npm run build
npx electron-builder --mac --publish never

echo "macOS package complete. Check the electron-builder output directory under release."
