# stage1 as builder
FROM node:18.16-alpine as builder

# Set working directory
WORKDIR /app


# install node modules and build assets
COPY package*.json ./

RUN npm install
# Copy all files from current directory to working dir in image
COPY . .
RUN npm run build

# Use Nginx as the production server
FROM nginx:alpine
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
RUN rm -rf /usr/share/nginx/html/*
# Copy the built files from the builder stage to the Nginx server
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 3000
EXPOSE 3000 3000

# Start Nginx when the container runs
CMD ["nginx", "-g", "daemon off;"]

## fsdfs