import zlib
import struct
import math

def create_png(width, height, draw_fn):
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0) # filter byte 0 = None
        for x in range(width):
            r, g, b, a = draw_fn(x, y, width, height)
            raw_data.extend([r, g, b, a])
            
    compressed = zlib.compress(bytes(raw_data), 9)
    
    png = bytearray(b'\x89PNG\r\n\x1a\n')
    
    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data)
    png.extend(struct.pack('>I', 13) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc))
    
    # IDAT
    idat_crc = zlib.crc32(b'IDAT' + compressed)
    png.extend(struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', idat_crc))
    
    # IEND
    iend_crc = zlib.crc32(b'IEND')
    png.extend(struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc))
    
    return bytes(png)

def draw_logo(x, y, w, h, is_maskable=False):
    # Normalized coords -1 to 1
    # For maskable, safe zone is 80% (scale down slightly)
    scale = 0.75 if is_maskable else 0.88
    nx = (x / w * 2.0 - 1.0) / scale
    ny = (y / h * 2.0 - 1.0) / scale
    
    # Base dark cyber background
    bg_r, bg_g, bg_b = 6, 11, 13 # #060B0D
    
    # Outer rounded box
    dist_sq = max(abs(nx) - 0.7, abs(ny) - 0.7, 0)
    # Check if inside outer chip boundary
    is_outer_chip = (abs(nx) <= 0.82 and abs(ny) <= 0.82)
    is_outer_border = is_outer_chip and (abs(nx) >= 0.76 or abs(ny) >= 0.76)
    
    # Pins on 4 sides
    is_pin = False
    pin_step = 0.22
    for p in [-0.44, -0.22, 0.0, 0.22, 0.44]:
        if abs(nx - p) < 0.04 and (0.82 < abs(ny) <= 0.96):
            is_pin = True
        if abs(ny - p) < 0.04 and (0.82 < abs(nx) <= 0.96):
            is_pin = True
            
    # Inner silicon die
    is_die = (abs(nx) <= 0.58 and abs(ny) <= 0.58)
    is_die_border = is_die and (abs(nx) >= 0.52 or abs(ny) >= 0.52)
    
    # Circuit code bracket '<' and '>'
    is_code = False
    # '<' on left: center at nx = -0.25, ny = 0
    lx = nx + 0.22
    if -0.15 <= lx <= 0.15:
        target_lx = abs(ny) * 0.7 - 0.1
        if abs(lx - target_lx) < 0.05 and abs(ny) < 0.35:
            is_code = True
            
    # '>' on right: center at nx = 0.22
    rx = nx - 0.22
    if -0.15 <= rx <= 0.15:
        target_rx = -(abs(ny) * 0.7 - 0.1)
        if abs(rx - target_rx) < 0.05 and abs(ny) < 0.35:
            is_code = True
            
    # Solder diagonal trace '/' in center (copper/gold)
    is_trace = False
    if abs(nx * 0.8 + ny) < 0.06 and abs(nx) < 0.14 and abs(ny) < 0.26:
        is_trace = True

    if is_trace:
        return (255, 141, 77, 255) # #FF8D4D copper bright
    elif is_code:
        return (0, 245, 212, 255) # #00F5D4 cyan neon
    elif is_die_border:
        return (201, 116, 63, 255) # #C9743F copper border
    elif is_die:
        return (14, 25, 28, 255) # #0E191C dark die
    elif is_pin:
        return (201, 116, 63, 255) # copper pins
    elif is_outer_border:
        return (0, 245, 212, 255) # cyan border
    elif is_outer_chip:
        return (10, 18, 20, 255) # #0A1214 chip package
    else:
        return (bg_r, bg_g, bg_b, 255)

# Generate icons
import os
os.makedirs('public', exist_ok=True)

with open('public/pwa-192x192.png', 'wb') as f:
    f.write(create_png(192, 192, lambda x, y, w, h: draw_logo(x, y, w, h, False)))
print("Generated pwa-192x192.png")

with open('public/pwa-512x512.png', 'wb') as f:
    f.write(create_png(512, 512, lambda x, y, w, h: draw_logo(x, y, w, h, False)))
print("Generated pwa-512x512.png")

with open('public/pwa-maskable-512x512.png', 'wb') as f:
    f.write(create_png(512, 512, lambda x, y, w, h: draw_logo(x, y, w, h, True)))
print("Generated pwa-maskable-512x512.png")

with open('public/apple-touch-icon.png', 'wb') as f:
    f.write(create_png(180, 180, lambda x, y, w, h: draw_logo(x, y, w, h, False)))
print("Generated apple-touch-icon.png")

with open('public/favicon-32x32.png', 'wb') as f:
    f.write(create_png(32, 32, lambda x, y, w, h: draw_logo(x, y, w, h, False)))
print("Generated favicon-32x32.png")
