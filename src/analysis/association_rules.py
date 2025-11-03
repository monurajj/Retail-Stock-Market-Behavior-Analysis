"""
Module for association rule mining and market basket analysis.
"""

import pandas as pd
import numpy as np
from mlxtend.frequent_patterns import apriori, association_rules
from mlxtend.preprocessing import TransactionEncoder
import matplotlib.pyplot as plt
import seaborn as sns


def generate_rules(df, min_support=0.01, min_confidence=0.3):
    """
    Generate association rules from transaction data.
    
    Parameters:
    -----------
    df : pd.DataFrame
        Transaction dataset
    min_support : float, default=0.01
        Minimum support threshold
    min_confidence : float, default=0.3
        Minimum confidence threshold
        
    Returns:
    --------
    pd.DataFrame
        Association rules with metrics
    """
    # Prepare basket data
    basket = df.groupby(['InvoiceNo', 'Description'])['Quantity'].sum().unstack().reset_index().fillna(0).set_index('InvoiceNo')
    
    # Convert to binary
    basket_sets = basket.applymap(lambda x: 1 if x > 0 else 0)
    
    # Generate frequent itemsets
    frequent_itemsets = apriori(basket_sets, min_support=min_support, use_colnames=True)
    
    # Generate rules
    rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=min_confidence)
    
    # Sort by lift
    rules = rules.sort_values('lift', ascending=False)
    
    return rules


def visualize_rules(rules, top_n=10):
    """
    Visualize association rules.
    
    Parameters:
    -----------
    rules : pd.DataFrame
        Association rules
    top_n : int, default=10
        Number of top rules to visualize
    """
    top_rules = rules.head(top_n)
    
    fig, axes = plt.subplots(1, 2, figsize=(15, 5))
    
    # Scatter plot: Support vs Confidence
    axes[0].scatter(top_rules['support'], top_rules['confidence'], 
                    s=top_rules['lift']*100, alpha=0.6, c=top_rules['lift'])
    axes[0].set_xlabel('Support')
    axes[0].set_ylabel('Confidence')
    axes[0].set_title('Support vs Confidence (size = Lift)')
    
    # Bar plot: Top rules by lift
    axes[1].barh(range(len(top_rules)), top_rules['lift'])
    axes[1].set_yticks(range(len(top_rules)))
    axes[1].set_yticklabels([f"{row['antecedents']} -> {row['consequents']}" 
                              for _, row in top_rules.iterrows()], fontsize=8)
    axes[1].set_xlabel('Lift')
    axes[1].set_title('Top Rules by Lift')
    
    plt.tight_layout()
    return fig

