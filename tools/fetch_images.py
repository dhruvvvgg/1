import urllib.request
import re
import os
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

urls_to_check = [
    'https://www.srmist.edu.in/',
    'https://www.srmist.edu.in/about-us/',
    'https://www.srmist.edu.in/campus-life/',
    'https://www.srmist.edu.in/infrastructure/',
    'https://www.srmist.edu.in/research/'
]

all_images = set()

for url in urls_to_check:
    print(f"Fetching {url}...")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            found = re.findall(r'https?://[^\s"\'<>]+\.(?:jpg|jpeg|png|webp|svg)', html, re.IGNORECASE)
            print(f"  Found {len(found)} image links")
            all_images.update(found)
    except Exception as e:
        print(f"  Error: {e}")

print(f"\nTotal unique images collected: {len(all_images)}")
# Filter for interesting ones
filtered = [img for img in all_images if any(k in img.lower() for k in ['campus', 'tech', 'park', 'tp', 'building', 'srm', 'banner', 'slider', 'logo', 'ktr', 'lab', 'aerial'])]

print("\nInteresting images:")
for img in sorted(filtered)[:40]:
    print(img)

with open('tools/found_images.json', 'w') as f:
    json.dump(list(all_images), f, indent=2)
