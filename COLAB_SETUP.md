# Google Colab Setup Guide

This guide will help you set up and run the Retail Stock Market Behavior Analysis project on Google Colab.

## Quick Start

1. **Access the Team Colab Workspace**: 
   - [Team Colab Link](https://colab.research.google.com/drive/1TR2k5w3yV2TNT4fVq-lSpSzgH8AfQBeS?usp=sharing)
   - Or open [Google Colab](https://colab.research.google.com/) directly

2. **Upload a notebook**: Click "File" → "Upload notebook" → Select one of the notebooks from the `notebooks/` folder

3. **Run the setup cell**: Each notebook starts with a setup cell that will:
   - Mount Google Drive (if needed)
   - Install all required packages
   - Set up the environment

4. **Load your data**: Choose one of the methods below

## Data Loading Options

### Option 1: Upload Directly to Colab (Easiest)

1. In Colab, click on the folder icon in the left sidebar (Files)
2. Click "Upload to session storage"
3. Upload your `OnlineRetail.csv` or `OnlineRetail.xlsx` file
4. Use this path in your notebook:
   ```python
   df = pd.read_csv('/content/OnlineRetail.csv', encoding='latin-1')
   ```

### Option 2: Use Google Drive

1. Upload your dataset to Google Drive
2. In the notebook, run:
   ```python
   from google.colab import drive
   drive.mount('/content/drive')
   ```
3. Use this path in your notebook:
   ```python
   df = pd.read_csv('/content/drive/MyDrive/path/to/OnlineRetail.csv', encoding='latin-1')
   ```

### Option 3: Download from UCI Repository

1. Use the download command in the notebook:
   ```python
   !wget https://archive.ics.uci.edu/ml/machine-learning-databases/00352/Online%20Retail.xlsx
   df = pd.read_excel('/content/Online Retail.xlsx', sheet_name='Online Retail')
   ```

## Working with Multiple Notebooks

### Method 1: Sequential Execution
- Run each notebook in order (01 → 02 → 03...)
- Save intermediate outputs to Drive or download them
- Load saved outputs in the next notebook

### Method 2: Mount Drive and Use Shared Folder
1. Create a project folder in Google Drive
2. Upload all notebooks to this folder
3. Mount Drive once at the start of each notebook
4. Use consistent paths for input/output files

## Saving Your Work

### Save to Google Drive
```python
# Save processed data
df_processed.to_csv('/content/drive/MyDrive/project/data/processed.csv', index=False)

# Save visualizations
plt.savefig('/content/drive/MyDrive/project/reports/figure.png')
```

### Download Files
- Right-click on files in the Colab file browser
- Select "Download"
- Or use:
  ```python
  from google.colab import files
  files.download('output_file.csv')
  ```

## Tips for Colab

1. **Runtime**: Use GPU/TPU if needed (Runtime → Change runtime type)
2. **Session Management**: Colab sessions disconnect after inactivity - save your work!
3. **Memory**: Large datasets may require upgrading to Colab Pro
4. **Sharing**: Share notebooks easily via the "Share" button
5. **Git Integration**: Install and use Git directly in Colab if needed

## Troubleshooting

### Packages Not Installing
- Use `%pip install` instead of `!pip install` if needed
- Restart runtime after installing: Runtime → Restart runtime

### File Not Found
- Check the file path carefully
- Use `!ls` to list files in current directory
- Ensure Drive is properly mounted

### Memory Issues
- Delete large variables: `del variable_name`
- Clear output: Runtime → Clear all outputs
- Restart runtime if needed

## Additional Resources

- [Google Colab Documentation](https://colab.research.google.com/notebooks/intro.ipynb)
- [Colab FAQ](https://research.google.com/colaboratory/faq.html)

