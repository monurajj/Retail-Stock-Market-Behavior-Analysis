# Data Source Explanation - Real Data vs Mock Data

## ✅ Direct Answer

**NO, you are NOT using mock data. Everything is computed from the REAL uploaded CSV file.**

---

## 🔍 Evidence from Code

### **Backend Code Analysis (`backend/app.py`)**

**Line 33-34 (Docstring):**
```python
"""
Parse the uploaded CSV and return REAL insights based on that file.
No hard-coded mock values – everything comes from the data.
"""
```

**Line 36-39: Reads REAL CSV:**
```python
content = await file.read()  # Reads uploaded file
df = pd.read_csv(BytesIO(content))  # Parses CSV into DataFrame
```

**All calculations use `df` (the uploaded CSV):**

```python
# Line 92-95: KPIs computed from uploaded CSV
total_revenue = float(df[revenue_col].sum())  # ← Sum from CSV
total_quantity = int(df[qty_col].sum())        # ← Sum from CSV
unique_customers = int(df[cust_col].nunique())  # ← Count from CSV
unique_products = int(df[prod_col].nunique())   # ← Count from CSV

# Line 98-100: Top product from CSV
prod_rev = df.groupby(prod_col)[revenue_col].sum().sort_values(ascending=False)
top_product_id = str(prod_rev.index[0])  # ← Real product ID from CSV
top_product_revenue = float(prod_rev.iloc[0])  # ← Real revenue from CSV

# Line 108-110: Top customer from CSV
cust_rev = df.groupby(cust_col)[revenue_col].sum().sort_values(ascending=False)
top_customer_id = str(cust_rev.index[0])  # ← Real customer ID from CSV
top_customer_revenue = float(cust_rev.iloc[0])  # ← Real revenue from CSV

# Line 142-148: Segmentation from CSV
customer_revenues = df.groupby(cust_col)[revenue_col].sum()  # ← From CSV
high_threshold = customer_revenues.quantile(0.8)  # ← Calculated from CSV
high_spenders = int((customer_revenues >= high_threshold).sum())  # ← From CSV
```

**Every single value comes from the uploaded CSV file!**

---

## 📊 Data Flow

```
1. User uploads CSV file
   ↓
2. Backend reads file: df = pd.read_csv(BytesIO(content))
   ↓
3. All calculations use df:
   - df.sum() → total revenue
   - df.groupby() → top products/customers
   - df.quantile() → segmentation thresholds
   - df.value_counts() → frequency analysis
   ↓
4. Response contains REAL values from uploaded CSV
```

---

## ❌ What Would Mock Data Look Like?

**If you were using mock data, you'd see something like:**

```python
# ❌ MOCK DATA (NOT IN YOUR CODE)
response = {
    "kpis": {
        "totalRevenue": 100000,  # ← Hardcoded
        "totalQuantity": 5000,    # ← Hardcoded
    },
    "topInsights": {
        "topProductByRevenue": {
            "productId": "PROD123",  # ← Hardcoded
            "revenue": 50000,        # ← Hardcoded
        }
    }
}
```

**Your code does NOT do this!** Every value is computed from `df`.

---

## ✅ What Your Code Actually Does

**Every value is dynamically computed:**

```python
# ✅ REAL DATA (YOUR CODE)
total_revenue = float(df[revenue_col].sum())  # Computed from CSV
top_product_id = str(prod_rev.index[0])       # From CSV
top_product_revenue = float(prod_rev.iloc[0])  # From CSV

response = {
    "kpis": {
        "totalRevenue": total_revenue,  # ← Real value from CSV
    },
    "topInsights": {
        "topProductByRevenue": {
            "productId": top_product_id,      # ← Real ID from CSV
            "revenue": top_product_revenue,   # ← Real value from CSV
        }
    }
}
```

---

## 🧪 How to Verify

**Test it yourself:**

1. **Upload CSV with known values:**
   - Create a CSV with 3 customers, 2 products
   - Customer A: £1000 revenue
   - Customer B: £500 revenue
   - Customer C: £200 revenue

2. **Check the results:**
   - Top customer should be Customer A with £1000
   - Total revenue should be £1700
   - If you change the CSV, results change → **Proves it's real data!**

3. **Try different CSVs:**
   - Upload different files
   - Results will be completely different
   - This proves no mock data is used

---

## 📋 Summary

| Aspect | Your System | Mock Data System |
|--------|-------------|------------------|
| **Data Source** | Uploaded CSV file | Hardcoded values |
| **KPIs** | Computed from CSV (`df.sum()`) | Fixed numbers |
| **Top Products** | From CSV (`df.groupby()`) | Hardcoded IDs |
| **Top Customers** | From CSV (`df.groupby()`) | Hardcoded IDs |
| **Segmentation** | Percentiles from CSV (`df.quantile()`) | Fixed thresholds |
| **Response Changes** | Yes, with different CSVs | No, always same |

---

## 🎤 For Your Presentation

**If asked: "Are you using mock data?"**

**Answer:**
> "No, we're using 100% real data from the uploaded CSV. Every metric - total revenue, top products, customer segmentation - is computed on-the-fly from the uploaded file using Pandas operations. You can verify this by uploading different CSV files and seeing completely different results."

**If asked: "How do we know it's real data?"**

**Answer:**
> "The backend reads the CSV file, parses it with Pandas, and performs statistical calculations like sums, groupby aggregations, and percentile calculations. There are no hardcoded values in the code - everything is dynamically computed from the uploaded data. The docstring even explicitly states 'No hard-coded mock values – everything comes from the data.'"

---

## ✅ Conclusion

**Your system uses REAL data from uploaded CSV files. No mock data, no hardcoded values, everything is computed dynamically.**

This is actually a **strength** of your system:
- ✅ Works with any CSV format
- ✅ Results reflect actual data
- ✅ No fake/dummy data
- ✅ Transparent and verifiable

