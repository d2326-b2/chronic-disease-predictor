# GitHub Workflows Documentation

This directory contains GitHub Actions workflows that automatically run on every push and pull request.

## Available Workflows

### 1. Python Tests & Linting (`python-tests.yml`)

**Trigger**: Push to `main`/`develop` or Pull Request

**What it does**:
- Runs on Windows, macOS, and Ubuntu
- Tests Python 3.8, 3.9, 3.10, 3.11
- Performs code linting with flake8
- Runs pytest tests (if available)

**Status Badge**:
```markdown
![Python Tests](https://github.com/yourusername/chronic-disease-predictor/workflows/Python%20Tests%20%26%20Linting/badge.svg)
```

### 2. Code Quality (`code-quality.yml`)

**Trigger**: Push to `main`/`develop` or Pull Request

**What it does**:
- Checks `requirements.txt` consistency
- Runs security checks with bandit
- Reports potential vulnerabilities

**Status Badge**:
```markdown
![Code Quality](https://github.com/yourusername/chronic-disease-predictor/workflows/Code%20Quality/badge.svg)
```

## Adding Workflow Badges to README

Add this to your README.md badges section:

```markdown
[![Tests](https://github.com/yourusername/chronic-disease-predictor/workflows/Python%20Tests%20%26%20Linting/badge.svg)](https://github.com/yourusername/chronic-disease-predictor/actions)
[![Code Quality](https://github.com/yourusername/chronic-disease-predictor/workflows/Code%20Quality/badge.svg)](https://github.com/yourusername/chronic-disease-predictor/actions)
```

## Customizing Workflows

To modify workflows:

1. Edit the `.yml` file in `.github/workflows/`
2. Commit and push to GitHub
3. Workflows run automatically on next push/PR

## Common Customizations

### Adding Email Notifications
```yaml
- name: Send notification
  if: failure()
  run: echo "Tests failed!"
```

### Adding Coverage Reports
```yaml
- name: Upload coverage
  uses: codecov/codecov-action@v3
```

### Running on Schedule
```yaml
on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday
```

## Monitoring Workflows

1. Go to **Actions** tab on GitHub
2. Select workflow to see runs
3. Click run to see details
4. Check logs for errors

## Troubleshooting

### Workflow not running?
- Check if workflow file has syntax errors
- Verify trigger conditions (branch names, events)
- Review `.gitignore` - files might be skipped

### Tests failing in CI but passing locally?
- Different Python version
- Different OS (Windows vs Linux line endings)
- Missing environment variables
- Check logs for specific errors

### Need to skip a workflow?
Add to commit message:
```
git commit -m "Fix something [skip ci]"
```

---

For more info: https://docs.github.com/en/actions
