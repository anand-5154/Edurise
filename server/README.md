# Server Build Process

## Folder Structure

- `src/` - TypeScript source files
- `dist/` - Compiled JavaScript files (generated)

## Build Commands

### Development
```bash
# Run in development mode with hot reload
npm run dev

# Watch and compile TypeScript to dist folder
npm run dev:build
```

### Production
```bash
# Clean and build for production
npm run build

# Start the compiled application
npm start
```

### Utility Commands
```bash
# Clean compiled files
npm run clean

# Clean JavaScript files from src folder
npm run clean:js

# Lint TypeScript files
npm run lint

# Fix linting issues
npm run lint:fix
```

## Workflow

1. **Development**: Use `npm run dev` for development with hot reload
2. **Building**: Use `npm run build` to compile TypeScript to JavaScript in the `dist` folder
3. **Production**: Use `npm start` to run the compiled JavaScript from the `dist` folder

## Benefits

- ✅ Source files (TypeScript) and compiled files (JavaScript) are separated
- ✅ Clean `src` folder contains only TypeScript files
- ✅ Compiled JavaScript goes to `dist` folder
- ✅ Easy to deploy only the `dist` folder
- ✅ Source maps for debugging
- ✅ TypeScript compilation with error handling 