# Tududi - A Personal Task & Project Management Application

Tududi is a personal task and project management application designed to help you stay organized and productive. It features a modern React frontend and a robust Node.js backend.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Application](#running-the-application)
- [Database Management](#database-management)
- [Development Workflow](#development-workflow)
- [Contributing](#contributing)
- [License](#license)

## Features

* **Task Creation, Editing, and Deletion:** Easily manage your daily tasks.
* **Project Management with Areas:** Organize tasks into broader projects and areas for better structure.
* **Tagging:** Categorize tasks, notes, and projects using custom tags for quick filtering.
* **User Authentication:** Secure access to your personal data.
* **Responsive UI:** A clean and adaptable user interface for various devices.
* **Daily Task Summary (if implemented):** Get a quick overview of your progress.
* **Pomodoro Timer Integration (if implemented):** Enhance focus with built-in time management.

## Technologies Used

**Frontend:**
- React
- TypeScript
- Webpack (for bundling)
- Babel (for transpilation)
- PostCSS / Tailwind CSS (for styling)
- `http-proxy-middleware` (for API proxying in development)

**Backend:**
- Node.js
- Express.js (for API)
- SQLite3 (for development database)
- Sequelize (ORM)
- Nodemon (for development server auto-restarts)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed:

-   **Node.js**: [LTS Version Recommended](https://nodejs.org/en/download/) (Includes npm)
    -   To check if Node.js is installed: `node -v`
    -   To check if npm is installed: `npm -v`
-   **Git**: [Download Git](https://git-scm.com/downloads)
-   **OpenSSL** (for generating a session secret on Windows/Linux)
    -   On Windows, Git Bash (which comes with Git) usually includes OpenSSL. You can also download it separately or use WSL.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/T_Management.git](https://github.com/your-username/T_Management.git)
    cd T_Management
    ```
    *(Replace `your-username` with your actual GitHub username and `T_Management` with your repository name if different)*

2.  **Install Frontend Dependencies:**
    ```bash
    npm install
    ```
    This command runs in the project root and installs dependencies for the frontend.

3.  **Install Backend Dependencies:**
    ```bash
    cd backend
    npm install
    cd .. # Go back to the project root
    ```

### Configuration

You need to set up several environment variables for the backend. These are crucial for the application to function correctly, especially for database connection, user authentication, and sessions.

**Important:** For development, you can set these variables directly in your terminal session. For a more permanent solution or production deployment, consider using a `.env` file and a package like `dotenv`.

**From the `backend` directory (or ensure you are in it):**

```bash
# Navigate to the backend directory if not already there
cd backend

# Set the Node Environment (crucial for development)
export NODE_ENV=development

# Set the default user's email and password for login
# Replace with your desired credentials for the initial admin user
export TUDUDI_USER_EMAIL=admin@example.com
export TUDUDI_USER_PASSWORD=your_secure_password

# Generate a strong, random session secret (required for security)
# On Windows, if `openssl` is not found, you can install Git for Windows (which includes Git Bash with OpenSSL)
# Or for a quick test, you can use a fixed string like `export TUDUDI_SESSION_SECRET=myverysecretkey`
# but DO NOT use a fixed string in production.
export TUDUDI_SESSION_SECRET=$(openssl rand -hex 64)

# Disable internal SSL for development (frontend handles HTTPS if needed)
export TUDUDI_INTERNAL_SSL_ENABLED=false

# Go back to the root directory for running frontend
cd ..