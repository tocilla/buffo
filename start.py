#!/usr/bin/env python3

import subprocess
import sys
import platform

IS_WINDOWS = platform.system() == 'Windows'

def check_docker_compose_up():
    result = subprocess.run(
        ["docker", "compose", "ps", "-q"],
        capture_output=True,
        text=True,
        shell=IS_WINDOWS
    )
    return len(result.stdout.strip()) > 0

def main():
    force = False
    dev_mode = False

    if "--help" in sys.argv:
        print("Usage: python start.py [OPTION]")
        print("Manage docker-compose services interactively")
        print("\nOptions:")
        print("  -f\t\tForce start containers without confirmation")
        print("  --dev\t\tStart in development mode (with hot reload and volume mounting)")
        print("  --help\tShow this help message")
        print("\nModes:")
        print("  Production:\tOptimized for deployment (default)")
        print("  Development:\tHot reload, live editing, debug mode")
        return

    if "-f" in sys.argv:
        force = True
        print("Force awakened. Skipping confirmation.")

    if "--dev" in sys.argv:
        dev_mode = True
        print("🚀 Development mode enabled - hot reload and volume mounting active")

    is_up = check_docker_compose_up()

    if is_up:
        action = "stop"
        msg = "🛑 Stop containers? [y/N] "  # No default
    else:
        action = "start"
        mode_text = "development" if dev_mode else "production"
        msg = f"⚡ Start containers in {mode_text} mode? [Y/n] "  # Yes default

    if not force:
        response = input(msg).strip().lower()
        if action == "stop":
            # Only proceed if user explicitly types 'y'
            if response != "y":
                print("Aborting.")
                return
        else:
            # Proceed unless user types 'n'
            if response == "n":
                print("Aborting.")
                return

    if action == "stop":
        subprocess.run(["docker", "compose", "down"], shell=IS_WINDOWS)
    else:
        if dev_mode:
            # Development mode with volume mounting and hot reload
            subprocess.run([
                "docker", "compose",
                "-f", "docker-compose.yaml",
                "-f", "docker-compose.dev.yml",
                "up", "-d"
            ], shell=IS_WINDOWS)
            print("✅ Development environment started!")
            print("💡 Code changes will auto-reload - no rebuilds needed")
        else:
            # Production mode
            subprocess.run(["docker", "compose", "up", "-d"], shell=IS_WINDOWS)
            print("✅ Production environment started!")

if __name__ == "__main__":
    main()
