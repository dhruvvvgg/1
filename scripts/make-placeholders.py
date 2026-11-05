"""Original flat studies, explicitly not SRM photographs. No external dependencies beyond Pillow."""
from PIL import Image, ImageDraw
from pathlib import Path
root=Path(__file__).resolve().parents[1]
for name, theme in [('campus-study',0),('learn-study',1),('research-study',2),('life-study',3),('work-study',4),('studio-study',5)]:
 im=Image.new('RGB',(1800,1000),'#c8dce3');d=ImageDraw.Draw(im)
 if theme in (0,1,3):
  d.ellipse((1300,80,1470,250),fill='#e9edf0')
  for x,y,w,h in [(40,410,420,500),(500,230,510,680),(1090,350,610,560)]:
   d.rectangle((x,y,x+w,y+h),fill=['#768f9a','#a5b7c0','#879ba5'][theme%3]); d.polygon([(x,y),(x+48,y-48),(x+w+48,y-48),(x+w,y)],fill='#dfe6e8')
   d.polygon([(x+w,y),(x+w+48,y-48),(x+w+48,y+h),(x+w,y+h)],fill='#536d7b')
   for row in range(6):
    for col in range(7):
     xx=x+24+col*(w-40)//7; yy=y+32+row*82
     if yy+40<y+h:d.rectangle((xx,yy,xx+32,yy+40),fill='#243f53')
  d.rectangle((0,880,1800,1000),fill='#617b73')
  for x in [80,360,1040,1600,1760]:
   d.rectangle((x-5,760,x+5,980),fill='#364f49');d.ellipse((x-80,650,x+80,840),fill='#4f7168')
  d.polygon([(600,1000),(810,880),(950,880),(1050,1000)],fill='#b7c6c7')
 else:
  d.rectangle((0,0,1800,1000),fill='#d1dfe3')
  for x in range(40,1800,300):
   d.rectangle((x,40,x+240,690),fill='#a0b7c3');d.rectangle((x+16,56,x+224,670),fill='#abc9d5');d.line((x+120,56,x+120,670),fill='#e5ecef',width=12)
  d.polygon([(0,800),(1800,720),(1800,1000),(0,1000)],fill='#718a98')
  d.rectangle((120,620,1650,660),fill='#385568');d.rectangle((160,660,184,980),fill='#385568');d.rectangle((1560,660,1584,980),fill='#385568')
  for x in [340,820,1300]:
   if theme==2:
    d.rectangle((x,410,x+220,605),fill='#456779');d.rectangle((x+16,426,x+204,565),fill='#c6dce5');d.line((x+20,560,x+165,450),fill='#0c4da2',width=12)
   else:
    d.polygon([(x,605),(x+40,330),(x+260,370),(x+220,620)],fill='#e5ecef');d.ellipse((x+80,410,x+180,510),outline='#0c4da2',width=12)
 im.save(root/'assets/raw'/f'{name}.png')
 im.resize((1800,1000) if theme==0 else (1200,667)).save(root/'assets/img'/f'{name}.webp',quality=85)
