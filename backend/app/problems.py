from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List


@dataclass(frozen=True)
class Problem:
    id: str
    title: str
    difficulty: str
    description: str
    input_format: str
    output_format: str
    reference_solution: str
    testcases: List[Dict[str, str]]  # {input, expected_output}


PROBLEMS: List[Problem] = [
    Problem(
        id="two-sum",
        title="Two Sum",
        difficulty="Easy",
        description=(
            "Given an array of integers `nums` and an integer `target`, return the indices "
            "of the two numbers such that they add up to `target`.\n\n"
            "You may assume that each input would have exactly one solution, and you may not "
            "use the same element twice.\n"
        ),
        input_format='JSON on stdin, e.g. {"nums":[2,7,11,15],"target":9}',
        output_format="Print JSON array of 2 indices, e.g. [0,1]",
        reference_solution=(
            "import json\n"
            "\n"
            "data = json.loads(input().strip())\n"
            "nums = data[\"nums\"]\n"
            "target = data[\"target\"]\n"
            "\n"
            "seen = {}\n"
            "for i, x in enumerate(nums):\n"
            "    need = target - x\n"
            "    if need in seen:\n"
            "        print(json.dumps([seen[need], i]))\n"
            "        break\n"
            "    seen[x] = i\n"
        ),
        testcases=[
            {"input": '{"nums":[2,7,11,15],"target":9}', "expected_output": "[0,1]"},
            {"input": '{"nums":[3,2,4],"target":6}', "expected_output": "[1,2]"},
            {"input": '{"nums":[3,3],"target":6}', "expected_output": "[0,1]"},
        ],
    ),
    Problem(
        id="valid-parentheses",
        title="Valid Parentheses",
        difficulty="Easy",
        description=(
            "Given a string `s` containing just the characters `()[]{}`, determine if the "
            "input string is valid.\n\n"
            "An input string is valid if open brackets are closed by the same type of brackets "
            "and in the correct order.\n"
        ),
        input_format='JSON on stdin, e.g. {"s":"()[]{}"}',
        output_format='Print "true" or "false"',
        reference_solution=(
            "import json\n"
            "\n"
            "s = json.loads(input().strip())[\"s\"]\n"
            "stack = []\n"
            "pairs = {')':'(', ']':'[', '}':'{'}\n"
            "\n"
            "ok = True\n"
            "for ch in s:\n"
            "    if ch in '([{':\n"
            "        stack.append(ch)\n"
            "    else:\n"
            "        if not stack or stack[-1] != pairs.get(ch):\n"
            "            ok = False\n"
            "            break\n"
            "        stack.pop()\n"
            "\n"
            "if stack:\n"
            "    ok = False\n"
            "\n"
            "print('true' if ok else 'false')\n"
        ),
        testcases=[
            {"input": '{"s":"()"}', "expected_output": "true"},
            {"input": '{"s":"()[]{}"}', "expected_output": "true"},
            {"input": '{"s":"(]"}', "expected_output": "false"},
            {"input": '{"s":"([)]"}', "expected_output": "false"},
        ],
    ),
    Problem(
        id="fizzbuzz",
        title="Fizz Buzz",
        difficulty="Easy",
        description=(
            "Given an integer `n`, return the string from 1 to `n` (one per line) where:\n"
            "- multiples of 3 print `Fizz`\n"
            "- multiples of 5 print `Buzz`\n"
            "- multiples of both print `FizzBuzz`\n"
            "- otherwise print the number\n"
        ),
        input_format='JSON on stdin, e.g. {"n":5}',
        output_format="Print n lines",
        reference_solution=(
            "import json\n"
            "\n"
            "n = json.loads(input().strip())[\"n\"]\n"
            "out = []\n"
            "for i in range(1, n + 1):\n"
            "    if i % 15 == 0:\n"
            "        out.append('FizzBuzz')\n"
            "    elif i % 3 == 0:\n"
            "        out.append('Fizz')\n"
            "    elif i % 5 == 0:\n"
            "        out.append('Buzz')\n"
            "    else:\n"
            "        out.append(str(i))\n"
            "print('\\n'.join(out))\n"
        ),
        testcases=[
            {"input": '{"n":3}', "expected_output": "1\n2\nFizz"},
            {"input": '{"n":5}', "expected_output": "1\n2\nFizz\n4\nBuzz"},
            {
                "input": '{"n":15}',
                "expected_output": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz",
            },
        ],
    ),
    Problem(
        id="reverse-string",
        title="Reverse String",
        difficulty="Easy",
        description=(
            "Given a string `s`, print the reversed string.\n"
            "Example: `hello` -> `olleh`.\n"
        ),
        input_format='JSON on stdin, e.g. {"s":"hello"}',
        output_format="Print the reversed string",
        reference_solution=(
            "import json\n"
            "\n"
            "s = json.loads(input().strip())[\"s\"]\n"
            "print(s[::-1])\n"
        ),
        testcases=[
            {"input": '{"s":"hello"}', "expected_output": "olleh"},
            {"input": '{"s":""}', "expected_output": ""},
            {"input": '{"s":"abcd"}', "expected_output": "dcba"},
        ],
    ),
    Problem(
        id="palindrome-number",
        title="Palindrome Number",
        difficulty="Easy",
        description=(
            "Given an integer `x`, return whether it is a palindrome (reads the same forward and backward).\n"
            "Print `true` or `false`.\n"
        ),
        input_format='JSON on stdin, e.g. {"x":121}',
        output_format='Print "true" or "false"',
        reference_solution=(
            "import json\n"
            "\n"
            "x = json.loads(input().strip())[\"x\"]\n"
            "s = str(x)\n"
            "print('true' if s == s[::-1] else 'false')\n"
        ),
        testcases=[
            {"input": '{"x":121}', "expected_output": "true"},
            {"input": '{"x":-121}', "expected_output": "false"},
            {"input": '{"x":10}', "expected_output": "false"},
        ],
    ),
    Problem(
        id="contains-duplicate",
        title="Contains Duplicate",
        difficulty="Easy",
        description=(
            "Given an integer array `nums`, return `true` if any value appears at least twice in the array.\n"
            "Otherwise return `false`.\n"
        ),
        input_format='JSON on stdin, e.g. {"nums":[1,2,3,1]}',
        output_format='Print "true" or "false"',
        reference_solution=(
            "import json\n"
            "\n"
            "nums = json.loads(input().strip())[\"nums\"]\n"
            "print('true' if len(set(nums)) != len(nums) else 'false')\n"
        ),
        testcases=[
            {"input": '{"nums":[1,2,3,1]}', "expected_output": "true"},
            {"input": '{"nums":[1,2,3,4]}', "expected_output": "false"},
            {"input": '{"nums":[1,1,1,3,3,4,3,2,4,2]}', "expected_output": "true"},
        ],
    ),
]


def list_problems() -> List[Dict[str, Any]]:
    return [
        {"id": p.id, "title": p.title, "difficulty": p.difficulty} for p in PROBLEMS
    ]


def get_problem(problem_id: str) -> Problem:
    for p in PROBLEMS:
        if p.id == problem_id:
            return p
    raise KeyError(problem_id)

