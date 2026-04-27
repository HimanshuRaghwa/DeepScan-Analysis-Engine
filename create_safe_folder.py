import os

folder_path = os.path.join("TEST_DATA", "SAFE_ONLY")
os.makedirs(folder_path, exist_ok=True)

files = [
    "project_report.docx",
    "family_photo.jpg",
    "notes.txt",
    "budget_spreadsheet.xlsx"
]

for filename in files:
    filepath = os.path.join(folder_path, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("DUMMY SAFE DATA")

print(f"Created safe folder at: {folder_path}")
