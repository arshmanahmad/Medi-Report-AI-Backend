# Testing the AI service (`http://127.0.0.1:5000`)

## 1. Start the service

```powershell
cd Medi-Report-AI-Backend\ai-services
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

You should see: `Running on http://127.0.0.1:5000`

---

## 2. Quick checks

| What | How |
|------|-----|
| **Alive** | Browser: `http://127.0.0.1:5000/health` → JSON `status: ok` |
| **Predict help** | Browser: `http://127.0.0.1:5000/predict` → explains you need **POST** |

**Important:** `/predict` does **not** work by pasting the URL in the browser — that only sends **GET**. You must send **POST** with a JSON body.

---

## 3. Test POST /predict (PowerShell)

Save as `body.json` next to this folder, or use `-Body` inline:

```powershell
$body = @{
  test_values = @{
    glucose = 95; urea = 25; creatinine = 0.9; hemoglobin = 14.5
    platelets = 250000; wbc = 7000; rbc = 4.5; alt = 30; ast = 28
    bilirubin = 0.8; albumin = 4.2; sodium = 140; potassium = 4.0
    cholesterol = 180; hdl = 55; ldl = 110; triglycerides = 120
  }
  selected_disease = $null
  user_id = $null
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri "http://127.0.0.1:5000/predict" -Method Post -Body $body -ContentType "application/json"
```

---

## 4. curl with the sample file (from `ai-services` folder)

```bash
curl -s -X POST http://127.0.0.1:5000/predict -H "Content-Type: application/json" -d @sample_predict.json
```

## 5. curl one-liner (Git Bash or WSL)

```bash
curl -s -X POST http://127.0.0.1:5000/predict \
  -H "Content-Type: application/json" \
  -d "{\"test_values\":{\"glucose\":95,\"urea\":25,\"creatinine\":0.9,\"hemoglobin\":14.5,\"platelets\":250000,\"wbc\":7000,\"rbc\":4.5,\"alt\":30,\"ast\":28,\"bilirubin\":0.8,\"albumin\":4.2,\"sodium\":140,\"potassium\":4.0,\"cholesterol\":180,\"hdl\":55,\"ldl\":110,\"triglycerides\":120},\"selected_disease\":null,\"user_id\":null}"
```

---

## 6. Postman / Thunder Client

- **Method:** `POST`
- **URL:** `http://127.0.0.1:5000/predict`
- **Headers:** `Content-Type` = `application/json`
- **Body:** raw → JSON → paste your JSON object

---

## 7. If you still get no response

- Confirm `python app.py` is running (no crash in the terminal).
- Try `http://127.0.0.1:5000/health` first.
- Another app may be using port **5000** — change port: `set PORT=5001` then `python app.py`, and set backend `AI_SERVICE_URL=http://127.0.0.1:5001`.
