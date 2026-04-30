"""
=============================================================
 Chronic Disease Risk Predictor — Random Forest Training
=============================================================
 Predicts risk for:
   1. Diabetes Mellitus    (PIMA Indians dataset)
   2. Hypertension         (Kaggle Hypertension dataset)
   3. Cardiovascular Disease (UCI Cleveland Heart Disease)

 Pipeline:
   Download datasets → Preprocess → Map to questionnaire
   features → Train RF → Evaluate → Save models → Predict
=============================================================
 INSTALL DEPENDENCIES:
   pip install pandas numpy scikit-learn joblib matplotlib
   seaborn requests
=============================================================
"""

import os
import warnings
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    classification_report, confusion_matrix,
    roc_auc_score, roc_curve
)
from sklearn.impute import SimpleImputer

warnings.filterwarnings("ignore")

# ─────────────────────────────────────────────────────────────
# STEP 1 — LOAD DATASETS
# ─────────────────────────────────────────────────────────────
# Download datasets manually from the links below and place
# them in the same folder as this script:
#
#  diabetes.csv   → https://www.kaggle.com/datasets/uciml/pima-indians-diabetes-database
#  heart.csv      → https://www.kaggle.com/datasets/cherngs/heart-disease-cleveland-uci
#  hypertension.csv → https://www.kaggle.com/datasets/prosperchuks/health-dataset
#                    (file: hypertension_data.csv — rename to hypertension.csv)
#
# All are free Kaggle downloads (create a free account if needed).
# ─────────────────────────────────────────────────────────────

DATA_DIR = "."   # change to folder where CSVs are saved

def load_datasets():
    paths = {
        "diabetes":     os.path.join(DATA_DIR, "datasets/diabetes.csv"),
        "heart":        os.path.join(DATA_DIR, "datasets/heart.csv"),
        "hypertension": os.path.join(DATA_DIR, "datasets/hypertension.csv"),
    }
    data = {}
    for name, path in paths.items():
        if os.path.exists(path):
            data[name] = pd.read_csv(path)
            print(f"[OK] Loaded {name}: {data[name].shape[0]} rows, {data[name].shape[1]} cols")
        else:
            print(f"[MISSING] {path} — see download links in the comment above.")
    return data


# ─────────────────────────────────────────────────────────────
# STEP 2 — PREPROCESS & MAP TO QUESTIONNAIRE FEATURES
# ─────────────────────────────────────────────────────────────
# The questionnaire collects 14 features:
#   age, sex, bmi, exercise, diet_quality, smoking,
#   sleep_hrs, stress_level, water_intake,
#   family_diabetes, family_cvd_htn,
#   bp_level, blood_sugar, high_cholesterol
#
# Each dataset has DIFFERENT column names and scales.
# We map available columns to our feature space, and fill
# the rest with sensible population-level defaults.
# ─────────────────────────────────────────────────────────────

FEATURE_COLS = [
    "age", "sex", "bmi", "exercise", "diet_quality", "smoking",
    "sleep_hrs", "stress_level", "water_intake",
    "family_diabetes", "family_cvd_htn",
    "bp_level", "blood_sugar", "high_cholesterol"
]


def preprocess_diabetes(df):
    """
    PIMA Indians columns:
    Pregnancies, Glucose, BloodPressure, SkinThickness,
    Insulin, BMI, DiabetesPedigreeFunction, Age, Outcome
    """
    out = pd.DataFrame()
    out["age"]          = df["Age"]
    out["sex"]          = 1                        # all female in PIMA
    out["bmi"]          = df["BMI"].replace(0, np.nan)

    # Map Glucose to blood_sugar (0=normal<100, 1=pre 100-125, 2=high 126+)
    out["blood_sugar"]  = pd.cut(df["Glucose"],
                                 bins=[0, 99, 125, 999],
                                 labels=[0, 1, 2]).astype(float)

    # Map BloodPressure to bp_level (0=high>=140, 1=mid 120-139, 2=normal)
    # PIMA stores diastolic only; approximate
    out["bp_level"]     = pd.cut(df["BloodPressure"],
                                 bins=[0, 79, 89, 999],
                                 labels=[2, 1, 0]).astype(float)

    # DiabetesPedigreeFunction > 0.5 → family history likely
    out["family_diabetes"]  = (df["DiabetesPedigreeFunction"] > 0.5).astype(int)

    # Not available in PIMA → fill with population default
    out["exercise"]         = 1   # assume "1-2 days" median
    out["diet_quality"]     = 1   # mixed diet
    out["smoking"]          = 2   # assume ex/non-smoker
    out["sleep_hrs"]        = 2   # 7-8 hrs
    out["stress_level"]     = 1   # sometimes stressed
    out["water_intake"]     = 1   # 1-2 litres
    out["family_cvd_htn"]   = 0
    out["high_cholesterol"] = 0

    out["target"] = df["Outcome"]

    # Impute zeros as NaN for biological features
    for col in ["bmi", "blood_sugar", "bp_level"]:
        out[col] = out[col].replace(0, np.nan)

    return out.reset_index(drop=True)


