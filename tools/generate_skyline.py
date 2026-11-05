# Generate the illustrated TP + TP2 Skyline SVG for SRMIST

svg = '''<svg class="skyline-svg" viewBox="0 0 1600 420" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYEnd meet" role="img" aria-label="Stylized illustrated skyline of SRM Tech Park (TP) and Tech Park 2 (TP2) at dusk">
  <!-- Layer 1: Sky canvas matching footer background #111317 -->
  <g id="sky">
    <rect width="1600" height="420" fill="#111317"/>
    <!-- Distant sky layer / faint twilight horizon -->
    <rect y="220" width="1600" height="200" fill="#141720"/>
    <rect y="310" width="1600" height="110" fill="#171B26"/>
  </g>

  <!-- Layer 2: Distant architectural backdrop & shadows -->
  <g id="buildings-backdrop" opacity="0.45">
    <!-- Distant connecting bridge & UB silhouette -->
    <rect x="180" y="240" width="140" height="150" fill="#0C0E14"/>
    <polygon points="180,240 250,210 320,240" fill="#0C0E14"/>
    <rect x="760" y="270" width="120" height="120" fill="#0E1118"/>
    <rect x="1380" y="260" width="160" height="130" fill="#0E1118"/>
  </g>

  <!-- Layer 3: Main Buildings (TP & TP2 Side by Side) -->
  <g id="buildings">
    <!-- ==================== TECH PARK 1 (TP - G+15 Stories) ==================== -->
    <!-- TP Main Massing: X: 340 to 740 (Width: 400px, Height: 330px from y=60 to 390) -->
    <!-- Central Tower Spine / Lift Core (tallest) -->
    <rect x="510" y="45" width="60" height="345" fill="#1F2533"/>
    <!-- Antenna spire on TP Core -->
    <line x1="540" y1="45" x2="540" y2="15" stroke="#3D475F" stroke-width="3"/>
    <circle cx="540" cy="15" r="3" fill="#C7A008"/>

    <!-- TP Left Wing (G+14) -->
    <rect x="340" y="75" width="170" height="315" fill="#242B3B"/>
    <!-- TP Right Wing (G+14) -->
    <rect x="570" y="75" width="170" height="315" fill="#242B3B"/>

    <!-- Parapet & Roof Cap -->
    <rect x="330" y="70" width="420" height="8" fill="#323C52"/>
    <rect x="500" y="40" width="80" height="6" fill="#3D475F"/>

    <!-- Architectural Louvers / Vertical Mullions -->
    <rect x="420" y="78" width="6" height="312" fill="#1B202C"/>
    <rect x="654" y="78" width="6" height="312" fill="#1B202C"/>

    <!-- TP Base / Entrance Portico -->
    <rect x="330" y="340" width="420" height="50" fill="#1B202C"/>
    <rect x="490" y="325" width="100" height="65" fill="#2D3547"/>

    <!-- ==================== TECH PARK 2 (TP2 - Computing Complex) ==================== -->
    <!-- TP2 Massing: X: 840 to 1280 (Width: 440px, Height: 290px from y=100 to 390) -->
    <!-- Modern stepped cantilever / angular profile -->
    <rect x="850" y="110" width="390" height="280" fill="#283042"/>
    <rect x="910" y="85" width="270" height="305" fill="#202736"/>
    <!-- Glass Atrium / Modern Link -->
    <rect x="740" y="220" width="110" height="170" fill="#191F2C"/>
    <line x1="740" y1="280" x2="850" y2="280" stroke="#2D3547" stroke-width="2"/>
    <line x1="740" y1="330" x2="850" y2="330" stroke="#2D3547" stroke-width="2"/>

    <!-- TP2 Top Roof Pavilion & Solar Array -->
    <rect x="940" y="70" width="210" height="15" fill="#38435C"/>
    <polygon points="900,110 940,85 1150,85 1190,110" fill="#2E374C"/>

    <!-- TP2 Modern Facade Ribs -->
    <rect x="970" y="90" width="8" height="300" fill="#181D28"/>
    <rect x="1040" y="90" width="8" height="300" fill="#181D28"/>
    <rect x="1110" y="90" width="8" height="300" fill="#181D28"/>
  </g>

  <!-- Layer 4: Window Grids & Ambient Lights -->
  <g id="windows">
'''

