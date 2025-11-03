"""
Module for customer segmentation and RFM analysis.
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score


def calculate_rfm(df, reference_date=None):
    """
    Calculate RFM (Recency, Frequency, Monetary) metrics for each customer.
    
    Parameters:
    -----------
    df : pd.DataFrame
        Transaction dataset
    reference_date : datetime, optional
        Reference date for recency calculation. If None, uses max date.
        
    Returns:
    --------
    pd.DataFrame
        RFM metrics per customer
    """
    if reference_date is None:
        reference_date = df['InvoiceDate'].max()
    
    rfm = df.groupby('CustomerID').agg({
        'InvoiceDate': lambda x: (reference_date - x.max()).days,  # Recency
        'InvoiceNo': 'nunique',  # Frequency
        'TotalValue': 'sum'  # Monetary
    }).reset_index()
    
    rfm.columns = ['CustomerID', 'Recency', 'Frequency', 'Monetary']
    
    # Handle any negative recency (future dates)
    rfm['Recency'] = rfm['Recency'].clip(lower=0)
    
    return rfm


def perform_clustering(rfm_df, n_clusters=4, method='kmeans'):
    """
    Perform customer clustering based on RFM metrics.
    
    Parameters:
    -----------
    rfm_df : pd.DataFrame
        RFM metrics dataframe
    n_clusters : int, default=4
        Number of clusters
    method : str, default='kmeans'
        Clustering method ('kmeans' or 'hierarchical')
        
    Returns:
    --------
    pd.DataFrame
        RFM dataframe with cluster labels
    """
    # Prepare data for clustering
    rfm_scaled = rfm_df[['Recency', 'Frequency', 'Monetary']].copy()
    
    # Handle any infinite or null values
    rfm_scaled = rfm_scaled.replace([np.inf, -np.inf], np.nan)
    rfm_scaled = rfm_scaled.fillna(rfm_scaled.median())
    
    # Scale the features
    scaler = StandardScaler()
    rfm_scaled_values = scaler.fit_transform(rfm_scaled)
    
    # Perform clustering
    if method == 'kmeans':
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        clusters = kmeans.fit_predict(rfm_scaled_values)
    else:
        raise ValueError(f"Unknown clustering method: {method}")
    
    # Add cluster labels
    rfm_df = rfm_df.copy()
    rfm_df['Cluster'] = clusters
    
    return rfm_df

