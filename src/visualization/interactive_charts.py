"""
Module for interactive visualizations.
"""

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import streamlit as st


def create_country_dashboard(df):
    """
    Create an interactive dashboard for country-wise sales analysis.
    
    Parameters:
    -----------
    df : pd.DataFrame
        Aggregated sales data by country and year
        
    Returns:
    --------
    plotly.graph_objects.Figure
        Interactive dashboard figure
    """
    fig = px.bar(
        df,
        x='Year',
        y='Total_Sales',
        color='Country',
        title='Yearly Sales by Country',
        labels={'Total_Sales': 'Total Sales ($)', 'Year': 'Year'},
        barmode='group'
    )
    
    fig.update_layout(
        xaxis_title='Year',
        yaxis_title='Total Sales ($)',
        hovermode='x unified',
        height=600
    )
    
    return fig


def plot_interactive_sales(df, country=None):
    """
    Plot interactive sales visualization with country filter.
    
    Parameters:
    -----------
    df : pd.DataFrame
        Sales data
    country : str, optional
        Specific country to filter
        
    Returns:
    --------
    plotly.graph_objects.Figure
        Interactive plot
    """
    if country:
        df = df[df['Country'] == country]
    
    fig = go.Figure()
    
    for country_name in df['Country'].unique():
        country_data = df[df['Country'] == country_name]
        fig.add_trace(go.Scatter(
            x=country_data['Year'],
            y=country_data['Total_Sales'],
            mode='lines+markers',
            name=country_name
        ))
    
    fig.update_layout(
        title='Sales Trends Over Time',
        xaxis_title='Year',
        yaxis_title='Total Sales ($)',
        hovermode='x unified'
    )
    
    return fig

