from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI(
    title="Retail Stock Behavior API",
    description="Backend API to serve customer behavior predictions to the dashboard.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/predict")
async def predict(
    file: UploadFile = File(...),
    periodicity: str = Form("monthly"),
):
    """
    Placeholder prediction endpoint.

    In a full implementation, this endpoint would:
    - Parse the uploaded CSV
    - Build the same features as in the notebooks
    - Load the trained RF/XGBoost model (pickle/joblib)
    - Return real forecasts and churn scores
    """
    # Read file just to validate request
    _ = await file.read()

    mock_response = {
        "horizon": "Next 6 months" if periodicity == "monthly" else "Next 3 years",
        "forecastSummary": (
            "Demand is predicted to peak in the upcoming festive months with stable "
            "baseline sales otherwise."
            if periodicity == "monthly"
            else "Revenue is expected to grow moderately year-on-year with stronger demand in Q4."
        ),
        "churnSummary": (
            "High-value customers show low churn risk; focus retention campaigns on "
            "medium-spend customers with high recency."
        ),
    }

    return JSONResponse(content=mock_response)


