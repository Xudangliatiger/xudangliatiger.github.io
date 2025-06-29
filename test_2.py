import pandas as pd


def merge_csv_columns(file1, file2, output_file):
    # Read the first CSV file
    df1 = pd.read_csv(file1)
    # Read the second CSV file
    df2 = pd.read_csv(file2)

    # Ensure that both dataframes have the same number of rows and the same IDs in the first column
    if not df1.iloc[:, 0].equals(df2.iloc[:, 0]):
        raise ValueError("The first columns (IDs) of the two CSV files do not match.")

    # Merge the second columns from both CSVs into one string separated by a space or any other delimiter you prefer
    df1['report'] = df1['report'].astype(str) + ' ' + df2['report'].astype(str)

    # Optionally, clean up any extra whitespace
    df1['report'] = df1['report'].str.strip()

    # Save the updated DataFrame to a new CSV file
    df1.to_csv(output_file, index=False)


if __name__ == "__main__":
    file1 = '/Users/tianxu/PycharmProjects/xudangliatiger.github.io/test_public_v1_40000.csv'  # Replace with your first input CSV file path
    file2 = '/Users/tianxu/PycharmProjects/xudangliatiger.github.io/test_public_huatuo_v3_revised.csv'  # Replace with your second input CSV file path
    output_file = '/Users/tianxu/PycharmProjects/xudangliatiger.github.io/test_public_huatuo_v3_revised_plus_baseline.csv'  # Replace with your output CSV file path

    merge_csv_columns(file1, file2, output_file)