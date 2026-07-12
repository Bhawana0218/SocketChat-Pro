{
  "extends": "@eslint/js/recommended",
  "languageOptions": {
    "ecmaVersion": 2020,
    "globals": {
      "browser": true,
      "ES2021": true
    },
    "parserOptions": {
      "ecmaFeatures": {
        "jsx": true
      },
      "sourceType": "module"
    }
  },
  "plugins": ["react-refresh"],
  "rules": {
    "react-refresh/only-export-components": ["warn", { "allowConstantExport": true }]
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
