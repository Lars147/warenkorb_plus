# Warenkorb+ Browser Extension (Chrome & Firefox)

# list all just commands
help:
    @just --list

# Install dependencies
install:
    npm install
    npx playwright install chromium

# Run Playwright tests
test:
    npm test

# Run tests with visible browser
test-headed:
    npm run test:headed

# Run tests in interactive UI mode
test-ui:
    npm run test:ui

# Run tests in CI (headless via xvfb)
test-ci:
    xvfb-run npm test

# Show test report
test-report:
    npm run test:report

# Create zip package for Chrome Web Store
package:
    rm -rf dist
    mkdir -p dist
    cd extension && zip -r ../dist/warenkorb_plus.zip . -x "*.DS_Store"
    @echo "Created dist/warenkorb_plus.zip"
