"""
Disease prediction engine using medical constraints (rule-based).
Designed to be trainable: add data to data/training_data.json and run train_model.py to improve.
"""
from pathlib import Path

MODEL_DIR = Path(__file__).resolve().parent
MODEL_PATH = MODEL_DIR / "models" / "disease_model.joblib"
TRAINING_DATA_PATH = MODEL_DIR / "data" / "training_data.json"


def _get_float(d, key, default=0.0):
    v = d.get(key)
    if v is None:
        return default
    try:
        return float(v)
    except (TypeError, ValueError):
        return default


def _predict_diabetes(values):
    """Fasting glucose (mg/dL). Normal <100, Prediabetes 100-125, Diabetes >=126."""
    g = _get_float(values, "glucose", 90)
    if g >= 126:
        return "High", 0.85, "Elevated glucose indicates high diabetes risk. Consult a doctor for HbA1c and treatment."
    if g >= 100:
        return "Moderate", 0.55, "Borderline glucose. Monitor diet, reduce sugar and refined carbs; consider follow-up tests."
    return "Low", 0.15, "Glucose within normal range. Maintain healthy diet and activity."


def _predict_anemia(values):
    """Hemoglobin (g/dL). Below 12 suggests anemia risk."""
    hb = _get_float(values, "hemoglobin", 14)
    if hb < 12:
        return "High", 0.8, "Low hemoglobin suggests anemia. Iron-rich diet and possible supplementation; see a doctor."
    if hb < 13:
        return "Moderate", 0.45, "Hemoglobin slightly low. Increase iron-rich foods and vitamin C for absorption."
    return "Low", 0.2, "Hemoglobin is in normal range."


def _predict_kidney(values):
    """Creatinine and Urea. Elevated values suggest kidney stress."""
    cr = _get_float(values, "creatinine", 1.0)
    urea = _get_float(values, "urea", 25)
    if cr > 1.2 or urea > 40:
        return "High", 0.7, "Elevated creatinine or urea may indicate kidney function concern. Hydration and doctor review advised."
    if cr > 1.0:
        return "Moderate", 0.5, "Kidney markers slightly elevated. Stay well hydrated and limit excess protein/salt."
    return "Low", 0.2, "Kidney function markers appear normal."


def _predict_liver(values):
    """ALT, AST. Elevated enzymes suggest liver stress."""
    alt = _get_float(values, "alt", 30)
    ast = _get_float(values, "ast", 28)
    if alt > 40 or ast > 40:
        return "High", 0.75, "Elevated liver enzymes detected. Avoid alcohol and fatty foods; consult a hepatologist if persistent."
    return "Low", 0.25, "Liver enzyme levels within normal range."


def _predict_heart(values):
    """Lipid panel: cholesterol, LDL, HDL, triglycerides."""
    chol = _get_float(values, "cholesterol", 180)
    ldl = _get_float(values, "ldl", 110)
    hdl = _get_float(values, "hdl", 50)
    tg = _get_float(values, "triglycerides", 120)
    risk = 0
    if chol > 200:
        risk += 0.3
    if ldl > 130:
        risk += 0.3
    if hdl < 40:
        risk += 0.2
    if tg > 150:
        risk += 0.2
    if risk >= 0.6:
        return "High", 0.75, "Lipid profile suggests elevated cardiovascular risk. Diet, exercise, and possible statin under doctor guidance."
    if risk >= 0.3:
        return "Moderate", 0.5, "Some lipid levels need attention. Reduce saturated fat and increase fiber; recheck in 3 months."
    return "Low", 0.2, "Lipid profile appears healthy."


def _predict_infection(values):
    """WBC. High may indicate infection; low may indicate immune suppression."""
    wbc = _get_float(values, "wbc", 7000)
    if wbc > 11000:
        return "High", 0.75, "Elevated white blood cells may indicate infection or inflammation. Clinical correlation needed."
    if wbc < 4000:
        return "Moderate", 0.4, "Low WBC may suggest weakened immunity. Avoid infections; discuss with doctor if persistent."
    return "Low", 0.15, "White blood cell count within normal range."


