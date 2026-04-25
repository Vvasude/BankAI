#!/usr/bin/env bash
# End-to-end: register, login, POST /transactions. Parses JSON with Python (not shell splits).
set -euo pipefail
BASE="${BASE:-http://127.0.0.1:8080}"
EMAIL="fraudtest$(date +%s)@local.test"
PASS="TestPass12"
echo "Using: $EMAIL"

REG_JSON=$(curl -sS -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}"
)
echo "register: $REG_JSON"

# Mint token — parse *only* the JSON from stdout (one object), never sed/grep/head the raw body.
TOKEN=$(printf '%s' "$REG_JSON" | python3 -c "import json,sys; t=json.load(sys.stdin)['token'];
assert t.count('.')==2, 'JWT must be header.payload.sig'; print(t)")
if [ -z "$TOKEN" ]; then
  echo "No token in register response" >&2
  exit 1
fi
echo "Token len: ${#TOKEN}"

code=$(curl -sS -o /tmp/txbody.txt -w "%{http_code}" -X POST "$BASE/transactions" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"amount":32.00,"merchant":"Bookstore","countryCode":"us"}') || true
echo "HTTP $code"
cat /tmp/txbody.txt
echo
if [ "$code" = "200" ] && [ -s /tmp/txbody.txt ]; then
  python3 -m json.tool < /tmp/txbody.txt
fi
