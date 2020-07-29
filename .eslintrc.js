const fs = require("fs");
const path = require("path");

const prettierOptions = JSON.parse(fs.readFileSync(path.resolve(__dirname, ".prettierrc"), "utf8"));

module.exports = {
  extends: ["react-app", "prettier", "prettier/react", "prettier/@typescript-eslint"],
  plugins: ["prettier"],
  rules: {
    "prettier/prettier": ["error", prettierOptions],
    "react-hooks/exhaustive-deps": "off", // 有时候 useEffect 只依赖[]
  },
  overrides: [
    {
      files: ["**/*.ts?(x)"],
      rules: { "prettier/prettier": ["warn", prettierOptions] },
    },
  ],
};
