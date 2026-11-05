"""Build the opening seal from the original logo's vector paths; never redraw the mark."""
from pathlib import Path
import re
from xml.etree import ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
paths=list(ET.parse(ROOT/'assets/img/srm-logo.svg').getroot())
assert len(paths)==384 and paths[32].get('fill')=='#C7A008' and paths[135].get('fill')=='#034DA1' and paths[136].get('fill')=='white', 'The source logo changed; review the seal paths before rebuilding.'
def path(p,fill=None,d=None):
 attrs={k:v for k,v in p.attrib.items() if k not in ('clip-rule',)}
 if fill:attrs['fill']=fill
 if d:attrs['d']=d
 return '<path '+ ' '.join(f'{k}="{v}"' for k,v in attrs.items())+'/>'
# Keep only the original outer contour: internal counters are blue branch/leaf details.
# Use this same solid silhouette for both the opening artwork and reveal aperture.
tree_contours = re.findall(r"[Mm][^Mm]*", paths[136].get("d"))
assert len(tree_contours) == 400 and tree_contours[0].rstrip().endswith(("Z", "z"))
tree_outline = tree_contours[0]
# The ribbon is painted in front of the tree in the source logo, so protect it.
svg='''<svg class="intro__scene" aria-hidden="true" width="100%" height="100%">
 <defs>
  <clipPath id="intro-field" clipPathUnits="userSpaceOnUse">'''+path(paths[135],fill='white')+'''</clipPath>
  <mask id="intro-protected" maskUnits="userSpaceOnUse" x="0" y="0" width="178" height="178" style="mask-type:luminance"><rect width="178" height="178" fill="white"/>'''+''.join(path(p,fill='black') for p in paths[287:311])+'''</mask>
  <mask id="intro-reveal" maskUnits="userSpaceOnUse" style="mask-type:luminance"><rect width="100%" height="100%" fill="white"/>
   <g data-intro-windows clip-path="url(#intro-field)" mask="url(#intro-protected)" opacity="0">
    '''+path(paths[136],fill='black',d=tree_outline).replace('<path ', '<path data-intro-aperture data-intro-tree ')+'''
   </g>
  </mask>
 </defs>
 <g mask="url(#intro-reveal)"><rect class="intro__cover" width="100%" height="100%"/>
  <g data-intro-seal>'''+''.join(path(p,d=tree_outline if i==136 else None) for i,p in enumerate(paths[32:345],start=32))+'''</g>
 </g>
</svg>'''
p=ROOT/'index.html';s=p.read_text();start=s.index('<div class="intro"');end=s.index('<a class="skip"',start)
s=s[:start]+'''<div class="intro" data-intro role="dialog" aria-modal="true" aria-label="SRM opening animation">
'''+svg+'''
 <button class="intro__skip" type="button" data-intro-skip>Skip intro</button>
</div>
'''+s[end:];p.write_text(s)
print('Built seal artwork and the solid tree silhouette reveal aperture from the original SVG.')
