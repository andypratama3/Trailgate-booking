# Image lokal untuk apps/api (Laravel 12) — dijalankan dengan `php artisan serve`.
# Untuk produksi lihat infra/ (Nginx + PHP-FPM), bukan file ini.
FROM php:8.3-cli-bookworm@sha256:5b8dd5a1c0930ff7757e8817d3ebbfc24d2ebddc4a158814776e8846af0ab347

RUN apt-get update && apt-get install -y --no-install-recommends \
        git unzip libzip-dev libpng-dev libjpeg62-turbo-dev \
        $PHPIZE_DEPS \
    && docker-php-ext-configure gd --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" pdo_mysql bcmath zip gd pcntl \
    && pecl install redis-6.3.0 \
    && docker-php-ext-enable redis \
    && rm -rf /var/lib/apt/lists/* /tmp/pear

# Composer dipin digest (ADR-006 §3 — item TERBUKA jatuh tempo T-008; ADR-006 accepted 2026-11-24, F1B-5).
COPY --from=composer:2.7.9@sha256:57d668f89bfb97187cad9a4f2a9df5a24b64d79f8202d414e8340549d009bd4e /usr/bin/composer /usr/bin/composer

ENV COMPOSER_ALLOW_SUPERUSER=1
WORKDIR /var/www/html
EXPOSE 8000


# --no-reload wajib di container: tanpa flag itu ServeCommand membuang DB_HOST/REDIS_HOST dari
# environment proses `php -S`, sehingga .env (127.0.0.1) yang dipakai dan koneksi ke mysql/redis gagal.
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000", "--no-reload"]
