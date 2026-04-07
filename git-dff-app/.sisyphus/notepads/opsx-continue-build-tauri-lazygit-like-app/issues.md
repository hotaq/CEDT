# Issues

## 2026-02-24

- File watching is not reliable across all platforms/filesystems; design assumes watchers are hints and keeps a polling fallback.
- Need to standardize branch checkout command (`git switch` vs `git checkout`) and output formats for branches/history that are robust to parsing.
- Windows/path canonicalization and non-UTF8 path round-tripping will need careful implementation and tests with real repos.
