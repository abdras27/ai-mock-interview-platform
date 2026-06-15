import asyncio
import os
import time
from typing import Any, Dict, Optional, Tuple

import httpx


class Judge0Error(Exception):
    pass


def _get_config() -> Tuple[str, Dict[str, str]]:
    """
    Supports two modes:
      1) Free/public Judge0 instance (no key): set JUDGE0_BASE_URL (default below)
      2) RapidAPI Judge0: set RAPIDAPI_KEY (and optionally RAPIDAPI_HOST, JUDGE0_BASE_URL)
    """
    # Official public CE instance (may have rate limits / availability constraints).
    base_url = os.getenv("JUDGE0_BASE_URL", "https://ce.judge0.com").rstrip("/")

    headers: Dict[str, str] = {"Content-Type": "application/json"}

    rapidapi_key = os.getenv("RAPIDAPI_KEY")
    if rapidapi_key:
        rapidapi_host = os.getenv("RAPIDAPI_HOST", "judge0-ce.p.rapidapi.com")
        headers.update(
            {
                "X-RapidAPI-Key": rapidapi_key,
                "X-RapidAPI-Host": rapidapi_host,
            }
        )

    return base_url, headers


async def run_python(code: str, *, stdin: Optional[str] = None, timeout_s: int = 20) -> Dict[str, Any]:
    """
    Submits Python code to Judge0 and polls until a result is ready.

    Returns a dict containing:
      - stdout
      - stderr
      - compile_output
      - message
      - status (object from Judge0)
    """
    base_url, headers = _get_config()

    submit_url = f"{base_url}/submissions"
    submit_params = {"base64_encoded": "false", "wait": "false"}

    payload = {
        "language_id": 71,  # Python 3 (Judge0)
        "source_code": code,
    }
    if stdin is not None:
        payload["stdin"] = stdin

    async with httpx.AsyncClient(timeout=httpx.Timeout(20.0)) as client:
        try:
            submit_resp = await client.post(
                submit_url, params=submit_params, headers=headers, json=payload
            )
        except httpx.HTTPError as e:
            raise Judge0Error(f"Failed to submit to Judge0: {e}") from e

        if submit_resp.status_code >= 400:
            raise Judge0Error(
                f"Judge0 submit failed ({submit_resp.status_code}): {submit_resp.text}"
            )

        token = submit_resp.json().get("token")
        if not token:
            raise Judge0Error("Judge0 did not return a token.")

        result_url = f"{base_url}/submissions/{token}"
        result_params = {
            "base64_encoded": "false",
            "fields": "stdout,stderr,compile_output,message,status",
        }

        start = time.monotonic()
        while True:
            elapsed = time.monotonic() - start
            if elapsed > timeout_s:
                raise Judge0Error("Timed out waiting for Judge0 result.")

            try:
                res = await client.get(result_url, params=result_params, headers=headers)
            except httpx.HTTPError as e:
                raise Judge0Error(f"Failed to fetch Judge0 result: {e}") from e

            if res.status_code >= 400:
                raise Judge0Error(
                    f"Judge0 result failed ({res.status_code}): {res.text}"
                )

            data: Dict[str, Any] = res.json()
            status: Optional[Dict[str, Any]] = data.get("status") or {}
            status_id = status.get("id")

            # 1 = In Queue, 2 = Processing. Anything else means "done".
            if status_id not in (1, 2):
                return data

            await asyncio.sleep(0.5)
