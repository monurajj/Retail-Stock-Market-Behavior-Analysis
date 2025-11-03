"""
Module for loading retail transaction data.
"""

import pandas as pd
import numpy as np
from pathlib import Path


def load_retail_data(file_path, encoding='latin-1'):
    """
    Load the UCI Online Retail dataset.
    
    Parameters:
    -----------
    file_path : str
        Path to the CSV file
    encoding : str, default='latin-1'
        File encoding
        
    Returns:
    --------
    pd.DataFrame
        Loaded dataset
    """
    df = pd.read_csv(file_path, encoding=encoding)
    return df


def load_kaggle_data(file_path, encoding='utf-8'):
    """
    Load Kaggle grocery dataset.
    
    Parameters:
    -----------
    file_path : str
        Path to the CSV file
    encoding : str, default='utf-8'
        File encoding
        
    Returns:
    --------
    pd.DataFrame
        Loaded dataset
    """
    df = pd.read_csv(file_path, encoding=encoding)
    return df

