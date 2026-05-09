FROM eclipse-temurin:17-jdk-jammy

# Install Node 22 via NodeSource signed apt repo (avoids curl | bash supply-chain risk)
RUN apt-get update \
    && apt-get install -y gnupg curl git unzip \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
       | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" \
       > /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Angular CLI globally at a fixed version for reproducibility.
# package.json uses ^21.2.10 (caret range); the global install is pinned to 21.2.10
# so the CLI inside the container is always deterministic regardless of future releases.
RUN npm install -g @angular/cli@21.2.10 --legacy-peer-deps

WORKDIR /workspace
