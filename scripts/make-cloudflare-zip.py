import os
import zipfile

dist_dir = os.path.abspath('dist')
zip_path = os.path.abspath('cloudflare-pages.zip')

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(dist_dir):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = os.path.relpath(file_path, dist_dir)
            zipf.write(file_path, arcname)

print(f"Created {zip_path} ({os.path.getsize(zip_path) / 1024:.1f} KB)")
