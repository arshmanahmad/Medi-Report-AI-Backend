"""
Medi Report AI - Python AI Service
Flask API for disease predictions, diet plans, medicine recommendations, recovery timeline.
"""
import os
from datetime import date
from flask import Flask, request, jsonify
from flask_cors import CORS

from prediction import run_predictions

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["GET"])
def index():
    return jsonify(
        {
            "service": "medi-report-ai-python",
            "endpoints": {
                "GET /health": "Liveness check",
                "GET /predict": "How to call POST /predict (read the JSON)",
                "POST /predict": "JSON body: test_values, selected_disease, user_id",
            },
        }
    )


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "medi-report-ai-python"})


@app.route("/predict", methods=["GET", "POST"])
def predict():
    if request.method == "GET":
        return jsonify(
            {
                "message": "This endpoint only returns predictions on POST.",
                "method": "POST",
                "url": request.url_root.rstrip("/") + "/predict",
                "headers": {"Content-Type": "application/json"},
                "body_keys": ["test_values", "selected_disease", "user_id"],
                "tip": "Opening this URL in a browser sends GET — use curl, Postman, or Thunder Client with POST.",
            }
        ), 200

    try:
        # force=True parses JSON even if client forgot Content-Type: application/json
        data = request.get_json(force=True, silent=True)
        if data is None:
            ct = request.content_type or "(missing)"
            return (
                jsonify(
                    {
                        "error": "Could not parse JSON body",
                        "hint": "Send header Content-Type: application/json and a valid JSON object.",
                        "content_type_received": ct,
                    }
                ),
                400,
            )

        test_values = data.get("test_values")
        selected_disease = data.get("selected_disease")
        user_id = data.get("user_id")

        if not test_values or not isinstance(test_values, dict):
            return jsonify({"error": "test_values required"}), 400

        result = run_predictions(test_values, selected_disease, user_id)
        result["testDate"] = date.today().isoformat()
        if user_id:
            result["userId"] = user_id

        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    # threaded=True avoids ECONNRESET when Node calls /predict while /health is in flight
    app.run(
        host="0.0.0.0",
        port=port,
        debug=debug,
        threaded=True,
        use_reloader=debug,
    )
