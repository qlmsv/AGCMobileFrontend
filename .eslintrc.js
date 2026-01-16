module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    'no-console': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
  },
  ignorePatterns: ['/dist/*', '/node_modules/*', '/android/*', '/ios/*'],
};