def preprocess_hypertension(df):
    """
    Hypertension dataset — exact columns:
      age, sex, cp, trestbps, chol, fbs, restecg,
      thalach, exang, oldpeak, slope, ca, thal, target  (14 total, 13 features + target)

    Mapping all 13 input columns → 14 FEATURE_COLS:
      age       -> age           (direct)
      sex       -> sex           (direct: 1=male,0=female)
      bmi       -> bmi           (not in CSV → NaN → imputed)
      trestbps  -> bp_level      (binned: <120=2, 120-139=1, 140+=0)
      chol      -> high_cholesterol (>200 = 1)
      fbs       -> blood_sugar   (1=high sugar, 0=normal)
      exang     -> exercise      (1=poor tolerance→0, 0=ok→2)
      cp        -> stress_level  (chest pain type: 0=asymp→high stress, 3=typical→low)
      thalach   -> family_cvd_htn (low max HR = higher CVD risk proxy)
      restecg   -> family_diabetes (ECG abnormality proxy)
      oldpeak   -> sleep_hrs     (ST depression proxy for severity)
      ca        -> water_intake  (number of vessels: 0=good, 3=bad)
      thal      -> diet_quality  (thal defect: 3=normal→good, 6/7=defect→poor)
      slope     -> smoking       (ST slope: 2=upsloping→low risk, 0=downsloping→high)
      target    -> target
    """
    out = pd.DataFrame()

    # Direct mappings
    out["age"] = df["age"]
    out["sex"] = df["sex"]
    out["bmi"] = np.nan   # not in dataset, imputed later

    # trestbps -> bp_level (2=normal, 1=elevated, 0=high)
    out["bp_level"] = pd.cut(df["trestbps"],
                             bins=[0, 119, 139, 999],
                             labels=[2, 1, 0]).astype(float)

    # chol -> high_cholesterol
    out["high_cholesterol"] = (df["chol"] > 200).astype(int)

    # fbs -> blood_sugar (fasting blood sugar >120 mg/dL)
    out["blood_sugar"] = df["fbs"].apply(lambda x: 2 if x == 1 else 0)

    # exang -> exercise tolerance (1=angina=no tolerance=0, 0=ok=2)
    out["exercise"] = df["exang"].apply(lambda x: 0 if x == 1 else 2)

    # cp (chest pain type) -> stress_level proxy
    # 0=asymptomatic(worst)→3, 1=atypical→2, 2=non-anginal→1, 3=typical angina→0
    out["stress_level"] = df["cp"].apply(
        lambda x: 3 if x == 0 else (2 if x == 1 else (1 if x == 2 else 0)))

    # thalach (max heart rate achieved) -> family_cvd_htn proxy
    # low max HR = higher CVD risk; threshold ~140
    out["family_cvd_htn"] = (df["thalach"] < 140).astype(int)

    # restecg (resting ECG) -> family_diabetes proxy
    # 0=normal, 1=ST-T abnormality, 2=LVH
    out["family_diabetes"] = (df["restecg"] > 0).astype(int)

    # oldpeak (ST depression) -> sleep_hrs proxy (higher depression = worse)
    # 0.0-1.0 → 3 (good), 1.1-2.0 → 2, 2.1-3.0 → 1, >3.0 → 0
    out["sleep_hrs"] = pd.cut(df["oldpeak"],
                              bins=[-0.1, 1.0, 2.0, 3.0, 99],
                              labels=[3, 2, 1, 0]).astype(float)

    # ca (number of major vessels 0-3) -> water_intake proxy
    # 0 vessels blocked = healthiest (2), 3 = worst (0)
    out["water_intake"] = df["ca"].apply(
        lambda x: 2 if x == 0 else (1 if x == 1 else 0))

    # thal -> diet_quality proxy
    # 3=normal→3(best), 6=fixed defect→1, 7=reversable defect→0(worst)
    out["diet_quality"] = df["thal"].apply(
        lambda x: 3 if x == 3 else (1 if x == 6 else 0))

    # slope -> smoking proxy
    # 2=upsloping(low risk)→3, 1=flat→1, 0=downsloping(high risk)→0
    out["smoking"] = df["slope"].apply(
        lambda x: 3 if x == 2 else (1 if x == 1 else 0))

    out["target"] = df["target"]
    return out.reset_index(drop=True)

