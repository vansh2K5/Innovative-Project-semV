# Testing Setup Guide

## 📦 Install Test Dependencies

The lint errors you're seeing are expected - TypeScript doesn't recognize Jest globals until the type definitions are installed.

### **Install Jest and TypeScript Support**

```bash
npm install --save-dev jest ts-jest @types/jest @types/node
```

### **What Each Package Does:**

- **`jest`** - Testing framework
- **`ts-jest`** - TypeScript preprocessor for Jest
- **`@types/jest`** - TypeScript type definitions for Jest (fixes lint errors)
- **`@types/node`** - TypeScript type definitions for Node.js

---

## 🧪 Running Tests

### **Run All Tests**
```bash
npm test
```

### **Run Specific Test File**
```bash
npm test __tests__/lib/api.test.ts
```

### **Run Tests in Watch Mode**
```bash
npm test -- --watch
```

### **Run Tests with Coverage**
```bash
npm test -- --coverage
```

---

## 📝 Add Test Script to package.json

If not already present, add this to your `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## ✅ Verify Installation

After installing dependencies, the lint errors in `__tests__/lib/api.test.ts` should disappear.

You can verify by:
1. Restarting your IDE/TypeScript server
2. Opening `__tests__/lib/api.test.ts`
3. Checking that `describe`, `test`, and `expect` are no longer underlined in red

---

## 🎯 Expected Test Output

When you run `npm test`, you should see:

```
PASS  __tests__/lib/api.test.ts
  API handleResponse
    Success cases (2xx)
      ✓ 200 with valid JSON response (2 ms)
      ✓ 200 with empty JSON object (1 ms)
      ✓ 201 with created resource (1 ms)
    Error cases with JSON
      ✓ 400 with error key in JSON (2 ms)
      ✓ 401 with message key in JSON (1 ms)
      ✓ 500 with both error and message keys (1 ms)
      ✓ 404 with no error/message keys (1 ms)
    Error cases with non-JSON (HTML/text)
      ✓ 500 with HTML error page (1 ms)
      ✓ 500 with plain text error (1 ms)
      ✓ 500 with very long text (should truncate) (1 ms)
      ✓ 500 with empty response body (1 ms)
    Edge cases
      ✓ Malformed JSON should fallback gracefully (2 ms)
      ✓ 403 Forbidden with detailed error (1 ms)
      ✓ 503 Service Unavailable (1 ms)
  APIError class
    ✓ Creates error with correct properties (1 ms)
    ✓ Is instance of Error (1 ms)

Test Suites: 1 passed, 1 total
Tests:       16 passed, 16 total
Snapshots:   0 total
Time:        1.234 s
```

---

## 🔧 Troubleshooting

### **Issue: Tests not found**
**Solution:** Make sure `jest.config.js` is in the root directory

### **Issue: Module resolution errors**
**Solution:** Check that `moduleNameMapper` in `jest.config.js` matches your tsconfig paths

### **Issue: TypeScript errors in tests**
**Solution:** Make sure `@types/jest` is installed and your IDE is restarted

---

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest/)
- [Testing Next.js Applications](https://nextjs.org/docs/testing)

---

## ✅ Summary

Once you run `npm install --save-dev jest ts-jest @types/jest @types/node`, the lint errors will be resolved and you can run the comprehensive test suite to verify the error handling implementation!
