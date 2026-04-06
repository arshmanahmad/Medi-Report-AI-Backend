"""
Incremental learning: log rule-engine outcomes to training_data.json and
optionally trigger RandomForest retraining (see train_model.py).
"""
import json
import threading
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parent / "data" / "training_data.json"
_file_lock = threading.Lock()

RISK_ORDER = {"High": 3, "Moderate": 2, "Low": 1}


def _max_risk_from_predictions(predictions: list) -> str:
    best = "Low"
    for p in predictions:
        rl = p.get("riskLevel", "Low")
        if RISK_ORDER.get(rl, 0) > RISK_ORDER.get(best, 0):
            best = rl
    return best


def append_training_sample(test_values: dict, predictions: list) -> int:
    """
    Append one labeled row (weak label = max risk from current rules).
    Returns total row count after append.
    """
    if not predictions:
        return _count_rows()

    row = {
        "test_values": dict(test_values),
        "risk_level": _max_risk_from_predictions(predictions),
        "source": "rule_engine",
    }

    with _file_lock:
        data: list = []
        if DATA_PATH.exists():
            try:
                with open(DATA_PATH, "r", encoding="utf-8") as f:
                    data = json.load(f)
            except (json.JSONDecodeError, OSError):
                data = []
        if not isinstance(data, list):
            data = []
        data.append(row)
        DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(DATA_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        n = len(data)

    if n >= 10 and n % 25 == 0:
        _retrain_async()

    return n


def _count_rows() -> int:
    if not DATA_PATH.exists():
        return 0
    try:
        with open(DATA_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        return len(data) if isinstance(data, list) else 0
    except (json.JSONDecodeError, OSError):
        return 0


def _retrain_async() -> None:
    def run() -> None:
        try:
            from train_model import train_and_save

            train_and_save()
        except Exception as e:
            print(f"[learning] Auto-retrain skipped: {e}")

    t = threading.Thread(target=run, daemon=True)
    t.start()


def predict_ml_overall_risk(test_values: dict):
    """If a trained joblib model exists, predict overall risk label."""
    model_path = Path(__file__).resolve().parent / "models" / "disease_model.joblib"
    if not model_path.exists():
        return None
    try:
        import joblib
    except ImportError:
        return None
    try:
        bundle = joblib.load(model_path)
        clf = bundle["model"]
        features = bundle["features"]
        le = bundle["encoder"]
        x = [float(test_values.get(k, 0)) for k in features]
        pred = clf.predict([x])[0]
        return str(le.inverse_transform([pred])[0])
    except Exception:
        return None
