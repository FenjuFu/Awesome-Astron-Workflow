
import cv2
import numpy as np

try:
    img_path = r"d:\Awesome-Astron-Workflow\Astron Celebrates the Year of the Horse\sticker_result.png"
    img = cv2.imread(img_path)
    
    if img is None:
        print("Failed to load image.")
        exit(1)

    print(f"Image shape: {img.shape}")
    
    # Check top-left pixel color
    b, g, r = img[0, 0]
    print(f"Top-left pixel (BGR): ({b}, {g}, {r})")
    print(f"Top-left pixel (Hex): #{r:02x}{g:02x}{b:02x}")
    
except Exception as e:
    print(f"Error: {e}")
