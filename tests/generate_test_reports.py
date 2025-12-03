import csv
from datetime import datetime, timedelta
from pathlib import Path
import random


def generate_report(path: Path, start_date: datetime, n_rows: int, seed: int) -> None:
    random.seed(seed)
    date = start_date

    with path.open("w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["date", "revenue", "quantity", "customer_id", "product_id"])

        for i in range(n_rows):
            # Simple synthetic pattern: mild upward trend + random noise
            base_revenue = 100 + i * 0.5
            seasonal = 30 * (1 if date.weekday() in (4, 5) else 0)  # weekends higher
            noise = random.uniform(-15, 15)
            revenue = max(20, round(base_revenue + seasonal + noise, 2))

            quantity = max(1, int(random.gauss(5, 2)))
            customer_id = 10_000 + random.randint(0, 150)
            product_id = 5_000 + random.randint(0, 80)

            writer.writerow(
                [date.strftime("%Y-%m-%d"), revenue, quantity, customer_id, product_id]
            )

            # Advance date roughly daily; occasionally skip a day to mimic gaps
            date += timedelta(days=1 if random.random() > 0.1 else 2)


def main() -> None:
    root = Path(__file__).resolve().parent
    out_dir = root / "generated_reports"
    out_dir.mkdir(exist_ok=True)

    n_rows = 300
    start_dates = [
        datetime(2024, 1, 1),
        datetime(2024, 3, 1),
        datetime(2024, 5, 1),
        datetime(2024, 7, 1),
        datetime(2024, 9, 1),
    ]

    for idx, start in enumerate(start_dates, start=1):
        path = out_dir / f"test_report_{idx}.csv"
        generate_report(path, start, n_rows=n_rows, seed=idx * 123)
        print(f"Generated {path} with {n_rows} rows")


if __name__ == "__main__":
    main()


