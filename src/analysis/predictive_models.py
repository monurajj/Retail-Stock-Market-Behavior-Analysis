"""
Module for predictive modeling and forecasting.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score, accuracy_score, classification_report
from statsmodels.tsa.arima.model import ARIMA
from prophet import Prophet
import warnings
warnings.filterwarnings('ignore')


def train_sales_forecast(df, model_type='arima', test_size=0.2):
    """
    Train a sales forecasting model.
    
    Parameters:
    -----------
    df : pd.DataFrame
        Time series data with date index
    model_type : str, default='arima'
        Model type ('arima' or 'prophet')
    test_size : float, default=0.2
        Proportion of data for testing
        
    Returns:
    --------
    tuple
        (model, predictions, metrics)
    """
    # Prepare data
    train_size = int(len(df) * (1 - test_size))
    train = df[:train_size]
    test = df[train_size:]
    
    if model_type == 'arima':
        # ARIMA model
        model = ARIMA(train['TotalValue'], order=(5, 1, 0))
        fitted_model = model.fit()
        predictions = fitted_model.forecast(steps=len(test))
        
    elif model_type == 'prophet':
        # Prophet model
        prophet_df = train.reset_index()
        prophet_df.columns = ['ds', 'y']
        
        model = Prophet()
        model.fit(prophet_df)
        
        future = model.make_future_dataframe(periods=len(test))
        forecast = model.predict(future)
        predictions = forecast.tail(len(test))['yhat'].values
        
    else:
        raise ValueError(f"Unknown model type: {model_type}")
    
    # Calculate metrics
    rmse = np.sqrt(mean_squared_error(test['TotalValue'], predictions))
    mae = mean_absolute_error(test['TotalValue'], predictions)
    r2 = r2_score(test['TotalValue'], predictions)
    
    metrics = {'RMSE': rmse, 'MAE': mae, 'R2': r2}
    
    return model, predictions, metrics


def predict_customer_churn(df, threshold_days=90):
    """
    Predict customer churn based on recency.
    
    Parameters:
    -----------
    df : pd.DataFrame
        Transaction dataset
    threshold_days : int, default=90
        Days since last purchase to consider as churned
        
    Returns:
    --------
    pd.DataFrame
        Customer churn predictions
    """
    from .customer_segmentation import calculate_rfm
    
    # Calculate RFM
    rfm = calculate_rfm(df)
    
    # Define churn (customers with recency > threshold)
    rfm['Churned'] = (rfm['Recency'] > threshold_days).astype(int)
    
    return rfm[['CustomerID', 'Recency', 'Churned']]

