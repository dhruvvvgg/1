import urllib.request
import re
import json

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

extra_urls = [
    'https://www.srmist.edu.in/department/department-of-computing-technologies/',
    'https://www.srmist.edu.in/department/school-of-architecture-interior-design/',
    'https://www.srmist.edu.in/department/department-of-mechanical-engineering/',
    'https://www.srmist.edu.in/gallery/',
    'https://www.srmist.edu.in/events/',
    'https://www.srmist.edu.in/placement/',
    'https://www.srmist.edu.in/admissions/'
]

found_images = set()

for url in extra_urls:
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=12) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            imgs = re.findall(r'https?://[^\s"\'<>]+\.(?:jpg|jpeg|png|webp|svg)', html, re.IGNORECASE)
            print(f"{url}: {len(imgs)} images")
            found_images.update(imgs)
    except Exception as e:
        print(f"{url}: {e}")

with open('tools/more_images.json', 'w') as f:
    json.dump(list(found_images), f, indent=2)

print("Total new images:", len(found_images))