def _predict_hypertension(values):
    """Proxy via sodium/potassium and lipids (no BP in lab)."""
    na = _get_float(values, "sodium", 140)
    k = _get_float(values, "potassium", 4.0)
    chol = _get_float(values, "cholesterol", 180)
    risk = 0
    if na > 145:
        risk += 0.3
    if k < 3.5:
        risk += 0.3
    if chol > 200:
        risk += 0.2
    if risk >= 0.5:
        return "Moderate", 0.5, "Electrolytes and lipids may contribute to hypertension risk. Limit salt; monitor BP regularly."
    return "Low", 0.2, "Electrolyte balance appears adequate."


DISEASE_CHECKS = {
    "Diabetes": _predict_diabetes,
    "Anemia": _predict_anemia,
    "Kidney Disorder": _predict_kidney,
    "Liver Disorder": _predict_liver,
    "Heart Disease": _predict_heart,
    "Infection": _predict_infection,
    "Hypertension": _predict_hypertension,
}


def _run_rule_predictions(test_values, selected_disease):
    predictions = []
    if selected_disease and selected_disease != "All Diseases":
        if selected_disease in DISEASE_CHECKS:
            level, prob, desc = DISEASE_CHECKS[selected_disease](test_values)
            predictions.append(
                {"disease": selected_disease, "riskLevel": level, "probability": prob, "description": desc}
            )
    else:
        for name, fn in DISEASE_CHECKS.items():
            level, prob, desc = fn(test_values)
            predictions.append(
                {"disease": name, "riskLevel": level, "probability": prob, "description": desc}
            )
    return predictions


def _salt_recommendations(predictions):
    recs = []
    high_risk = {p["disease"] for p in predictions if p["riskLevel"] == "High"}

    if "Diabetes" in high_risk:
        recs.append(
            {
                "saltName": "Metformin",
                "medicationName": "Metformin HCl",
                "safeStartingAge": 18,
                "dosage": "500mg once or twice daily as prescribed",
                "cautions": [
                    "May cause gastrointestinal upset; take with meals.",
                    "Not recommended in severe kidney disease; eGFR should be checked.",
                    "Avoid excessive alcohol; risk of lactic acidosis.",
                ],
                "whenNeeded": "When fasting glucose consistently ≥126 mg/dL or HbA1c ≥6.5%, as per doctor.",
            }
        )
    if "Anemia" in high_risk:
        recs.append(
            {
                "saltName": "Ferrous Sulfate",
                "medicationName": "Iron Supplement",
                "safeStartingAge": 12,
                "dosage": "325mg once daily (elemental iron); take with vitamin C for absorption",
                "cautions": [
                    "Take with food to reduce stomach upset.",
                    "May cause constipation; increase fiber and fluids.",
                    "Keep away from children; overdose is dangerous.",
                ],
                "whenNeeded": "When hemoglobin is below 12 g/dL and iron deficiency is confirmed.",
            }
        )
    if "Liver Disorder" in high_risk:
        recs.append(
            {
                "saltName": "Ursodeoxycholic Acid",
                "medicationName": "UDCA",
                "safeStartingAge": 18,
                "dosage": "300mg twice daily or as prescribed",
                "cautions": [
                    "Requires periodic liver function monitoring.",
                    "Not for use in pregnancy without doctor approval.",
                ],
                "whenNeeded": "When liver enzymes are significantly elevated and cause is identified by a hepatologist.",
            }
        )
    if "Heart Disease" in high_risk:
        recs.append(
            {
                "saltName": "Atorvastatin",
                "medicationName": "Lipitor (statin)",
                "safeStartingAge": 18,
                "dosage": "10–20 mg once daily, as prescribed",
                "cautions": [
                    "May cause muscle pain; report unexplained muscle weakness.",
                    "Avoid grapefruit in large amounts.",
                    "Liver function tests recommended periodically.",
                ],
                "whenNeeded": "When LDL or cardiovascular risk is high despite diet and lifestyle changes.",
            }
        )
    return recs


