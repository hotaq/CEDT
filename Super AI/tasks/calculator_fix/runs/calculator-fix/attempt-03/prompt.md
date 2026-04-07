You are working inside an isolated task workspace.

Task name: calculator-fix
Task description: Make unit tests pass in a small Python workspace.
Attempt: 3
Current best evaluation: pass, exit_code=0

You may edit only these paths relative to the workspace:
- calculator.py

These paths are ignored by change validation:
- __pycache__/
- tests/__pycache__/

Hard rules:
- Do not modify files outside the editable paths.
- Leave the workspace runnable after your changes.
- Do not touch the evaluator or test harness unless they are explicitly editable.
- Stop after making the code changes. The outer harness will run evaluation.

Task-specific instructions:
Make the calculator workspace pass its unit tests.

Constraints:
- Only edit the implementation file, not the tests.
- Keep the function signature unchanged.
- Prefer the smallest correct fix.