def preprocess_heart(df):
    """
    UCI Cleveland / Kaggle heart.csv columns:
    age, sex, cp, trestbps, chol, fbs, restecg, thalach,
    exang, oldpeak, slope, ca, thal, target
    target: 0 = no disease, 1 = disease
    """
    out = pd.DataFrame()
    out["age"]          = df["age"]
    out["sex"]          = df["sex"]
    out["bmi"]          = np.nan  # not in this dataset

    out["bp_level"]     = pd.cut(df["trestbps"],
                                 bins=[0, 119, 139, 999],
                                 labels=[2, 1, 0]).astype(float)

    out["high_cholesterol"] = (df["chol"] > 200).astype(int)
    out["blood_sugar"]  = df["fbs"].apply(lambda x: 2 if x == 1 else 0)
    out["exercise"]     = df["exang"].apply(lambda x: 0 if x == 1 else 2)
    out["family_cvd_htn"]  = 0  # not available
    out["family_diabetes"] = 0
    out["diet_quality"]    = 1
    out["smoking"]         = 2
    out["sleep_hrs"]       = 2
    out["stress_level"]    = 1
    out["water_intake"]    = 1

    out["target"] = df["target"].apply(lambda x: 1 if x > 0 else 0)
    return out.reset_index(drop=True)


def impute_features(df):
    """
    Fill NaN with median. Safe for all sklearn versions.
    - Adds any missing columns as NaN first.
    - Pre-fills completely-NaN columns with global fallback values
      so sklearn never sees an all-NaN column (avoids shape mismatch
      on sklearn < 1.1 which drops all-NaN columns silently).
    """
    # Global fallback values for columns that may be entirely NaN
    # (e.g. bmi is absent from hypertension and CVD datasets)
    FALLBACK = {
        "age": 45.0, "sex": 0.0, "bmi": 25.0,
        "exercise": 1.0, "diet_quality": 1.0, "smoking": 2.0,
        "sleep_hrs": 2.0, "stress_level": 1.0, "water_intake": 1.0,
        "family_diabetes": 0.0, "family_cvd_htn": 0.0,
        "bp_level": 1.0, "blood_sugar": 1.0, "high_cholesterol": 0.0,
    }

    df = df.copy()

    # Add any completely missing columns
    for col in FEATURE_COLS:
        if col not in df.columns:
            print(f"  [WARN] Column '{col}' missing — filling with fallback")
            df[col] = np.nan

    feature_df = df[FEATURE_COLS].copy()

    # Pre-fill columns that are 100% NaN with fallback value
    # This prevents sklearn from dropping them before fit_transform
    for col in FEATURE_COLS:
        if feature_df[col].isna().all():
            feature_df[col] = FALLBACK.get(col, 0.0)

    imputer = SimpleImputer(strategy="median")
    imputed  = imputer.fit_transform(feature_df)
    return pd.DataFrame(imputed, columns=FEATURE_COLS), imputer


# ─────────────────────────────────────────────────────────────
# STEP 3 — TRAIN RANDOM FOREST
# ─────────────────────────────────────────────────────────────

def train_rf(X_train, y_train, disease_name):
    """Train a Random Forest with best-practice hyperparameters."""
    rf = RandomForestClassifier(
        n_estimators=200,        # 200 trees — good balance for small datasets
        max_depth=10,            # prevent overfitting
        min_samples_split=5,
        min_samples_leaf=3,
        max_features="sqrt",     # standard for classification
        class_weight="balanced", # handles class imbalance
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train, y_train)
    print(f"  [{disease_name}] RF trained on {len(X_train)} samples.")
    return rf


