#!/bin/bash
# Local development script to build standalone executables
# Production builds use GitHub Actions (see .github/workflows/build-binaries.yml)
# Requires: Bun installed (https://bun.sh)

set -e

if ! command -v bun &> /dev/null; then
    echo "❌ Error: Bun is not installed"
    echo "Install from: https://bun.sh"
    exit 1
fi

mkdir -p dist

echo "🔨 Building executables locally..."

# Determine current platform for native build
NATIVE_BUILD=""
case "$(uname -s)" in
    Darwin)
        if [ "$(uname -m)" = "arm64" ]; then
            NATIVE_BUILD="bun-darwin-arm64"
        else
            NATIVE_BUILD="bun-darwin-x64"
        fi
        ;;
    Linux)
        if [ "$(uname -m)" = "aarch64" ]; then
            NATIVE_BUILD="bun-linux-arm64"
        else
            NATIVE_BUILD="bun-linux-x64"
        fi
        ;;
esac

# Build native version first (fastest, most likely to work)
if [ -n "$NATIVE_BUILD" ]; then
    echo "📦 Building native executable ($NATIVE_BUILD)..."
    bun build --compile \
        --target="$NATIVE_BUILD" \
        --minify \
        --bytecode \
        ./src/index.ts \
        --outfile "dist/plane-mcp-server-native"
    echo "✅ Native build complete: dist/plane-mcp-server-native"
fi

# Cross-compile for all platforms (optional, slower)
if [ "$1" = "--all" ]; then
    echo "📦 Cross-compiling for all platforms..."

    for target in bun-darwin-arm64 bun-darwin-x64 bun-linux-x64 bun-linux-arm64 bun-windows-x64; do
        output="dist/plane-mcp-server-${target#bun-}"
        [ "$target" = "bun-windows-x64" ] && output="${output}.exe"

        echo "  Building $target..."
        bun build --compile \
            --target="$target" \
            --minify \
            --bytecode \
            ./src/index.ts \
            --outfile "$output"
    done

    echo ""
    echo "✅ All executables built:"
    ls -lh dist/
else
    echo ""
    echo "💡 Tip: Run with --all to build for all platforms"
fi
