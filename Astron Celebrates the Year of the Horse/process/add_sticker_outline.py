
import cv2
import numpy as np
import os

def process_image():
    input_path = r"d:\Awesome-Astron-Workflow\Astron Celebrates the Year of the Horse\sticker_result.png"
    output_path = r"d:\Awesome-Astron-Workflow\Astron Celebrates the Year of the Horse\sticker_result_outlined.png"
    
    if not os.path.exists(input_path):
        print(f"Error: File not found: {input_path}")
        return

    print(f"Reading {input_path}...")
    img = cv2.imread(input_path)
    if img is None:
        print("Failed to load image")
        return

    # Background color BGR: (245, 44, 108) -> #6C2CF5
    bg_color = np.array([245, 44, 108], dtype=np.uint8)
    
    # Create mask for background
    # Using a small tolerance to be safe against minor noise
    tolerance = 2
    lower = np.clip(bg_color - tolerance, 0, 255)
    upper = np.clip(bg_color + tolerance, 0, 255)
    mask = cv2.inRange(img, lower, upper)
    
    # Invert mask to get foreground (stickers)
    fg_mask = cv2.bitwise_not(mask)
    
    # Find external contours
    contours, hierarchy = cv2.findContours(fg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    print(f"Found {len(contours)} initial contours.")
    
    # Filter small contours (noise)
    # A sticker in a 2500x2500 grid of 25 is roughly 500x500 pixels max.
    # Area could be around 50000-100000.
    # Let's filter out anything smaller than 1000 pixels area.
    min_area = 1000
    valid_contours = [cnt for cnt in contours if cv2.contourArea(cnt) > min_area]
    
    print(f"Found {len(valid_contours)} valid stickers (expected ~25).")
    
    # Draw white contours
    # Thickness 20 pixels
    outline_color = (255, 255, 255) # White
    thickness = 20
    
    # Draw on the original image
    cv2.drawContours(img, valid_contours, -1, outline_color, thickness)
    
    # Save result
    cv2.imwrite(output_path, img)
    print(f"Saved result to {output_path}")

if __name__ == "__main__":
    process_image()
