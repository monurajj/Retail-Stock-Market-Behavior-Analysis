# Debugging: Same Results for All CSV Files

## 🔍 Problem

You're seeing the same customer IDs and product IDs for all CSV files:
- **Customers**: 10112.0, 10127.0, 10032.0, 10073.0, 10034.0
- **Products**: 5066.0, 5047.0, 5068.0, 5074.0, 5010.0

## 🎯 Possible Causes

### **1. Browser Cache (Most Likely)**
The frontend might be caching the API response.

**Solution:**
- Open browser DevTools (F12)
- Go to Network tab
- Check "Disable cache"
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Try uploading different CSV files again

### **2. File Not Being Sent Correctly**
The file might not be reaching the backend.

**How to Check:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Upload a CSV file
4. Look for the `/api/predict` request
5. Click on it and check:
   - **Request Payload**: Should show FormData with your file
   - **Response**: Should show different data for different files

### **3. Backend Not Reading File**
The backend might be reading a cached/default file.

**How to Check:**
1. Add debug logging to backend:
   ```python
   print(f"File name: {file.filename}")
   print(f"File size: {len(content)} bytes")
   print(f"First 100 chars: {content[:100]}")
   print(f"DataFrame shape: {df.shape}")
   print(f"First customer: {df[cust_col].iloc[0]}")
   ```

### **4. Same CSV File Being Uploaded**
You might be uploading the same file each time.

**Solution:**
- Make sure you're selecting different CSV files
- Check the file name shown in the UI
- Try with completely different CSV files

### **5. Frontend State Not Clearing**
The result state might not be clearing between uploads.

**Check:**
- Look at line 101 in `page.tsx`: `setResult(null);` - this should clear results
- But the result might be persisting in React state

## 🔧 Debugging Steps

### **Step 1: Check Network Tab**

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Upload a CSV file
4. Find the `/api/predict` request
5. Check:
   - **Request**: Does it show your file in FormData?
   - **Response**: What data does it return?
   - **Status**: Is it 200 OK?

### **Step 2: Add Backend Logging**

Add this to `backend/app.py` after line 36:

```python
content = await file.read()

# ADD DEBUG LOGGING
print(f"=== DEBUG ===")
print(f"File name: {file.filename}")
print(f"File size: {len(content)} bytes")
print(f"First 200 chars: {content[:200]}")
```

Then check the backend terminal output when you upload files.

### **Step 3: Check File Contents**

Make sure your CSV files actually have different data:

```bash
# Check first few rows of each CSV
head -5 your_file_1.csv
head -5 your_file_2.csv
```

They should have different customer IDs and product IDs.

### **Step 4: Test with Simple CSV**

Create a test CSV with known values:

```csv
date,revenue,quantity,customer_id,product_id
2024-01-01,100,5,99999,88888
2024-01-02,200,10,99999,88888
```

Upload this and see if you get:
- Customer: 99999
- Product: 88888

If you still see the old IDs, there's a caching issue.

## 🐛 Most Likely Issue: Browser Cache

**Quick Fix:**
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or use Ctrl+Shift+Delete to clear browser cache
5. Try uploading different CSV files again

## 🔍 Check Backend Response

Add this to see what backend is actually returning:

**In `frontend/app/page.tsx`, after line 137:**

```typescript
const data: PredictionResponse = await res.json();
console.log("Backend response:", data); // ADD THIS
console.log("Top customer:", data.detailedInsights?.top5Customers?.[0]); // ADD THIS
setResult(data);
```

Then check browser console to see if backend is returning different data.

## ✅ Expected Behavior

When you upload **different CSV files**, you should see:
- Different customer IDs
- Different product IDs
- Different revenue values
- Different KPI values

If you're seeing the **same values**, one of the issues above is happening.

## 🎯 Quick Test

1. Create a CSV with customer ID `99999` and product ID `88888`
2. Upload it
3. Check if results show `99999` and `88888`
4. If not, there's a caching or file reading issue

## 📝 Code to Add for Debugging

**Backend (`backend/app.py`):**
```python
@app.post("/api/predict")
async def predict(
    file: UploadFile = File(...),
    periodicity: str = Form("monthly"),
):
    content = await file.read()
    
    # DEBUG: Print file info
    print(f"\n=== FILE UPLOAD DEBUG ===")
    print(f"Filename: {file.filename}")
    print(f"Size: {len(content)} bytes")
    
    try:
        df = pd.read_csv(BytesIO(content))
        print(f"DataFrame shape: {df.shape}")
        print(f"Columns: {list(df.columns)}")
        
        # Find customer column
        cust_col = pick_col(customer_col_candidates)
        if cust_col:
            print(f"Customer column: {cust_col}")
            print(f"First 5 customers: {df[cust_col].head().tolist()}")
            print(f"Unique customers: {df[cust_col].nunique()}")
        
        # Find product column
        prod_col = pick_col(product_col_candidates)
        if prod_col:
            print(f"Product column: {prod_col}")
            print(f"First 5 products: {df[prod_col].head().tolist()}")
            print(f"Unique products: {df[prod_col].nunique()}")
        
        print("=" * 50)
    except Exception as e:
        print(f"ERROR: {e}")
        raise
```

**Frontend (`frontend/app/page.tsx`):**
```typescript
const data: PredictionResponse = await res.json();

// DEBUG: Log response
console.log("=== BACKEND RESPONSE ===");
console.log("Top customer:", data.detailedInsights?.top5Customers?.[0]);
console.log("Top product:", data.detailedInsights?.top5Products?.[0]);
console.log("Total revenue:", data.kpis?.totalRevenue);
console.log("========================");

setResult(data);
```

## 🎤 For Your Presentation

If this happens during demo:

**Quick Fix:**
1. Open DevTools (F12)
2. Go to Network tab
3. Check "Disable cache"
4. Hard refresh
5. Upload file again

**If Still Same:**
- "Let me check the backend logs to see what file is being processed"
- Check terminal where backend is running
- Verify file is being read correctly

