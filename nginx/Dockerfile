FROM nginx

COPY ./default.conf /etc/nginx/conf.d/default.conf

RUN apt-get update && \
    apt-get -y install certbot cron python3-certbot-nginx procps

CMD service cron start && \
    service nginx start && \
    sleep infinity
    