# Data Directory

This directory contains all datasets used in the analysis.

## Structure

- **raw/**: Original, unprocessed datasets
  - Place the UCI Online Retail dataset here
  - Place Kaggle grocery datasets here

- **processed/**: Cleaned and transformed datasets
  - Generated after running data preprocessing notebooks

- **external/**: Additional external data sources
  - Economic indicators
  - Holiday calendars
  - Demographic data

## Dataset Sources

1. **UCI Online Retail Dataset**
   - Source: https://archive.ics.uci.edu/dataset/352/online+retail
   - Expected filename: `OnlineRetail.csv` or `OnlineRetail.xlsx`

2. **Kaggle Grocery Dataset**
   - Source: Kaggle
   - Expected filename: (varies by dataset)

## Data Usage

Raw data files should not be committed to version control (see `.gitignore`). Only place datasets here locally for analysis.

