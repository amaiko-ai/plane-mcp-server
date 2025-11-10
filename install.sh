#!/bin/bash
# Plane MCP Server installer for Claude Desktop
# Usage: curl -fsSL https://raw.githubusercontent.com/amaiko-ai/plane-mcp-server/main/install.sh | bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 Plane MCP Server Installer"
echo ""

# Detect OS and architecture
OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
    Darwin)
        if [ "$ARCH" = "arm64" ]; then
            BINARY_NAME="plane-mcp-server-macos-arm64"
        else
            BINARY_NAME="plane-mcp-server-macos-x64"
        fi
        CONFIG_DIR="$HOME/Library/Application Support/Claude"
        ;;
    Linux)
        if [ "$ARCH" = "aarch64" ]; then
            BINARY_NAME="plane-mcp-server-linux-arm64"
        else
            BINARY_NAME="plane-mcp-server-linux-x64"
        fi
        CONFIG_DIR="$HOME/.config/Claude"
        ;;
    *)
        echo -e "${RED}❌ Unsupported OS: $OS${NC}"
        echo "Please install manually from: https://github.com/amaiko-ai/plane-mcp-server/releases"
        exit 1
        ;;
esac

echo "Detected: $OS $ARCH"
echo "Binary: $BINARY_NAME"
echo ""

# Install location
INSTALL_DIR="$HOME/.local/bin"
INSTALL_PATH="$INSTALL_DIR/plane-mcp-server"

# Create install directory
mkdir -p "$INSTALL_DIR"

# Download latest release
echo "📥 Downloading latest release..."
LATEST_URL="https://github.com/amaiko-ai/plane-mcp-server/releases/latest/download/$BINARY_NAME"

if command -v curl &> /dev/null; then
    curl -fsSL "$LATEST_URL" -o "$INSTALL_PATH"
elif command -v wget &> /dev/null; then
    wget -q "$LATEST_URL" -O "$INSTALL_PATH"
else
    echo -e "${RED}❌ Error: curl or wget required${NC}"
    exit 1
fi

# Make executable
chmod +x "$INSTALL_PATH"
echo -e "${GREEN}✅ Binary installed to $INSTALL_PATH${NC}"
echo ""

# Gather configuration
echo "📝 Configuration"
echo ""

read -p "Plane API Key: " PLANE_API_KEY
read -p "Workspace Slug: " PLANE_WORKSPACE_SLUG
read -p "Plane Host (default: https://app.plane.so): " PLANE_API_HOST_URL
PLANE_API_HOST_URL=${PLANE_API_HOST_URL:-https://app.plane.so}

echo ""

# Create/update Claude Desktop config
CONFIG_FILE="$CONFIG_DIR/claude_desktop_config.json"
mkdir -p "$CONFIG_DIR"

if [ -f "$CONFIG_FILE" ]; then
    echo -e "${YELLOW}⚠️  Config file exists: $CONFIG_FILE${NC}"
    echo "Backing up to ${CONFIG_FILE}.backup"
    cp "$CONFIG_FILE" "${CONFIG_FILE}.backup"
fi

# Generate config (merge with existing if present)
if [ -f "$CONFIG_FILE" ]; then
    # Use jq if available, otherwise manual merge
    if command -v jq &> /dev/null; then
        TMP_FILE=$(mktemp)
        jq --arg path "$INSTALL_PATH" \
           --arg key "$PLANE_API_KEY" \
           --arg slug "$PLANE_WORKSPACE_SLUG" \
           --arg host "$PLANE_API_HOST_URL" \
           '.mcpServers["plane-intake"] = {
               "command": $path,
               "args": [],
               "env": {
                   "PLANE_API_KEY": $key,
                   "PLANE_WORKSPACE_SLUG": $slug,
                   "PLANE_API_HOST_URL": $host
               }
           }' "$CONFIG_FILE" > "$TMP_FILE"
        mv "$TMP_FILE" "$CONFIG_FILE"
    else
        echo -e "${YELLOW}⚠️  jq not found, cannot merge config automatically${NC}"
        echo "Please add this to $CONFIG_FILE manually:"
        echo ""
        cat <<EOF
{
  "mcpServers": {
    "plane-intake": {
      "command": "$INSTALL_PATH",
      "args": [],
      "env": {
        "PLANE_API_KEY": "$PLANE_API_KEY",
        "PLANE_WORKSPACE_SLUG": "$PLANE_WORKSPACE_SLUG",
        "PLANE_API_HOST_URL": "$PLANE_API_HOST_URL"
      }
    }
  }
}
EOF
        exit 0
    fi
else
    # Create new config
    cat > "$CONFIG_FILE" <<EOF
{
  "mcpServers": {
    "plane-intake": {
      "command": "$INSTALL_PATH",
      "args": [],
      "env": {
        "PLANE_API_KEY": "$PLANE_API_KEY",
        "PLANE_WORKSPACE_SLUG": "$PLANE_WORKSPACE_SLUG",
        "PLANE_API_HOST_URL": "$PLANE_API_HOST_URL"
      }
    }
  }
}
EOF
fi

echo -e "${GREEN}✅ Config updated: $CONFIG_FILE${NC}"
echo ""

# Restart Claude Desktop (macOS only)
if [ "$OS" = "Darwin" ]; then
    echo "🔄 Restarting Claude Desktop..."
    if pgrep -x "Claude" > /dev/null; then
        osascript -e 'quit app "Claude"' 2>/dev/null || true
        sleep 1
    fi
    open -a "Claude" 2>/dev/null || echo -e "${YELLOW}⚠️  Please restart Claude Desktop manually${NC}"
fi

echo ""
echo -e "${GREEN}✅ Installation complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Restart Claude Desktop if it's running"
echo "2. The plane-intake MCP server should now be available"
echo ""
echo "To uninstall:"
echo "  rm $INSTALL_PATH"
echo "  Remove the 'plane-intake' section from $CONFIG_FILE"
