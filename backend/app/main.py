import json
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, ConfigDict, Field
from starlette.concurrency import run_in_threadpool

PROJECT_ROOT = Path(__file__).resolve().parents[2]
ESLINT_ENTRY = PROJECT_ROOT / "node_modules" / "eslint" / "bin" / "eslint.js"
ESLINT_CONFIG = PROJECT_ROOT / "backend" / "eslint.config.js"
MAX_SOURCE_LENGTH = 50_000
ANALYSIS_TIMEOUT_SECONDS = 10

app = FastAPI(title="Nexara analysis API", version="1.0.0")


class AnalysisRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    language: Literal["javascript", "python"]
    code: str = Field(min_length=1, max_length=MAX_SOURCE_LENGTH)


async def run_analyzer(command: list[str], code: str) -> tuple[int, str, str]:
    try:
        result = await run_in_threadpool(
            subprocess.run,
            command,
            input=code,
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=ANALYSIS_TIMEOUT_SECONDS,
            check=False,
        )
    except FileNotFoundError as error:
        raise HTTPException(
            status_code=503,
            detail="The selected analyzer is not installed on this server.",
        ) from error
    except subprocess.TimeoutExpired as error:
        raise HTTPException(
            status_code=504,
            detail="Code analysis exceeded the 10 second limit.",
        ) from error

    return (
        result.returncode,
        result.stdout,
        result.stderr,
    )


async def analyze_javascript(code: str) -> tuple[str, list[dict[str, object]]]:
    node = shutil.which("node")
    if not node or not ESLINT_ENTRY.is_file():
        raise HTTPException(
            status_code=503,
            detail="JavaScript analysis needs Node.js and the project's npm dependencies.",
        )

    exit_code, stdout, stderr = await run_analyzer(
        [
            node,
            str(ESLINT_ENTRY),
            "--stdin",
            "--stdin-filename",
            "playground.js",
            "--no-config-lookup",
            "--config",
            str(ESLINT_CONFIG),
            "--format",
            "json",
        ],
        code,
    )
    if exit_code not in (0, 1):
        raise HTTPException(
            status_code=500,
            detail=f"ESLint could not analyze this input: {stderr.strip() or 'unknown analyzer error'}",
        )

    try:
        results = json.loads(stdout)
    except json.JSONDecodeError as error:
        raise HTTPException(
            status_code=500,
            detail="ESLint returned an invalid response.",
        ) from error

    diagnostics = []
    for result in results:
        for message in result["messages"]:
            diagnostics.append(
                {
                    "severity": "error" if message["severity"] == 2 else "warning",
                    "message": message["message"],
                    "rule": message.get("ruleId") or "syntax",
                    "line": message.get("line"),
                    "column": message.get("column"),
                }
            )

    return "ESLint", diagnostics


async def analyze_python(code: str) -> tuple[str, list[dict[str, object]]]:
    exit_code, stdout, stderr = await run_analyzer(
        [
            sys.executable,
            "-m",
            "ruff",
            "check",
            "--output-format",
            "json",
            "--stdin-filename",
            "playground.py",
            "-",
        ],
        code,
    )
    if exit_code not in (0, 1):
        raise HTTPException(
            status_code=500,
            detail=f"Ruff could not analyze this input: {stderr.strip() or 'unknown analyzer error'}",
        )

    try:
        messages = json.loads(stdout)
    except json.JSONDecodeError as error:
        raise HTTPException(
            status_code=500,
            detail="Ruff returned an invalid response.",
        ) from error

    diagnostics = []
    for message in messages:
        location = message.get("location") or {}
        code_name = message.get("code") or "unknown"
        diagnostics.append(
            {
                "severity": "error" if code_name.startswith(("E", "F")) else "warning",
                "message": message["message"],
                "rule": code_name,
                "line": location.get("row"),
                "column": location.get("column"),
            }
        )

    return "Ruff", diagnostics


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/analyze")
async def analyze(request: AnalysisRequest) -> dict[str, object]:
    if request.language == "javascript":
        analyzer, diagnostics = await analyze_javascript(request.code)
    else:
        analyzer, diagnostics = await analyze_python(request.code)

    return {
        "analyzer": analyzer,
        "diagnostics": diagnostics,
        "summary": (
            f"{analyzer} found {len(diagnostics)} issue"
            f"{'' if len(diagnostics) == 1 else 's'}."
            if diagnostics
            else f"{analyzer} found no issues for its configured rules."
        ),
    }
