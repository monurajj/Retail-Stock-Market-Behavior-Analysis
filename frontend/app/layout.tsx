import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Retail Stock Behavior Dashboard",
  description: "Upload monthly or yearly reports and get demand and churn predictions"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <header className="mb-8 border-b border-slate-800 pb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Retail Stock Behavior Dashboard
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                For shopkeepers to upload monthly / yearly reports and view model-driven insights.
              </p>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}


