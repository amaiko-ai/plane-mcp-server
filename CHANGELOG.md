# Changelog

## [1.3.1](https://github.com/amaiko-ai/plane-mcp-server/compare/v1.3.0...v1.3.1) (2025-11-11)


### Bug Fixes

* test release workflow and downstream automation ([162ae65](https://github.com/amaiko-ai/plane-mcp-server/commit/162ae65be71ea1028ebeff887312308d4f282c7f))

## [1.3.0](https://github.com/amaiko-ai/plane-mcp-server/compare/v1.2.0...v1.3.0) (2025-11-11)


### Features

* replace fetch with axios for connection pooling ([713d00a](https://github.com/amaiko-ai/plane-mcp-server/commit/713d00aab25e7fde7b9ff962eafb791ed134cb98))


### Bug Fixes

* consolidate release workflows to fix trigger issues ([7b05f17](https://github.com/amaiko-ai/plane-mcp-server/commit/7b05f172fe3facd69f82925b322cf0b16b89bf9d))

## [1.2.0](https://github.com/amaiko-ai/plane-mcp-server/compare/v1.1.0...v1.2.0) (2025-11-11)


### Features

* add Homebrew formula for package manager installation ([6f7643d](https://github.com/amaiko-ai/plane-mcp-server/commit/6f7643d9296375e7c8003ffe43e8755540c97e95))
* add one-command installer script for normal users ([f8603a3](https://github.com/amaiko-ai/plane-mcp-server/commit/f8603a3ba55945bc896492dda0c7bf96d9d7bafc))
* add standalone binary builds for zero-dependency installation ([4adf049](https://github.com/amaiko-ai/plane-mcp-server/commit/4adf049c1d72f13919fec1a6dd66fce442ff0fa6))
* switch to npm Trusted Publishing (OIDC, no tokens) ([d885f30](https://github.com/amaiko-ai/plane-mcp-server/commit/d885f3099ff445978f0f4325e87f76b20b1f0df2))


### Bug Fixes

* add dependency installation to binary build workflows ([90a9610](https://github.com/amaiko-ai/plane-mcp-server/commit/90a9610643c4125923053eda406ce71bde20423d))
* add NPM_TOKEN env for npm authentication ([f812049](https://github.com/amaiko-ai/plane-mcp-server/commit/f8120490c2f3e57a195f401497ab43865e7c9ebc))

## [1.1.0](https://github.com/amaiko-ai/plane-mcp-server/compare/v1.0.0...v1.1.0) (2025-11-10)


### Features

* add automated release workflow with release-please ([e1cfa08](https://github.com/amaiko-ai/plane-mcp-server/commit/e1cfa0855ca83ca9afdf197b3f3fec7af3f1950b))


### Bug Fixes

* add packages field to pnpm-workspace.yaml for proper pnpm 10 config ([6104997](https://github.com/amaiko-ai/plane-mcp-server/commit/6104997ed8062271aa48c79bf9cd3f0c4d864429))
* remove pnpm-workspace.yaml (not needed for single-package repo) ([e87a4ec](https://github.com/amaiko-ai/plane-mcp-server/commit/e87a4ec69e60041e95fb896df598da9684051452))
