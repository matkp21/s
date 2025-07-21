# MediAssistant - Backend

This directory contains the Python backend for the MediAssistant application, powered by FastAPI.

## Purpose

This backend is responsible for:
- Handling all AI-powered logic and integrations (e.g., OpenAI, Google AI).
- Securely interacting with Firebase services (Firestore, Auth) via the Admin SDK.
- Providing a set of robust API endpoints for the Next.js frontend to consume.

## Tech Stack

- **Framework:** FastAPI
- **Server:** Uvicorn
- **AI Integration:** OpenAI Python SDK, LangChain (conceptual), etc.
- **Firebase:** `firebase-admin` for backend services.

## Getting Started (Locally)

1.  **Navigate to this directory:**
    ```bash
    cd backend
    ```

2.  **Create a virtual environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Create a `.env` file** for your environment variables (e.g., `OPENAI_API_KEY`, Firebase service account details).

5.  **Run the development server:**
    ```bash
    uvicorn main:app --reload
    ```
    The API will be available at `http://127.0.0.1:8000`.
