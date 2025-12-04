"use client";

import { useMemo, useState } from "react";
import Papa from "papaparse";
import {
  Line,
  LineChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  CartesianGrid
} from "recharts";

type PredictionResponse = {
  horizon: string;
  forecastSummary: string;
  churnSummary: string;
  kpis?: {
    totalRevenue: number;
    totalQuantity: number;
    uniqueCustomers: number;
    uniqueProducts: number;
    avgTransactionValue?: number;
    medianTransactionValue?: number;
  };
  topInsights?: {
    topProductByRevenue: { productId: string; revenue: number };
    topProductByQuantity: { productId: string; quantity: number };
    highestEarningCustomer: { customerId: string; revenue: number };
    mostFrequentCustomer: { customerId: string; visits: number };
  };
  detailedInsights?: {
    top5Customers: Array<{
      rank: number;
      customerId: string;
      revenue: number;
      visits: number;
      avgSpendPerVisit: number;
    }>;
    top5Products: Array<{
      rank: number;
      productId: string;
      revenue: number;
      quantity: number;
      avgPrice: number;
    }>;
    customerSegmentation: {
      highSpenders: number;
      mediumSpenders: number;
      lowSpenders: number;
      highSpenderThreshold: number;
      mediumSpenderThreshold: number;
    };
    purchaseFrequency: {
      avgVisitsPerCustomer: number;
      medianVisitsPerCustomer: number;
    };
  };
  randomForestModel?: {
    modelUsed: boolean;
    description: string;
    accuracy?: number;
    rocAuc?: number | null;
    featureImportances?: Record<string, number>;
    topAtRiskCustomers?: Array<{
      customerId: string;
      recencyDays: number;
      frequency: number;
      totalSpent: number;
      churnProbability: number;
    }>;
    reason?: string;
  };
};

type CsvPoint = {
  date: string;
  revenue: number;
};

const COLORS = {
  primary: "#2563eb",
  secondary: "#1e40af",
  accent: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#06b6d4",
  chart1: "#2563eb",
  chart2: "#3b82f6",
  chart3: "#60a5fa",
  chart4: "#93c5fd",
  chart5: "#dbeafe"
};

