"""
Module for static visualizations.
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import seaborn as sns


def plot_temporal_patterns(df, pattern_type='hourly'):
    """
    Plot temporal purchase patterns.
    
    Parameters:
    -----------
    df : pd.DataFrame
        Aggregated temporal data
    pattern_type : str, default='hourly'
        Type of pattern ('hourly', 'daily', 'monthly')
        
    Returns:
    --------
    matplotlib.figure.Figure
        Plot figure
    """
    fig, ax = plt.subplots(figsize=(12, 6))
    
    if pattern_type == 'hourly':
        ax.plot(df.index, df['Total_Value'], marker='o')
        ax.set_xlabel('Hour of Day')
        ax.set_xticks(range(24))
    elif pattern_type == 'daily':
        ax.bar(range(len(df)), df['Total_Value'])
        ax.set_xticks(range(len(df)))
        ax.set_xticklabels(df['DayName'], rotation=45)
        ax.set_xlabel('Day of Week')
    elif pattern_type == 'monthly':
        ax.plot(df.index, df['Total_Value'], marker='o')
        ax.set_xlabel('Month')
        ax.set_xticks(range(1, 13))
        ax.set_xticklabels(df['MonthName'], rotation=45)
    
    ax.set_ylabel('Total Sales Value ($)')
    ax.set_title(f'{pattern_type.title()} Purchase Patterns')
    ax.grid(True, alpha=0.3)
    
    plt.tight_layout()
    return fig


def plot_customer_segments(rfm_df):
    """
    Plot customer segmentation visualization.
    
    Parameters:
    -----------
    rfm_df : pd.DataFrame
        RFM dataframe with cluster labels
        
    Returns:
    --------
    matplotlib.figure.Figure
        Plot figure
    """
    fig = plt.figure(figsize=(15, 5))
    
    # 3D scatter plot
    ax1 = fig.add_subplot(131, projection='3d')
    scatter = ax1.scatter(rfm_df['Recency'], rfm_df['Frequency'], 
                         rfm_df['Monetary'], c=rfm_df['Cluster'], cmap='viridis')
    ax1.set_xlabel('Recency')
    ax1.set_ylabel('Frequency')
    ax1.set_zlabel('Monetary')
    ax1.set_title('Customer Segments (3D)')
    plt.colorbar(scatter, ax=ax1)
    
    # RF vs M
    ax2 = fig.add_subplot(132)
    for cluster in rfm_df['Cluster'].unique():
        cluster_data = rfm_df[rfm_df['Cluster'] == cluster]
        ax2.scatter(cluster_data['Recency'], cluster_data['Frequency'], 
                   label=f'Cluster {cluster}', alpha=0.6)
    ax2.set_xlabel('Recency')
    ax2.set_ylabel('Frequency')
    ax2.set_title('Recency vs Frequency')
    ax2.legend()
    ax2.grid(True, alpha=0.3)
    
    # Cluster sizes
    ax3 = fig.add_subplot(133)
    cluster_sizes = rfm_df['Cluster'].value_counts().sort_index()
    ax3.bar(cluster_sizes.index, cluster_sizes.values)
    ax3.set_xlabel('Cluster')
    ax3.set_ylabel('Number of Customers')
    ax3.set_title('Cluster Sizes')
    ax3.grid(True, alpha=0.3, axis='y')
    
    plt.tight_layout()
    return fig

