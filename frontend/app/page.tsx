"use client";

import { useMemo, useState } from "react";
import Papa from "papaparse";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type PredictionResponse = {
  horizon: string;
  forecastSummary: string;
  churnSummary: string;
};

type CsvPoint = {
  date: string;
  revenue: number;
};

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
      const formData = new FormData();
      formData.append("file", file);
      formData.append("periodicity", periodicity);

      const res = await fetch("/api/predict", {
        method: "POST",
        body: formData
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Prediction request failed");
      }

      const data: PredictionResponse = await res.json();
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
      complete: (results) => {
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

  return (
    <main className="space-y-10">
      {/* Top hero + KPI strip */}
      <section className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">
              Retail Intelligence Overview
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              Upload your latest sales report and let the model surface customers likely to buy
              again, churn risk, and product demand so you can act quickly.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
            <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">
              Prediction status
            </p>
            <p className="text-sm font-semibold">
              {loading ? "Running model..." : result ? "Latest prediction ready" : "Waiting for file"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
            <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">
              Report type
            </p>
            <p className="text-sm font-semibold capitalize">{periodicity}</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
            <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">
              Focused insights
            </p>
            <p className="text-sm font-semibold">Demand & churn</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
            <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-1">
              Next step
            </p>
            <p className="text-sm font-semibold">
              {result ? "Review insights below" : "Upload CSV & run prediction"}
            </p>
          </div>
        </div>
      </section>

      {/* Upload + connection explainer */}
      <section className="grid gap-6 lg:grid-cols-[1.2fr,0.9fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-lg shadow-slate-950/50"
        >
          <h3 className="text-base font-semibold mb-1">Upload sales report</h3>
          <p className="text-xs text-slate-400 mb-3">
            Upload a monthly or yearly CSV report (date, revenue, quantity, etc.). The backend
            model will forecast demand and estimate churn risk.
          </p>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">CSV file</label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-200 file:mr-4 file:rounded-md file:border-0 file:bg-primary/90 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-primary transition-colors cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Report type</label>
            <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900/70 p-1 text-xs">
              <button
                type="button"
                onClick={() => setPeriodicity("monthly")}
                className={`px-3 py-1 rounded-md ${
                  periodicity === "monthly"
                    ? "bg-primary text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setPeriodicity("yearly")}
                className={`px-3 py-1 rounded-md ${
                  periodicity === "yearly"
                    ? "bg-primary text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                Yearly
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md bg-accent px-4 py-2 text-sm font-semibold text-slate-950 shadow hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors w-full md:w-auto"
          >
            {loading ? "Running model..." : "Run prediction"}
          </button>

          {error && (
            <p className="text-xs text-red-400 border border-red-500/40 bg-red-950/30 rounded-md px-3 py-2">
              {error}
            </p>
          )}
        </form>

        <div className="rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950 p-6 shadow-lg shadow-slate-950/60 space-y-4">
          <h3 className="text-base font-semibold mb-1">How this dashboard connects to your models</h3>
          <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
            <li>
              Frontend (this app) sends your CSV file to <code>/api/predict</code>.
            </li>
            <li>
              The <code>/api/predict</code> route should forward the file to your{" "}
              <strong>Python backend</strong> (FastAPI/Flask) which loads the ARIMA, Prophet and
              churn models from this repo.
            </li>
            <li>
              The backend returns JSON with forecast summary (next periods) and customer churn
              insights, which we render below.
            </li>
          </ul>
          <p className="text-xs text-slate-400 mt-2">
            Currently the API route is a <strong>stub</strong> that returns a mock response. You can
            replace it later to call your actual Python model service.
          </p>
        </div>
      </section>

      {/* Prediction output + insight structure */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold">Prediction output</h3>
          <p className="text-[11px] text-slate-400">
            These insights are generated from the most recently uploaded report.
          </p>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.4fr,1fr]">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-950/40 space-y-4">
            <h4 className="text-sm font-semibold text-slate-100 mb-1">Demand & revenue outlook</h4>
            {!result ? (
              <p className="text-sm text-slate-400">
                Run a prediction to see demand forecasts, revenue outlook, and seasonal patterns.
              </p>
            ) : (
              <p className="text-sm text-slate-200 leading-relaxed mb-3">
                {result.forecastSummary}
              </p>
            )}

            <div className="mt-1 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 h-56">
              {chartData.length === 0 ? (
                <p className="text-[11px] text-slate-500">
                  After you select a CSV, this panel will plot **revenue vs date** from your report,
                  so shopkeepers can visually inspect demand trends.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      tickLine={false}
                      minTickGap={20}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      tickLine={false}
                      width={56}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#020617",
                        borderColor: "#1e293b",
                        borderRadius: 8,
                        padding: "6px 8px",
                        fontSize: 11
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/40 space-y-2">
              <h4 className="text-sm font-semibold text-slate-100">
                Customer behavior insight (churn & re‑purchase)
              </h4>
              {!result ? (
                <p className="text-sm text-slate-400">
                  The model will summarize which segments are likely to buy again and which are at
                  risk of churn.
                </p>
              ) : (
                <p className="text-sm text-slate-200 leading-relaxed">{result.churnSummary}</p>
              )}
              <p className="text-[11px] text-slate-500 mt-1">
                In a full deployment, this card can link to a table of customers with churn
                probabilities and recommended actions.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-slate-950/40 space-y-2">
              <h4 className="text-sm font-semibold text-slate-100">
                Next actions for shopkeepers
              </h4>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                <li>Restock items with predicted high demand in the next period.</li>
                <li>Target high-risk churn customers with discounts or loyalty offers.</li>
                <li>
                  Use recommendations (to be added) to cross‑sell complementary products to active
                  customers.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


