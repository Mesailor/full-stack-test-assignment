# Tailwind Config

Shared Tailwind CSS configuration based on DESIGN.md.

## Usage

In your app's `tailwind.config.js`:

```javascript
const baseConfig = require("@repo/tailwind-config/tailwind.config");

module.exports = {
  ...baseConfig,
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
};
```
