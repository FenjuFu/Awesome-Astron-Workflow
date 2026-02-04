import cv2
import numpy as np
import os

def generate_cutlines():
    input_path = r"d:\Awesome-Astron-Workflow\Astron Celebrates the Year of the Horse\combined_5x5_bordered.png"
    output_path = r"d:\Awesome-Astron-Workflow\Astron Celebrates the Year of the Horse\combined_5x5_bordered_cutlines_loose.png"
    
    if not os.path.exists(input_path):
        print(f"Error: File not found: {input_path}")
        return

    print(f"Reading {input_path}...")
    # Read as BGRA
    img = cv2.imread(input_path, cv2.IMREAD_UNCHANGED)
    
    if img is None:
        print("Failed to load image")
        return
        
    if img.shape[2] != 4:
        print("Image does not have an alpha channel")
        return

    # Extract Alpha channel
    alpha = img[:, :, 3]
    
    # 1. Threshold to binary
    _, binary = cv2.threshold(alpha, 10, 255, cv2.THRESH_BINARY)
    
    # 2. Noise Removal & Smoothing
    # Close small holes inside
    kernel_close = np.ones((5, 5), np.uint8)
    binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel_close)
    
    # Open to remove small noise outside
    kernel_open = np.ones((5, 5), np.uint8)
    binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel_open)

    # 3. Create approximate contour (Dilation)
    # The user wants "outermost approximate contour". 
    # Dilation expands the white region.
    margin = 40 # Increased from 20 to 40 for looser outline
    dilation_kernel = np.ones((margin * 2 + 1, margin * 2 + 1), np.uint8)
    sticker_shape = cv2.dilate(binary, dilation_kernel, iterations=1)
    
    # 4. Fill Holes (Optional but good for cutlines)
    # This ensures the cutline doesn't go inside the sticker if there's a hollow part
    h, w = sticker_shape.shape
    mask = np.zeros((h + 2, w + 2), np.uint8)
    im_flood = sticker_shape.copy()
    cv2.floodFill(im_flood, mask, (0, 0), 255) # Floodfill from corner with White (assuming corner is empty)
    
    # Invert floodfilled image
    im_flood_inv = cv2.bitwise_not(im_flood)
    
    # Combine the two images to get the foreground filled
    # Note: Logic above depends on background color.
    # Let's try a safer way: Find external contours and draw filled
    contours, _ = cv2.findContours(sticker_shape, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    filled_shape = np.zeros_like(sticker_shape)
    cv2.drawContours(filled_shape, contours, -1, 255, thickness=cv2.FILLED)
    
    # 5. Extract Outline
    # We want a thin line around the filled shape
    # Dilate slightly and subtract original (or erode)
    line_thickness = 2
    outline_kernel = np.ones((3, 3), np.uint8)
    
    # Edge detection via dilation - erosion
    dilated_for_edge = cv2.dilate(filled_shape, outline_kernel, iterations=line_thickness)
    eroded_for_edge = cv2.erode(filled_shape, outline_kernel, iterations=line_thickness)
    edge = cv2.absdiff(dilated_for_edge, eroded_for_edge)
    
    # 6. Create Output Image (Black lines on White background)
    # Initialize white background
    result = np.full((img.shape[0], img.shape[1], 3), 255, dtype=np.uint8)
    
    # Draw black edges
    result[edge > 0] = [0, 0, 0]
    
    cv2.imwrite(output_path, result)
    print(f"Saved cutlines to {output_path}")

if __name__ == "__main__":
    generate_cutlines()