const PIE_COLORS = ["#2563eb", "#f59e0b", "#ef4444"];

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [periodicity, setPeriodicity] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [csvSeries, setCsvSeries] = useState<CsvPoint[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!file) {
      setError("Please select a CSV file to upload.");
      return;
    }

    try {
      setLoading(true);
      const start = performance.now();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("periodicity", periodicity);

      const requestPromise = fetch("/api/predict", {
        method: "POST",
        body: formData
      });

      // Ensure loader is visible for at least 1 second
      const minDelayPromise = new Promise((resolve) => {
        const elapsed = performance.now() - start;
        const remaining = Math.max(0, 1000 - elapsed);
        setTimeout(resolve, remaining);
      });

      const res = await Promise.race([
        Promise.all([requestPromise, minDelayPromise]).then(([r]) => r as Response)
      ]);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Prediction request failed");
      }

      const data: PredictionResponse = await res.json();
      
      // DEBUG: Log response to verify different files return different data
      console.log("=== BACKEND RESPONSE ===");
      console.log("File name:", file.name);
      console.log("Top customer:", data.detailedInsights?.top5Customers?.[0]?.customerId);
      console.log("Top product:", data.detailedInsights?.top5Products?.[0]?.productId);
      console.log("Total revenue:", data.kpis?.totalRevenue);
      console.log("========================");
      
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (newFile: File | null) => {
    setFile(newFile);
    setCsvSeries([]);
    if (!newFile) return;

    Papa.parse(newFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<any>) => {
        const rows = (results.data as any[])
          .map((row) => {
            const date = String(row.date || row.Date || row.invoice_date || "").trim();
            const revenueRaw = row.revenue ?? row.Revenue ?? row.total ?? row.TotalPrice;
            const revenue = Number(revenueRaw);
            if (!date || Number.isNaN(revenue)) return null;
            return { date, revenue };
          })
          .filter((d): d is CsvPoint => d !== null);

        setCsvSeries(rows);
      }
    });
  };

  const chartData = useMemo(() => {
    return csvSeries.slice().sort((a, b) => a.date.localeCompare(b.date));
  }, [csvSeries]);

  const topCustomersChartData = useMemo(() => {
    if (!result?.detailedInsights?.top5Customers) return [];
    return result.detailedInsights.top5Customers.map((cust) => ({
      name: `Customer ${cust.customerId}`,
      revenue: cust.revenue,
      visits: cust.visits
    }));
  }, [result]);

  const topProductsChartData = useMemo(() => {
    if (!result?.detailedInsights?.top5Products) return [];
    return result.detailedInsights.top5Products.map((prod) => ({
      name: `Product ${prod.productId}`,
      revenue: prod.revenue,
      quantity: prod.quantity
    }));
  }, [result]);

  const segmentationChartData = useMemo(() => {
    if (!result?.detailedInsights?.customerSegmentation) return [];
    const seg = result.detailedInsights.customerSegmentation;
    return [
      { name: "High Spenders", value: seg.highSpenders },
      { name: "Medium Spenders", value: seg.mediumSpenders },
      { name: "Low Spenders", value: seg.lowSpenders }
    ];
  }, [result]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? `Rs${entry.value.toLocaleString()}` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <main className="space-y-8">
      {/* KPI Cards */}
      <section>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {result?.kpis
                    ? `Rs${result.kpis.totalRevenue.toLocaleString(undefined, {
                        maximumFractionDigits: 0
                      })}`
                    : loading
                    ? "Calculating..."
                    : "—"}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Quantity</p>
                <p className="text-2xl font-bold text-gray-900">
                  {result?.kpis ? result.kpis.totalQuantity.toLocaleString() : loading ? "…" : "—"}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Unique Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {result?.kpis ? result.kpis.uniqueCustomers.toLocaleString() : loading ? "…" : "—"}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-6 py-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Unique Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {result?.kpis ? result.kpis.uniqueProducts.toLocaleString() : loading ? "…" : "—"}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upload Form */}
      <section className="grid gap-6 lg:grid-cols-[1.2fr,0.9fr]">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5"
        >
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Upload Sales Report</h3>
            <p className="text-sm text-gray-600">
              Upload a monthly or yearly CSV report to get demand forecasts and customer insights.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">CSV File</label>
            {file ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-300 rounded-lg">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <label className="ml-3 cursor-pointer">
                  <span className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                    Change File
                  </span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <label className="block cursor-pointer">
                <div className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  <div className="text-center">
                    <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">
                      <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">CSV files only</p>
                  </div>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Report Type</label>
            <div className="inline-flex rounded-lg border border-gray-300 bg-gray-50 p-1">
              <button
                type="button"
                onClick={() => setPeriodicity("monthly")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  periodicity === "monthly"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setPeriodicity("yearly")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  periodicity === "yearly"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Yearly
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading && (
              <span className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            )}
            {loading ? "Running prediction..." : "Run Prediction"}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </form>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">How It Works</h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">1</div>
              <span>Upload your CSV file with sales data (date, revenue, quantity, customer, product)</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">2</div>
              <span>Our backend analyzes the data and computes KPIs, forecasts, and customer insights</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">3</div>
              <span>View comprehensive visualizations and actionable insights to optimize your business</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Results Section */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 bg-white rounded-xl shadow-xl p-8 border border-gray-200">
            <span className="h-12 w-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
            <p className="text-sm font-medium text-gray-700">
              Analyzing your data. This may take a few seconds...
            </p>
          </div>
        </div>
      )}

      {result && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
            <span className="text-sm text-gray-500">Horizon: {result.horizon}</span>
          </div>

          {/* Revenue Trend Chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
            {chartData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-400">
                <p className="text-sm">Upload a CSV file to see revenue trends</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    tickLine={false}
                    minTickGap={30}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    tickLine={false}
                    width={80}
                    tickFormatter={(value) => `Rs${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke={COLORS.primary}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: COLORS.primary }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Forecast and Churn Summary */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Demand & Revenue Outlook</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                {result.forecastSummary}
              </p>
              {chartData.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-semibold text-gray-500 mb-1">
                    Recent revenue snapshot (bars from your uploaded file)
                  </p>
                  <div className="h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 5, right: 20, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 10, fill: "#9ca3af" }}
                          tickLine={false}
                          minTickGap={40}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "#9ca3af" }}
                          tickLine={false}
                          width={60}
                          tickFormatter={(value) => `Rs${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                          dataKey="revenue"
                          fill={COLORS.accent}
                          radius={[6, 6, 0, 0]}
                          maxBarSize={20}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Customer Behavior Insights</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{result.churnSummary}</p>
            </div>
          </div>

          {/* Random Forest Churn Model Section */}
          {result.randomForestModel && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Random Forest Churn Model
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 max-w-2xl">
                    {result.randomForestModel.description}
                  </p>
                </div>
              </div>

              {result.randomForestModel.modelUsed ? (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2 text-xs">
                    {typeof result.randomForestModel.accuracy === "number" && (
                      <div className="bg-blue-50 border border-blue-100 rounded-md px-3 py-2">
                        <p className="text-[11px] font-semibold text-blue-900 mb-1">
                          Accuracy
                        </p>
                        <p className="text-sm font-bold text-blue-700">
                          {(result.randomForestModel.accuracy * 100).toFixed(1)}%
                        </p>
                      </div>
                    )}
                    {typeof result.randomForestModel.rocAuc === "number" && (
                      <div className="bg-indigo-50 border border-indigo-100 rounded-md px-3 py-2">
                        <p className="text-[11px] font-semibold text-indigo-900 mb-1">
                          ROC-AUC
                        </p>
                        <p className="text-sm font-bold text-indigo-700">
                          {result.randomForestModel.rocAuc.toFixed(3)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
                    {result.randomForestModel.topAtRiskCustomers &&
                      result.randomForestModel.topAtRiskCustomers.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-700 mb-1">
                            Top At‑Risk Customers (by churn probability)
                          </p>
                          <div className="border border-gray-100 rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-100">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                    Customer
                                  </th>
                                  <th className="px-3 py-2 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                    Churn Prob.
                                  </th>
                                  <th className="px-3 py-2 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                    Recency (days)
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-100">
                                {result.randomForestModel.topAtRiskCustomers.map((cust) => (
                                  <tr key={cust.customerId}>
                                    <td className="px-3 py-2 text-xs text-gray-800">
                                      {cust.customerId}
                                    </td>
                                    <td className="px-3 py-2 text-xs text-gray-900 text-right">
                                      {(cust.churnProbability * 100).toFixed(1)}%
                                    </td>
                                    <td className="px-3 py-2 text-xs text-gray-900 text-right">
                                      {cust.recencyDays}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                    <div>
                      <p className="text-[11px] font-semibold text-gray-600 mb-1">
                        How to read ROC‑AUC score
                      </p>
                      <div className="overflow-hidden rounded-md border border-gray-100">
                        <table className="min-w-full divide-y divide-gray-100">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                AUC Score
                              </th>
                              <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                Model Performance
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-100 text-[11px]">
                            <tr>
                              <td className="px-3 py-1.5 text-gray-800">1.0</td>
                              <td className="px-3 py-1.5 text-gray-800">Perfect model</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-1.5 text-gray-800">0.9 – 1.0</td>
                              <td className="px-3 py-1.5 text-gray-800">Excellent</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-1.5 text-gray-800">0.8 – 0.9</td>
                              <td className="px-3 py-1.5 text-gray-800">Good</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-1.5 text-gray-800">0.7 – 0.8</td>
                              <td className="px-3 py-1.5 text-gray-800">Fair</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-1.5 text-gray-800">0.6 – 0.7</td>
                              <td className="px-3 py-1.5 text-gray-800">Poor</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-1.5 text-gray-800">0.5</td>
                              <td className="px-3 py-1.5 text-gray-800">
                                No better than random guessing
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                result.randomForestModel.reason && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-3 py-2">
                    {result.randomForestModel.reason}
                  </p>
                )
              )}
            </div>
          )}

          {/* Top Customers and Products Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            {topCustomersChartData.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Customers by Revenue</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topCustomersChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      tickLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      tickLine={false}
                      width={80}
                      tickFormatter={(value) => `Rs${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {topProductsChartData.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Products by Revenue</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProductsChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#6b7280" }}
                      tickLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      tickLine={false}
                      width={80}
                      tickFormatter={(value) => `Rs${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" fill={COLORS.success} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Customer Segmentation Pie Chart */}
          {segmentationChartData.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Segmentation</h3>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={segmentationChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {segmentationChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {result.detailedInsights?.customerSegmentation && (
                    <>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-green-900">High Spenders</span>
                          <span className="text-lg font-bold text-green-700">
                            {result.detailedInsights.customerSegmentation.highSpenders}
                          </span>
                        </div>
                        <p className="text-xs text-green-700">
                          ≥ Rs{result.detailedInsights.customerSegmentation.highSpenderThreshold.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-yellow-900">Medium Spenders</span>
                          <span className="text-lg font-bold text-yellow-700">
                            {result.detailedInsights.customerSegmentation.mediumSpenders}
                          </span>
                        </div>
                        <p className="text-xs text-yellow-700">
                          Rs{result.detailedInsights.customerSegmentation.mediumSpenderThreshold.toLocaleString(undefined, { maximumFractionDigits: 0 })} - Rs{result.detailedInsights.customerSegmentation.highSpenderThreshold.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-red-900">Low Spenders</span>
                          <span className="text-lg font-bold text-red-700">
                            {result.detailedInsights.customerSegmentation.lowSpenders}
                          </span>
                        </div>
                        <p className="text-xs text-red-700">
                          &lt; Rs{result.detailedInsights.customerSegmentation.mediumSpenderThreshold.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </p>
                      </div>
                    </>
                  )}
                  {result.detailedInsights?.purchaseFrequency && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                      <h4 className="text-sm font-semibold text-blue-900 mb-3">Purchase Frequency</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-blue-700 mb-1">Avg Visits/Customer</p>
                          <p className="text-lg font-bold text-blue-900">
                            {result.detailedInsights.purchaseFrequency.avgVisitsPerCustomer.toFixed(1)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-blue-700 mb-1">Median Visits</p>
                          <p className="text-lg font-bold text-blue-900">
                            {result.detailedInsights.purchaseFrequency.medianVisitsPerCustomer.toFixed(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Top Insights Cards */}
          {result.topInsights && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-5">
                <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-2">Top Product (Revenue)</p>
                <p className="text-lg font-bold text-blue-900 mb-1">Product {result.topInsights.topProductByRevenue.productId}</p>
                <p className="text-2xl font-bold text-blue-700">
                  Rs{result.topInsights.topProductByRevenue.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-5">
                <p className="text-xs font-semibold text-green-900 uppercase tracking-wide mb-2">Top Product (Quantity)</p>
                <p className="text-lg font-bold text-green-900 mb-1">Product {result.topInsights.topProductByQuantity.productId}</p>
                <p className="text-2xl font-bold text-green-700">
                  {result.topInsights.topProductByQuantity.quantity.toLocaleString()} units
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-5">
                <p className="text-xs font-semibold text-purple-900 uppercase tracking-wide mb-2">Top Customer (Revenue)</p>
                <p className="text-lg font-bold text-purple-900 mb-1">Customer {result.topInsights.highestEarningCustomer.customerId}</p>
                <p className="text-2xl font-bold text-purple-700">
                  Rs{result.topInsights.highestEarningCustomer.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 p-5">
                <p className="text-xs font-semibold text-orange-900 uppercase tracking-wide mb-2">Most Frequent Customer</p>
                <p className="text-lg font-bold text-orange-900 mb-1">Customer {result.topInsights.mostFrequentCustomer.customerId}</p>
                <p className="text-2xl font-bold text-orange-700">
                  {result.topInsights.mostFrequentCustomer.visits.toLocaleString()} visits
                </p>
              </div>
            </div>
          )}

          {/* Action Items */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Actions</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Restock items with predicted high demand in the next period based on historical patterns</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Target high-risk churn customers with personalized discounts or loyalty offers</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Use top product insights to cross-sell complementary items to active customers</span>
              </li>
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
