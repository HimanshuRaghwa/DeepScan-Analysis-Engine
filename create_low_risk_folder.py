import os

folder_path = os.path.join("TEST_DATA", "LOW_RISK_ONLY")
os.makedirs(folder_path, exist_ok=True)

files = [
    "suspicious_document.pdf",
    "suspicious_activity_log.txt",
    "suspicious_macro.docm"
]

for filename in files:
    filepath = os.path.join(folder_path, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("DUMMY LOW RISK DATA")

print(f"Created low risk folder at: {folder_path}")
