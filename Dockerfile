# docker build . -t color_blindness_live_filter
# docker run -ti -p8080:8080 -v$PWD:/tmp color_blindness_live_filter
FROM node:latest
RUN npm install http-server -g
RUN openssl req -new -x509 -keyout server.pem -out server.pem -days 365 -nodes -subj "/C=/ST=/L=/O=/OU=/CN=example.com"
CMD http-server /tmp --ssl -C /server.pem -K /server.pem -c 1
