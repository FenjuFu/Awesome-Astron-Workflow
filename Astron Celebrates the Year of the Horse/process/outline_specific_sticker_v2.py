import cv2
import numpy as np

def process_single_sticker_v2():
    input_path = r"d:\Awesome-Astron-Workflow\Astron Celebrates the Year of the Horse\sticker_result.png"
    output_path = r"d:\Awesome-Astron-Workflow\Astron Celebrates the Year of the Horse\sticker_result_processed.png"
    
    img = cv2.imread(input_path)
    if img is None:
        print("Failed to load image")
        return

    # Background color: [245, 44, 108]
    bg_color = np.array([245, 44, 108], dtype=np.uint8)
    
    # Create mask
    tolerance = 10
    lower = np.clip(bg_color - tolerance, 0, 255)
    upper = np.clip(bg_color + tolerance, 0, 255)
    mask = cv2.inRange(img, lower, upper)
    fg_mask = cv2.bitwise_not(mask) # 0 for bg, 255 for fg
    
    contours, _ = cv2.findContours(fg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    valid_contours = [c for c in contours if cv2.contourArea(c) > 1000]
    if not valid_contours:
        print("No valid contours found.")
        return

    # Find top-left
    bounding_boxes = [cv2.boundingRect(c) for c in valid_contours]
    min_y = min(b[1] for b in bounding_boxes)
    row_tolerance = 50 
    top_row_indices = [i for i, b in enumerate(bounding_boxes) if abs(b[1] - min_y) < row_tolerance]
    top_row_indices.sort(key=lambda i: bounding_boxes[i][0])
    target_index = top_row_indices[0]
    target_contour = valid_contours[target_index]
    
    # Create a mask for just this sticker
    single_sticker_mask = np.zeros_like(fg_mask)
    cv2.drawContours(single_sticker_mask, [target_contour], -1, 255, -1) # Filled
    
    # Create the outline
    # We want the outline to be OUTSIDE the object.
    # So we dilate the mask.
    outline_width = 20
    kernel_size = outline_width * 2 + 1
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kernel_size, kernel_size))
    dilated_mask = cv2.dilate(single_sticker_mask, kernel)
    
    # The area to paint white is (dilated_mask - single_sticker_mask) if we want STRICTLY outside.
    # But for a sticker look, painting white behind the object is fine.
    # Since we are modifying 'img', let's paint white where dilated_mask is white.
    # BUT we must preserve the original object pixels.
    
    # 1. Capture original object pixels
    object_pixels = cv2.bitwise_and(img, img, mask=single_sticker_mask)
    
    # 2. Draw white silhouette on the image where dilated mask is
    # We only want to affect the area around the target sticker.
    # Create a white image
    white_canvas = np.full_like(img, 255)
    
    # Update img where dilated_mask is non-zero to be white
    # But only for this sticker! We don't want to wipe out other stickers if they overlap (unlikely)
    # or the background.
    # Actually, we just want to change the background to white AROUND the sticker.
    
    # Convert image to float or just work with masks
    # img[dilated_mask == 255] = [255, 255, 255]
    # This sets the whole dilated area to white.
    img[dilated_mask == 255] = [255, 255, 255]
    
    # 3. Restore the original object pixels on top
    # Where single_sticker_mask is 255, copy from original (which we need to have saved)
    # Wait, 'img' is modified in step 2. We need a copy of original.
    original_img = cv2.imread(input_path)
    
    # Copy original object pixels back
    # Use numpy indexing
    img[single_sticker_mask == 255] = original_img[single_sticker_mask == 255]
    
    cv2.imwrite(output_path, img)
    print(f"Saved refined result to {output_path}")

if __name__ == "__main__":
    process_single_sticker_v2()
