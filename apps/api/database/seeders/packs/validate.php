#!/usr/bin/env php
<?php

declare(strict_types=1);

/**
 * Validator sumber Mountain Pack (FR-37, PRD §6.1, §18.3).
 *
 * Mandiri: hanya PHP stdlib, tanpa bootstrap Laravel dan tanpa Composer.
 *
 * Pakai:
 *   php validate.php [--max-age-days=90] [--today=YYYY-MM-DD] [--schema=PATH]
 *                    [--allow-verified] [--expected-label=DEMO] [PATH ...]
 *
 * Keluar:
 *   0 = semua pack lulus
 *   1 = ada galat validasi (satu baris per galat)
 *   2 = argumen/path/schema salah
 */
const DEFAULT_MAX_AGE_DAYS = 90; // PRD §6.1: > 90 hari = perlu verifikasi ulang
const REFERENCE_TIMEZONE = 'Asia/Jakarta'; // zona acuan agar batas 90 hari deterministik

function usage(): string
{
    return <<<'TXT'
Usage: php validate.php [--max-age-days=90] [--today=YYYY-MM-DD] [--schema=PATH]
                        [--allow-verified] [--expected-label=DEMO] [PATH ...]

  PATH              file pack *.json atau direktori berisi pack (*.json langsung,
                    subdirektori fixtures/ tidak ikut dipindai)
  --max-age-days    batas umur verified_at dalam hari (default 90, PRD §6.1)
  --today=          tanggal acuan perhitungan umur (default: hari ini di Asia/Jakarta)
  --schema=         path JSON Schema (default: skema bawaan di schema/)
  --allow-verified  lewati cek label DEMO + verified=false; hanya untuk pack pilot yang
                    sudah dikonfirmasi manusia (lihat docs/domain/mountain-pack.md §7)
  --expected-label  label yang diwajibkan (default: DEMO)

Exit: 0 lulus, 1 ada galat validasi, 2 argumen salah.
TXT;
}

/** @param list<string> $argv */
function parse_args(array $argv): array
{
    $opts = [
        'max_age_days' => DEFAULT_MAX_AGE_DAYS,
        // Dipin ke zona acuan: date.timezone di php.ini berbeda antar mesin/CI sehingga
        // 'today' bisa bergeser satu hari dan batas 90/91 hari jadi nondeterministik.
        'today' => (new DateTimeImmutable('today', new DateTimeZone(REFERENCE_TIMEZONE)))->format('Y-m-d'),
        'schema' => __DIR__.'/schema/mountain-pack.schema.json',
        'allow_verified' => false,
        'expected_label' => 'DEMO',
        'targets' => [],
    ];

    foreach (array_slice($argv, 1) as $arg) {
        if ($arg === '--help' || $arg === '-h') {
            echo usage(), PHP_EOL;
            exit(0);
        }
        if (str_starts_with($arg, '--max-age-days=')) {
            $value = substr($arg, strlen('--max-age-days='));
            if (! ctype_digit($value) || (int) $value < 1) {
                fwrite(STDERR, "error: --max-age-days butuh integer >= 1, dapat '{$value}'".PHP_EOL);
                exit(2);
            }
            $opts['max_age_days'] = (int) $value;

            continue;
        }
        if (str_starts_with($arg, '--today=')) {
            $value = substr($arg, strlen('--today='));
            if (! check_date($value)) {
                fwrite(STDERR, "error: --today butuh tanggal YYYY-MM-DD valid, dapat '{$value}'".PHP_EOL);
                exit(2);
            }
            $opts['today'] = $value;

            continue;
        }
        if (str_starts_with($arg, '--schema=')) {
            $opts['schema'] = substr($arg, strlen('--schema='));

            continue;
        }

        if ($arg === '--allow-verified') {
            $opts['allow_verified'] = true;

            continue;
        }
        if (str_starts_with($arg, '--expected-label=')) {
            $value = substr($arg, strlen('--expected-label='));
            if (trim($value) === '') {
                fwrite(STDERR, 'error: --expected-label butuh label tidak kosong'.PHP_EOL);
                exit(2);
            }
            $opts['expected_label'] = $value;

            continue;
        }
        if (str_starts_with($arg, '--')) {
            fwrite(STDERR, "error: opsi tidak dikenal '{$arg}'".PHP_EOL);
            fwrite(STDERR, usage().PHP_EOL);
            exit(2);
        }
        $opts['targets'][] = $arg;
    }

    return $opts;
}

