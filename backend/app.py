from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from io import BytesIO
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score

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
    Parse the uploaded CSV and return REAL insights based on that file.
    No hard-coded mock values – everything comes from the data.
    """
    content = await file.read()
    
    # DEBUG: Log file information
    print(f"\n=== FILE UPLOAD DEBUG ===")
    print(f"Filename: {file.filename}")
    print(f"File size: {len(content)} bytes")
    print(f"Content type: {file.content_type}")
    
    try:
        df = pd.read_csv(BytesIO(content))
        print(f"DataFrame shape: {df.shape}")
        print(f"Columns: {list(df.columns)}")
    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={"error": f"Failed to parse CSV: {str(e)}"}
        )

    # Flexible column name handling
    date_col_candidates = ["date", "Date", "InvoiceDate"]
    revenue_col_candidates = ["revenue", "Revenue", "TotalPrice", "Sales", "Amount"]
    qty_col_candidates = ["quantity", "Quantity", "qty", "Qty"]
    customer_col_candidates = ["customer_id", "CustomerID", "customer", "Customer"]
    product_col_candidates = ["product_id", "StockCode", "product", "ProductID"]

    def pick_col(candidates):
        for c in candidates:
            if c in df.columns:
                return c
        return None

    date_col = pick_col(date_col_candidates)
    revenue_col = pick_col(revenue_col_candidates)
    qty_col = pick_col(qty_col_candidates)
    cust_col = pick_col(customer_col_candidates)
    prod_col = pick_col(product_col_candidates)

    # If the CSV doesn't match expected schema, return a clear 400 error
    if not (date_col and revenue_col and qty_col and cust_col and prod_col):
        return JSONResponse(
            status_code=400,
            content={
                "error": "CSV does not contain required columns.",
                "required_like": {
                    "date": date_col_candidates,
                    "revenue": revenue_col_candidates,
                    "quantity": qty_col_candidates,
                    "customer": customer_col_candidates,
                    "product": product_col_candidates,
                },
                "received_columns": list(df.columns),
            },
        )

    # Clean numeric fields
    df[revenue_col] = pd.to_numeric(df[revenue_col], errors="coerce").fillna(0)
    df[qty_col] = pd.to_numeric(df[qty_col], errors="coerce").fillna(0)

    # Parse dates if present
    try:
        df[date_col] = pd.to_datetime(df[date_col], errors="coerce")
    except Exception:
        pass

    total_revenue = float(df[revenue_col].sum())
    total_quantity = int(df[qty_col].sum())
    unique_customers = int(df[cust_col].nunique())
    unique_products = int(df[prod_col].nunique())

    # Top product by revenue
    prod_rev = df.groupby(prod_col)[revenue_col].sum().sort_values(ascending=False)
    top_product_id = str(prod_rev.index[0])
    top_product_revenue = float(prod_rev.iloc[0])
    
    # DEBUG: Log top results
    print(f"Top product ID: {top_product_id}, Revenue: {top_product_revenue}")
    print(f"Top 5 products: {[str(x) for x in prod_rev.head(5).index.tolist()]}")

    # Top product by quantity
    prod_qty = df.groupby(prod_col)[qty_col].sum().sort_values(ascending=False)
    top_qty_product_id = str(prod_qty.index[0])
    top_qty = int(prod_qty.iloc[0])

    # Highest earning customer
    cust_rev = df.groupby(cust_col)[revenue_col].sum().sort_values(ascending=False)
    top_customer_id = str(cust_rev.index[0])
    top_customer_revenue = float(cust_rev.iloc[0])
    
    # DEBUG: Log top results
    print(f"Top customer ID: {top_customer_id}, Revenue: {top_customer_revenue}")
    print(f"Top 5 customers: {[str(x) for x in cust_rev.head(5).index.tolist()]}")
    print("=" * 50)

    # Most frequent customer (by transactions)
    cust_freq = df[cust_col].value_counts()
    most_freq_customer_id = str(cust_freq.index[0])
    most_freq_visits = int(cust_freq.iloc[0])

    # Top 5 customers by revenue
    top_5_customers = []
    for idx, (cust_id, rev) in enumerate(cust_rev.head(5).items()):
        visit_count = int(cust_freq.get(cust_id, 0))
        top_5_customers.append({
            "rank": idx + 1,
            "customerId": str(cust_id),
            "revenue": float(rev),
            "visits": visit_count,
            "avgSpendPerVisit": float(rev / visit_count) if visit_count > 0 else 0.0
        })

    # Top 5 products by revenue
    top_5_products_rev = []
    for idx, (prod_id, rev) in enumerate(prod_rev.head(5).items()):
        qty = int(prod_qty[prod_id]) if prod_id in prod_qty.index else 0
        top_5_products_rev.append({
            "rank": idx + 1,
            "productId": str(prod_id),
            "revenue": float(rev),
            "quantity": qty,
            "avgPrice": float(rev / qty) if qty > 0 else 0.0
        })

    # Customer segmentation (high/medium/low spenders)
    customer_revenues = df.groupby(cust_col)[revenue_col].sum()
    high_threshold = customer_revenues.quantile(0.8)
    medium_threshold = customer_revenues.quantile(0.5)
    
    high_spenders = int((customer_revenues >= high_threshold).sum())
    medium_spenders = int(((customer_revenues >= medium_threshold) & (customer_revenues < high_threshold)).sum())
    low_spenders = int((customer_revenues < medium_threshold).sum())

    # Average transaction value
    avg_transaction_value = float(df[revenue_col].mean())
    median_transaction_value = float(df[revenue_col].median())

    # Customer purchase frequency stats
    avg_visits_per_customer = float(cust_freq.mean())
    median_visits_per_customer = float(cust_freq.median())

    # Simple data-driven text summary
    avg_record_revenue = float(df[revenue_col].mean())
    max_record_revenue = float(df[revenue_col].max())
    min_record_revenue = float(df[revenue_col].min())

    forecast_summary = (
        f"Across the uploaded report, total revenue is Rs{total_revenue:,.0f} "
        f"over {len(df):,} records, with an average of Rs{avg_record_revenue:,.0f} "
        f"per record. The highest single-record revenue is Rs{max_record_revenue:,.0f} "
        f"and the lowest is Rs{min_record_revenue:,.0f}. Use these patterns to plan "
        "stock levels and staffing for similar periods."
    )

    churn_summary = (
        f"Based on this report, focus retention on customers whose spend or visit "
        f"frequency is dropping between periods, especially compared to your top "
        f"earners like customer {top_customer_id} (who spent Rs{top_customer_revenue:,.0f}). "
        f"Product {top_product_id} generated the highest revenue (Rs{top_product_revenue:,.0f}), "
        f"while product {top_qty_product_id} sold the most units ({top_qty:,})."
    )

    # ------------------------------------------------------------------
    # Random Forest customer churn modeling (classification)
    # ------------------------------------------------------------------
    rf_results = {
        "modelUsed": False,
        "description": (
            "Random Forest is an ensemble machine learning algorithm for classification "
            "and regression. It builds many decision trees on different subsets of the data "
            "and averages their results (or takes a majority vote) to improve accuracy and "
            "reduce overfitting. Here it is used to predict which customers are at higher "
            "risk of churn based on recency, frequency and monetary value."
        ),
    }

    try:
        # Build customer-level features: recency, frequency, total spend
        reference_date = df[date_col].max() + pd.Timedelta(days=1)
        cust_last_purchase = df.groupby(cust_col)[date_col].max()
        recency = (reference_date - cust_last_purchase).dt.days

        # Align frequency and revenue with the same customer index
        freq_aligned = cust_freq.reindex(cust_last_purchase.index).fillna(0)
        rev_aligned = cust_rev.reindex(cust_last_purchase.index).fillna(0.0)

        customer_features = pd.DataFrame(
            {
                "customerId": cust_last_purchase.index.astype(str),
                "Recency": recency.astype("int64"),
                "Frequency": freq_aligned.astype("int64"),
                "TotalSpent": rev_aligned.astype("float64"),
            }
        )

        # Define churn label: customers with Recency > 90 days are treated as churned
        customer_features["Churned"] = (
            customer_features["Recency"] > 90
        ).astype(int)

        # Only train the model if we have enough variation in the label
        if customer_features["Churned"].nunique() > 1 and len(customer_features) >= 20:
            feature_cols = ["Recency", "Frequency", "TotalSpent"]
            X = customer_features[feature_cols]
            y = customer_features["Churned"]

            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.3, random_state=42, stratify=y
            )

            rf = RandomForestClassifier(
                n_estimators=200,
                max_depth=None,
                random_state=42,
                class_weight="balanced_subsample",
            )
            rf.fit(X_train, y_train)

            y_pred = rf.predict(X_test)
            y_proba = rf.predict_proba(X_test)[:, 1]

            accuracy = float(accuracy_score(y_test, y_pred))
            try:
                roc_auc = float(roc_auc_score(y_test, y_proba))
            except ValueError:
                roc_auc = None

            feature_importances = {
                col: float(imp)
                for col, imp in zip(feature_cols, rf.feature_importances_)
            }

            # Estimate churn probability for all customers and surface top 5 at-risk
            all_proba = rf.predict_proba(X)[:, 1]
            customer_features["churnProbability"] = all_proba

            top_at_risk = (
                customer_features.sort_values(
                    "churnProbability", ascending=False
                )
                .head(5)
                .reset_index(drop=True)
            )

            top_at_risk_list = []
            for _, row in top_at_risk.iterrows():
                top_at_risk_list.append(
                    {
                        "customerId": str(row["customerId"]),
                        "recencyDays": int(row["Recency"]),
                        "frequency": int(row["Frequency"]),
                        "totalSpent": float(row["TotalSpent"]),
                        "churnProbability": float(row["churnProbability"]),
                    }
                )

            rf_results.update(
                {
                    "modelUsed": True,
                    "accuracy": accuracy,
                    "rocAuc": roc_auc,
                    "featureImportances": feature_importances,
                    "topAtRiskCustomers": top_at_risk_list,
                }
            )
        else:
            rf_results.update(
                {
                    "reason": (
                        "Not enough variation in churn behaviour in this file to train a "
                        "reliable Random Forest model."
                    )
                }
            )
    except Exception as e:
        rf_results.update(
            {
                "reason": f"Random Forest model could not be trained on this file: {str(e)}"
            }
        )

    response = {
        "horizon": "Next 6 months" if periodicity == "monthly" else "Next 3 years",
        "forecastSummary": forecast_summary,
        "churnSummary": churn_summary,
        "kpis": {
            "totalRevenue": total_revenue,
            "totalQuantity": total_quantity,
            "uniqueCustomers": unique_customers,
            "uniqueProducts": unique_products,
            "avgTransactionValue": avg_transaction_value,
            "medianTransactionValue": median_transaction_value,
        },
        "topInsights": {
            "topProductByRevenue": {
                "productId": top_product_id,
                "revenue": top_product_revenue,
            },
            "topProductByQuantity": {
                "productId": top_qty_product_id,
                "quantity": top_qty,
            },
            "highestEarningCustomer": {
                "customerId": top_customer_id,
                "revenue": top_customer_revenue,
            },
            "mostFrequentCustomer": {
                "customerId": most_freq_customer_id,
                "visits": most_freq_visits,
            },
        },
        "detailedInsights": {
            "top5Customers": top_5_customers,
            "top5Products": top_5_products_rev,
            "customerSegmentation": {
                "highSpenders": high_spenders,
                "mediumSpenders": medium_spenders,
                "lowSpenders": low_spenders,
                "highSpenderThreshold": float(high_threshold),
                "mediumSpenderThreshold": float(medium_threshold),
            },
            "purchaseFrequency": {
                "avgVisitsPerCustomer": avg_visits_per_customer,
                "medianVisitsPerCustomer": median_visits_per_customer,
            },
        },
        "randomForestModel": rf_results,
    }

    return JSONResponse(content=response)
