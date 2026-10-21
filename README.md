# Nexara

Nexara is a browser-based code playground with a real static-analysis API for JavaScript and Python.

## Run locally

Install the frontend dependencies:

```sh
npm install
```

Create and install the Python API environment on Windows:

```powershell
py -3 -m venv backend\.venv
backend\.venv\Scripts\python.exe -m pip install -r backend\requirements.txt
```

Start the API and Vite in separate terminals:

```powershell
npm run dev:api
npm run dev
```

Vite proxies `/api` to the local FastAPI service at `127.0.0.1:8000`. Open the URL printed by Vite.

## What the checks do

- JavaScript is checked by ESLint using `backend/eslint.config.js`.
- Python is checked by Ruff.
- The API accepts at most 50 KB of source and stops a check after 10 seconds.
- Other playground languages can still be executed, but do not have a static analyzer configured here.
- This is static linting, not AI review or a security audit. The API does not execute submitted code.

JavaScript execution uses a browser Web Worker and is not a security sandbox. Other compiled languages are sent to Wandbox when Run is pressed. Do not submit secrets.

For deployment, serve the frontend and route `/api` to the FastAPI service through the same-origin reverse proxy. The Vite proxy is for local development only.
