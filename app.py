"""
╔══════════════════════════════════════════════════════════════════╗
║   Chronic Disease Predictor — Flask Backend                      ║
║   Cloudflare Tunnel → QR works from ANY phone on ANY network     ║
╚══════════════════════════════════════════════════════════════════╝

HOW THE QR DOWNLOAD WORKS:
  1. Patient completes assessment in browser
  2. Browser builds PDF with jsPDF and POSTs it here
  3. Flask saves PDF to  static/reports/<unique>.pdf
  4. Flask returns a Cloudflare HTTPS URL for that file
  5. QR is generated from that URL
  6. Any phone anywhere scans QR → PDF downloads instantly
  7. PDFs auto-deleted after 24 hours

ONE-TIME SETUP (2 minutes):
  STEP 1 — Download cloudflared.exe
    Windows: https://github.com/cloudflare/cloudflared/releases/latest
             download cloudflared-windows-amd64.exe
             rename to cloudflared.exe
             place in THIS folder (same folder as app.py)
    Mac:   brew install cloudflared
    Linux: wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O cloudflared && chmod +x cloudflared

  STEP 2 — Install packages
    pip install flask flask-cors joblib numpy scikit-learn

  STEP 3 — Run
    python app.py

  You will see:
    [Tunnel] Starting Cloudflare tunnel...
    [Tunnel] Public URL: https://xxxx.trycloudflare.com
    * Running on http://0.0.0.0:5000
"""

from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import joblib, numpy as np, os, base64, uuid, subprocess
import threading, re, time, sys, socket
from pathlib import Path
from datetime import datetime

app = Flask(__name__)
CORS(app)

BASE        = Path(__file__).parent.resolve()
REPORTS_DIR = BASE / "static" / "reports"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)


# CLOUDFLARE TUNNEL
TUNNEL_URL    = None
_tunnel_ready = threading.Event()


def _find_cloudflared():
    exe   = "cloudflared.exe" if sys.platform == "win32" else "cloudflared"
    local = BASE / exe
    if local.exists():
        return str(local)
    import shutil
    return shutil.which("cloudflared")


def _start_tunnel():
    global TUNNEL_URL
    cf = _find_cloudflared()
    if not cf:
        print("\n[Tunnel] cloudflared NOT found — QR will use LAN IP (same Wi-Fi only)")
        print("[Tunnel] Download cloudflared-windows-amd64.exe from:")
        print("[Tunnel]   https://github.com/cloudflare/cloudflared/releases/latest")
        print("[Tunnel] Rename to cloudflared.exe and place next to app.py\n")
        _tunnel_ready.set()
        return
    print("[Tunnel] Starting Cloudflare tunnel...")
    try:
        proc = subprocess.Popen(
            [cf, "tunnel", "--url", "http://localhost:5000"],
            stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
            text=True, bufsize=1,
        )
        for line in proc.stdout:
            m = re.search(r"https://[a-z0-9\-]+\.trycloudflare\.com", line)
            if m:
                TUNNEL_URL = m.group(0)
                print(f"[Tunnel] Public URL: {TUNNEL_URL}")
                print(f"[Tunnel] QR works from ANY phone on ANY network\n")
                _tunnel_ready.set()
                break
        for _ in proc.stdout:
            pass
    except Exception as e:
        print(f"[Tunnel] Error: {e}")
        _tunnel_ready.set()


def _get_lan_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


def _cleanup_loop():
    while True:
        time.sleep(3600)
        cutoff = time.time() - 86400
        for f in REPORTS_DIR.glob("*.pdf"):
            try:
                if f.stat().st_mtime < cutoff:
                    f.unlink()
                    print(f"[Cleanup] Deleted {f.name}")
            except Exception:
                pass


# ML MODELS
def _load(name):
    p = BASE / name
    return joblib.load(p) if p.exists() else None

models = {
    "Diabetes Mellitus":      _load("train_model/rf_diabetes.pkl"),
    "Hypertension":           _load("train_model/rf_hypertension.pkl"),
    "Cardiovascular Disease": _load("train_model/rf_cvd.pkl"),
}
imputers = {
    "Diabetes Mellitus":      _load("train_model/imputer_diabetes.pkl"),
    "Hypertension":           _load("train_model/imputer_hypertension.pkl"),
    "Cardiovascular Disease": _load("train_model/imputer_cvd.pkl"),
}

