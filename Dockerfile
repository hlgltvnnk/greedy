# # Builder image
# FROM rust:1.86.0 AS builder

# ENV TARGET=x86_64-unknown-linux-gnu

# # Setup musl target and dependencies
# RUN rustup target add "$TARGET" && apt-get update

# # Set working directory
# WORKDIR /usr/src/app

# # Copy full workspace early so cargo can find all workspace members
# COPY . .

# # Fetch dependencies (now it will succeed)
# RUN cargo fetch

# # Build the binary
# RUN cargo build --release --locked --target "$TARGET" && cp "target/${TARGET}/release/greedy-indexer" ./

# # Runtime image
# FROM scratch AS runtime

# EXPOSE 8080
# COPY --from=builder /usr/src/app/greedy-indexer /bin/greedy-indexer

# ENTRYPOINT ["/bin/greedy-indexer"]

# ---- Builder stage ----
    FROM rust:1.86.0 AS builder

    # Set working directory
    WORKDIR /usr/src/app
    
    # Copy manifest and lock files
    COPY Cargo.toml Cargo.lock ./
    
    # Only create dummy src if you're not using a workspace.
    # If you use a workspace, skip this step.
    RUN mkdir -p src && echo "fn main() {}" > src/main.rs
    
    # Build dependencies only
    RUN cargo build --release || true
    
    # Clean dummy source
    RUN rm -rf src
    
    # Copy full source
    COPY . .
    
    # Build actual app
    RUN cargo build --release
    
    # ---- Runtime stage ----
    FROM debian:bookworm-slim
    
    RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
    
    COPY --from=builder /usr/src/app/target/release/greedy-indexer /usr/local/bin/greedy-indexer
    COPY ./migrations /opt/migrations
    
    EXPOSE 8080
    ENTRYPOINT ["/usr/local/bin/greedy-indexer"]
    