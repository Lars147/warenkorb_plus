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
    rm -f warenkorb_plus.zip
    zip -r warenkorb_plus.zip . -x "*.git*" -x ".DS_Store" -x "README.md" -x "PRIVACY.md" -x "justfile" -x "warenkorb_plus.zip" -x ".claude/*" -x "tests/*" -x "playwright.config.js" -x "package.json" -x "package-lock.json" -x "node_modules/*" -x "playwright-report/*" -x "test-results/*"
    @echo "Created warenkorb_plus.zip"
