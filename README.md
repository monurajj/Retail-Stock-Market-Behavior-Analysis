# Retail Stock Market Behavior Analysis

## Project Overview

This project focuses on comprehensive behavioral analysis of retail transaction data to uncover meaningful patterns, associations, and trends in customer purchasing behavior. Through advanced analytics techniques including association rule mining, time-series analysis, customer segmentation, and predictive modeling, we aim to provide actionable insights for retail business strategy.

**Course:** Data Mining  
**Project Type:** Exploratory Data Analysis & Predictive Analytics

---

## Contributors

- Monu Kumar
- Rhythm Jain
- Aditya Kumar

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Objectives](#objectives)
3. [Dataset Information](#dataset-information)
4. [Analysis Philosophy & Methodology](#analysis-philosophy--methodology)
5. [Research Questions](#research-questions)
6. [Project Structure](#project-structure)
7. [Methodology & Implementation](#methodology--implementation)
8. [Key Findings](#key-findings)
9. [Technologies & Tools](#technologies--tools)
10. [Installation & Setup](#installation--setup)
11. [Usage](#usage)
12. [Future Work](#future-work)
13. [References](#references)

---

## Problem Statement

Retailers accumulate massive volumes of transaction data daily, generating terabytes of information that remain largely unexplored. The challenge lies in transforming this raw transactional data into actionable business intelligence. Understanding customer purchasing patterns, identifying product associations, recognizing temporal trends, and segmenting customers effectively can drive:

- **Strategic Inventory Management**: Optimize stock levels based on frequently co-purchased items
- **Marketing Campaigns**: Design targeted promotions based on customer segments and buying patterns
- **Revenue Optimization**: Identify peak sales periods and seasonal trends
- **Customer Retention**: Understand customer behavior to improve satisfaction and loyalty

This project addresses the complexity of retail data mining by implementing a multi-faceted analytical approach that combines descriptive, diagnostic, predictive, and prescriptive analytics.

---

## Objectives

1. **Association Analysis**: Discover products frequently bought together using market basket analysis
2. **Temporal Pattern Recognition**: Identify purchase volume patterns across different time dimensions
3. **Customer Segmentation**: Create meaningful customer clusters using both supervised and unsupervised learning techniques
4. **Geographical Analysis**: Analyze sales trends by country with interactive visualizations
5. **Predictive Modeling**: Develop models to forecast future purchasing behavior and sales trends
6. **Descriptive Insights**: Extract actionable business intelligence from historical transaction data

---

## Dataset Information

### Primary Dataset: UCI Online Retail Dataset

- **Source**: [UCI Machine Learning Repository - Online Retail Dataset](https://archive.ics.uci.edu/dataset/352/online+retail)
- **Description**: This is a transnational data set containing all the transactions occurring between 01/12/2010 and 09/12/2011 for a UK-based and registered, non-store online retail. The company mainly sells unique all-occasion gift-ware.
- **Key Attributes**:
  - `InvoiceNo`: Invoice number (unique identifier)
  - `StockCode`: Product code
  - `Description`: Product description
  - `Quantity`: Quantity purchased
  - `InvoiceDate`: Invoice date and time
  - `UnitPrice`: Unit price per item
  - `CustomerID`: Unique customer identifier
  - `Country`: Country of purchase

### Secondary Dataset: Kaggle Grocery Data

- **Source**: Kaggle - Grocery Store Dataset
- **Purpose**: Complement the primary dataset with additional features and validate findings across different retail contexts

---

## Analysis Philosophy & Methodology

### Design Philosophy

Our analytical approach follows a **systematic, multi-stage methodology** that balances exploratory discovery with rigorous statistical validation:

1. **Exploratory Phase**: Comprehensive data exploration to understand data quality, distributions, and initial patterns
2. **Preprocessing Phase**: Data cleaning, transformation, and feature engineering to prepare data for advanced analytics
3. **Descriptive Analysis**: Statistical summaries and visualizations to understand historical patterns
4. **Predictive Analysis**: Machine learning models to forecast future trends
5. **Validation Phase**: Cross-validation and model evaluation to ensure reliability

### Methodology Framework

```
Data Collection → Data Cleaning → EDA → Feature Engineering → 
Modeling → Validation → Visualization → Insights & Recommendations
```

### Key Methodological Principles

- **Reproducibility**: All analyses are documented and code is version-controlled
- **Statistical Rigor**: Appropriate statistical tests and validation techniques applied
- **Interpretability**: Models and findings are explainable and actionable
- **Scalability**: Solutions designed to handle large-scale retail data

---

## Research Questions

### 1. Product Association Analysis
**Question**: Which products are most frequently bought together?

**Approach**:
- Market Basket Analysis using Apriori and FP-Growth algorithms
- Association Rule Mining with support, confidence, and lift metrics
- Visualization of product networks and frequent itemsets

**Expected Insights**: 
- Cross-selling opportunities
- Product bundling strategies
- Inventory co-location recommendations

---

### 2. Temporal Purchase Patterns
**Question**: Do certain times of day/week show higher purchase volume?

**Approach**:
- Time-series decomposition to identify trends and seasonality
- Statistical analysis of purchase volumes by hour, day of week, and month
- Peak hour and peak day identification
- Holiday and seasonal pattern detection

**Expected Insights**:
- Optimal marketing campaign timing
- Resource allocation for customer service
- Inventory replenishment scheduling

---

### 3. Customer Segmentation
**Question**: What does customer segmentation by basket size reveal?

**Approach**:
- RFM (Recency, Frequency, Monetary) Analysis
- Clustering analysis: K-Means, Hierarchical Clustering, DBSCAN
- Supervised vs. Unsupervised Learning comparison
- Customer lifetime value (CLV) calculation

**Expected Insights**:
- Customer tier identification
- Personalized marketing strategies
- Retention strategies for different segments

---

### 4. Seasonal Pattern Analysis
**Question**: Are there seasonal purchase patterns (e.g., holiday spikes)?

**Approach**:
- Time-series analysis with seasonal decomposition
- Holiday impact analysis
- Year-over-year comparison
- Seasonal index calculation

**Expected Insights**:
- Forecast accuracy improvement
- Seasonal marketing planning
- Inventory management optimization

---

### 5. Advanced Customer Clustering
**Question**: Is there a way to cluster customers based on this data? Showcase using supervised or unsupervised clustering.

**Approach**:
- **Unsupervised Learning**: K-Means, Hierarchical Clustering, DBSCAN
- **Supervised Learning**: Classification models with customer labels
- Comparison and justification of chosen approach
- Cluster interpretation and business relevance

**Methodology Selection Justification**:
- Initial unsupervised clustering to discover natural customer groups
- Feature engineering based on customer behavior metrics
- Evaluation using silhouette score, elbow method, and business interpretability
- Chosen method justified based on data characteristics and business objectives

---

### 6. Interactive Geographical Analysis
**Question**: Aggregate data on yearly granularity for each country, then produce an interactive bar chart allowing country selection to display yearly sales.

**Approach**:
- Data aggregation by country and year
- Interactive visualization using Plotly/Dash or Streamlit
- Dynamic filtering and drill-down capabilities
- Comparative analysis across countries

**Expected Insights**:
- Market performance by geography
- Growth trends identification
- Market expansion opportunities

---

### 7. Predictive & Descriptive Analysis
**Question**: Perform predictive and descriptive analysis using this data and any other sources deemed necessary.

**Approach**:
- **Descriptive Analysis**: 
  - Statistical summaries
  - Distribution analysis
  - Correlation analysis
  - Cohort analysis

- **Predictive Analysis**:
  - Sales forecasting (ARIMA, Prophet, LSTM)
  - Customer churn prediction
  - Next purchase prediction
  - Basket size prediction

**Additional Data Sources** (if required):
- Economic indicators (GDP, inflation rates)
- Demographic data by country
- Holiday calendars
- Marketing campaign data

---



---

## Methodology & Implementation

### 1. Data Preprocessing

- **Data Quality Assessment**: Missing values, duplicates, outliers
- **Data Cleaning**: 
  - Remove invalid transactions (negative quantities, zero prices)
  - Handle missing CustomerIDs
  - Standardize product descriptions
- **Feature Engineering**:
  - Create temporal features (hour, day_of_week, month, season)
  - Calculate basket size, transaction value
  - Compute RFM metrics
  - Extract country-level features

### 2. Association Rule Mining

**Algorithm**: Apriori Algorithm / FP-Growth
- Minimum support threshold: 0.01 (1%)
- Minimum confidence threshold: 0.3 (30%)
- Lift > 1.0 for meaningful associations

**Metrics**:
- **Support**: Frequency of itemset occurrence
- **Confidence**: Conditional probability of consequent given antecedent
- **Lift**: Strength of association relative to independence

### 3. Temporal Analysis

- **Hourly Patterns**: Distribution of purchases across 24 hours
- **Day-of-Week Patterns**: Weekly purchasing behavior
- **Monthly Trends**: Long-term sales trajectory
- **Seasonal Decomposition**: Trend, seasonal, and residual components

### 4. Customer Segmentation

**Clustering Approach Comparison**:

#### Unsupervised Learning (Primary Method)
- **K-Means Clustering**: Based on RFM scores
  - Advantages: Fast, interpretable, works well with numeric features
  - Limitations: Assumes spherical clusters, requires k specification
  - Justification: RFM features form natural groupings, business-interpretable clusters

#### Alternative: Hierarchical Clustering
- Advantages: No need to pre-specify k, dendrogram visualization
- Limitations: Computationally expensive for large datasets

#### Supervised Learning (Secondary Method)
- Classification with predefined customer labels
- Comparison with unsupervised results
- Validation of cluster quality

**Selection Rationale**: We primarily use **unsupervised K-Means clustering** because:
1. Customer segments are unknown a priori
2. RFM features naturally form distinct clusters
3. Business interpretability and actionability
4. Scalability for large datasets

### 5. Geographical Analysis

- Aggregation by country and year
- Interactive dashboard with country selection
- Year-over-year growth calculations
- Market share analysis

### 6. Predictive Modeling

**Models Implemented**:
1. **Time Series Forecasting**:
   - ARIMA for linear trends
   - Prophet for seasonality handling
   - LSTM for complex patterns

2. **Classification**:
   - Customer churn prediction
   - Product category preference

3. **Regression**:
   - Sales forecasting
   - Basket value prediction

**Model Evaluation**:
- Cross-validation
- RMSE, MAE for regression
- Accuracy, Precision, Recall, F1 for classification
- AIC/BIC for model selection

---

## Key Findings

### Preliminary Insights (To be updated with analysis results)

1. **Product Associations**: 
   - [Findings from market basket analysis]

2. **Temporal Patterns**:
   - [Peak hours and days identified]

3. **Customer Segments**:
   - [Number of segments and their characteristics]

4. **Seasonal Trends**:
   - [Holiday spikes and seasonal patterns]

5. **Geographical Performance**:
   - [Top performing countries]

6. **Predictive Insights**:
   - [Forecasted trends and model performance]

*Note: Detailed findings will be documented as the analysis progresses.*

---

## Technologies & Tools

### Programming Languages
- **Python 3.8+**: Primary analysis language

### Core Libraries
- **Pandas**: Data manipulation and analysis
- **NumPy**: Numerical computing
- **Scikit-learn**: Machine learning algorithms
- **MLxtend**: Association rule mining
- **Statsmodels**: Statistical modeling and time series
- **Prophet**: Time series forecasting

### Visualization
- **Matplotlib**: Static plotting
- **Seaborn**: Statistical visualization
- **Plotly**: Interactive visualizations
- **Dash/Streamlit**: Interactive dashboards

### Data Processing
- **Jupyter Notebooks**: Interactive development
- **Scipy**: Statistical functions

### Version Control
- **Git**: Code versioning
- **GitHub**: Repository hosting

---

## Installation & Setup

### Prerequisites
- Python 3.8 or higher
- pip or conda package manager

### Installation Steps

1. **Clone the repository**:
```bash
git clone https://github.com/yourusername/Retail-Stock-Market-Behavior-Analysis.git
cd Retail-Stock-Market-Behavior-Analysis
```

2. **Create a virtual environment** (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

### Required Packages

Create a `requirements.txt` file with:
```
pandas>=1.5.0
numpy>=1.23.0
matplotlib>=3.6.0
seaborn>=0.12.0
plotly>=5.10.0
scikit-learn>=1.1.0
mlxtend>=0.22.0
statsmodels>=0.13.0
prophet>=1.1.0
jupyter>=1.0.0
dash>=2.6.0
streamlit>=1.12.0
scipy>=1.9.0
```

---

## Usage

### Running the Analysis

1. **Start Jupyter Notebook**:
```bash
jupyter notebook
```

2. **Execute notebooks in order**:
   - Start with `01_data_exploration.ipynb`
   - Proceed sequentially through the analysis pipeline

3. **Run interactive dashboard**:
```bash
streamlit run src/visualization/interactive_charts.py
```

### Data Download

1. Download the UCI Online Retail dataset from [here](https://archive.ics.uci.edu/dataset/352/online+retail)
2. Place the dataset in `data/raw/` directory
3. Update the data path in the loading scripts if necessary

---

## Future Work

1. **Advanced Modeling**:
   - Deep learning models for customer behavior prediction
   - Reinforcement learning for recommendation systems

2. **Real-time Analytics**:
   - Stream processing for live transaction analysis
   - Real-time recommendation engine

3. **Enhanced Features**:
   - Sentiment analysis on product reviews
   - Social media data integration
   - Weather data correlation

4. **Business Applications**:
   - Automated inventory management system
   - Dynamic pricing model
   - Customer retention strategy automation

---

## References

### Datasets
1. Daqing Chen, Sai Liang Sain, and Kun Guo, "Data mining for the online retail industry: A case study of RFM model-based customer segmentation using data mining," Journal of Database Marketing and Customer Strategy Management, Vol. 19, No. 3, pp. 197-208, 2012.

2. UCI Machine Learning Repository: [Online Retail Dataset](https://archive.ics.uci.edu/dataset/352/online+retail)

### Academic Papers
- Agrawal, R., Imieliński, T., & Swami, A. (1993). Mining association rules between sets of items in large databases.
- Berry, M. J., & Linoff, G. S. (2004). Data Mining Techniques: For Marketing, Sales, and Customer Relationship Management.
- Kumar, V., & Reinartz, W. (2012). Customer Relationship Management: Concept, Strategy, and Tools.

### Tools & Libraries Documentation
- [Pandas Documentation](https://pandas.pydata.org/docs/)
- [Scikit-learn User Guide](https://scikit-learn.org/stable/user_guide.html)
- [MLxtend Documentation](https://rasbt.github.io/mlxtend/)

---

## License

This project is created for educational purposes as part of a Data Mining course.

---

## Acknowledgments

- UCI Machine Learning Repository for providing the dataset
- Kaggle community for additional resources and datasets
- Course instructors and teaching assistants

---

**Last Updated**: [Current Date]  
**Version**: 1.0
