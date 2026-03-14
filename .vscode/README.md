# VS Code Debugging Guide - Gadgify

This folder contains VS Code debugging configurations for Gadgify.

## 🚀 Quick Start

### 1. Install Required Extensions

Open VS Code Extensions (Ctrl+Shift+X) and install:

- **Debugger for Chrome** (Microsoft)
- **Thunder Client** or **REST Client** (optional, for API testing)

### 2. Start Debugging

1. Open Debug view: **Ctrl+Shift+D**
2. Select configuration from dropdown:
   - **🚀 Full Stack Debug** - Both frontend & backend
   - **⚡ Frontend Only** - Just React app
   - **🔧 Backend Only** - Just Express server
3. Click green play button (or F5)

## 📋 Available Configurations

### 🚀 Full Stack Debug (Frontend + Backend)

Starts both frontend and backend with debuggers attached.

**What happens:**

- Chrome browser opens at http://localhost:3000
- Express server starts with Node debugger
- Both run simultaneously

**Use when:** Debugging features that span frontend + backend

### ⚡ Frontend Only

Debugs React app in Chrome.

**What happens:**

- Chrome browser launches at http://localhost:3000
- You must start backend manually: `cd backend && npm run dev`

**Use when:** Debugging UI, components, or frontend logic only

### 🔧 Backend Only

Debugs Express server with Node debugger.

**What happens:**

- Node server starts with debugger
- You must start frontend manually: `cd frontend && npm run dev`
- Browser connects to http://localhost:3000

**Use when:** Debugging API endpoints, database queries, middleware

## 🎯 How to Debug

### Set Breakpoints

Click on the line number in VS Code where you want to pause execution:

```typescript
// Example - Frontend
export const fetchProducts = async () => {
  const response = await axios.get("/api/products"); // ← Click line number
  return response.data;
};

// Example - Backend
app.get("/api/products", (req, res) => {
  console.log("Fetching products"); // ← Click line number
  res.json({ success: true, data: [] });
});
```

### Debug Console

When paused at breakpoint:

1. View → Debug Console (Ctrl+Shift+Y)
2. Inspect variables: type `variableName`
3. Execute commands: type JavaScript/TypeScript code

```
// Inspect a variable
> products
[{id: 1, name: "Laptop", price: 50000}, ...]

// Execute code
> products.length
5

// Check object structure
> products[0]
{id: 1, name: "Laptop", price: 50000, stock: 10}
```

### Step Through Code

**Keyboard Shortcuts:**

- **F5** - Continue execution
- **F10** - Step over (next line)
- **F11** - Step into (enter function)
- **Shift+F11** - Step out (exit function)
- **Ctrl+Shift+F5** - Restart

### Watch Variables

Monitor specific variables:

1. Click **Watch** section in Debug view
2. Click "+" and enter variable name
3. Value updates as you step through code

## 🔍 Frontend Debugging Tips

### Using debugger in React Code

```typescript
function ProductList() {
  const products = useQuery(...);

  debugger; // Pauses here when DevTools is open

  return <div>{products.data?.map(...)}</div>;
}
```

### Browser DevTools (F12)

Even with VS Code debugger, use browser console for:

- Checking API responses
- Testing JavaScript in console
- Viewing network requests
- Inspecting DOM elements

### Inspect Props/State

```typescript
// In Debug Console
> window.__REACT_DEVTOOLS_GLOBAL_HOOK__  // Check React is loaded
> document.querySelector('.product-card')  // Find elements
```

## 🛠️ Backend Debugging Tips

### API Endpoint Debugging

```typescript
// backend/src/routes/products.ts
router.get("/:id", (req, res, next) => {
  debugger; // ← Breakpoint here

  const { id } = req.params;
  console.log("Fetching product:", id); // Shows in terminal

  // Make API call to test from frontend
  // It will pause here and you can inspect req.params, req.query, etc.
});
```

### Database Query Debugging

```typescript
// backend/src/services/productService.ts
export const getProduct = async (id: string) => {
  debugger; // Pause here

  const product = await prisma.product.findUnique({
    where: { id },
  });

  console.log("Found product:", product);
  return product;
};
```

### Request/Response Inspection

When paused at breakpoint:

```
Debug Console → Type:
> req.params
> req.body
> req.headers
> res.statusCode
```

## 📍 Common Debugging Scenarios

### Scenario 1: "Products not showing on page"

1. Select **Full Stack Debug**
2. Press F5
3. Set breakpoint in `ProductList.tsx` at render
4. Set breakpoint in `backend/controllers/productController.ts`
5. Browser loads → both breakpoints show data flow
6. Check if data is coming from API

### Scenario 2: "API returns wrong data"

1. Select **Backend Only**
2. Start frontend manually: `cd frontend && npm run dev`
3. Set breakpoint in service layer (where data is queried)
4. Step through and inspect database results
5. Check transformation logic

### Scenario 3: "Form validation fails"

1. Select **Frontend Only**
2. Start backend manually: `cd backend && npm run dev`
3. Set breakpoint in form component
4. Type in form fields
5. Check validation state in Debug Console

## 🚨 Troubleshooting

### "Chrome not installed"

Install Chrome or modify launch.json to use Edge:

```json
"type": "vscode-edge-debug2"
```

### "Port 3000 already in use"

```bash
# Kill process using port
# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -i :3000
kill -9 <PID>
```

### "Breakpoints not hit"

1. Ensure webpack sourcemaps enabled (Vite does this by default)
2. Run `npm run dev` not `npm run build`
3. Check breakpoint column (must be on actual code)
4. Restart debugger (Ctrl+Shift+F5)

### "Node debugger not working"

1. Ensure backend is running with debugger:
   ```bash
   cd backend
   npm run dev
   ```
2. Check PORT not conflicting (default: 5000)
3. Look for error in terminal

### "Can't find module"

Run in backend folder:

```bash
npm install
npx prisma generate
```

## 🎨 VS Code Debugger Customization

Edit `launch.json` to:

**Change Chrome to Edge:**

```json
"type": "msedge"
```

**Enable detailed logging:**

```json
"trace": "verbose"
```

**Skip files in stepping:**

```json
"skipFiles": ["<node_internals>/**"]
```

**Auto-attach to external Chrome:**

```json
"attach": true,
"port": 9222
```

## 📚 Resources

- [VS Code Debugging Guide](https://code.visualstudio.com/docs/editor/debugging)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [React DevTools Extension](https://chrome.google.com/webstore)
- [Redux DevTools](https://chrome.google.com/webstore) (if using Redux)

## 💡 Pro Tips

1. **Use conditional breakpoints**: Right-click breakpoint → Edit Breakpoint → Add condition
2. **Watch expressions**: Use `window.localStorage` in watch
3. **Break on errors**: Pause on exceptions (icon in Debug view)
4. **Debug console history**: Use up/down arrows
5. **Multi-session**: Can debug multiple Chrome windows simultaneously

## 🔧 Need Help?

1. Check error message in terminal
2. Look at troubleshooting section above
3. Read `../.github/QUICK_REFERENCE.md` for quick answers
4. Run `npm run dev` to ensure servers are running

---

**Setup Version**: 1.0
**Last Updated**: 2026-02-28
**Gadgify Debug Configuration**
