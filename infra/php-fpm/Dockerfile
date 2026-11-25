# Image produksi apps/api — PHP-FPM 8.3, NON-ROOT (www-data).
# Dev: docker/api/Dockerfile (php:8.3-cli-bookworm) bebas root — image ini untuk rilis.
#
# Pin (ADR-006 §3, F1B-5): base image + composer dipin ke DIGEST (bukan tag bergerak),
# pecl install redis dipin versi (redis-6.3.0). Update digest: docker manifest inspect

FROM php:8.3-fpm-bookworm@sha256:47b0d0d2a77fe8461eb042a93f1088a965fe66ed267eadfeb638edd573bfb019

# Kebutuhan build = temporary; hapus di lapisan sama supaya tidak di image final.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git unzip libzip-dev libpng-dev libjpeg62-turbo-dev $PHPIZE_DEPS \
    && docker-php-ext-configure gd --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" opcache pdo_mysql bcmath zip gd pcntl \
    && pecl install redis-6.3.0 \
    && docker-php-ext-enable redis opcache \
    && rm -rf /var/lib/apt/lists/* /tmp/pear \
    && apt-get purge -y --auto-remove git $PHPIZE_DEPS \
    && apt-get clean

# Composer dipin digest (ADR-006 §3).
COPY --from=composer:2.7.9@sha256:57d668f89bfb97187cad9a4f2a9df5a24b64d79f8202d414e8340549d009bd4e \
    /usr/bin/composer /usr/bin/composer

# Jamin direktori socket FPM spesifik user www-data (www.conf: /run/php-fpm/www.sock).
RUN mkdir -p /run/php-fpm && chown -R www-data:www-data /run/php-fpm
# FPM default sudah user www-data:group www-data; pastikan explicit untuk menjadikan non-root
# prinsip default (temuan tg-security F1B-4). Laravel storage + bootstrap cache wajib writable.
USER www-data:www-data

WORKDIR /var/www/html

# Runtime config: fpm pool minimal produksi.
COPY infra/php-fpm/www.conf /usr/local/etc/php-fpm.d/www.conf
COPY infra/php-fpm/docker-php.ini /usr/local/etc/php/conf.d/docker-php-prod.ini

EXPOSE 9000

CMD ["docker-php-entrypoint", "php-fpm"]
