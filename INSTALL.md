# INSTALLATION GUIDE

Complete step-by-step guide to install and run the Chronic Disease Risk Predictor.

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Installation Steps](#installation-steps)
3. [Configuration](#configuration)
4. [Running the Application](#running-the-application)
5. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements
- **Python**: 3.8 or higher
- **RAM**: 2 GB minimum (4 GB recommended)
- **Disk Space**: 500 MB for application and dependencies
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Supported Operating Systems
- Windows 10/11
- macOS 10.13+
- Ubuntu 18.04+
- Debian 9+
- Other Linux distributions

### Internet Requirements
- Internet connection for initial package installation
- Optional: Internet for Cloudflare Tunnel (for public access)

---

## Installation Steps

### Step 1: Download Python

If you don't have Python installed:

**Windows**:
1. Visit https://www.python.org/downloads/
2. Download Python 3.10 or higher
3. Run installer
4. ✅ **IMPORTANT**: Check "Add Python to PATH"
5. Click "Install Now"

**macOS**:
```bash
# Using Homebrew
brew install python3

# Or download from https://www.python.org/downloads/
```

**Linux**:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install python3 python3-pip

# Fedora/RHEL
sudo dnf install python3 python3-pip
```

### Step 2: Clone or Download the Repository

**Option A - Using Git**:
```bash
git clone https://github.com/yourusername/chronic-disease-predictor.git
cd chronic-disease-predictor
```

**Option B - Download ZIP**:
1. Visit the GitHub repository
2. Click "Code" → "Download ZIP"
3. Extract the ZIP file
4. Open terminal/command prompt in the extracted folder

### Step 3: Create Virtual Environment (Recommended)

A virtual environment isolates project dependencies from your system Python.

**Windows**:
```bash
# Create virtual environment
python -m venv venv

# Activate it
venv\Scripts\activate
```

**macOS/Linux**:
```bash
# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate
```

You should see `(venv)` in your terminal, indicating the virtual environment is active.

### Step 4: Install Dependencies

With virtual environment activated, run:

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

This installs:
- Flask (web framework)
- scikit-learn (machine learning)
- numpy (numerical computing)
- flask-cors (cross-origin support)
- joblib (data serialization)
- And other dependencies

**Installation time**: 2-5 minutes depending on internet speed

### Step 5: Verify Installation

```bash
python -c "import flask, sklearn, numpy; print('✓ All dependencies installed correctly')"
```

You should see: `✓ All dependencies installed correctly`

---

## Configuration

### Basic Configuration (Optional)

Create a `.env` file in the project root:

```bash
# Create .env file
touch .env  # macOS/Linux
# or
type nul > .env  # Windows
```

Add these settings:

```env
# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=dev-secret-key-change-in-production

# Application Settings
HOST=127.0.0.1
PORT=5000
```

### Production Configuration

For production deployment, create `.env.production`:

```env
FLASK_ENV=production
FLASK_DEBUG=False
SECRET_KEY=your-production-secret-key-here
HOST=0.0.0.0
PORT=5000
```

### Cloudflare Tunnel Setup (Optional)

For public access from any device/network:

1. **Download Cloudflare Tunnel**:
   ```bash
   # Windows: Download from
   https://github.com/cloudflare/cloudflared/releases
   
   # macOS
   brew install cloudflared
   
   # Linux
   wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
   chmod +x cloudflared-linux-amd64
   ```

2. **Place in project root** (Windows only):
   - Save `cloudflared.exe` in the project directory

3. **Authenticate** (first time only):
   ```bash
   cloudflared tunnel login
   ```

4. **Run app.py** - tunnel will start automatically

---

## Running the Application

### Quick Start

1. **Activate virtual environment** (if not already active):
   ```bash
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

2. **Run the application**:
   ```bash
   python app.py
   ```

3. **Open in browser**:
   - Navigate to `http://localhost:5000`
   - You should see the health assessment form

### Expected Output

```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
Press CTRL+C to quit
```

### Using the Application

1. **Complete Health Assessment**:
   - Fill out all 14 health questions
   - Click "Get Risk Assessment"

2. **View Results**:
   - See your risk scores for each disease
   - Compare risks with charts

3. **Download Report**:
   - Click "Download Report"
   - PDF saves to your computer

---

## Troubleshooting

### Issue: "Python not found" or "pip not found"

**Solution**:
- Ensure Python was installed with "Add to PATH" option
- Restart terminal/command prompt after installation
- Use `python3` instead of `python` on macOS/Linux

```bash
python --version  # or python3 --version
pip --version     # or pip3 --version
```

### Issue: "Module not found" errors

**Solution**:
```bash
# Ensure virtual environment is activated
# Then reinstall dependencies
pip install -r requirements.txt --upgrade

# Or reinstall completely
pip uninstall -r requirements.txt -y
pip install -r requirements.txt
```

### Issue: "Address already in use"

**Solution**: Another application is using port 5000. Either:

Option A - Kill the process:
```bash
# Windows
netstat -ano | findstr :5000

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

Option B - Use different port in `app.py`:
```python
app.run(debug=True, port=5001)  # Change to 5001
```

### Issue: "Cloudflared command not found"

**Solution**:
- Ensure cloudflared is in project root (Windows)
- Use full path to cloudflared executable
- Or reinstall via package manager

### Issue: Charts not displaying properly

**Solution**:
- Check browser console (F12)
- Ensure JavaScript is enabled
- Try different browser
- Clear browser cache
- Check network connectivity

### Issue: PDFs not downloading

**Solution**:
```bash
# Create reports directory
mkdir static/reports

# Check file permissions
chmod 755 static/reports
```

### Issue: Port 5000 permission denied (macOS/Linux)

**Solution**:
```bash
# Use port > 1024 instead
# Edit app.py or use:
python -c "import sys; sys.path.insert(0, '.'); from app import app; app.run(port=8000)"
```

---

## Updating the Application

To get the latest updates:

```bash
# If using Git
git pull origin main

# Update dependencies
pip install -r requirements.txt --upgrade
```

---

## Uninstallation

To completely remove the application:

```bash
# Deactivate virtual environment
deactivate

# Remove virtual environment
rm -rf venv  # macOS/Linux
rmdir /s venv  # Windows

# Delete project folder
rm -rf chronic-disease-predictor  # macOS/Linux
rmdir /s chronic-disease-predictor  # Windows
```

---

## Next Steps

- Read [README.md](README.md) for features overview
- Check [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
- Review [PROJECT_REPORT.md](PROJECT_REPORT.md) for technical details
- Join [GitHub Discussions](https://github.com/yourusername/chronic-disease-predictor/discussions)

---

## Getting Help

- 📖 [Full Documentation](README.md)
- 🐛 [Report Issues](https://github.com/yourusername/chronic-disease-predictor/issues)
- 💬 [Discussions](https://github.com/yourusername/chronic-disease-predictor/discussions)
- 📧 Email: support@example.com

---

**Last Updated**: April 2026
