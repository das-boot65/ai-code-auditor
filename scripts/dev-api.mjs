import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import process from 'node:process'

const python = process.platform === 'win32'
  ? 'backend/.venv/Scripts/python.exe'
  : 'backend/.venv/bin/python'

if (!existsSync(python)) {
  console.error('Backend environment not found. Create backend/.venv and install backend/requirements.txt first.')
  process.exitCode = 1
} else {
  const server = spawn(
    python,
    ['-m', 'uvicorn', 'app.main:app', '--app-dir', 'backend', '--reload', '--host', '127.0.0.1', '--port', '8000'],
    { stdio: 'inherit' },
  )

  server.on('error', (error) => {
    console.error(`Could not start the analysis API: ${error.message}`)
    process.exitCode = 1
  })

  server.on('exit', (code) => {
    process.exitCode = code ?? 1
  })

  process.on('SIGINT', () => server.kill('SIGINT'))
  process.on('SIGTERM', () => server.kill('SIGTERM'))
}
