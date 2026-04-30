# Contributing to Chronic Disease Risk Predictor

Thank you for your interest in contributing! We welcome contributions from the community. This document provides guidelines and instructions for contributing.

## 🎯 Ways to Contribute

- 🐛 **Report Bugs**: Found an issue? Let us know!
- 💡 **Suggest Features**: Have an idea? Share it!
- 📝 **Improve Documentation**: Help us write better docs
- 🔧 **Code Contributions**: Submit pull requests with improvements
- 🧪 **Testing**: Help test new features
- 🌍 **Translations**: Help localize the project

## 📋 Before You Start

1. Check existing [Issues](https://github.com/yourusername/chronic-disease-predictor/issues) and [Pull Requests](https://github.com/yourusername/chronic-disease-predictor/pulls)
2. Read the [README.md](README.md) to understand the project
3. Review the [Code of Conduct](CODE_OF_CONDUCT.md)

## 🐛 Reporting Bugs

When reporting a bug, please include:
- **Title**: Clear, descriptive title
- **Description**: What happened and what you expected
- **Steps to Reproduce**: How to replicate the issue
- **Environment**: Python version, OS, browser
- **Screenshots**: If applicable

### Example Bug Report:
```
Title: AR view not loading on Firefox mobile

Description:
The AR experience page fails to load when accessed from Firefox on iPhone.

Steps to Reproduce:
1. Open app on iPhone
2. Click "Open AR Experience"
3. Scan QR code with Firefox

Environment:
- Python 3.10
- Windows 11
- Firefox iOS 125.0

Error Message:
[Include console errors if any]
```

## 💡 Suggesting Features

When suggesting a feature:
- **Title**: Clear, concise feature name
- **Description**: What problem does it solve?
- **Use Case**: How would it be used?
- **Mockups**: UI mockups if applicable

### Example Feature Request:
```
Title: Add dark mode to dashboard

Description:
Add a dark theme option for better accessibility and reduced eye strain.

Use Case:
Users accessing the app in low-light environments would benefit from a dark theme.
```

## 🔧 Code Contributions

### Step 1: Fork & Clone
```bash
git clone https://github.com/yourusername/chronic-disease-predictor.git
cd chronic-disease-predictor
```

### Step 2: Create a Branch
```bash
git checkout -b feature/your-feature-name
# or for bug fixes:
git checkout -b fix/bug-name
```

Branch naming:
- Features: `feature/feature-name`
- Bugs: `fix/bug-name`
- Documentation: `docs/doc-name`
- Tests: `test/test-name`

### Step 3: Make Changes
- Keep changes focused on one issue/feature
- Write clean, readable code
- Add comments for complex logic
- Update documentation if needed

### Step 4: Test Your Changes
```bash
# Run the application
python app.py

# Test manually in browser
# http://localhost:5000

# Run any existing tests
pytest  # if tests exist
```

### Step 5: Commit & Push
```bash
git add .
git commit -m "Brief description of changes"
# Good commit messages:
# - Start with a verb (Add, Fix, Update, Remove)
# - Be concise but descriptive
# - Example: "Fix AR loading issue on mobile browsers"

git push origin feature/your-feature-name
```

### Step 6: Submit a Pull Request

1. Go to [Pull Requests](https://github.com/yourusername/chronic-disease-predictor/pulls)
2. Click "New Pull Request"
3. Select your branch
4. Fill in the PR template:

```markdown
## Description
Briefly describe what this PR does.

## Related Issue
Closes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Testing Done
Describe tests performed.

## Screenshots
Include relevant screenshots if applicable.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed the code
- [ ] Added/updated documentation
- [ ] No new warnings generated
- [ ] Tested on multiple browsers
```

## 📝 Code Style Guidelines

### Python
```python
# Follow PEP 8
# - 4 spaces for indentation
# - max line length 88 characters (Black formatter)
# - Use type hints where possible
# - Write docstrings for functions

def predict_risk(features: list) -> dict:
    """
    Predict disease risk based on health features.
    
    Args:
        features: List of 14 health feature values
        
    Returns:
        Dictionary with risk scores for each disease
    """
    pass
```

### JavaScript
```javascript
// Use camelCase for variables and functions
// Use const/let, avoid var
// Write clear comments
// Use meaningful variable names

const calculateBMI = (weight, height) => {
    // weight in kg, height in m
    return weight / (height * height);
};
```

### HTML/CSS
```html
<!-- Use semantic HTML tags -->
<!-- Use meaningful class names following BEM or similar -->
<!-- Keep indentation consistent (2 or 4 spaces) -->

<div class="card card--primary">
    <h2 class="card__title">Risk Assessment</h2>
    <p class="card__description">...</p>
</div>
```

## 🧪 Testing Guidelines

Before submitting a PR:
1. Test on Python 3.8, 3.9, 3.10, 3.11
2. Test on multiple browsers (Chrome, Firefox, Safari, Edge)
3. Test on mobile devices or mobile emulation
4. Verify no console errors
5. Check for accessibility issues

## 📚 Documentation

When updating code, also update:
- Inline comments
- Function docstrings
- [README.md](README.md) if applicable
- Add examples for new features

## ✅ Review Process

1. Maintainers review your PR
2. We may request changes
3. Address feedback in your branch
4. We merge when approved

## ⚖️ License

By contributing, you agree your code will be licensed under the MIT License.

## 🤝 Community

- Be respectful and inclusive
- Assume good intent
- Help others learn
- Celebrate contributions

## ❓ Questions?

- Check [GitHub Discussions](https://github.com/yourusername/chronic-disease-predictor/discussions)
- Open an issue with your question
- Review existing documentation

---

Thank you for contributing! 🎉
