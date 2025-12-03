import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Retail Stock Behavior Dashboard",
  description: "Upload monthly or yearly reports and get demand and churn predictions"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <header className="mb-8 border-b border-gray-200 pb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Retail Stock Behavior Dashboard
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                Upload monthly or yearly reports and view model-driven insights for better business decisions.
              </p>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}


