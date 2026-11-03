import cv2
import numpy as np

img = cv2.imread('public/images/NOVA_AeroRun_Campaign.png')
h, w, _ = img.shape

def get_contrast(crop):
    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    p_high = float(np.percentile(gray, 95))
    p_low = float(np.percentile(gray, 5))
    l1 = (p_high + 0.05) / 255.0
    l2 = (p_low + 0.05) / 255.0
    return (l1 + 0.05) / (l2 + 0.05)

regions = [
    ("NOVA", 0.03, 0.05, 0.20, 0.06),
    ("AERORUN X1", 0.11, 0.05, 0.40, 0.07),
    ("BUILT FOR YOUR FASTEST MILES", 0.20, 0.05, 0.50, 0.05),
    ("30% LIGHTER THAN LEADING RUNNING SHOES", 0.30, 0.05, 0.43, 0.09),
    ("UP TO 40 KM TESTED DURABILITY", 0.41, 0.05, 0.41, 0.08),
    ("INDIA'S #1 RUNNING SHOE", 0.51, 0.05, 0.38, 0.08),
    ("GUARANTEED TO MAKE EVERY RUN FASTER", 0.61, 0.05, 0.43, 0.09),
    ("₹3,999", 0.77, 0.04, 0.34, 0.09),
    ("MONSOON RUNNING CAMPAIGN", 0.89, 0.05, 0.48, 0.06),
]

for name, y, x, rw, rh in regions:
    crop = img[int(h*y):int(h*(y+rh)), int(w*x):int(w*(x+rw))]
    cr = get_contrast(crop)
    print(f"{name:40} | Box: y={y*100:.1f}%, x={x*100:.1f}%, w={rw*100:.1f}%, h={rh*100:.1f}% | Contrast: {cr:.2f}:1")
