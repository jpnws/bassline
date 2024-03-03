# Use the official Bun image for the base stage
# This is used to install dependencies and build the app
FROM oven/bun:latest as base
WORKDIR /app

# Install dependencies in a temporary directory to cache them
FROM base as dependencies
COPY --from=node:20 /usr/local/bin/node /usr/local/bin/node
COPY package.json ./
COPY bun.lockb ./
COPY prisma/schema.prisma ./

# Install all dependencies including devDependencies
RUN bun install --frozen-lockfile

# Generate Prisma client. Ensure you have prisma as a dev dependency and your prisma schema file is copied.
RUN bunx prisma generate

# Create a separate stage for building the production bundle
# This can include transpilation, pruning of dev dependencies, or any build steps specific to your application
FROM dependencies as builder
COPY . .
# Optionally run tests or any other pre-production steps
# RUN bun test
# Build your app here if needed. For Bun.js, this might just be copying files or other simple tasks, as compilation is not typically needed like in Rust.
# RUN bun run build or any other build command

# Finally, prepare the runtime stage
FROM oven/bun:latest as runtime
WORKDIR /app

# Copy production dependencies
# With Bun.js, if there's no build step, you might skip directly to copying the whole application directory
# Otherwise, adjust the COPY commands to fit your build output
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app ./

# Set any runtime environment variables
ENV NODE_ENV=production

# Expose the port your app runs on
EXPOSE 8000

# Define the command to run your app
CMD ["bun", "start"]
