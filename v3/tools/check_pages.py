from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
class P(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.links=[];self.h1=0;self.imgs=[];self.heroes=0;self.breadcrumbs=0
 def handle_starttag(self,t,a):
  a=dict(a)
  if 'id' in a:self.ids.append(a['id'])
  if t=='h1':self.h1+=1
  if 'photo-hero' in a.get('class','').split():self.heroes+=1
  if 'crumbs' in a.get('class','').split():self.breadcrumbs+=1
  if t=='img':self.imgs.append(a)
  for k in ['src','href']:
   if k in a:self.links.append((t,a[k]))
root=Path(__file__).resolve().parents[1];parsers={}
for base in [root,root/'preview']:
 for path in base.glob('*.html'):
  p=P();p.feed(path.read_text());parsers[path]=p;assert p.h1==1,(path,p.h1)
  assert p.heroes==1 and p.breadcrumbs==0,(path,"Hero or breadcrumb regression")
  assert len(p.ids)==len(set(p.ids)),path
  for img in p.imgs:assert all(k in img for k in ['alt','width','height']),(path,img)
for path,p in parsers.items():
 for tag,url in p.links:
  u=urlsplit(url)
  if u.scheme or u.netloc:continue
  target=(path.parent/unquote(u.path)) if u.path else path
  assert target.is_file(),(path,url)
  if tag=='a' and u.fragment and target.suffix=='.html':assert u.fragment in parsers[target].ids,(path,url)
print(len(parsers),'HTML documents: unique IDs, one H1, image metadata, all local paths and anchors verified.')
