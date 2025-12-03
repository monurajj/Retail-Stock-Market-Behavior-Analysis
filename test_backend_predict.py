import pathlib

import requests


def test_single_file(csv_path: pathlib.Path, periodicity: str = "monthly") -> None:
    """Send one CSV file to the /api/predict endpoint and print the response."""
    if not csv_path.exists():
        raise FileNotFoundError(f"CSV file not found at {csv_path}")

    files = {
        "file": (csv_path.name, csv_path.read_bytes(), "text/csv"),
    }
    data = {"periodicity": periodicity}

    print(f"\n=== Testing {csv_path} (periodicity={periodicity}) ===")
    resp = requests.post(
        "http://localhost:8000/api/predict", files=files, data=data, timeout=15
    )
    print("Status code:", resp.status_code)
    try:
        print("Response JSON:", resp.json())
    except Exception as exc:  # noqa: BLE001
        print("Failed to parse JSON:", exc)
        print("Raw text:", resp.text)


def main() -> None:
    """Run simple smoke tests for all generated test CSVs."""
    root = pathlib.Path(__file__).parent
    generated_dir = root / "tests" / "generated_reports"

    if not generated_dir.exists():
        raise FileNotFoundError(
            f"Generated reports directory not found at {generated_dir}. "
            "Run tests/generate_test_reports.py first."
        )

    csv_files = sorted(generated_dir.glob("test_report_*.csv"))
    if not csv_files:
        raise FileNotFoundError(
            f"No test_report_*.csv files found in {generated_dir}. "
            "Run tests/generate_test_reports.py first."
        )

    print("Sending test requests to http://localhost:8000/api/predict ...")
    for csv_path in csv_files:
        test_single_file(csv_path, periodicity="monthly")


if __name__ == "__main__":
    main()


