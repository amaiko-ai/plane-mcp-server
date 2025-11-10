class PlaneMcpServer < Formula
  desc "MCP server for managing Plane intake queue (triage workflow)"
  homepage "https://github.com/amaiko-ai/plane-mcp-server"
  version "1.1.0"
  license "MIT"

  on_macos do
    if Hardware::CPU.arm?
      url "https://github.com/amaiko-ai/plane-mcp-server/releases/download/v#{version}/plane-mcp-server-macos-arm64"
      sha256 "REPLACE_WITH_ACTUAL_SHA256_ARM64"
    else
      url "https://github.com/amaiko-ai/plane-mcp-server/releases/download/v#{version}/plane-mcp-server-macos-x64"
      sha256 "REPLACE_WITH_ACTUAL_SHA256_X64"
    end
  end

  on_linux do
    if Hardware::CPU.arm?
      url "https://github.com/amaiko-ai/plane-mcp-server/releases/download/v#{version}/plane-mcp-server-linux-arm64"
      sha256 "REPLACE_WITH_ACTUAL_SHA256_LINUX_ARM64"
    else
      url "https://github.com/amaiko-ai/plane-mcp-server/releases/download/v#{version}/plane-mcp-server-linux-x64"
      sha256 "REPLACE_WITH_ACTUAL_SHA256_LINUX_X64"
    end
  end

  def install
    bin.install Dir["plane-mcp-server-*"].first => "plane-mcp-server"
  end

  def caveats
    <<~EOS
      Plane MCP Server has been installed!

      To use with Claude Desktop, add to your config file:
      #{if OS.mac?
        "~/Library/Application Support/Claude/claude_desktop_config.json"
      elsif OS.linux?
        "~/.config/Claude/claude_desktop_config.json"
      end}

      {
        "mcpServers": {
          "plane-intake": {
            "command": "#{bin}/plane-mcp-server",
            "args": [],
            "env": {
              "PLANE_API_KEY": "your-api-key-here",
              "PLANE_WORKSPACE_SLUG": "your-workspace-slug",
              "PLANE_API_HOST_URL": "https://app.plane.so"
            }
          }
        }
      }

      Get your API key from: https://app.plane.so/settings/api-tokens
    EOS
  end

  test do
    # Test that binary exists and is executable
    assert_predicate bin/"plane-mcp-server", :exist?
    assert_predicate bin/"plane-mcp-server", :executable?
  end
end
