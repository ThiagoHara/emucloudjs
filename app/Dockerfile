FROM ubuntu:16.04

MAINTAINER Thiago Hara <thiagomassamihara@gmail.com>
# Install app dependencies
RUN apt-get update && \
    apt-get -y install sudo && \
    apt-get -y install curl && \    
    curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash - && \
    apt-get install --yes nodejs && \
    apt-get -y autoremove

# Install PM2
RUN npm install -g pm2

RUN mkdir -p /var/www/app

# Define working directory
WORKDIR /var/www/app

ADD . /var/www/app

RUN npm install

#COPY docker-entrypoint.sh /
#ENTRYPOINT ["/docker-entrypoint.sh"]

# Expose port
EXPOSE 3000

# Run app
CMD ["pm2-docker", "process.yml"]