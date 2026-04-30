# 🏥 Chronic Disease Risk Predictor

A web-based machine learning system that predicts individual risk for three major chronic diseases: **Diabetes Mellitus**, **Hypertension**, and **Cardiovascular Disease**. Provides comprehensive health assessment, ML-powered risk predictions, and personalized health recommendations.

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-2.3+-green.svg)](https://flask.palletsprojects.com/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.1+-orange.svg)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🎯 Features

- **🤖 ML-Powered Risk Assessment**: Uses Random Forest models trained on real medical datasets
- **📊 Comprehensive Health Questionnaire**: 14-field assessment covering lifestyle, medical history, and vital signs
- **� Interactive Risk Dashboard**: Visual charts and comparisons of disease risk scores
- **📥 PDF Report Generation**: Download personalized health reports
- **🔒 Privacy-First**: No sensitive data stored on servers
- **🌐 Web-Based**: Works on any device with a modern browser
- **📲 Mobile-Friendly**: Responsive design for smartphones and tablets

---

## 📋 How It Works

```
User Assessment → Feature Extraction → ML Prediction → Risk Analysis → Dashboard Display
```

### Three Disease Models
1. **Diabetes Mellitus** - Blood sugar regulation risk
2. **Hypertension** - High blood pressure risk
3. **Cardiovascular Disease** - Heart disease risk

### Risk Categories
- 🟢 **Low Risk** (0-30%)
- 🟡 **Moderate Risk** (30-60%)
- 🔴 **High Risk** (60%+)

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/chronic-disease-predictor.git
   cd chronic-disease-predictor
   ```

2. **Create a virtual environment** (optional but recommended)
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Flask application**
   ```bash
   python app.py
   ```

5. **Open in browser**
   Navigate to `http://localhost:5000` in your web browser

---

## 💻 Usage

### Main Features

#### 1. **Health Assessment**
- Fill out a 14-field questionnaire covering:
  - Age, sex, BMI
  - Exercise and diet habits
  - Smoking and sleep patterns
  - Stress levels and hydration
  - Family medical history
  - Current vital signs

#### 2. **Risk Dashboard**
- View personalized risk scores for all three diseases
- Compare risks side-by-side
- See detailed charts and statistics

#### 3. **PDF Reports**
- Generate a comprehensive health report
- Includes assessment details and risk scores
- Download to your device

---

## 📁 Project Structure

```
chronic-disease-predictor/
├── app.py                          # Flask application (main entry point)
├── requirements.txt                # Python dependencies
├── README.md                       # This file
├── LICENSE                         # MIT License
│
├── templates/
│   └── index.html                 # Main dashboard & assessment UI
│
├── static/
│   ├── css/
│   │   └── style.css              # Application styling
│   ├── js/
│   │   ├── main.js                # Core functionality
│   │   └── main.js                # Core functionality & visualization(auto-cleaned)
│
├── datasets/
│   ├── diabetes.csv               # Training data source
│   ├── heart.csv                  # Training data source
│   └── hypertension.csv           # Training data source
│
└── train_model/
    ├── chronic_disease_rf.py      # Model training script
    ├── rf_diabetes.pkl            # Pre-trained diabetes model
    ├── rf_hypertension.pkl        # Pre-trained hypertension model
    ├── rf_cvd.pkl                 # Pre-trained CVD model
    ├── imputer_diabetes.pkl       # Data imputer for diabetes
    ├── imputer_hypertension.pkl   # Data imputer for hypertension
    └── imputer_cvd.pkl            # Data imputer for CVD
```

---

## 🔬 Machine Learning Details

### Model Architecture
- **Algorithm**: Random Forest Classifier
- **Number of Trees**: 200
- **Max Depth**: 10
- **Feature Count**: 14 health features

### Training Data
- **Diabetes**: PIMA Indians Diabetes Dataset (768 samples)
- **Hypertension**: Kaggle Hypertension Dataset (5500+ samples)
- **CVD**: UCI Heart Disease Dataset (303 samples)

### Evaluation Metrics
- Accuracy, Precision, Recall, F1-Score
- ROC-AUC (primary metric for model selection)
- 5-Fold Cross-Validation for robustness

### Health Features Used
| # | Feature | Range | Description |
|---|---------|-------|-------------|
| 0 | Age | 10-90 years | Patient age |
| 1 | Sex | 0=M, 1=F | Biological sex |
| 2 | BMI | ~16-40 | Body Mass Index |
| 3 | Exercise | 0-3 | Activity level (0=Never, 3=5+ days/week) |
| 4 | Diet Quality | 0-3 | Nutrition level (0=Junk, 3=Very healthy) |
| 5 | Smoking | 0-3 | Smoking status (0=Daily, 3=Never) |
| 6 | Sleep Hours | 0-3 | Sleep duration (0=<5hrs, 3=>8hrs) |
| 7 | Stress Level | 0-3 | Stress (0=Constant, 3=Rarely) |
| 8 | Water Intake | 0-2 | Daily water (0=<1L, 2=>2L) |
| 9 | Family Diabetes | 0/1 | Family history |
| 10 | Family CVD/HTN | 0/1 | Family history |
| 11 | BP Level | 0-2 | Blood pressure category |
| 12 | Blood Sugar | 0-2 | Glucose level category |
| 13 | High Cholesterol | 0/1 | Cholesterol status |

---

## 🛠️ Technologies Used

### Backend
- **Framework**: Flask 2.3+
- **ML Libraries**: scikit-learn, joblib, numpy
- **CORS**: flask-cors
- **Server**: Cloudflare Tunnel (for public access)

### Frontend
- **HTML5, CSS3, JavaScript**
- **Charts**: Chart.js for data visualization
- **PDF Generation**: jsPDF

### Deployment
- **Local**: Flask development server
- **Public**: Cloudflare Tunnel (optional)
- **Container**: Docker-ready

---

## 🔒 Privacy & Security

- ✅ No personal data stored on servers
- ✅ All health data processed locally on client
- ✅ HTTPS support via Cloudflare Tunnel
- ✅ CORS configured for security
- ✅ No external data sharing

---

## 📝 Configuration

### Environment Variables (Optional)
Create a `.env` file in the project root:
```env
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-secret-key-here
```

### Cloudflare Tunnel (for public access)
1. Download `cloudflared` from [Cloudflare](https://github.com/cloudflare/cloudflared/releases)
2. Place executable in project root
3. Run `python app.py` - tunnel will start automatically
4. App will be accessible from any device/network

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📧 Contact & Support

- **Issues**: Please report bugs via [GitHub Issues](https://github.com/yourusername/chronic-disease-predictor/issues)
- **Discussions**: Join the community on [GitHub Discussions](https://github.com/yourusername/chronic-disease-predictor/discussions)

---

## 🙏 Acknowledgments

- PIMA Indians Diabetes Dataset
- UCI Machine Learning Repository
- Kaggle Community
- Flask and scikit-learn communities
- All contributors and testers

---

## ⚠️ Disclaimer

**This tool is for educational and informational purposes only.** It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals for medical concerns.

---

**Last Updated**: April 2026
**Version**: 1.0.0
