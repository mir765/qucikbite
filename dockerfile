FROM nginx:latest

WORKDIR /qucikbite

COPY . /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
