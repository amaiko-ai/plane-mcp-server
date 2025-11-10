#!/bin/bash
# Update Homebrew formula with SHA256 checksums from latest release
# Run this after building binaries in a release

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <version>"
    echo "Example: $0 1.1.0"
    exit 1
fi

VERSION="$1"
FORMULA="Formula/plane-mcp-server.rb"
BASE_URL="https://github.com/amaiko-ai/plane-mcp-server/releases/download/v${VERSION}"

echo "📦 Updating Homebrew formula for version $VERSION"
echo ""

# Calculate SHA256 for each binary
echo "Calculating SHA256 checksums..."

declare -A SHAS

for binary in \
    "plane-mcp-server-macos-arm64" \
    "plane-mcp-server-macos-x64" \
    "plane-mcp-server-linux-arm64" \
    "plane-mcp-server-linux-x64"
do
    if [ -f "dist/$binary" ]; then
        sha=$(shasum -a 256 "dist/$binary" | cut -d' ' -f1)
        SHAS[$binary]=$sha
        echo "  $binary: $sha"
    else
        echo "⚠️  Warning: dist/$binary not found, skipping"
    fi
done

echo ""

# Update formula
if [ -f "$FORMULA" ]; then
    # Update version
    sed -i.bak "s/version \".*\"/version \"${VERSION}\"/" "$FORMULA"

    # Update SHA256s
    [ -n "${SHAS[plane-mcp-server-macos-arm64]}" ] && \
        sed -i.bak "s/sha256 \"REPLACE_WITH_ACTUAL_SHA256_ARM64\"/sha256 \"${SHAS[plane-mcp-server-macos-arm64]}\"/" "$FORMULA"

    [ -n "${SHAS[plane-mcp-server-macos-x64]}" ] && \
        sed -i.bak "s/sha256 \"REPLACE_WITH_ACTUAL_SHA256_X64\"/sha256 \"${SHAS[plane-mcp-server-macos-x64]}\"/" "$FORMULA"

    [ -n "${SHAS[plane-mcp-server-linux-arm64]}" ] && \
        sed -i.bak "s/sha256 \"REPLACE_WITH_ACTUAL_SHA256_LINUX_ARM64\"/sha256 \"${SHAS[plane-mcp-server-linux-arm64]}\"/" "$FORMULA"

    [ -n "${SHAS[plane-mcp-server-linux-x64]}" ] && \
        sed -i.bak "s/sha256 \"REPLACE_WITH_ACTUAL_SHA256_LINUX_X64\"/sha256 \"${SHAS[plane-mcp-server-linux-x64]}\"/" "$FORMULA"

    rm -f "$FORMULA.bak"

    echo "✅ Formula updated: $FORMULA"
else
    echo "❌ Error: $FORMULA not found"
    exit 1
fi
