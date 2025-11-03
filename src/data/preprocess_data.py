"""
Module for data cleaning and preprocessing.
"""

import pandas as pd
import numpy as np
from datetime import datetime


def clean_data(df):
    """
    Clean the retail transaction dataset.
    
    Parameters:
    -----------
    df : pd.DataFrame
        Raw dataset
        
    Returns:
    --------
    pd.DataFrame
        Cleaned dataset
    """
    df_clean = df.copy()
    
    # Remove rows with negative quantities
    df_clean = df_clean[df_clean['Quantity'] > 0]
    
    # Remove rows with zero or negative prices
    df_clean = df_clean[df_clean['UnitPrice'] > 0]
    
    # Remove cancelled invoices (typically start with 'C')
    df_clean = df_clean[~df_clean['InvoiceNo'].astype(str).str.startswith('C')]
    
    # Convert InvoiceDate to datetime
    df_clean['InvoiceDate'] = pd.to_datetime(df_clean['InvoiceDate'])
    
    # Remove rows with missing critical information
    df_clean = df_clean.dropna(subset=['InvoiceNo', 'StockCode', 'Description'])
    
    return df_clean


def create_features(df):
    """
    Create derived features from the cleaned dataset.
    
    Parameters:
    -----------
    df : pd.DataFrame
        Cleaned dataset
        
    Returns:
    --------
    pd.DataFrame
        Dataset with new features
    """
    df_featured = df.copy()
    
    # Calculate total transaction value
    df_featured['TotalValue'] = df_featured['Quantity'] * df_featured['UnitPrice']
    
    # Extract temporal features
    df_featured['Hour'] = df_featured['InvoiceDate'].dt.hour
    df_featured['DayOfWeek'] = df_featured['InvoiceDate'].dt.dayofweek
    df_featured['DayName'] = df_featured['InvoiceDate'].dt.day_name()
    df_featured['Month'] = df_featured['InvoiceDate'].dt.month
    df_featured['MonthName'] = df_featured['InvoiceDate'].dt.month_name()
    df_featured['Year'] = df_featured['InvoiceDate'].dt.year
    df_featured['Quarter'] = df_featured['InvoiceDate'].dt.quarter
    
    # Extract date components
    df_featured['Date'] = df_featured['InvoiceDate'].dt.date
    
    # Determine season
    df_featured['Season'] = df_featured['Month'].apply(get_season)
    
    return df_featured


def get_season(month):
    """
    Map month to season.
    
    Parameters:
    -----------
    month : int
        Month number (1-12)
        
    Returns:
    --------
    str
        Season name
    """
    if month in [12, 1, 2]:
        return 'Winter'
    elif month in [3, 4, 5]:
        return 'Spring'
    elif month in [6, 7, 8]:
        return 'Summer'
    else:
        return 'Autumn'

