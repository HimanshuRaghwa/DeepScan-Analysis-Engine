import os

folder_path = os.path.join("TEST_DATA", "HIGH_RISK_ONLY")
os.makedirs(folder_path, exist_ok=True)

files = [
    "virus_test_file.bin",
    "malware_sample.exe",
    "eicar_signature.txt"
]

for filename in files:
    filepath = os.path.join(folder_path, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("DUMMY HIGH RISK DATA")

print(f"Created high risk folder at: {folder_path}")
