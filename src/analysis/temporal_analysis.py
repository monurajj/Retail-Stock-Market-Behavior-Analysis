"""
Module for temporal pattern analysis.
"""

import pandas as pd
import numpy as np
from datetime import datetime


def analyze_hourly(df):
    """
    Analyze purchase patterns by hour of day.
    
    Parameters:
    -----------
    df : pd.DataFrame
        Transaction dataset with InvoiceDate column
        
    Returns:
    --------
    pd.DataFrame
        Aggregated hourly statistics
    """
    hourly_stats = df.groupby('Hour').agg({
        'Quantity': ['sum', 'mean', 'count'],
        'TotalValue': ['sum', 'mean'],
        'InvoiceNo': 'nunique'
    }).round(2)
    
    hourly_stats.columns = ['Total_Quantity', 'Avg_Quantity', 'Num_Transactions',
                           'Total_Value', 'Avg_Value', 'Unique_Invoices']
    
    return hourly_stats


def analyze_daily(df):
    """
    Analyze purchase patterns by day of week.
    
    Parameters:
    -----------
    df : pd.DataFrame
        Transaction dataset with InvoiceDate column
        
    Returns:
    --------
    pd.DataFrame
        Aggregated daily statistics
    """
    daily_stats = df.groupby('DayOfWeek').agg({
        'Quantity': ['sum', 'mean', 'count'],
        'TotalValue': ['sum', 'mean'],
        'InvoiceNo': 'nunique'
    }).round(2)
    
    daily_stats.columns = ['Total_Quantity', 'Avg_Quantity', 'Num_Transactions',
                           'Total_Value', 'Avg_Value', 'Unique_Invoices']
    
    # Add day names
    day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    daily_stats['DayName'] = [day_names[i] for i in daily_stats.index]
    
    return daily_stats


def analyze_monthly(df):
    """
    Analyze purchase patterns by month.
    
    Parameters:
    -----------
    df : pd.DataFrame
        Transaction dataset with InvoiceDate column
        
    Returns:
    --------
    pd.DataFrame
        Aggregated monthly statistics
    """
    monthly_stats = df.groupby('Month').agg({
        'Quantity': ['sum', 'mean', 'count'],
        'TotalValue': ['sum', 'mean'],
        'InvoiceNo': 'nunique'
    }).round(2)
    
    monthly_stats.columns = ['Total_Quantity', 'Avg_Quantity', 'Num_Transactions',
                            'Total_Value', 'Avg_Value', 'Unique_Invoices']
    
    month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    monthly_stats['MonthName'] = [month_names[i-1] for i in monthly_stats.index]
    
    return monthly_stats

