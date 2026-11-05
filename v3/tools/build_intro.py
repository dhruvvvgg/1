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
# The first tree subpath is its outer silhouette. Preserve the canopy's fine blue
# details as ink, rather than turning every tiny leaf counter into a new window.
tree=re.findall(r'M[^M]*',paths[136].get('d'))[0]
svg='''<svg class="intro__scene" aria-hidden="true" width="100%" height="100%">
 <defs>
  <clipPath id="intro-field" clipPathUnits="userSpaceOnUse">'''+path(paths[135],fill='white')+'''</clipPath>
  <mask id="intro-protected" maskUnits="userSpaceOnUse" x="0" y="0" width="178" height="178" style="mask-type:luminance"><rect width="178" height="178" fill="white"/>'''+path(paths[136],fill='black',d=tree)+''.join(path(p,fill='black') for p in paths[287:311])+'''</mask>
  <mask id="intro-reveal" maskUnits="userSpaceOnUse" style="mask-type:luminance"><rect width="100%" height="100%" fill="white"/>
   <g data-intro-windows clip-path="url(#intro-field)" mask="url(#intro-protected)" fill="black" opacity="0">
    <path data-intro-aperture d="M0 0H178V100H0Z"/>
    <path data-intro-aperture d="M0 100H89V178H0Z"/>
    <path data-intro-aperture d="M89 100H178V178H89Z"/>
   </g>
  </mask>
 </defs>
 <g mask="url(#intro-reveal)"><rect class="intro__cover" width="100%" height="100%"/>
  <g data-intro-seal>'''+''.join(path(p) for p in paths[32:345])+'''</g>
 </g>
</svg>'''
p=ROOT/'index.html';s=p.read_text();start=s.index('<div class="intro"');end=s.index('<a class="skip"',start)
s=s[:start]+'''<div class="intro" data-intro role="dialog" aria-modal="true" aria-label="SRM opening animation">
'''+svg+'''
 <button class="intro__skip" type="button" data-intro-skip>Skip intro</button>
</div>
'''+s[end:];p.write_text(s)
print('Built seal artwork and three protected reveal apertures from the original SVG.')
