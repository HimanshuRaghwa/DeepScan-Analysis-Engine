import os

base_dir = "TEST_DATA"
nested_dir = os.path.join(base_dir, "nested_folder")

os.makedirs(nested_dir, exist_ok=True)

files_to_create = {
    os.path.join(base_dir, "safe_document.txt"): "This is a completely safe and innocent text document.",
    os.path.join(base_dir, "eicar-test-file.txt"): "X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*",
    os.path.join(base_dir, "game_crack_patch.zip"): "PK\x03\x04... dummy zip content ...",
    os.path.join(base_dir, "suspicious_script.bat"): "@echo off\nping 127.0.0.1 -n 5 > nul\necho Done.",
    os.path.join(nested_dir, "malware_payload.bin"): "\x4D\x5A\x90\x00\x03\x00\x00\x00",
    os.path.join(nested_dir, "innocent_image.jpg"): "\xFF\xD8\xFF\xE0... fake image bytes ..."
}

for filepath, content in files_to_create.items():
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

print(f"Created dummy test data in '{base_dir}' directory.")
