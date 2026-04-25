#!/usr/bin/env bash
# Delegates to the same script in the service module.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/fraud-detection-service"
exec ./scripts/curl-e2e.sh "$@"
