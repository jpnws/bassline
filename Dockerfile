# Use the official Bun image for the base stage.
# This is used to install dependencies and build the app.
FROM oven/bun:1 as base

# Add a new user to run the app. This is a best practice for security.
RUN useradd -m appuser

# Set the working directory in the container.
WORKDIR /app

# Ensure appuser owns the working directory.
RUN chown appuser:appuser /app
USER appuser

# Install dependencies in a temporary directory to cache them.
FROM base as dependencies
COPY --from=node:20 /usr/local/bin/node /usr/local/bin/node
COPY package.json ./
COPY bun.lockb ./
COPY prisma/schema.prisma ./

# Install all dependencies including devDependencies.
# Generate Prisma client. Ensure you have prisma as a dev dependency and your prisma schema file is copied.
RUN bun install && bunx prisma generate

# Create a separate stage for building the production bundle.
# This can include transpilation, pruning of dev dependencies, or any build steps specific to your application.
FROM dependencies as builder
COPY . .

# Finally, prepare the runtime stage.
FROM oven/bun:1 as runtime
WORKDIR /app

# Copy production dependencies.
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app ./

# Set any runtime environment variables.
ENV NODE_ENV=production

# Expose the port your app runs on.
EXPOSE 8000

# Define the command to run your app.
CMD ["bun", "start"]

# Add a health check to your app.
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/api/health_check || exit 1
