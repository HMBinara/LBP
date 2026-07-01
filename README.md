# LBP — Learning Balance Platform

A modern, full-stack learning platform designed to deliver personalized learning experiences and assessments. This repository contains the backend API and a React-based frontend application.

## Table of Contents
- Overview
- Features
- Tech stack
- Architecture
- Getting Started
  - Prerequisites
  - Local setup
- Project Structure
- Contributing
- License
- Contact

## Overview
LBP (Learning Balance Platform) is an educational web application focused on adaptive learning and assessment workflows. It provides user authentication, content management, quizzes, and an admin/curator toolset for planning and evaluating learning materials.

## Features
- User authentication and profile management
- Quiz and assessment engine
- Admin and curator agents for content planning
- React frontend with fast development tooling (Vite)
- Python backend API with simple deployment requirements

## Tech stack
- Frontend: React, Vite, Tailwind CSS
- Backend: Python (Flask)
- Authentication & services: Firebase (serviceAccountKey.json included for local dev)

## Architecture
- `backend/` — Flask API, agents, and service utilities
- `frontend/my-react-app/` — React single-page application

## Getting Started
### Prerequisites
- Node.js (16+)
- Python 3.8+
- pip
- (Optional) virtualenv or venv for Python

### Local setup
1. Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
# Set environment variables or place `serviceAccountKey.json` in `backend/` for Firebase access
python app.py
```

2. Frontend

```bash
cd frontend/my-react-app
npm install
npm run dev
```

Open the frontend dev server (usually at `http://localhost:5173`) after starting.

## Project Structure
- `backend/` — Flask app, requirements, agents
  - `app.py` — application entrypoint
  - `agents/` — automation agents and planners
- `frontend/my-react-app/` — React app created with Vite
  - `src/` — React components and assets
  - `public/` — static files

## Contributing
Contributions are welcome. Please open an issue to discuss changes or submit a pull request with a clear description and tests where appropriate.

## License
This project does not specify a license. Add a `LICENSE` file to indicate the intended license.

## Contact
For questions or support, open an issue in this repository or reach out to the maintainers listed in the project metadata.
