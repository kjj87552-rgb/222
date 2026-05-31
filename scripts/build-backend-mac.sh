#!/usr/bin/env bash
set -euo pipefail

export PYTHONUTF8=1
export PYTHONIOENCODING=utf-8

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root_dir="$(cd "$script_dir/.." && pwd)"
venv_dir="$root_dir/.venv-package-mac"
build_dir="$root_dir/build"
backend_out_dir="$build_dir/backend"
pyinstaller_work_dir="$build_dir/pyinstaller"
template_dir="$root_dir/backend/design_prompt_templates"
python_cmd="${PYTHON:-python3}"

remove_child_path() {
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

if [ ! -d "$template_dir" ]; then
  echo "Missing backend prompt template directory: backend/design_prompt_templates" >&2
  exit 1
fi

template_count="$(find "$template_dir" -maxdepth 1 -type f -name '*.md' | wc -l | tr -d ' ')"
if [ "${template_count:-0}" -le 0 ]; then
  echo "No design prompt template markdown files found in backend/design_prompt_templates" >&2
  exit 1
fi

if [ ! -d "$venv_dir" ]; then
  "$python_cmd" -m venv "$venv_dir"
fi

python_exe="$venv_dir/bin/python"
if [ ! -x "$python_exe" ]; then
  echo "Missing venv python: $python_exe" >&2
  exit 1
fi

"$python_exe" -m pip install --upgrade pip setuptools wheel
"$python_exe" -m pip install -r "$root_dir/backend/requirements.txt" "pyinstaller==6.20.0"

remove_child_path "$backend_out_dir"
remove_child_path "$pyinstaller_work_dir"
mkdir -p "$backend_out_dir"

entry_point="$root_dir/backend/desktop_server.py"
"$python_exe" -m PyInstaller \
  --noconfirm \
  --clean \
  --name libai-backend \
  --onedir \
  --distpath "$backend_out_dir" \
  --workpath "$pyinstaller_work_dir" \
  --specpath "$pyinstaller_work_dir" \
  --paths "$root_dir" \
  --collect-submodules backend \
  --collect-submodules uvicorn \
  --collect-submodules fastapi \
  --collect-submodules starlette \
  --collect-submodules pydantic \
  --collect-submodules PIL \
  --collect-submodules httpx \
  --collect-submodules urllib3 \
  --collect-submodules websockets \
  --collect-submodules anyio \
  --collect-all boto3 \
  --collect-all botocore \
  --collect-all s3transfer \
  --collect-all jmespath \
  --hidden-import h11 \
  --hidden-import boto3 \
  --hidden-import botocore.config \
  --hidden-import s3transfer \
  --hidden-import jmespath \
  "$entry_point"

backend_exe="$backend_out_dir/libai-backend/libai-backend"
if [ ! -x "$backend_exe" ]; then
  echo "Backend executable was not produced: build/backend/libai-backend/libai-backend" >&2
  exit 1
fi

backend_internal_dir="$backend_out_dir/libai-backend/_internal"
for runtime_path in boto3 botocore botocore/data s3transfer jmespath; do
  if [ ! -e "$backend_internal_dir/$runtime_path" ]; then
    echo "Packaged backend is missing S3 runtime dependency: $runtime_path" >&2
    exit 1
  fi
done

cp -R "$template_dir" "$backend_out_dir/design_prompt_templates"
reference_storage_env_file="$root_dir/backend/reference-storage.env"
if [ -f "$reference_storage_env_file" ]; then
  cp "$reference_storage_env_file" "$backend_out_dir/reference-storage.env"
fi

echo "Backend runtime ready: build/backend"
