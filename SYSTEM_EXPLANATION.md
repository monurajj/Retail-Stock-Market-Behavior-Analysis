# Complete System Functionality Guide
## Retail Stock Market Behavior Analysis - Presentation Preparation

---

## 📋 Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Frontend (Next.js/React)](#frontend-nextjsreact)
3. [Backend (FastAPI)](#backend-fastapi)
4. [Data Flow & Processing](#data-flow--processing)
5. [Models & Analytics](#models--analytics)
6. [Complete User Journey](#complete-user-journey)
7. [Key Features Explained](#key-features-explained)

---

## 🏗️ System Architecture Overview

Your system follows a **3-tier architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                        │
│  - User Interface (React Components)                         │
│  - File Upload & Visualization                              │
│  - API Route Handler (/api/predict)                         │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP POST Request
                       │ (FormData: CSV file + periodicity)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              API ROUTE (/api/predict/route.ts)               │
│  - Receives request from frontend                            │
│  - Forwards to Python backend                                │
│  - Returns JSON response                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP POST Request
                       │ (Forwards FormData)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (FastAPI - Python)                      │
│  - Receives CSV file                                         │
│  - Parses and analyzes data                                  │
│  - Computes KPIs, insights, segmentation                     │
│  - Returns comprehensive JSON response                      │
└─────────────────────────────────────────────────────────────┘
```

**Technology Stack:**
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Recharts
- **Backend**: FastAPI (Python), Pandas, NumPy
- **Data Processing**: Pandas for CSV parsing and analysis
- **Visualization**: Recharts for interactive charts

---

## 🎨 Frontend (Next.js/React)

### **Main Component: `page.tsx`**

This is your main dashboard page. Here's how it works:

#### **1. State Management**
```typescript
- file: Stores the uploaded CSV file
- periodicity: "monthly" or "yearly" (affects forecast horizon)
- loading: Shows loading spinner during processing
- result: Stores the prediction response from backend
- error: Handles error messages
- csvSeries: Parsed CSV data for revenue trend chart
```

#### **2. File Upload Flow**

**Step 1: User selects CSV file**
- File input triggers `handleFileChange()`
- Uses **PapaParse** library to parse CSV client-side
- Extracts `date` and `revenue` columns (flexible column name matching)
- Stores parsed data in `csvSeries` for immediate visualization

**Step 2: User clicks "Run Prediction"**
- Form submission triggers `handleSubmit()`
- Creates FormData with:
  - CSV file
  - Periodicity selection
- Sends POST request to `/api/predict` (Next.js API route)
- Shows loading spinner (minimum 1 second for UX)

#### **3. Data Visualization**

The frontend displays multiple visualizations:

**a) KPI Cards (Top Section)**
- Total Revenue
- Total Quantity
- Unique Customers
- Unique Products
- All computed from backend response

**b) Revenue Trend Chart**
- Line chart showing revenue over time
- Uses parsed CSV data (`csvSeries`)
- Displays before prediction runs

**c) Analysis Results (After Prediction)**
- **Top 5 Customers Bar Chart**: Revenue and visits per customer
- **Top 5 Products Bar Chart**: Revenue and quantity per product
- **Customer Segmentation Pie Chart**: High/Medium/Low spenders
- **Top Insights Cards**: Quick stats on top products/customers

#### **4. UI Features**
- **Responsive Design**: Works on mobile, tablet, desktop
- **Loading States**: Spinner overlay during processing
- **Error Handling**: Displays user-friendly error messages
- **Interactive Charts**: Hover tooltips, zoom capabilities
- **Modern UI**: Tailwind CSS with gradient cards and shadows

---

## ⚙️ Backend (FastAPI)

### **Main File: `app.py`**

The backend is a **FastAPI** application that processes CSV files and returns insights.

#### **1. API Endpoint: `/api/predict`**

**Input:**
- `file`: CSV file (multipart/form-data)
- `periodicity`: "monthly" or "yearly" (form field)

**Processing Steps:**

**Step 1: CSV Parsing (REAL DATA)**
```python
- Reads uploaded file into memory (BytesIO)
- Uses Pandas to parse CSV: df = pd.read_csv(BytesIO(content))
- All subsequent calculations use this real data (df)
- Handles various column name formats:
  * date: "date", "Date", "InvoiceDate"
  * revenue: "revenue", "Revenue", "TotalPrice", "Sales", "Amount"
  * quantity: "quantity", "Quantity", "qty", "Qty"
  * customer: "customer_id", "CustomerID", "customer", "Customer"
  * product: "product_id", "StockCode", "product", "ProductID"
```

**Step 2: Data Validation**
- Checks if required columns exist
- Returns 400 error if columns are missing
- Cleans numeric fields (handles NaN, converts to float/int)

**Step 3: KPI Calculation**
```python
- totalRevenue: Sum of all revenue values
- totalQuantity: Sum of all quantity values
- uniqueCustomers: Count of distinct customer IDs
- uniqueProducts: Count of distinct product IDs
- avgTransactionValue: Mean revenue per transaction
- medianTransactionValue: Median revenue per transaction
```

**Step 4: Top Insights**
```python
- Top Product by Revenue: Groups by product, sums revenue, finds max
- Top Product by Quantity: Groups by product, sums quantity, finds max
- Highest Earning Customer: Groups by customer, sums revenue, finds max
- Most Frequent Customer: Counts transactions per customer, finds max
```

**Step 5: Detailed Analysis**

**a) Top 5 Customers:**
- Sorted by total revenue
- For each: rank, customerId, revenue, visits, avgSpendPerVisit

**b) Top 5 Products:**
- Sorted by total revenue
- For each: rank, productId, revenue, quantity, avgPrice

**c) Customer Segmentation:**
- Groups customers by total revenue
- Calculates percentiles:
  * High Spenders: Top 20% (80th percentile)
  * Medium Spenders: 50th-80th percentile
  * Low Spenders: Bottom 50%
- Returns counts and thresholds

**d) Purchase Frequency:**
- Calculates visits per customer
- Returns average and median visits

**Step 6: Text Summaries**
- **forecastSummary**: Data-driven summary of revenue patterns
- **churnSummary**: Insights on customer behavior and top performers

**Output:**
```json
{
  "horizon": "Next 6 months" or "Next 3 years",
  "forecastSummary": "...",
  "churnSummary": "...",
  "kpis": {...},
  "topInsights": {...},
  "detailedInsights": {...}
}
```

#### **2. CORS Configuration**
- Allows all origins (`*`) for development
- Enables credentials and all HTTP methods
- Necessary for frontend-backend communication

---

## 🔄 Data Flow & Processing

### **Complete Request-Response Cycle**

```
1. USER ACTION
   └─> Uploads CSV file
   └─> Selects "monthly" or "yearly"
   └─> Clicks "Run Prediction"

2. FRONTEND (page.tsx)
   └─> handleSubmit() creates FormData
   └─> POST to /api/predict (Next.js API route)

3. API ROUTE (route.ts)
   └─> Receives FormData
   └─> Forwards to http://localhost:8000/api/predict
   └─> Waits for Python backend response

4. BACKEND (app.py)
   └─> Reads CSV from FormData
   └─> Parses with Pandas
   └─> Validates columns
   └─> Computes all metrics:
       ├─> KPIs (revenue, quantity, customers, products)
       ├─> Top products/customers
       ├─> Customer segmentation
       ├─> Purchase frequency
       └─> Text summaries
   └─> Returns JSON response

5. API ROUTE (route.ts)
   └─> Receives JSON from backend
   └─> Returns to frontend

6. FRONTEND (page.tsx)
   └─> Receives JSON response
   └─> Updates state (result)
   └─> Re-renders with:
       ├─> KPI cards
       ├─> Charts (bar, pie, line)
       ├─> Insights cards
       └─> Action recommendations
```

### **Data Processing Details**

**Column Name Flexibility:**
The backend is designed to handle various CSV formats:
- Different naming conventions (camelCase, snake_case, PascalCase)
- Case-insensitive matching
- Multiple candidate names per field

**Numeric Cleaning:**
- Converts strings to numbers
- Handles NaN values (fills with 0)
- Ensures type safety (float for revenue, int for counts)

**Date Parsing:**
- Attempts to parse date columns
- Handles various date formats
- Used for temporal analysis (if needed)

---

## 🤖 Models & Analytics

### **1. Customer Segmentation Model**

**Location:** `src/analysis/customer_segmentation.py`

**Method: RFM Analysis + K-Means Clustering**

**RFM Calculation:**
- **Recency (R)**: Days since last purchase
- **Frequency (F)**: Number of transactions
- **Monetary (M)**: Total revenue spent

**Segmentation Process:**
1. Groups transactions by CustomerID
2. Calculates R, F, M for each customer
3. Uses percentiles to create segments:
   - **High Spenders**: Top 20% by revenue
   - **Medium Spenders**: 50th-80th percentile
   - **Low Spenders**: Bottom 50%

**Business Value:**
- Identify VIP customers for retention
- Target marketing campaigns
- Optimize inventory for high-value segments

### **2. Predictive Models**

**Location:** `src/analysis/predictive_models.py`

**Available Models:**

**a) Sales Forecasting (`train_sales_forecast`)**
- **ARIMA**: Time series forecasting for linear trends
- **Prophet**: Handles seasonality and holidays
- Returns: model, predictions, metrics (RMSE, MAE, R²)

**b) Customer Churn Prediction (`predict_customer_churn`)**
- Based on recency threshold (default: 90 days)
- Uses RFM analysis
- Returns: CustomerID, Recency, Churned (0/1)

**Note:** These models are available in the codebase but are **NOT currently used** in the web application. The web app uses **descriptive analytics with Pandas/NumPy only** (KPIs, top insights, segmentation) rather than predictive forecasting. The backend (`app.py`) imports only Pandas - no sklearn, no ARIMA, no Prophet.

### **3. Current Web App Analytics**

The web application currently focuses on **descriptive analytics using ONLY Pandas/NumPy**:

1. **Aggregations**: Sums, counts, averages (`df.sum()`, `df.mean()`, `df.count()`)
2. **Rankings**: Top N customers/products (`df.sort_values()`, `df.head()`)
3. **Segmentation**: Percentile-based customer groups (`df.quantile()`)
4. **Frequency Analysis**: Visit counts, purchase patterns (`df.value_counts()`)

**Important: NO Machine Learning Models**
- ❌ No sklearn imports
- ❌ No model training (`model.fit()`)
- ❌ No predictions (`model.predict()`)
- ❌ No pre-trained models
- ✅ Only statistical operations with Pandas/NumPy

**Why Descriptive First?**
- Faster processing (no model training needed)
- More interpretable results
- Real-time insights (1-3 seconds)
- No historical data requirements
- Works with any CSV format

---

## 👤 Complete User Journey

### **Scenario: User wants to analyze monthly sales report**

**Step 1: Access Dashboard**
- User opens the web application
- Sees clean dashboard with KPI cards (empty initially)
- Upload form is visible

**Step 2: Upload CSV**
- User clicks "Click to upload" or drags CSV file
- File is selected and displayed with name and size
- CSV is parsed client-side (PapaParse)
- Revenue trend chart appears (if date/revenue columns exist)

**Step 3: Select Periodicity**
- User chooses "Monthly" or "Yearly"
- This affects the forecast horizon text (not the analysis)

**Step 4: Run Prediction**
- User clicks "Run Prediction"
- Loading spinner appears
- Request sent to `/api/predict`

**Step 5: Backend Processing**
- Backend receives CSV
- Parses and validates
- Computes all metrics (takes 1-3 seconds typically)
- Returns JSON response

**Step 6: Results Display**
- Loading spinner disappears
- KPI cards update with values
- Multiple charts appear:
  - Revenue trend (from CSV)
  - Top 5 customers bar chart
  - Top 5 products bar chart
  - Customer segmentation pie chart
- Top insights cards show key metrics
- Action recommendations appear

**Step 7: User Analysis**
- User can hover over charts for details
- Review customer segments
- Identify top products/customers
- Use insights for business decisions

---

## 🎯 Key Features Explained

### **1. Flexible CSV Handling**

**Why it's important:**
- Different retailers use different CSV formats
- Column names vary (Date vs date vs InvoiceDate)
- Makes the system more user-friendly

**How it works:**
- Backend tries multiple column name candidates
- Returns clear error if required columns missing
- Handles case variations

### **2. Real-time Visualization**

**Why it's important:**
- Immediate feedback improves UX
- Users see data before prediction completes
- Multiple chart types for different insights

**How it works:**
- Client-side CSV parsing (PapaParse)
- Recharts library for interactive charts
- Responsive design for all screen sizes

### **3. Customer Segmentation**

**Why it's important:**
- Helps prioritize marketing efforts
- Identifies high-value customers
- Enables targeted strategies

**How it works:**
- Groups customers by total revenue
- Uses statistical percentiles (20th, 50th, 80th)
- Creates three segments with clear thresholds

### **4. Comprehensive Insights**

**Why it's important:**
- Single upload provides multiple insights
- Saves time vs. manual analysis
- Actionable recommendations

**How it works:**
- Computes multiple metrics in one pass
- Aggregates at different levels (product, customer, overall)
- Generates text summaries for quick understanding

---

## 🔧 Technical Details for Presentation

### **Frontend Technologies**
- **Next.js 14**: React framework with API routes
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **Recharts**: Chart library (built on D3.js)
- **PapaParse**: CSV parsing library

### **Backend Technologies**
- **FastAPI**: Modern Python web framework
- **Pandas**: Data manipulation and analysis
- **NumPy**: Numerical computations
- **Uvicorn**: ASGI server (runs FastAPI)

### **Architecture Patterns**
- **RESTful API**: Standard HTTP methods
- **Separation of Concerns**: Frontend/Backend split
- **Stateless**: Each request is independent
- **CORS**: Cross-origin resource sharing enabled

### **Data Processing**
- **In-memory processing**: CSV loaded into memory
- **No database**: Stateless, file-based
- **Efficient aggregations**: Pandas groupby operations (`df.groupby().sum()`)
- **Flexible parsing**: Multiple column name support
- **Statistical methods only**: Uses Pandas/NumPy - NO machine learning models
- **Percentile-based segmentation**: `df.quantile()` for customer segmentation

---

## 📊 What the System Does NOT Do (Important for Q&A)

1. **No Machine Learning Models**: The web app uses ONLY Pandas/NumPy statistical operations - no sklearn, no ARIMA, no Prophet, no model training, no predictions
2. **No Pre-trained Models**: Everything is computed on-the-fly from uploaded CSV
3. **No Database**: Data is processed in-memory, not stored
4. **No User Authentication**: Anyone can upload and analyze
5. **No Historical Comparison**: Each upload is analyzed independently
6. **No Real-time Updates**: Analysis happens on-demand, not continuously

---

## 🎤 Presentation Talking Points

### **Opening (30 seconds)**
"Today I'll demonstrate our Retail Stock Market Behavior Analysis system. It's a web application that allows retailers to upload sales reports and instantly receive comprehensive insights including customer segmentation, top products, and actionable recommendations."

### **Demo Flow (2-3 minutes)**
1. **Show Dashboard**: "Clean, modern interface with KPI cards"
2. **Upload CSV**: "Flexible CSV handling - works with various formats"
3. **Run Analysis**: "Backend processes data in seconds"
4. **Show Results**: "Multiple visualizations - bar charts, pie charts, line charts"
5. **Explain Insights**: "Customer segmentation, top products, purchase frequency"

### **Technical Highlights (1 minute)**
- "Built with Next.js frontend and FastAPI backend"
- "Real-time data processing with Pandas"
- "Responsive design works on all devices"
- "Flexible column name handling for different CSV formats"

### **Business Value (1 minute)**
- "Helps retailers identify top customers and products"
- "Enables targeted marketing through customer segmentation"
- "Provides actionable recommendations for inventory and retention"
- "Saves hours of manual analysis"

### **Q&A Preparation**
- **"How does it handle different CSV formats?"** → Flexible column name matching
- **"What models are used?"** → Descriptive analytics (aggregations, rankings, segmentation)
- **"Can it predict future sales?"** → Models exist in codebase but not in web app currently
- **"How fast is it?"** → Typically 1-3 seconds for standard CSV files
- **"What's the tech stack?"** → Next.js, React, FastAPI, Pandas

---

## 🚀 Running the System

### **Start Backend**
```bash
cd backend
python -m uvicorn app:app --reload --port 8000
```

### **Start Frontend**
```bash
cd frontend
npm run dev
```

### **Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Health Check: http://localhost:8000/health

---

## 📝 Summary

**Your system is a complete end-to-end analytics dashboard that:**
1. Accepts CSV uploads from users
2. Processes data in real-time using Python/Pandas
3. Computes comprehensive business metrics
4. Visualizes insights with interactive charts
5. Provides actionable recommendations

**Key Strengths:**
- User-friendly interface
- Flexible data handling
- Fast processing
- Comprehensive insights
- Modern tech stack

**Perfect for demonstrating:**
- Full-stack development skills
- Data analysis capabilities
- UI/UX design
- API design
- Business intelligence application

---

**Good luck with your presentation! 🎉**

