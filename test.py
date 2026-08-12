import pandas as pd


def extract_findings_and_impression(report):
    findings = ""
    impression = ""
    in_findings_section = False
    in_impression_section = False

    # Split the report into lines and process each line
    for line in report.split('\n'):
        if "FINDINGS:" in line:
            in_findings_section = True
            in_impression_section = False
            continue
        elif "IMPRESSION:" in line:
            in_findings_section = False
            in_impression_section = True
            continue

        if in_findings_section:
            findings += line + ' '
        elif in_impression_section:
            impression += line + ' '

    return findings.strip(), impression.strip()


def process_csv(input_file, output_file):
    # Read the CSV file
    df = pd.read_csv(input_file)

    # Process each row and update the report column directly
    for index, row in df.iterrows():
        study_id = row['study_id']
        report = row['report']

        findings, impression = extract_findings_and_impression(report)

        # Combine findings and impression with a single space between them
        processed_report = f"{findings} {impression}".strip()

        # Update the existing DataFrame instead of creating a new one
        df.at[index, 'report'] = processed_report

    # Save the updated DataFrame to a new CSV file
    df.to_csv(output_file, index=False)


if __name__ == "__main__":
    input_file = '/Users/tianxu/PycharmProjects/xudangliatiger.github.io/test_public_huatuo_v3.csv'  # Replace with your input CSV file path
    output_file = '/Users/tianxu/PycharmProjects/xudangliatiger.github.io/test_public_huatuo_v3_revised.csv'  # Replace with your output CSV file path
    process_csv(input_file, output_file)