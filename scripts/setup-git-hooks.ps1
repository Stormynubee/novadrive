# Enable repo git hooks that strip Cursor co-author trailers from commits.
Set-Location (Join-Path $PSScriptRoot "..")
git config core.hooksPath .githooks
Write-Host "Git hooks enabled: .githooks/prepare-commit-msg will remove Cursor co-author lines."
