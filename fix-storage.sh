#!/bin/bash
set -euo pipefail

# This script is a workaround for environments with limited, read-only home directories.
# It moves the project to a writable location and then executes the final command.

SOURCE_DIR="/home/user/studio"
TARGET_DIR="/home/user/studio-moved"
PNPM_CMD="pnpm"

# --- Main Logic ---

echo "📂 Project detected at: $SOURCE_DIR"

if [ -f "$TARGET_DIR/frontend/pnpm-lock.yaml" ]; then
    echo "✅ Project already exists in writable directory. Skipping move."
else
    echo "📦 Will relocate project to writable directory: $TARGET_DIR"
    mkdir -p "$TARGET_DIR"

    echo "🧹 Cleaning up large directories from source to make space..."
    # Defensively remove large directories from the source to make space for the copy
    rm -rf "$SOURCE_DIR/node_modules" "$SOURCE_DIR/.next" "$SOURCE_DIR/.turbo" "$SOURCE_DIR/frontend/node_modules" "$SOURCE_DIR/frontend/.next"

    echo "📦 Moving project source code from $SOURCE_DIR to $TARGET_DIR..."
    # Use rsync if available for more robust exclusion, otherwise fallback to cp
    if command -v rsync &> /dev/null; then
        echo "✅ Using 'rsync' for efficient move..."
        rsync -a --exclude=".git" --exclude="node_modules" --exclude=".next" --exclude=".turbo" "$SOURCE_DIR/" "$TARGET_DIR/"
    else
        echo "⚠️ rsync not found. Using 'cp' as a fallback (excluding known large dirs)..."
        # Find all files and directories except .git, node_modules, and .next
        find "$SOURCE_DIR" -mindepth 1 -maxdepth 1 \
            ! -name ".git" \
            ! -name "node_modules" \
            ! -name ".next" \
            ! -name ".turbo" \
            -exec cp -r -t "$TARGET_DIR/" {} +
    fi
fi

# Change to the new directory to ensure subsequent commands run there.
cd "$TARGET_DIR/frontend"
echo "📂 Current working directory is now $(pwd)"

echo "🛠️  Setting up isolated build/output cache..."
mkdir -p ./.next ./.turbo
export NEXT_PRIVATE_DIR="$TARGET_DIR/frontend/.next"
export TURBO_CACHE_DIR="$TARGET_DIR/frontend/.turbo"

echo "🔗 Redirecting build folders..."
# Symlink if not already linked
ln -sf "$TARGET_DIR/frontend/.next" "$SOURCE_DIR/frontend/.next"
# No longer a workspace, so no root .turbo
# ln -sf "$TARGET_DIR/.turbo" "$SOURCE_DIR/.turbo"


echo "⚙️  Configuring PNPM and NPM..."
# Redirect cache to a writable directory
$PNPM_CMD config set store-dir "$TARGET_DIR/.pnpm-store"
$PNPM_CMD config set cache-dir "$TARGET_DIR/.pnpm-cache"
npm config set cache "$TARGET_DIR/.npm"

echo "📦 Installing dependencies..."
# Install dependencies in the new location
$PNPM_CMD install

echo "🚀 Starting development server..."
# Execute the command passed to the script, e.g., "pnpm run dev"
exec pnpm run dev "$@"
