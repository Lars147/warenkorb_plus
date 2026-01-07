# Warenkorb+ Chrome Extension

# list all just commands
help:
    @just --list

# Create zip package for Chrome Web Store
package:
    rm -f warenkorb_plus.zip
    zip -r warenkorb_plus.zip . -x "*.git*" -x ".DS_Store" -x "README.md" -x "PRIVACY.md" -x "justfile" -x "warenkorb_plus.zip" -x ".claude/*"
    @echo "Created warenkorb_plus.zip"
