# EMMA Healthcare Scripts

This directory contains utility scripts for the EMMA Healthcare Admin Panel.

## Available Scripts

### 🔴 kill-servers.sh

**Purpose:** Safely terminate all running development servers and free up ports.

**What it does:**
- Terminates all Node.js/Next.js development servers
- Frees up common development ports (3000, 3001, 3002, 4000, 5000, 8000, 8080, etc.)
- Cleans up orphaned Node.js processes
- Optionally clears Next.js build cache
- Provides detailed feedback on all actions taken

**Usage:**

```bash
# Method 1: Direct execution
./scripts/kill-servers.sh

# Method 2: Using npm scripts (recommended)
npm run kill

# Alternative npm script names
npm run kill:servers
npm run stop:all
```

**When to use:**
- Before starting a new development session
- When ports are blocked by zombie processes
- After unexpected crashes or force-quits
- When switching between different projects
- Before system shutdown/restart

**Features:**
- ✅ Color-coded output for easy reading
- ✅ Kills processes on 13+ common development ports
- ✅ Detects and terminates various dev server types (Next.js, Vite, Webpack, etc.)
- ✅ Optional cache clearing
- ✅ Final verification to ensure all ports are free
- ✅ Safe execution with proper error handling

**Exit Codes:**
- `0` - Success: All servers terminated and ports freed
- `1` - Warning: Some ports may still be in use (manual check recommended)

### 📊 seed-database.js

**Purpose:** Seed the Firestore database with initial data for development.

**Usage:**
```bash
npm run db:seed
```

## Adding New Scripts

When adding new scripts to this directory:

1. Create your script file in the `scripts/` directory
2. Make it executable: `chmod +x scripts/your-script.sh`
3. Add an npm script alias in `package.json`
4. Document it in this README

## Script Conventions

- **Shell scripts**: Use `.sh` extension and include shebang `#!/bin/bash`
- **Node scripts**: Use `.js` extension and can access project dependencies
- **Naming**: Use kebab-case for script files (e.g., `kill-servers.sh`)
- **Documentation**: Always include purpose, usage, and examples
- **Error handling**: Scripts should handle errors gracefully and provide clear feedback
- **Colors**: Use color codes for better terminal output readability

## Troubleshooting

### Port Still in Use After Running kill-servers.sh

If a port is still in use after running the script:

1. Check what's using the port:
   ```bash
   lsof -i:PORT_NUMBER
   ```

2. Manually kill the process:
   ```bash
   kill -9 PID
   ```

3. For system services (like port 5000 on macOS for AirPlay):
   - These are system services and shouldn't be killed
   - Use a different port for your development server

### Permission Denied

If you get a permission denied error:

```bash
# Make the script executable
chmod +x scripts/kill-servers.sh
```

### Script Not Found

If npm scripts don't work, ensure you're in the project root directory:

```bash
cd /path/to/emma-admin-v2
npm run kill
```

## Support

For issues or questions about these scripts, please refer to the main project documentation or contact the development team.