def _diet_plan(predictions):
    has_diabetes = any(p["disease"] == "Diabetes" for p in predictions)
    has_liver = any(p["disease"] == "Liver Disorder" for p in predictions)
    has_anemia = any(p["disease"] == "Anemia" for p in predictions)
    high_count = sum(1 for p in predictions if p["riskLevel"] == "High")

    foods_to_eat = [
        "Fresh vegetables (leafy greens, broccoli, carrots)",
        "Whole grains (brown rice, oats, quinoa)",
        "Lean proteins (chicken, fish, legumes)",
        "Fresh fruits (berries, apples, citrus)",
        "Nuts and seeds (almonds, walnuts, chia seeds)",
        "Low-fat dairy",
    ]
    if has_diabetes:
        foods_to_eat.extend(["High-fiber foods", "Low glycemic index foods"])
    if has_liver:
        foods_to_eat.extend(["Antioxidant-rich foods", "Green tea"])
    if has_anemia:
        foods_to_eat.extend(
            ["Iron-rich foods (spinach, lentils)", "Vitamin C with meals to boost iron absorption"]
        )

    foods_to_avoid = [
        "Processed and fast food",
        "Sugary drinks and desserts",
        "Excessive salt and sodium",
        "Limit red meat",
        "Refined carbohydrates (white bread, pasta)",
    ]
    if has_liver:
        foods_to_avoid.extend(["Alcohol", "Fried and very fatty foods"])

    routines = [
        "Drink 8–10 glasses of water daily (hydration targets).",
        "Exercise 30 minutes, 5 days a week.",
        "Sleep 7–8 hours nightly.",
        "Eat at regular intervals; avoid skipping meals.",
        "Stress management (e.g. walking, meditation).",
        "Regular health check-ups every 3–6 months.",
    ]

    duration = "Follow for 3–6 months, then reassess with repeat tests."
    if high_count > 0:
        duration = "Follow consistently for 4–6 months; recheck labs as advised by your doctor."

    meal_plan = {
        "breakfast": ["Oatmeal with berries", "Whole grain toast with avocado", "Green tea"],
        "lunch": ["Grilled chicken salad", "Quinoa bowl with vegetables", "Fresh fruit"],
        "dinner": ["Baked fish with steamed vegetables", "Brown rice", "Mixed greens"],
        "snacks": ["Nuts and seeds", "Greek yogurt", "Fresh fruit"],
    }

    return {
        "foodsToEat": foods_to_eat,
        "foodsToAvoid": foods_to_avoid,
        "healthyRoutines": routines,
        "duration": duration,
        "mealPlan": meal_plan,
    }


def _recovery_timeline(predictions):
    high_count = sum(1 for p in predictions if p["riskLevel"] == "High")
    if high_count > 0:
        duration = "4–6 months"
        improvement = 60
    else:
        duration = "2–3 months"
        improvement = 85

    milestones = [
        {"week": 2, "description": "Initial improvements in energy and routine adherence"},
        {"week": 4, "description": "Early changes in test markers possible with diet/lifestyle"},
        {"week": 8, "description": "Noticeable improvement in overall health indicators"},
        {"week": 12, "description": "Re-evaluation and repeat tests recommended"},
        {"week": 24, "description": "Target health goals and maintenance"},
    ]
    return {
        "estimatedDuration": duration,
        "milestones": milestones,
        "improvementPercentage": improvement,
    }


def run_predictions(test_values, selected_disease, user_id=None):
    """Main entry: run rule-based predictions, optional ML hint, incremental learning."""
    from learning import append_training_sample, predict_ml_overall_risk

    predictions = _run_rule_predictions(test_values, selected_disease)
    salt_recommendations = _salt_recommendations(predictions)
    diet_plan = _diet_plan(predictions)
    recovery_timeline = _recovery_timeline(predictions)

    training_samples = append_training_sample(test_values, predictions)
    ml_overall_risk = predict_ml_overall_risk(test_values)

    out = {
        "predictions": predictions,
        "saltRecommendations": salt_recommendations,
        "dietPlan": diet_plan,
        "recoveryTimeline": recovery_timeline,
        "learning": {
            "trainingSamplesLogged": training_samples,
            "mlModelActive": ml_overall_risk is not None,
        },
    }
    if ml_overall_risk is not None:
        out["mlOverallRisk"] = ml_overall_risk
    return out
