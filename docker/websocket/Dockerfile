FROM php:8.5-cli

WORKDIR /app

RUN apt-get update \
    && apt-get install -y unzip libzip-dev \
    && docker-php-ext-install zip \
    && docker-php-ext-install pcntl pdo_mysql

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY ./websocket/composer.json ./websocket/composer.lock* ./
# RUN cp /workspace/composer.json ./

RUN composer install

COPY ./websocket .
# RUN cp -rL /workspace/. ./

CMD ["php", "websocket.php", "start"]

RUN composer dump-autoload --optimize