# ─────────────────────────────────────────────────────────────
# STEP 4 — EVALUATE
# ─────────────────────────────────────────────────────────────

def evaluate(model, X_test, y_test, disease_name, label_names=("No Risk","At Risk")):
    y_pred    = model.predict(X_test)
    y_prob    = model.predict_proba(X_test)[:, 1]
    auc       = roc_auc_score(y_test, y_prob)
    cv_scores = cross_val_score(model, X_test, y_test, cv=5, scoring="roc_auc")

    sep    = "=" * 50
    report = classification_report(y_test, y_pred, target_names=label_names)

    lines = [
        "",
        sep,
        f"  {disease_name} — Evaluation",
        sep,
        report,
        f"  ROC-AUC:           {auc:.4f}",
        f"  5-Fold CV AUC:     {cv_scores.mean():.4f} ± {cv_scores.std():.4f}",
    ]
    block = "\n".join(lines)
    print(block)
    return auc, y_prob, block


def plot_results(models_data, output_dir="."):
    """Plot feature importances and ROC curves for all 3 models."""
    fig, axes = plt.subplots(2, 3, figsize=(18, 10))
    fig.suptitle("Random Forest — Chronic Disease Risk Models", fontsize=14)

    colors = ["#1D9E75", "#378ADD", "#D85A30"]

    for i, (name, model, X_test, y_test, y_prob) in enumerate(models_data):
        # Feature importance
        ax = axes[0][i]
        importances = pd.Series(model.feature_importances_, index=FEATURE_COLS)
        importances.sort_values().tail(10).plot(kind="barh", ax=ax, color=colors[i], alpha=0.8)
        ax.set_title(f"{name}\nTop Feature Importances", fontsize=11)
        ax.set_xlabel("Importance")

        # ROC curve
        ax2 = axes[1][i]
        fpr, tpr, _ = roc_curve(y_test, y_prob)
        auc = roc_auc_score(y_test, y_prob)
        ax2.plot(fpr, tpr, color=colors[i], lw=2, label=f"AUC = {auc:.3f}")
        ax2.plot([0,1],[0,1],"k--", lw=1)
        ax2.set_xlabel("False Positive Rate")
        ax2.set_ylabel("True Positive Rate")
        ax2.set_title(f"{name} — ROC Curve")
        ax2.legend()

    plt.tight_layout()
    out_path = os.path.join(output_dir, "model_evaluation.png")
    plt.savefig(out_path, dpi=120, bbox_inches="tight")
    plt.close()
    print(f"\n[Saved] model_evaluation.png → {out_path}")


# ─────────────────────────────────────────────────────────────
# STEP 5 — PREDICT FROM QUESTIONNAIRE
# ─────────────────────────────────────────────────────────────

def questionnaire_to_vector(responses: dict) -> list:
    """
    Convert raw questionnaire responses to the feature vector.

    Parameters (all keys in responses dict):
      age         : int   (10–90)
      sex         : int   (0=male, 1=female)
      height_cm   : float
      weight_kg   : float
      exercise    : int   (0=never … 3=5+days)
      diet        : int   (0=junk … 3=very healthy)
      smoke       : int   (0=daily … 3=never)
      sleep       : int   (0=<5hrs … 3=>8hrs)
      stress      : int   (0=constant … 3=rarely)
      water       : int   (0=<1L, 1=1-2L, 2=>2L)
      fam_dm      : int   (0=no, 1=yes, -1=unknown→0)
      fam_cvd     : int   (0=no, 1=yes, -1=unknown→0)
      bp          : int   (0=high, 1=slightly high, 2=normal, -1=unknown→1)
      sugar       : int   (0=high, 1=pre-diabetic, 2=normal, -1=unknown→1)
      chol        : int   (0=no, 1=yes, -1=unknown→0)
    """
    ht = responses.get("height_cm", 165)
    wt = responses.get("weight_kg", 70)
    bmi = round(wt / (ht / 100) ** 2, 1)

    def f(key, default):
        v = responses.get(key, default)
        return default if v == -1 else v

    return [
        responses.get("age",  35),
        responses.get("sex",   0),
        bmi,
        f("exercise",  1),
        f("diet",      1),
        f("smoke",     2),
        f("sleep",     2),
        f("stress",    1),
        f("water",     1),
        max(f("fam_dm",  0), 0),
        max(f("fam_cvd", 0), 0),
        max(f("bp",      1), 0),
        max(f("sugar",   1), 0),
        max(f("chol",    0), 0),
    ]