DISEASE_INFO = {
    "Diabetes Mellitus": {
        "icon":"🩸","color":"#f59e0b",
        "description":"Diabetes is a chronic condition where the body cannot regulate blood sugar. Type 2 is largely preventable.",
        "symptoms":"Increased thirst, frequent urination, fatigue, blurred vision.",
        "prevention":["Maintain healthy weight","Exercise 30 min/day","Eat low-GI foods","Avoid sugary drinks","Monitor blood sugar"],
        "doctor_advice":"Get HbA1c tested annually if you have risk factors.",
        "key_factors":["High blood sugar","BMI over 25","Family history","Sedentary lifestyle","Poor diet"],
        "exercise":[{"icon":"🚶","title":"Daily Walks","desc":"30 min brisk walking improves insulin sensitivity by 35%"},{"icon":"🏊","title":"Swimming","desc":"Low-impact cardio 3x/week"},{"icon":"🏋️","title":"Resistance Training","desc":"Weights 2x/week"}],
        "diet":[{"icon":"🥦","title":"Low-GI Foods","desc":"Whole grains over refined carbs"},{"icon":"🚫","title":"Avoid Sugar","desc":"Cut sugary drinks"},{"icon":"🫐","title":"Antioxidants","desc":"Berries, nuts reduce insulin resistance"}],
        "lifestyle":[{"icon":"⚖️","title":"Lose 5-7% Weight","desc":"Reduces diabetes risk by 58%"},{"icon":"😴","title":"Sleep 7-8 hrs","desc":"Poor sleep raises blood sugar"},{"icon":"🧘","title":"Manage Stress","desc":"Cortisol spikes blood sugar"}],
        "sources":[{"name":"American Diabetes Association","url":"https://diabetes.org"},{"name":"WHO — Diabetes","url":"https://www.who.int/health-topics/diabetes"},{"name":"CDC Prevention","url":"https://www.cdc.gov/diabetes/prevention"}],
    },
    "Hypertension": {
        "icon":"💓","color":"#ef4444",
        "description":"Hypertension rarely has symptoms but greatly raises stroke and heart attack risk.",
        "symptoms":"Often none. Occasional headaches, dizziness, nosebleeds.",
        "prevention":["Reduce sodium intake","Exercise regularly","Limit alcohol","Quit smoking","Manage stress"],
        "doctor_advice":"Check blood pressure at least once a year.",
        "key_factors":["High sodium","Stress","Obesity","Sedentary lifestyle","Smoking"],
        "exercise":[{"icon":"🚴","title":"Cycling","desc":"5x/week lowers systolic BP by 4-9 mmHg"},{"icon":"🏃","title":"Aerobic Cardio","desc":"20-30 min most days"},{"icon":"🧘","title":"Yoga","desc":"Reduces both BP values"}],
        "diet":[{"icon":"🧂","title":"Reduce Sodium","desc":"Under 1500mg/day"},{"icon":"🍌","title":"DASH Diet","desc":"Fruits, veggies, low-fat dairy"},{"icon":"🫀","title":"Omega-3","desc":"Fatty fish & walnuts"}],
        "lifestyle":[{"icon":"🚬","title":"Quit Smoking","desc":"Effects within 48 hours"},{"icon":"🍷","title":"Limit Alcohol","desc":"Max 1-2 drinks/day"},{"icon":"🎵","title":"Relaxation","desc":"Deep breathing lowers BP"}],
        "sources":[{"name":"American Heart Association","url":"https://www.heart.org"},{"name":"WHO — Hypertension","url":"https://www.who.int/health-topics/hypertension"},{"name":"Mayo Clinic","url":"https://www.mayoclinic.org/diseases-conditions/high-blood-pressure"}],
    },
    "Cardiovascular Disease": {
        "icon":"❤️","color":"#ec4899",
        "description":"CVD is the #1 global cause of death — yet largely preventable through lifestyle.",
        "symptoms":"Chest pain, shortness of breath, fatigue, irregular heartbeat.",
        "prevention":["Stop smoking","Control blood pressure","Heart-healthy diet","Exercise regularly","Manage cholesterol"],
        "doctor_advice":"Annual lipid panel and ECG recommended if over 40 or high risk.",
        "key_factors":["High cholesterol","Hypertension","Smoking","Diabetes Mellitus","Family history"],
        "exercise":[{"icon":"🏃","title":"Cardio 150 min/wk","desc":"Reduces CVD risk by 35%"},{"icon":"🚵","title":"HIIT","desc":"Improves heart efficiency"},{"icon":"🤸","title":"Flexibility","desc":"Improves blood vessel health"}],
        "diet":[{"icon":"🫒","title":"Mediterranean Diet","desc":"Gold standard for heart health"},{"icon":"🥑","title":"Healthy Fats","desc":"Avocados, nuts, seeds"},{"icon":"🍓","title":"Plant Foods","desc":"5+ servings/day cuts risk 20%"}],
        "lifestyle":[{"icon":"🚭","title":"Stop Smoking","desc":"Halves CVD risk in 1 year"},{"icon":"🏥","title":"Annual Checkups","desc":"Monitor cholesterol & BP"},{"icon":"😊","title":"Social Bonds","desc":"Reduces mortality 29%"}],
        "sources":[{"name":"American Heart Association","url":"https://www.heart.org"},{"name":"WHO — CVD","url":"https://www.who.int/health-topics/cardiovascular-diseases"},{"name":"European Heart Journal","url":"https://academic.oup.com/eurheartj"}],
    },
}


