import sys
import json
from sklearn.linear_model import LinearRegression
import numpy as np

try:
    print("✅ Python script started", file=sys.stderr)

    data = json.load(sys.stdin)
    print("📦 Received data:", data, file=sys.stderr)

    days = np.array(data["days"]).reshape(-1, 1)
    amounts = np.array(data["amounts"])

    model = LinearRegression()
    model.fit(days, amounts)

    next_day = np.array([[max(data["days"]) + 1]])
    prediction = model.predict(next_day)[0]

    print(json.dumps({ "forecast": round(prediction, 2) }))
except Exception as e:
    print(json.dumps({ "error": str(e) }))
    sys.exit(1)