def predict_risk(models: dict, imputers: dict, vector: list) -> dict:
    """Return probability risk (0–100%) for each disease.
    Each model uses its own imputer to handle any NaN in the vector.
    """
    results = {}
    for disease, model in models.items():
        x = np.array(vector, dtype=float).reshape(1, -1)
        x = imputers[disease].transform(x)   # apply the matching imputer
        prob  = model.predict_proba(x)[0][1]
        pct   = round(prob * 100, 1)
        level = "Low" if pct < 30 else "Moderate" if pct < 60 else "High"
        results[disease] = {"probability": pct, "level": level}
    return results


# ─────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────

def main():
    print("\n" + "="*60)
    print("  Chronic Disease Risk — RF Training Pipeline")
    print("="*60)

    raw = load_datasets()

    if not raw:
        print("\n[ERROR] No datasets found. Download CSVs first (see links at top).")
        return

    trained_models   = {}
    trained_imputers = {}
    models_for_plot  = []

    # ── Diabetes ──────────────────────────────────────────────
    if "diabetes" in raw:
        print("\n[1/3] Training Diabetes model...")
        df = preprocess_diabetes(raw["diabetes"])
        X, imputer = impute_features(df)
        y = df["target"]
        X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2,
                                                   random_state=42, stratify=y)
        model = train_rf(X_tr, y_tr, "Diabetes")
        auc, y_prob, report_dm  = evaluate(model, X_te, y_te, "Diabetes Mellitus")
        trained_models["Diabetes Mellitus"]   = model
        trained_imputers["Diabetes Mellitus"] = imputer
        models_for_plot.append(("Diabetes Mellitus", model, X_te, y_te, y_prob))
        joblib.dump(model,   "rf_diabetes.pkl")
        joblib.dump(imputer, "imputer_diabetes.pkl")
        print("  [Saved] rf_diabetes.pkl + imputer_diabetes.pkl")

    # ── Hypertension ──────────────────────────────────────────
    if "hypertension" in raw:
        print("\n[2/3] Training Hypertension model...")
        df = preprocess_hypertension(raw["hypertension"])
        X, imputer = impute_features(df)
        y = df["target"]
        X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2,
                                                   random_state=42, stratify=y)
        model = train_rf(X_tr, y_tr, "Hypertension")
        auc, y_prob, report_htn = evaluate(model, X_te, y_te, "Hypertension")
        trained_models["Hypertension"]   = model
        trained_imputers["Hypertension"] = imputer
        models_for_plot.append(("Hypertension", model, X_te, y_te, y_prob))
        joblib.dump(model,   "rf_hypertension.pkl")
        joblib.dump(imputer, "imputer_hypertension.pkl")
        print("  [Saved] rf_hypertension.pkl + imputer_hypertension.pkl")

    # ── Cardiovascular Disease ────────────────────────────────
    if "heart" in raw:
        print("\n[3/3] Training CVD model...")
        df = preprocess_heart(raw["heart"])
        X, imputer = impute_features(df)
        y = df["target"]
        X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2,
                                                   random_state=42, stratify=y)
        model = train_rf(X_tr, y_tr, "CVD")
        auc, y_prob, report_cvd = evaluate(model, X_te, y_te, "Cardiovascular Disease")
        trained_models["Cardiovascular Disease"]   = model
        trained_imputers["Cardiovascular Disease"] = imputer
        models_for_plot.append(("Cardiovascular Disease", model, X_te, y_te, y_prob))
        joblib.dump(model,   "rf_cvd.pkl")
        joblib.dump(imputer, "imputer_cvd.pkl")
        print("  [Saved] rf_cvd.pkl + imputer_cvd.pkl")

    # ── Plot ──────────────────────────────────────────────────
    if models_for_plot:
        plot_results(models_for_plot)

    # ── Demo Prediction ───────────────────────────────────────
    print("\n" + "="*60)
    print("  Example Prediction from Questionnaire Responses")
    print("="*60)

    sample_responses = {
        "age":        45,
        "sex":         0,       # male
        "height_cm": 170,
        "weight_kg":  85,       # BMI ~29.4 (overweight)
        "exercise":    1,       # 1-2 days/week
        "diet":        1,       # mixed diet
        "smoke":       1,       # ex-smoker
        "sleep":       1,       # 5-6 hrs
        "stress":      1,       # often stressed
        "water":       1,       # 1-2 litres
        "fam_dm":      1,       # family has diabetes
        "fam_cvd":     1,       # family has CVD
        "bp":          1,       # slightly high
        "sugar":       1,       # pre-diabetic range
        "chol":       -1,       # don't know → default
    }

    vector = questionnaire_to_vector(sample_responses)
    prediction_lines = []
    prediction_lines.append("\n" + "="*60)
    prediction_lines.append("  Example Prediction from Questionnaire Responses")
    prediction_lines.append("="*60)
    prediction_lines.append(f"  Feature vector: {vector}")

    if trained_models:
        risks = predict_risk(trained_models, trained_imputers, vector)
        prediction_lines.append("")
        prediction_lines.append(f"  {'Disease':<30} {'Risk %':>8}  {'Level'}")
        prediction_lines.append("  " + "-"*48)
        for disease, result in risks.items():
            prediction_lines.append(
                f"  {disease:<30} {result['probability']:>7.1f}%  {result['level']}")

    pred_block = "\n".join(prediction_lines)
    print(pred_block)

    # ── Save output.txt ───────────────────────────────────────
    saved_files_block = """
[Done] Files saved:
  rf_diabetes.pkl          + imputer_diabetes.pkl
  rf_hypertension.pkl      + imputer_hypertension.pkl
  rf_cvd.pkl               + imputer_cvd.pkl
  model_evaluation.png
  output.txt

To load a model later:
  model   = joblib.load('rf_diabetes.pkl')
  imputer = joblib.load('imputer_diabetes.pkl')
  x       = imputer.transform([vector])
  risk    = model.predict_proba(x)[0][1]
"""
    print(saved_files_block)

    # Collect all evaluation reports that were generated
    all_reports = []
    for var_name in ["report_dm", "report_htn", "report_cvd"]:
        if var_name in dir():  # only include if that model was trained
            pass
    # Build from locals safely
    report_blocks = []
    for rname in [locals().get("report_dm",""), locals().get("report_htn",""), locals().get("report_cvd","")]:
        if rname:
            report_blocks.append(rname)

    header = """
================================================================
  Chronic Disease Risk Predictor — Model Training Report
================================================================
  Models  : Random Forest Classifier (sklearn)
  Diseases: Diabetes Mellitus | Hypertension | Cardiovascular Disease
  Features: 14 questionnaire-mapped features
================================================================
"""

    feature_table = """
Feature Encoding Reference
---------------------------
Index | Feature            | Range  | Description
------+--------------------+--------+----------------------------------
  0   | age                | 10-90  | Age in years
  1   | sex                | 0-1    | 0=Male, 1=Female
  2   | bmi                | float  | Weight(kg) / Height(m)^2
  3   | exercise           | 0-3    | 0=Never ... 3=5+days/week
  4   | diet_quality       | 0-3    | 0=Junk ... 3=Very healthy
  5   | smoking            | 0-3    | 0=Daily ... 3=Never
  6   | sleep_hrs          | 0-3    | 0=<5hrs ... 3=>8hrs
  7   | stress_level       | 0-3    | 0=Constant ... 3=Rarely
  8   | water_intake       | 0-2    | 0=<1L, 1=1-2L, 2=>2L
  9   | family_diabetes    | 0-1    | Family history of diabetes
 10   | family_cvd_htn     | 0-1    | Family history of CVD/HTN
 11   | bp_level           | 0-2    | 0=High(140+), 1=Elevated, 2=Normal
 12   | blood_sugar        | 0-2    | 0=High(126+), 1=Pre-diabetic, 2=Normal
 13   | high_cholesterol   | 0-1    | Cholesterol > 200 mg/dL
"""

    output_content = (
        header
        + "\n".join(report_blocks)
        + "\n"
        + pred_block
        + "\n"
        + feature_table
        + saved_files_block
    )

    with open("output.txt", "w", encoding="utf-8") as f:
        f.write(output_content)
    print("[Saved] output.txt")


if __name__ == "__main__":
    main()
