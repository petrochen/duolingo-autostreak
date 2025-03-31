# Duolingo Autostreak

A Dockerized Node.js script to automatically maintain your Duolingo streak for multiple users.

This script runs continuously in a Docker container, performs a configurable number of lessons for each enabled user, and then waits 24 hours before repeating the cycle.

This project is a fork of [Michael1337/duolingo-autostreak](https://github.com/Michael1337/duolingo-autostreak) with multi-user support and other improvements.

## Features

-   **Multiple Users:** Manage streaks for several Duolingo accounts.
-   **Dockerized:** Easy setup and management using Docker and Docker Compose.
-   **Configuration File:** Uses `config.json` for easy setup of users and settings.
-   **Reliability:** Includes basic error handling and retry logic for API requests.
-   **Logging:** Logs activities to a file (`logs/duolingo.log`) mounted from the host.
-   **Results Tracking:** Saves the outcome of each cycle to `results.json`.
-   **Simple Management:** Includes a `manage.sh` script for easy container control.

## Requirements

-   [Docker](https://docs.docker.com/get-docker/)
-   [Docker Compose](https://docs.docker.com/compose/install/) (Usually included with Docker Desktop)

## Setup

1.  **Clone or Download:** Get the project files onto your system.
    ```bash
    git clone git@github.com:petrochen/duolingo-autostreak.git
    cd duolingo-autostreak
    ```

2.  **Get Duolingo JWT Token:** You need a JWT token for each user you want to manage.
    *   Log in to [Duolingo](https://www.duolingo.com) in your web browser.
    *   Open your browser's developer tools (usually by pressing F12).
    *   Go to the "Application" (or "Storage") tab.
    *   Find "Cookies" in the left-hand menu and select `https://www.duolingo.com`.
    *   Look for a cookie named `jwt_token` (or potentially a similar name containing "jwt").
    *   Copy the **entire value** from the "Value" column for that cookie (it's a long string with dots). **Important:** Keep this token secure, as it grants access to the account.
    *   Repeat for each Duolingo account.

3.  **Configure `config.json`:**
    *   Copy the example configuration file:
        ```bash
        cp config.json.example config.json
        ```
    *   Open the newly created `config.json` file.
    *   Replace the placeholder usernames (`your_duolingo_username_...`) and JWT tokens (`YOUR_JWT_TOKEN_HERE_...`) with the actual values you obtained in the previous step. **Do not commit `config.json` to version control as it contains secrets.**
    *   Adjust the number of `lessons` and other `settings` if needed.

4.  **Make Management Script Executable:**
    ```bash
    chmod +x manage.sh
    ```

5.  **Create Logs Directory:** The script expects the `logs` directory to exist for mounting.
    ```bash
    mkdir -p logs
    ```

## Usage

Use the `manage.sh` script to control the container:

-   **Build the Docker image:** (Only needs to be done once initially or after code changes)
    ```bash
    ./manage.sh build
    ```

-   **Start the container:** (Runs in detached mode)
    ```bash
    ./manage.sh start
    ```
    The script will now run, perform lessons for enabled users, log its activity to `logs/duolingo.log`, save results to `results.json`, and then wait 24 hours before the next cycle.

-   **View Logs:**
    ```bash
    ./manage.sh logs
    ```
    (Press `Ctrl+C` to stop viewing logs)

-   **Check Container Status:**
    ```bash
    ./manage.sh status
    ```

-   **Restart the container:** (Useful after changing `config.json`)
    ```bash
    ./manage.sh restart
    ```

-   **Stop the container:**
    ```bash
    ./manage.sh stop
    ```

## Project Structure

-   `Dockerfile`: Defines the Docker image build process.
-   `docker-compose.yml`: Defines the Docker service and its configuration (volumes, network, etc.).
-   `duolingo.js`: The main Node.js application logic.
-   `config.json`: User configuration and settings (You create this).
-   `package.json` / `package-lock.json`: Node.js dependencies.
-   `manage.sh`: Helper script for Docker Compose commands.
-   `results.json`: Stores the results of the last run (Created automatically if missing and volume is mounted).
-   `logs/`: Directory containing the application log file (Created automatically if missing and volume is mounted).

## Security Warnings ⚠️

-   **Never commit `config.json`** - It contains your JWT tokens which grant full access to your Duolingo accounts
-   **Never share your JWT tokens** - They are equivalent to your password
-   **Never commit `results.json`** - It contains your usernames
-   **Keep your logs private** - They may contain sensitive information
-   **Review your code before pushing** - Make sure no sensitive data is included

## Changes from the original project

-   **Multi-User Support**
    - Added ability to manage multiple Duolingo accounts simultaneously
    - Implemented individual user enable/disable functionality
    - Added per-user error handling and retry logic
    - Added user-specific results tracking

-   **Improved Docker Setup**
    - Implemented proper volume mounting and logging
    - Added container restart policy

-   **Better Error Handling**
    - Added structured logging with timestamps
    - Implemented log rotation and critical error tracking
    - Added automatic log directory management

-   **Enhanced Security**
    - Implemented non-root user in container
    - Added proper file permissions
    - Improved configuration file handling

