# Step 1: Build
FROM golang:1.23-alpine AS builder
WORKDIR /app
RUN apk add --no-cache gcc musl-dev libc-dev
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o /bin/mc-web-console .

# Step 2: Deploy
FROM alpine:latest
WORKDIR /app
COPY --from=builder /bin/mc-web-console /app/mc-web-console
COPY --from=builder /app/templates /app/templates
COPY --from=builder /app/public /app/public
CMD ["/app/mc-web-console"]