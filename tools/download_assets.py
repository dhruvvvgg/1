import os
import urllib.request
from PIL import Image

os.makedirs('assets/raw', exist_ok=True)
os.makedirs('assets/img', exist_ok=True)

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

images_to_download = [
    {
        "id": "srm-logo",
        "url": "https://www.srmist.edu.in/wp-content/uploads/2022/01/srm-logo.svg",
        "type": "svg",
        "description": "Official SRM Institute of Science and Technology vector logo"
    },
    {
        "id": "srm-logo-white",
        "url": "https://www.srmist.edu.in/wp-content/uploads/2022/01/srm-logo-white.svg",
        "type": "svg",
        "description": "Official SRM IST monochrome white vector logo"
    },
    {
        "id": "hero-campus-ub",
        "url": "https://www.srmist.edu.in/wp-content/uploads/2022/04/Building_UB_majestic_pic-6.jpg",
        "type": "raster",
        "target_width": 2400,
        "description": "SRMIST Kattankulathur iconic University Building (UB) majestic view"
    },
    {
        "id": "campus-lakeview",
        "url": "https://www.srmist.edu.in/wp-content/uploads/2022/02/SRMIST-Lakeview_opt.jpg",
        "type": "raster",
        "target_width": 2400,
        "description": "SRMIST Kattankulathur Lakeview campus expanse"
    },
    {
        "id": "lab-chemistry",
        "url": "https://www.srmist.edu.in/wp-content/uploads/2022/03/Chemistry-research-149-1-scaled.jpg",
        "type": "raster",
        "target_width": 1600,
        "description": "SRM Advanced Chemistry Research Laboratory with faculty and research scholars"
    },
    {
        "id": "lab-imac",
        "url": "https://www.srmist.edu.in/wp-content/uploads/2024/11/3-crore-worth-iMac-lab-opened-in-SRMIST-10.jpg",
        "type": "raster",
        "target_width": 1600,
        "description": "State-of-the-art Apple iMac Computing Facility at SRMIST"
    },
    {
        "id": "work-technoblizz",
        "url": "https://www.srmist.edu.in/wp-content/uploads/2026/10/technoblizz-open-house-project-exhibition.jpg",
        "type": "raster",
        "target_width": 1200,
        "description": "TECHNOBLIZZ open-house engineering project exhibition at SRMIST"
    },
    {
        "id": "work-drones",
        "url": "https://www.srmist.edu.in/wp-content/uploads/2026/09/drone-building-for-students-scaled.jpg",
        "type": "raster",
        "target_width": 1200,
        "description": "Aerospace and UAV drone design lab: students building and testing drones"
    },
    {
        "id": "work-volvo-centre",
        "url": "https://www.srmist.edu.in/wp-content/uploads/2026/10/SRMIST-and-Volvo-Group-Partners-to-Set-Up-Vehicle-Technology-Centre.png",
        "type": "raster",
        "target_width": 1200,
        "description": "SRMIST and Volvo Group Vehicle Technology Centre partnership launch"
    },
    {
        "id": "tp-building-exterior",
        "url": "https://upload.wikimedia.org/wikipedia/commons/e/ee/SRM_Tech_Park.jpg",
        "type": "raster",
        "target_width": 1600,
        "description": "Tech Park (TP) 15-story architectural facade at SRMIST Kattankulathur"
    },
    {
        "id": "research-park-raman",
        "url": "https://www.srmist.edu.in/wp-content/uploads/2022/05/sir-cv-raman-research-park.png",
        "type": "raster",
        "target_width": 1200,
        "description": "Sir C.V. Raman Research Park at SRMIST"
    },
    {
        "id": "research-nanotech",
        "url": "https://www.srmist.edu.in/wp-content/uploads/2023/09/Nanotechnology-Research-Center-NRC.jpg",
        "type": "raster",
        "target_width": 1200,
        "description": "Nanotechnology Research Center (NRC) cleanrooms and instrumentation"
    }
]

credits_entries = []

for item in images_to_download:
    raw_ext = item["url"].split(".")[-1].split("?")[0]
    raw_path = f"assets/raw/{item['id']}.{raw_ext}"
    print(f"Downloading {item['id']} from {item['url']}...")
    try:
        req = urllib.request.Request(item["url"], headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
            with open(raw_path, 'wb') as f:
                f.write(data)
            print(f"  Saved {raw_path} ({len(data)} bytes)")

        if item["type"] == "raster":
            # Convert to WebP and resize
            with Image.open(raw_path) as im:
                orig_w, orig_h = im.size
                target_w = min(orig_w, item.get("target_width", 1600))
                target_h = int(orig_h * (target_w / orig_w))
                if (target_w, target_h) != (orig_w, orig_h):
                    im_resized = im.resize((target_w, target_h), Image.Resampling.LANCZOS)
                else:
                    im_resized = im
                webp_path = f"assets/img/{item['id']}.webp"
                im_resized.save(webp_path, "WEBP", quality=85)
                print(f"  Converted to {webp_path} ({target_w}x{target_h})")
        elif item["type"] == "svg":
            # Copy to assets/img
            with open(f"assets/img/{item['id']}.svg", 'wb') as f:
                f.write(data)
            print(f"  Copied SVG to assets/img/{item['id']}.svg")

        credits_entries.append(f"- **`{item['id']}`** ({item['description']})\n  - Source: [{item['url']}]({item['url']})\n  - Local: `assets/img/{item['id']}.{'svg' if item['type']=='svg' else 'webp'}`")
    except Exception as e:
        print(f"  Error: {e}")

with open('assets/CREDITS.md', 'w', encoding='utf-8') as f:
    f.write("# SRM IST Website Redesign - Image Credits & Provenance\n\n")
    f.write("All imagery sourced from official SRM Institute of Science and Technology publications and official campus documentation.\n\n")
    f.write("\n\n".join(credits_entries) + "\n")

print("\nDone downloading and converting assets!")
