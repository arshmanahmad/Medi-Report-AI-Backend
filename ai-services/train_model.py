"""
Optional: Train/retrain ML model from data/training_data.json.
Add rows with test_values and risk_level to improve predictions over time.
Run: python train_model.py
"""
import json
from pathlib import Path

MODEL_DIR = Path(__file__).resolve().parent
DATA_PATH = MODEL_DIR / "data" / "training_data.json"
MODELS_DIR = MODEL_DIR / "models"
MODEL_PATH = MODELS_DIR / "disease_model.joblib"

FEATURES = [
    "glucose", "urea", "creatinine", "hemoglobin", "platelets",
    "wbc", "rbc", "alt", "ast", "bilirubin", "albumin",
    "sodium", "potassium", "cholesterol", "hdl", "ldl", "triglycerides",
]


def load_training_data():
    if not DATA_PATH.exists():
        return []
    with open(DATA_PATH, "r") as f:
        return json.load(f)


def train_and_save():
    data = load_training_data()
    if len(data) < 10:
        print("Add at least 10 labeled samples to data/training_data.json to train. Skipping.")
        return

    try:
        import numpy as np
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.preprocessing import LabelEncoder
        import joblib
    except ImportError:
        print("Install: pip install numpy scikit-learn joblib")
        return

    X = []
    y = []
    for row in data:
        x_row = [row.get("test_values", {}).get(k, 0) for k in FEATURES]
        if len(x_row) != len(FEATURES):
            continue
        label = row.get("risk_level") or row.get("overall_risk") or "Low"
        X.append(x_row)
        y.append(label)

    if len(X) < 10:
        print("Not enough valid rows. Skipping.")
        return

    X = np.array(X, dtype=float)
    le = LabelEncoder()
    y_enc = le.fit_transform(y)
    clf = RandomForestClassifier(n_estimators=50, random_state=42)
    clf.fit(X, y_enc)

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": clf, "encoder": le, "features": FEATURES}, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")


if __name__ == "__main__":
    train_and_save()
