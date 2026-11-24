#!/usr/bin/env sh
# Self-test validate.php (FR-37, T-004). Mandiri: sh + php saja.
#
# Pakai: sh apps/api/database/seeders/packs/validate.self-test.sh
# Keluar 0 bila semua ekspektasi kode keluar terpenuhi, 1 bila ada yang meleset.

set -u

DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
VALIDATOR="php $DIR/validate.php"
FAILED=0
CASES=0

expect() {
    expected=$1
    label=$2
    shift 2
    $VALIDATOR "$@" >/dev/null 2>&1
    actual=$?
    CASES=$((CASES + 1))
    if [ "$actual" -eq "$expected" ]; then
        echo "ok   ($actual) $label"
    else
        echo "FAIL (harap $expected, dapat $actual) $label"
        FAILED=$((FAILED + 1))
    fi
}

expect 0 "4 pack DEMO lulus" "$DIR"
expect 1 "fixture: source_url hilang" "$DIR/fixtures/missing-source-url.json"
expect 1 "fixture: verified_at kedaluwarsa" "$DIR/fixtures/expired-verified-at.json"
expect 1 "fixture: tanggal tidak valid" "$DIR/fixtures/invalid-date.json"
expect 1 "fixture: verified bukan false" "$DIR/fixtures/verified-true.json"
expect 1 "fixture: source_url tidak terdaftar di sources[]" "$DIR/fixtures/undeclared-source-url.json"
expect 1 "fixture: sumber kind=opinion jadi aturan" "$DIR/fixtures/opinion-as-rule-source.json"
expect 1 "fixture: scope=route dengan route_slug tak terselesaikan" "$DIR/fixtures/route-scope-unresolved.json"
expect 1 "fixture: struktur tanpa mountain" "$DIR/fixtures/missing-mountain.json"
expect 0 "batas umur dinaikkan ke 800 hari" --max-age-days=800 "$DIR/fixtures/expired-verified-at.json"
expect 2 "argumen --max-age-days salah" --max-age-days=abc
expect 2 "path tidak ada" "$DIR/tidak-ada.json"
expect 0 "escape hatch: --allow-verified melewati cek DEMO" --allow-verified "$DIR/fixtures/verified-true.json"
expect 0 "escape hatch: --expected-label cocok dengan label pack" --expected-label=DEMO "$DIR/gede-pangrango.json"
expect 1 "escape hatch: --expected-label tidak cocok dengan label pack" --expected-label=PILOT "$DIR/gede-pangrango.json"

if [ "$FAILED" -gt 0 ]; then
    echo "FAIL: $FAILED dari $CASES kasus meleset"
    exit 1
fi

echo "OK: $CASES kasus kode keluar sesuai"
exit 0
