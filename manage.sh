#!/bin/bash

# Function to display help information
show_help() {
    echo "Duolingo Autostreak Management"
    echo "Usage:"
    echo "  ./manage.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start     - Start the container"
    echo "  stop      - Stop the container"
    echo "  restart   - Restart the container"
    echo "  logs      - Show logs"
    echo "  status    - Show container status"
    echo "  build     - Rebuild the image"
    echo "  help      - Show this help"
}

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed"
    exit 1
fi

# Check if config.json exists
if [ ! -f "config.json" ]; then
    echo "❌ config.json file not found"
    exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Function to stop and remove container
cleanup_container() {
    if docker ps -a | grep -q duolingo-autostreak; then
        echo "🧹 Cleaning up old container..."
        docker stop duolingo-autostreak >/dev/null 2>&1
        docker rm duolingo-autostreak >/dev/null 2>&1
    fi
}

# Command processing
case "$1" in
    "start")
        echo "🚀 Starting Duolingo Autostreak..."
        cleanup_container
        docker-compose up -d
        ;;
    "stop")
        echo "🛑 Stopping Duolingo Autostreak..."
        docker-compose down
        ;;
    "restart")
        echo "🔄 Restarting Duolingo Autostreak..."
        cleanup_container
        docker-compose up -d
        ;;
    "logs")
        echo "📋 Showing Duolingo Autostreak logs..."
        docker-compose logs -f
        ;;
    "status")
        echo "📊 Duolingo Autostreak status:"
        docker-compose ps
        ;;
    "build")
        echo "🏗️  Rebuilding Duolingo Autostreak image..."
        docker-compose build --no-cache
        ;;
    "help"|"")
        show_help
        ;;
    *)
        echo "❌ Unknown command: $1"
        show_help
        exit 1
        ;;
esac

# Check execution result
if [ $? -eq 0 ]; then
    echo "✅ Command executed successfully"
else
    echo "❌ Error executing command"
    exit 1
fi