/** @return list<string> */
function resolve_targets(array $targets): array
{
    if ($targets === []) {
        $targets = [__DIR__];
    }

    $files = [];
    foreach ($targets as $target) {
        if (is_dir($target)) {
            foreach (glob(rtrim($target, '/').'/*.json') ?: [] as $file) {
                $files[] = $file;
            }

            continue;
        }
        if (is_file($target)) {
            $files[] = $target;

            continue;
        }
        fwrite(STDERR, "error: path tidak ditemukan: {$target}".PHP_EOL);
        exit(2);
    }

    $files = array_values(array_unique($files));
    sort($files);

    return $files;
}

function load_schema(string $path): stdClass
{
    if (! is_file($path)) {
        fwrite(STDERR, "error: schema tidak ditemukan: {$path}".PHP_EOL);
        exit(2);
    }
    try {
        $schema = json_decode((string) file_get_contents($path), false, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException $e) {
        fwrite(STDERR, "error: schema bukan JSON valid ({$path}): {$e->getMessage()}".PHP_EOL);
        exit(2);
    }
    if (! $schema instanceof stdClass) {
        fwrite(STDERR, "error: schema harus objek JSON ({$path})".PHP_EOL);
        exit(2);
    }

    return $schema;
}

/** @return array{0: ?stdClass, 1: ?string} */
function load_pack(string $path): array
{
    $raw = file_get_contents($path);
    if ($raw === false) {
        return [null, 'tidak bisa membaca file'];
    }
    try {
        $pack = json_decode($raw, false, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException $e) {
        return [null, 'bukan JSON valid: '.$e->getMessage()];
    }
    if (! $pack instanceof stdClass) {
        return [null, 'harus objek JSON (root)'];
    }

    return [$pack, null];
}

/** @return mixed */
function resolve_ref(stdClass $root, string $ref)
{
    if (! str_starts_with($ref, '#/')) {
        throw new RuntimeException("\$ref didukung hanya '#/...' lokal, dapat: {$ref}");
    }
    $node = $root;
    foreach (explode('/', substr($ref, 2)) as $segment) {
        $segment = str_replace(['~1', '~0'], ['/', '~'], $segment);
        if ($node instanceof stdClass) {
            $node = $node->{$segment} ?? null;
        } elseif (is_array($node)) {
            $node = $node[(int) $segment] ?? null;
        } else {
            $node = null;
        }
        if ($node === null) {
            throw new RuntimeException("\$ref tak terselesaikan: {$ref}");
        }
    }

    return $node;
}

function check_date(string $value): bool
{
    if (! preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
        return false;
    }
    $parsed = DateTimeImmutable::createFromFormat('!Y-m-d', $value);

    return $parsed !== false
        && $parsed->format('Y-m-d') === $value
        && $parsed->format('Y-m') === substr($value, 0, 7);
}

function type_matches(mixed $value, string $type): bool
{
    return match ($type) {
        'null' => $value === null,
        'boolean' => is_bool($value),
        'integer' => is_int($value),
        'number' => is_int($value) || is_float($value),
        'string' => is_string($value),
        'array' => is_array($value),
        'object' => $value instanceof stdClass,
        default => false,
    };
}

function describe_type(mixed $value): string
{
    return match (true) {
        $value === null => 'null',
        is_bool($value) => is_bool($value) ? 'bool' : '',
        is_int($value) => 'integer',
        is_float($value) => 'number',
        is_string($value) => 'string',
        is_array($value) => 'array',
        $value instanceof stdClass => 'object',
        default => get_debug_type($value),
    };
}

/** Panjang karakter tanpa syarat ext/mbstring (validator wajib jalan di `php -n`). */
function string_length(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value) : strlen($value);
}

/** @param array<string> $errors */
function validate_node(mixed $value, stdClass $schema, string $path, stdClass $root, array &$errors): void
{
    if (isset($schema->{'$ref'})) {
        validate_node($value, resolve_ref($root, $schema->{'$ref'}), $path, $root, $errors);

        return;
    }

    $at = $path === '' ? 'pack' : $path;

    if (isset($schema->type)) {
        $types = is_array($schema->type) ? $schema->type : [$schema->type];
        $matched = false;
        foreach ($types as $type) {
            if (type_matches($value, $type)) {
                $matched = true;
                break;
            }
        }
        if (! $matched) {
            $errors[] = "{$at}: tipe harus ".implode('|', $types).', dapat '.describe_type($value);

            return;
        }
    }

    if (isset($schema->enum) && ! in_array($value, $schema->enum, true)) {
        $errors[] = "{$at}: nilai tidak diizinkan (".implode(', ', $schema->enum).'), dapat '.describe_type($value);

        return;
    }

    if (property_exists($schema, 'const') && $value !== $schema->const) {
        $errors[] = "{$at}: wajib bernilai ".json_encode($schema->const);

        return;
    }

    if (is_string($value)) {
        if (isset($schema->minLength) && string_length($value) < $schema->minLength) {
            $errors[] = "{$at}: minimal {$schema->minLength} karakter";
        }
        if (isset($schema->pattern) && ! preg_match('~'.$schema->pattern.'~', $value)) {
            $errors[] = "{$at}: tidak cocok pola '{$schema->pattern}'";
        }
        if (isset($schema->format) && ! matches_format($value, (string) $schema->format)) {
            $errors[] = "{$at}: format tidak valid untuk '{$schema->format}', dapat '{$value}'";
        }
    }

    if (is_int($value) || is_float($value)) {
        if (isset($schema->minimum) && $value < $schema->minimum) {
            $errors[] = "{$at}: minimal {$schema->minimum}, dapat {$value}";
        }
    }

    if (is_array($value)) {
        if (isset($schema->minItems) && count($value) < $schema->minItems) {
            $errors[] = "{$at}: minimal {$schema->minItems} elemen";
        }
        if (isset($schema->items)) {
            foreach ($value as $index => $item) {
                validate_node($item, $schema->items, "{$path}[{$index}]", $root, $errors);
            }
        }
    }

    if (! $value instanceof stdClass) {
        return;
    }

    $vars = get_object_vars($value);
    if (isset($schema->required)) {
        foreach ($schema->required as $required) {
            if (! property_exists($value, $required)) {
                $errors[] = "{$at}: hilang properti wajib '{$required}'";
            }
        }
    }
    $properties = isset($schema->properties) ? $schema->properties : new stdClass;
    foreach ($vars as $key => $child) {
        if (property_exists($properties, $key)) {
            validate_node($child, $properties->{$key}, $path === '' ? $key : "{$path}.{$key}", $root, $errors);

            continue;
        }
        if (property_exists($schema, 'additionalProperties')) {
            $additional = $schema->additionalProperties;
            if ($additional === false) {
                $errors[] = "{$at}: properti tidak dikenal '{$key}'";
            } elseif ($additional instanceof stdClass) {
                validate_node($child, $additional, $path === '' ? $key : "{$path}.{$key}", $root, $errors);
            }
        }
    }
}

function matches_format(string $value, string $format): bool
{
    return match ($format) {
        'date' => check_date($value),
        'uri' => filter_var($value, FILTER_VALIDATE_URL) !== false && preg_match('~^https?://~', $value) === 1,
        default => true,
    };
}

/** @return list<string> */
function domain_errors(stdClass $pack, array $opts): array
{
    $errors = uniqueness_errors($pack);

    // Cek label DEMO (PRD §18.3) bisa dilewati setelah pack diverifikasi manusia:
    // `--allow-verified` untuk pack pilot, atau `--expected-label=X` untuk label lain.
    if (! $opts['allow_verified']) {
        if (! isset($pack->verified) || $pack->verified !== false) {
            $errors[] = "pack: 'verified' harus false — pack DEMO belum dikonfirmasi tenant (PRD §18.3)";
        }
        if (! isset($pack->label) || $pack->label !== $opts['expected_label']) {
            $errors[] = "pack: 'label' harus '{$opts['expected_label']}' — data belum diverifikasi tenant (PRD §18.3)";
        }
    }

    $sourceUrls = [];
    $sourceKinds = [];
    foreach (is_array($pack->sources ?? null) ? $pack->sources : [] as $source) {
        if ($source instanceof stdClass && isset($source->url) && is_string($source->url)) {
            $sourceUrls[$source->url] = true;
            $sourceKinds[$source->url] = isset($source->kind) && is_string($source->kind) ? $source->kind : '';
        }
    }

    $routeSlugs = [];
    foreach (is_array($pack->routes ?? null) ? $pack->routes : [] as $route) {
        if ($route instanceof stdClass && isset($route->slug)) {
            $routeSlugs[$route->slug] = true;
        }
    }

    $sourced = [];
    collect_sourced($pack, '', $sourced);
    foreach ($sourced as [$at, $entry]) {
        if (! is_string($entry->source_url) || trim($entry->source_url) === '') {
            $errors[] = "{$at}.source_url: wajib berupa URL terisi (PRD §6.1, NOT NULL)";
        } elseif (! isset($sourceUrls[$entry->source_url])) {
            $errors[] = "{$at}.source_url tidak dideklarasikan di sources[]: {$entry->source_url}";
        }
        if (! property_exists($entry, 'verified_at')) {
            $errors[] = "{$at}.verified_at: wajib ada (PRD §2.3 #7, §6.1)";
        } elseif (is_string($entry->verified_at) && check_date($entry->verified_at)) {
            if ($entry->verified_at > $opts['today']) {
                $errors[] = "{$at}.verified_at {$entry->verified_at} di masa depan dari acuan {$opts['today']} — tanggal verifikasi tidak boleh melebihi hari ini (PRD §6.1)";
            } else {
                $age = days_old($entry->verified_at, $opts['today']);
                if ($age > $opts['max_age_days']) {
                    $errors[] = "{$at}.verified_at {$entry->verified_at} berumur {$age} hari (> {$opts['max_age_days']}) — verifikasi ulang diperlukan (PRD §6.1)";
                }
            }
        }
    }

    foreach (is_array($pack->requirement_rules ?? null) ? $pack->requirement_rules : [] as $index => $rule) {
        if (! $rule instanceof stdClass) {
            continue;
        }
        $at = "requirement_rules[{$index}]";

        foreach (['source_url', 'verified_at', 'effective_from', 'effective_to'] as $field) {
            if (! property_exists($rule, $field)) {
                $errors[] = "{$at}: hilang '{$field}' — aturan tanpa sumber tidak boleh masuk (PRD §6.1)";
            }
        }

        if (isset($rule->source_url) && is_string($rule->source_url) && ($sourceKinds[$rule->source_url] ?? '') === 'opinion') {
            $errors[] = "{$at}.source_url memakai sumber kind=opinion: {$rule->source_url} — opini bukan fakta bersumber dan tidak boleh menjadi aturan (PRD §6.1, docs/domain/mountain-pack.md §4.3)";
        }
        if (isset($rule->scope) && $rule->scope === 'route' && (! isset($rule->route_slug) || ! is_string($rule->route_slug) || trim($rule->route_slug) === '')) {
            $errors[] = "{$at}: scope 'route' wajib mengisi route_slug yang ada di routes[] (PRD §6.1, §10.1)";
        }
        if (
            isset($rule->effective_from, $rule->effective_to)
            && is_string($rule->effective_from) && is_string($rule->effective_to)
            && check_date($rule->effective_from) && check_date($rule->effective_to)
            && $rule->effective_from > $rule->effective_to
        ) {
            $errors[] = "{$at}: effective_from {$rule->effective_from} setelah effective_to {$rule->effective_to}";
        }
    }

    foreach (['gates', 'checkpoints', 'camp_areas', 'quota', 'closure_drafts', 'requirement_rules'] as $group) {
        foreach (is_array($pack->{$group} ?? null) ? $pack->{$group} : [] as $index => $entry) {
            if (! $entry instanceof stdClass || ! isset($entry->route_slug) || $entry->route_slug === null) {
                continue;
            }
            if (! isset($routeSlugs[$entry->route_slug])) {
                $errors[] = "{$group}[{$index}].route_slug '{$entry->route_slug}' tidak ada di routes[]";
            }
        }
    }

    return $errors;
}

/** Cek slug/ID unik per koleksi — JSON Schema tidak bisa mengekspresikan unique-by-property. */
function uniqueness_errors(stdClass $pack): array
{
    $errors = [];
    foreach (['routes', 'gates', 'checkpoints', 'camp_areas'] as $group) {
        $seen = [];
        foreach (is_array($pack->{$group} ?? null) ? $pack->{$group} : [] as $index => $entry) {
            if (! $entry instanceof stdClass || ! isset($entry->slug) || ! is_string($entry->slug)) {
                continue;
            }
            if (isset($seen[$entry->slug])) {
                $errors[] = "{$group}[{$index}].slug '{$entry->slug}' duplikat dengan {$group}[{$seen[$entry->slug]}].slug";
            } else {
                $seen[$entry->slug] = $index;
            }
        }
    }

    $seenIds = [];
    foreach (is_array($pack->sources ?? null) ? $pack->sources : [] as $index => $source) {
        if (! $source instanceof stdClass || ! isset($source->id) || ! is_string($source->id)) {
            continue;
        }
        if (isset($seenIds[$source->id])) {
            $errors[] = "sources[{$index}].id '{$source->id}' duplikat dengan sources[{$seenIds[$source->id]}].id";
        } else {
            $seenIds[$source->id] = $index;
        }
    }

    return $errors;
}

/** Kumpulkan semua objek yang membawa `source_url` beserta path-nya. */
function collect_sourced(mixed $node, string $path, array &$found): void
{
    if ($node instanceof stdClass) {
        if (property_exists($node, 'source_url')) {
            $found[] = [$path, $node];
        }
        foreach (get_object_vars($node) as $key => $child) {
            collect_sourced($child, $path === '' ? $key : "{$path}.{$key}", $found);
        }

        return;
    }
    if (is_array($node)) {
        foreach ($node as $index => $child) {
            collect_sourced($child, "{$path}[{$index}]", $found);
        }
    }
}

function days_old(string $date, string $today): int
{
    $from = DateTimeImmutable::createFromFormat('!Y-m-d', $date);
    $to = DateTimeImmutable::createFromFormat('!Y-m-d', $today);
    if ($from === false || $to === false) {
        return PHP_INT_MAX;
    }

    return (int) $from->diff($to)->days;
}

$opts = parse_args($argv);
$schema = load_schema($opts['schema']);
$files = resolve_targets($opts['targets']);
if ($files === []) {
    fwrite(STDERR, 'error: tidak ada pack *.json ditemukan di target'.PHP_EOL);
    exit(2);
}

$failed = 0;
$checked = 0;
foreach ($files as $file) {
    [$pack, $loadError] = load_pack($file);
    if ($pack === null) {
        fwrite(STDERR, "{$file}: {$loadError}".PHP_EOL);
        $failed++;

        continue;
    }

    $checked++;
    $errors = [];
    try {
        validate_node($pack, $schema, '', $schema, $errors);
    } catch (RuntimeException $e) {
        fwrite(STDERR, "{$file}: schema gagal: {$e->getMessage()}".PHP_EOL);
        $failed++;

        continue;
    }
    $errors = array_merge($errors, domain_errors($pack, $opts));
    if ($errors === []) {
        continue;
    }
    foreach ($errors as $error) {
        fwrite(STDERR, "{$file}: {$error}".PHP_EOL);
    }
    $failed++;
}

if ($failed > 0) {
    fwrite(STDERR, "FAIL: {$failed} pack bermasalah dari {$checked} pack diperiksa (max_age_days={$opts['max_age_days']}, today={$opts['today']})".PHP_EOL);
    exit(1);
}

echo "OK: {$checked} pack valid (max_age_days={$opts['max_age_days']}, today={$opts['today']})".PHP_EOL;
exit(0);
