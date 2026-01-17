# @contactship/config

Shared configuration packages for the Contactship monorepo.

## Structure

```
packages/config/
├── eslint/          # ESLint configurations
│   ├── base.js      # Base ESLint configuration
│   ├── nextjs.js    # Next.js specific rules
│   ├── react.js     # React specific rules
│   └── index.js     # Export all ESLint configs
├── prettier/        # Prettier configuration
│   ├── config.js     # Prettier config
│   └── index.js     # Export Prettier config
├── typescript/       # TypeScript configurations
│   ├── base.json     # Base TypeScript config
│   ├── library.json  # For shared libraries
│   ├── nextjs.json   # For Next.js apps
│   └── service.json  # For service packages
└── package.json
```

## Usage

### ESLint

```typescript
// Import base config
import eslintConfig from "@contactship/config/eslint";

export default [...eslintConfig];
```

### Prettier

```javascript
// Import Prettier config
module.exports = require("@contactship/config/prettier");
```

### TypeScript

```json
{
  "extends": "@contactship/config/typescript/base"
}
```