# Generate window grids for TP (14 rows x 8 cols on each wing)
for row in range(13):
    y = 90 + row * 19
    # Left wing windows
    for col in range(6):
        x = 352 + col * 25
        # Soft warm glow on select windows, dim dusk blue on others
        if (row + col) % 5 == 0:
            fill = '#E5B824' # Gold light
            op = '0.75'
        elif (row + col) % 3 == 0:
            fill = '#9BBBE6' # Cool office light
            op = '0.5'
        else:
            fill = '#121620' # Dark window
            op = '0.9'
        svg += f'    <rect x="{x}" y="{y}" width="16" height="10" rx="1" fill="{fill}" opacity="{op}"/>\n'

    # Right wing windows
    for col in range(6):
        x = 584 + col * 25
        if (row * 2 + col) % 7 == 0:
            fill = '#E5B824'
            op = '0.8'
        elif (row + col) % 2 == 0:
            fill = '#9BBBE6'
            op = '0.45'
        else:
            fill = '#121620'
            op = '0.9'
        svg += f'    <rect x="{x}" y="{y}" width="16" height="10" rx="1" fill="{fill}" opacity="{op}"/>\n'

    # Central spine vertical narrow slit windows
    svg += f'    <rect x="536" y="{y}" width="8" height="11" rx="1" fill="#9BBBE6" opacity="0.6"/>\n'

# Generate window grids for TP2 (horizontal ribbon curtain glazing)
for row in range(11):
    y = 125 + row * 23
    for col in range(10):
        x = 868 + col * 37
        if (row * 3 + col) % 6 == 0:
            fill = '#E5B824'
            op = '0.7'
        elif (row + col) % 2 == 0:
            fill = '#8EAFDA'
            op = '0.55'
        else:
            fill = '#141822'
            op = '0.85'
        svg += f'    <rect x="{x}" y="{y}" width="26" height="13" rx="1" fill="{fill}" opacity="{op}"/>\n'

svg += '''  </g>

  <!-- Layer 5: Foreground (Kattankulathur trees, landscape & campus ground) -->
  <g id="foreground">
    <!-- Ground plane -->
    <rect x="0" y="388" width="1600" height="32" fill="#0C0E12"/>
    <line x1="0" y1="388" x2="1600" y2="388" stroke="#222836" stroke-width="1.5"/>

    <!-- Stylized campus palm & broadleaf trees (silhouettes) -->
    <!-- Left cluster -->
    <circle cx="120" cy="375" r="26" fill="#0F171D"/>
    <circle cx="150" cy="370" r="32" fill="#141E26"/>
    <circle cx="190" cy="378" r="22" fill="#0F171D"/>
    <circle cx="280" cy="372" r="28" fill="#131C24"/>
    <circle cx="310" cy="379" r="20" fill="#0F171D"/>

    <!-- Center trees between TP and TP2 -->
    <circle cx="760" cy="375" r="24" fill="#121B24"/>
    <circle cx="790" cy="368" r="30" fill="#15212C"/>
    <circle cx="825" cy="376" r="25" fill="#121B24"/>

    <!-- Right cluster -->
    <circle cx="1300" cy="370" r="30" fill="#141E26"/>
    <circle cx="1340" cy="376" r="22" fill="#0F171D"/>
    <circle cx="1420" cy="366" r="34" fill="#15212C"/>
    <circle cx="1465" cy="374" r="26" fill="#121B24"/>
    <circle cx="1520" cy="378" r="20" fill="#0F171D"/>

    <!-- Building Labels (Subtle architectural caption in the corner) -->
    <text x="340" y="407" font-family="'Inter Tight', sans-serif" font-size="11" font-weight="700" fill="#586275" letter-spacing="0.08em">TECH PARK (TP · G+15)</text>
    <text x="850" y="407" font-family="'Inter Tight', sans-serif" font-size="11" font-weight="700" fill="#586275" letter-spacing="0.08em">TECH PARK 2 (TP2 · COMPUTING COMPLEX)</text>
    <text x="1380" y="407" font-family="'JetBrains Mono', monospace" font-size="10" fill="#434B5A">KTR CAMPUS SKYLINE</text>
  </g>
</svg>'''

with open('assets/skyline.svg', 'w', encoding='utf-8') as f:
    f.write(svg)

print("Generated assets/skyline.svg successfully!")
