"""Remove Cursor co-author trailer from git commit messages (stdin -> stdout)."""
import sys

msg = sys.stdin.read()
lines = msg.splitlines(keepends=True)
filtered = [
    line
    for line in lines
    if "Co-authored-by: Cursor" not in line
    and "cursoragent@cursor.com" not in line
]
while filtered and filtered[-1].strip() == "":
    filtered.pop()
if filtered and not filtered[-1].endswith("\n"):
    filtered[-1] += "\n"
sys.stdout.write("".join(filtered))
