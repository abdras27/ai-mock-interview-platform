import os
import json
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pathlib import Path

from .judge0 import Judge0Error, run_python
from .problems import get_problem, list_problems


load_dotenv(Path(__file__).resolve().parents[1] / ".env")

app = FastAPI(title="Simple Coding Platform API")


app.add_middleware(
    CORSMiddleware,
    # Keep this beginner-friendly: allow any origin (no auth/cookies in this project).
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RunRequest(BaseModel):
    code: str = Field(..., min_length=1)
    stdin: str | None = None


class RunResponse(BaseModel):
    stdout: str | None = None
    stderr: str | None = None
    compile_output: str | None = None
    message: str | None = None
    status: dict | None = None


class SubmitRequest(BaseModel):
    code: str = Field(..., min_length=1)
    problem_id: str = Field(..., min_length=1)
    testcases: list[dict] | None = None


class SubmitResponse(BaseModel):
    verdict: str
    passed: int
    total: int
    results: list[dict]


class ProblemListItem(BaseModel):
    id: str
    title: str
    difficulty: str


class ProblemDetail(BaseModel):
    id: str
    title: str
    difficulty: str
    description: str
    input_format: str
    output_format: str
    reference_solution: str
    testcases: list[dict]


@app.get("/health")
def health() -> dict:
    return {"ok": True}


@app.get("/problems", response_model=list[ProblemListItem])
def problems() -> list[ProblemListItem]:
    return [ProblemListItem(**p) for p in list_problems()]


@app.get("/problems/{problem_id}", response_model=ProblemDetail)
def problem_detail(problem_id: str) -> ProblemDetail:
    try:
        p = get_problem(problem_id)
    except KeyError:
        raise HTTPException(status_code=404, detail="Problem not found")

    return ProblemDetail(
        id=p.id,
        title=p.title,
        difficulty=p.difficulty,
        description=p.description,
        input_format=p.input_format,
        output_format=p.output_format,
        reference_solution=p.reference_solution,
        testcases=p.testcases,
    )


@app.post("/run", response_model=RunResponse)
async def run_code(req: RunRequest) -> RunResponse:
    try:
        result = await run_python(req.code, stdin=req.stdin)
    except Judge0Error as e:
        return RunResponse(stderr=str(e), status={"description": "error"})

    return RunResponse(
        stdout=result.get("stdout"),
        stderr=result.get("stderr"),
        compile_output=result.get("compile_output"),
        message=result.get("message"),
        status=result.get("status"),
    )


@app.post("/submit", response_model=SubmitResponse)
async def submit_code(req: SubmitRequest) -> SubmitResponse:
    try:
        p = get_problem(req.problem_id)
    except KeyError:
        raise HTTPException(status_code=400, detail="Invalid problem_id")

    raw_testcases = req.testcases or p.testcases
    testcases = []
    for i, tc in enumerate(raw_testcases):
        stdin = str(tc.get("input", ""))
        expected = str(tc.get("expected_output", ""))
        testcases.append({"index": i + 1, "input": stdin, "expected_output": expected})

    results: list[dict] = []
    passed = 0

    def normalize(value: str) -> Any:
        s = (value or "").strip()
        try:
            return json.loads(s)
        except Exception:
            return s

    for tc in testcases:
        try:
            result = await run_python(req.code, stdin=tc["input"])
        except Judge0Error as e:
            results.append(
                {
                    "index": tc["index"],
                    "input": tc["input"],
                    "expected_output": tc["expected_output"],
                    "your_output": "",
                    "passed": False,
                    "status": "Error",
                    "stderr": str(e),
                }
            )
            continue

        stdout = (result.get("stdout") or "").strip()
        stderr = result.get("stderr")
        status_desc = (result.get("status") or {}).get("description") or "Done"
        is_passed = normalize(stdout) == normalize(tc["expected_output"])
        if is_passed:
            passed += 1

        results.append(
            {
                "index": tc["index"],
                "input": tc["input"],
                "expected_output": tc["expected_output"],
                "your_output": stdout,
                "passed": is_passed,
                "status": status_desc,
                "stderr": stderr,
            }
        )

    total = len(testcases)
    verdict = "Accepted" if passed == total else "Wrong Answer"

    return SubmitResponse(verdict=verdict, passed=passed, total=total, results=results)
