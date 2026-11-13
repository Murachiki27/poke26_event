# FROM php:8.5-apache

# WORKDIR /var/www/html

# # RUN cp -rL /workspace/. /var/www/html/
# COPY --chown=www-data:www-data ./api .

# RUN docker-php-ext-install pdo_mysql

FROM php:8.5-fpm

# Composerの実行やDB接続に必要な最小限のパッケージをインストール
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libzip-dev \
    && docker-php-ext-install pdo_mysql zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Composerのインストール
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# ソースコードをコピー（所有者を www-data に指定）
COPY --chown=www-data:www-data ./api /var/www/html

# www-dataユーザーで composer install を実行
USER www-data
RUN composer install --no-interaction --optimize-autoloader

# PHP-FPMのデフォルトポート
EXPOSE 9000

CMD ["php-fpm"]

