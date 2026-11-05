import json

with open('tools/found_images.json') as f:
    imgs1 = json.load(f)

with open('tools/more_images.json') as f:
    imgs2 = json.load(f)

all_imgs = sorted(list(set(imgs1 + imgs2)))

print(f"Total unique images: {len(all_imgs)}")

# Let's filter out tiny icons or logos, but keep the official logo
logos = [img for img in all_imgs if 'logo' in img.lower()]
print("\n--- LOGOS ---")
for l in logos:
    print(l)

# Campus / building / lab images
campus = [img for img in all_imgs if any(k in img.lower() for k in [
    'building', 'campus', 'ub', 'lakeview', 'research', 'lab', 'banner', 'slider', 'infrastructure', 'tech', 'park'
])]

print(f"\n--- CAMPUS / LABS / INFRA ({len(campus)}) ---")
for c in campus:
    # exclude tiny thumbs like -150x150 or -300x
    if not ('-150x' in c or '-300x' in c or '-100x' in c):
        print(c)
