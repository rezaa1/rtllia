FROM postgres:15-alpine

# Set environment variables
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_DB=retell_app

# Copy initialization scripts
COPY postgresql_schema.sql /docker-entrypoint-initdb.d/

# Expose PostgreSQL port
EXPOSE 5432

# The postgres image already includes a CMD to start the server
