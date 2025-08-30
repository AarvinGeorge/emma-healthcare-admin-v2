#!/bin/bash

#################################################################################
# EMMA Healthcare - Development Server Termination Script
# 
# Purpose: Safely terminate all running development servers and free up ports
# Usage: ./scripts/kill-servers.sh
#
# This script will:
# - Kill Node.js/Next.js development servers
# - Free up common development ports
# - Clean up any orphaned processes
# - Provide clear feedback on actions taken
#################################################################################

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Common development ports to check
PORTS=(3000 3001 3002 3003 4000 4200 5000 5173 5174 8000 8080 8081 9000)

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Function to kill processes on a specific port
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null)
    
    if [ ! -z "$pids" ]; then
        echo -e "  ${YELLOW}→${NC} Found process(es) on port $port: $pids"
        kill -9 $pids 2>/dev/null
        if [ $? -eq 0 ]; then
            echo -e "  ${GREEN}✓${NC} Killed process(es) on port $port"
            return 0
        else
            echo -e "  ${RED}✗${NC} Failed to kill process(es) on port $port"
            return 1
        fi
    fi
    return 2
}

# Function to find and kill specific process patterns
kill_by_pattern() {
    local pattern=$1
    local description=$2
    local found=0
    
    # Find PIDs matching the pattern
    local pids=$(ps aux | grep -E "$pattern" | grep -v grep | awk '{print $2}')
    
    if [ ! -z "$pids" ]; then
        print_warning "Found $description processes: $pids"
        for pid in $pids; do
            kill -9 $pid 2>/dev/null
            if [ $? -eq 0 ]; then
                echo -e "  ${GREEN}✓${NC} Killed PID $pid"
                found=$((found + 1))
            fi
        done
    fi
    
    return $found
}

# Header
echo ""
echo "============================================"
echo "   EMMA Development Server Termination"
echo "============================================"
echo ""

# Step 1: Kill Node.js development servers
print_status "Checking for Node.js development servers..."

kill_by_pattern "next dev" "Next.js development"
next_killed=$?

kill_by_pattern "npm run dev" "npm development"
npm_killed=$?

kill_by_pattern "yarn dev" "yarn development"
yarn_killed=$?

kill_by_pattern "vite" "Vite development"
vite_killed=$?

kill_by_pattern "webpack-dev-server" "Webpack dev server"
webpack_killed=$?

kill_by_pattern "react-scripts start" "Create React App"
cra_killed=$?

total_killed=$((next_killed + npm_killed + yarn_killed + vite_killed + webpack_killed + cra_killed))

if [ $total_killed -gt 0 ]; then
    print_success "Terminated $total_killed development server process(es)"
else
    print_success "No active development servers found"
fi

# Step 2: Free up common development ports
echo ""
print_status "Checking common development ports..."

ports_cleared=0
for port in "${PORTS[@]}"; do
    kill_port $port
    result=$?
    if [ $result -eq 0 ]; then
        ports_cleared=$((ports_cleared + 1))
    fi
done

if [ $ports_cleared -gt 0 ]; then
    print_success "Cleared $ports_cleared port(s)"
else
    print_success "All development ports are already free"
fi

# Step 3: Kill any remaining Node processes that might be stuck
echo ""
print_status "Checking for orphaned Node.js processes..."

# Look for node processes running in the current project directory
project_dir=$(pwd)
orphaned_pids=$(ps aux | grep node | grep "$project_dir" | grep -v grep | awk '{print $2}')

if [ ! -z "$orphaned_pids" ]; then
    print_warning "Found orphaned Node.js processes in project directory"
    for pid in $orphaned_pids; do
        kill -9 $pid 2>/dev/null
        if [ $? -eq 0 ]; then
            echo -e "  ${GREEN}✓${NC} Killed orphaned PID $pid"
        fi
    done
else
    print_success "No orphaned Node.js processes found"
fi

# Step 4: Clean up Next.js cache (optional)
echo ""
print_status "Cleaning up development caches..."

if [ -d ".next" ]; then
    print_warning "Found Next.js build cache"
    read -p "Do you want to clear the Next.js cache? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf .next
        print_success "Cleared Next.js cache"
    else
        print_status "Keeping Next.js cache"
    fi
fi

# Step 5: Final verification
echo ""
print_status "Performing final verification..."

# Check if any ports are still in use
ports_in_use=""
for port in "${PORTS[@]}"; do
    if lsof -i:$port >/dev/null 2>&1; then
        ports_in_use="$ports_in_use $port"
    fi
done

if [ -z "$ports_in_use" ]; then
    print_success "All development ports are free"
else
    print_error "Some ports are still in use:$ports_in_use"
    print_warning "You may need to manually check these ports"
fi

# Check for any remaining dev processes
if ps aux | grep -E "(next dev|npm run dev|yarn dev)" | grep -v grep >/dev/null 2>&1; then
    print_warning "Some development processes may still be running"
    print_warning "Run 'ps aux | grep dev' to check manually"
else
    print_success "No development processes detected"
fi

# Summary
echo ""
echo "============================================"
echo "           Termination Complete"
echo "============================================"
echo ""
print_success "Server termination script finished"
echo ""

# Exit with appropriate code
if [ ! -z "$ports_in_use" ]; then
    exit 1
else
    exit 0
fi