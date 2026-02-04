import cv2
import numpy as np
from PIL import Image
import os

def process_cell_cv2(cell_img_pil, margin=15, line_thickness=5):
    """
    Process a single cell using OpenCV to generate a clean outline.
    Keeps only the largest connected component to remove stray lines.
    """
    # Convert PIL to numpy
    img_np = np.array(cell_img_pil)
    
    # Check if image has alpha
    if img_np.shape[2] != 4:
        return Image.new("RGB", cell_img_pil.size, (255, 255, 255))
        
    alpha = img_np[:, :, 3]
    
    # Check if empty
    if np.max(alpha) == 0:
        return Image.new("RGB", cell_img_pil.size, (255, 255, 255))
        
    # 1. Threshold to binary
    # Increased threshold to ignore faint semi-transparent noise
    _, binary = cv2.threshold(alpha, 50, 255, cv2.THRESH_BINARY)
    
    # 2. Noise Removal (Opening)
    # Erode then Dilate to remove small noise points and disconnect weak links
    open_kernel = np.ones((5, 5), np.uint8)
    binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, open_kernel)
    
    # 3. Keep Largest Connected Component (Removes stray lines/islands)
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(binary, connectivity=8)
    
    # stats: [x, y, width, height, area]
    if num_labels > 1:
        # Find index of largest area (ignoring label 0 which is background)
        largest_label = 1 + np.argmax(stats[1:, 4])
        
        # Create mask for only the largest component
        cleaned_mask = np.zeros_like(binary)
        cleaned_mask[labels == largest_label] = 255
    else:
        cleaned_mask = binary

    # 4. Dilate to create sticker shape (Expansion)
    # Kernel size must be odd
    dilation_k_size = margin * 2 + 1
    dilation_kernel = np.ones((dilation_k_size, dilation_k_size), np.uint8)
    sticker_shape = cv2.dilate(cleaned_mask, dilation_kernel, iterations=1)

    # 5. Fill Holes inside the shape (FloodFill)
    im_flood = sticker_shape.copy()
    h, w = im_flood.shape
    mask = np.zeros((h+2, w+2), np.uint8)
    # Floodfill background with 128
    cv2.floodFill(im_flood, mask, (0,0), 128)
    
    # Create final filled mask:
    # Everything that is NOT 128 (Background) should be 255 (Foreground + Holes)
    filled_shape = np.where(im_flood == 128, 0, 255).astype(np.uint8)

    # 6. Extract Outline
    # Morphological Gradient
    # Line thickness determines the kernel size
    # If we want a line of width 'w', we can use a kernel of size 'w' for gradient?
    # Or dilate by w/2 and erode by w/2.
    # Let's use a kernel size approx equal to thickness.
    line_k_size = line_thickness * 2 + 1 # Make it odd and substantial
    line_kernel = np.ones((line_k_size, line_k_size), np.uint8)
    
    # Outer edge
    edge_outer = cv2.dilate(filled_shape, line_kernel, iterations=1)
    # Inner edge (original filled shape)
    # If we want the line to be purely "outside" the margin, we use (dilated - original)
    # If we want centered, we use (dilated - eroded)
    # Let's do centered on the margin boundary
    edge_inner = cv2.erode(filled_shape, line_kernel, iterations=1)
    
    edge = cv2.absdiff(edge_outer, edge_inner)
    
    # 7. Create Output Image
    # White background (255, 255, 255)
    result_np = np.full((h, w, 3), 255, dtype=np.uint8)
    
    # Where edge > 0, set to Black (0, 0, 0)
    _, edge_mask = cv2.threshold(edge, 127, 255, cv2.THRESH_BINARY)
    result_np[edge_mask == 255] = [0, 0, 0]
    
    return Image.fromarray(result_np)

def create_cutlines():
    input_path = r"d:\Awesome-Astron-Workflow\Astron Celebrates the Year of the Horse\combined_5x5.png"
    output_path = r"d:\Awesome-Astron-Workflow\Astron Celebrates the Year of the Horse\combined_5x5_outline.png"
    
    print(f"Processing {input_path} with OpenCV (Refined)...")
    try:
        img = Image.open(input_path).convert("RGBA")
        
        rows = 5
        cols = 5
        cell_width = img.width // cols
        cell_height = img.height // rows
        
        print(f"Image size: {img.size}, Cell size: {cell_width}x{cell_height}")
        
        final_canvas = Image.new("RGB", img.size, (255, 255, 255))
        
        for row in range(rows):
            for col in range(cols):
                idx = row * 5 + col + 1
                print(f"Processing cell {idx} ({row}, {col})...")
                
                x = col * cell_width
                y = row * cell_height
                box = (x, y, x + cell_width, y + cell_height)
                
                cell = img.crop(box)
                
                # Settings:
                # margin=15: Expansion from object
                # line_thickness=4: Width of the black line (approx 8-9px total stroke width due to dilate-erode)
                cell_outline = process_cell_cv2(cell, margin=15, line_thickness=4)
                
                final_canvas.paste(cell_outline, box)
        
        print(f"Saving to {output_path}...")
        final_canvas.save(output_path)
        print("Done!")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_cutlines()