def questionnaire_to_vector(r):
    ht  = float(r.get("height_cm", 165))
    wt  = float(r.get("weight_kg", 70))
    bmi = round(wt / (ht / 100) ** 2, 1)
    def f(k, d):
        v = r.get(k, d)
        return d if (v is None or v == -1) else float(v)
    return [
        f("age",35), f("sex",0), bmi,
        f("exercise",1), f("diet",1), f("smoke",2),
        f("sleep",2), f("stress",1), f("water",1),
        max(f("fam_dm",0),0), max(f("fam_cvd",0),0),
        max(f("bp",1),0), max(f("sugar",1),0), max(f("chol",0),0),
    ]

def simulate_improved(v):
    v = list(v)
    v[3]=min(v[3]+1.5,3); v[4]=min(v[4]+1.5,3); v[5]=min(v[5]+1.0,3)
    v[6]=min(v[6]+0.5,3); v[7]=min(v[7]+1.0,3); v[8]=min(v[8]+0.5,2)
    return v

def predict(vector):
    results = {}
    for disease, model in models.items():
        if not model or not imputers[disease]:
            results[disease] = {"current":50.0,"improved":30.0,"worsened":72.0}
            continue
        def prob_of(vec):
            x = np.array(vec, dtype=float).reshape(1,-1)
            x = imputers[disease].transform(x)
            return round(model.predict_proba(x)[0][1]*100, 1)
        cur   = prob_of(vector)
        imp   = prob_of(simulate_improved(vector))
        wor_v = list(vector)
        wor_v[3]=max(wor_v[3]-1,0); wor_v[4]=max(wor_v[4]-1,0); wor_v[5]=max(wor_v[5]-1,0)
        wor   = prob_of(wor_v)
        results[disease] = {"current":cur,"improved":imp,"worsened":wor}
    return results


# FLASK ROUTES

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/predict", methods=["POST"])
def api_predict():
    data    = request.json or {}
    vector  = questionnaire_to_vector(data)
    results = predict(vector)
    highest = max(results, key=lambda k: results[k]["current"])
    bmi     = round(float(data.get("weight_kg",70)) /
                    (float(data.get("height_cm",165))/100)**2, 1)
    return jsonify({
        "risks":        results,
        "highest":      highest,
        "disease_info": DISEASE_INFO[highest],
        "all_info":     DISEASE_INFO,
        "bmi":          bmi,
        "generated_at": datetime.now().strftime("%B %d, %Y at %I:%M %p"),
    })


@app.route("/api/tunnel-status")
def api_tunnel_status():
    return jsonify({
        "ready":      TUNNEL_URL is not None,
        "tunnel_url": TUNNEL_URL,
        "mode":       "tunnel" if TUNNEL_URL else "lan",
        "lan_ip":     _get_lan_ip(),
    })


@app.route("/api/upload-report", methods=["POST"])
def api_upload_report():
    data    = request.json or {}
    pdf_b64 = data.get("pdf_base64", "")
    rid     = data.get("report_id", "report")

    if not pdf_b64:
        return jsonify({"error": "No PDF data received"}), 400

    if "," in pdf_b64:
        pdf_b64 = pdf_b64.split(",", 1)[1]

    try:
        pdf_bytes = base64.b64decode(pdf_b64)
    except Exception as e:
        return jsonify({"error": f"Invalid base64: {e}"}), 400

    filename = f"CDP_{uuid.uuid4().hex[:14]}.pdf"
    (REPORTS_DIR / filename).write_bytes(pdf_bytes)
    print(f"[Report] Saved {filename} ({len(pdf_bytes)//1024} KB)")

    if TUNNEL_URL:
        download_url = f"{TUNNEL_URL}/static/reports/{filename}"
        mode = "tunnel"
    else:
        download_url = f"http://{_get_lan_ip()}:5000/static/reports/{filename}"
        mode = "lan"

    print(f"[Report] URL ({mode}): {download_url}")
    return jsonify({
        "download_url": download_url,
        "mode":         mode,
        "method":       "Cloudflare Tunnel" if mode == "tunnel" else "Local Network",
    })


if __name__ == "__main__":
    print("\n╔══════════════════════════════════════════════╗")
    print("║   Chronic Disease Predictor                  ║")
    print("╚══════════════════════════════════════════════╝\n")

    threading.Thread(target=_start_tunnel, daemon=True).start()
    threading.Thread(target=_cleanup_loop, daemon=True).start()

    print("[App] Waiting for Cloudflare tunnel (max 15s)...")
    _tunnel_ready.wait(timeout=15)

    if TUNNEL_URL:
        print(f"[App] QR works from ANY network → {TUNNEL_URL}")
    else:
        print(f"[App] Same-network QR only (LAN: {_get_lan_ip()}:5000)")
        print("[App] Place cloudflared.exe next to app.py for cross-network QR")

    print("\n[App] Open browser → http://localhost:5000\n")
    app.run(host="0.0.0.0", port=5000, debug=False)
