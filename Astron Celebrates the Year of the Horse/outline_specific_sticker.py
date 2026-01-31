import cv2
import numpy as np

def process_single_sticker():
    input_path = r"d:\Awesome-Astron-Workflow\Astron Celebrates the Year of the Horse\sticker_result.png"
    output_path = r"d:\Awesome-Astron-Workflow\Astron Celebrates the Year of the Horse\sticker_result_processed.png"
    single_output_path = r"d:\Awesome-Astron-Workflow\Astron Celebrates the Year of the Horse\sticker_1_outlined.png"
    
    img = cv2.imread(input_path)
    if img is None:
        print("Failed to load image")
        return

    # Background color from previous inspection: [245, 44, 108]
    bg_color = np.array([245, 44, 108], dtype=np.uint8)
    
    # Mask
    tolerance = 10
    lower = np.clip(bg_color - tolerance, 0, 255)
    upper = np.clip(bg_color + tolerance, 0, 255)
    mask = cv2.inRange(img, lower, upper)
    fg_mask = cv2.bitwise_not(mask)
    
    contours, _ = cv2.findContours(fg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if not contours:
        print("No contours found.")
        return

    # Filter small noise
    valid_contours = [c for c in contours if cv2.contourArea(c) > 1000]
    
    if not valid_contours:
        print("No valid contours found.")
        return

    # Find top-left
    # Sort by y, then x
    bounding_boxes = [cv2.boundingRect(c) for c in valid_contours]
    
    # Identify top-row
    min_y = min(b[1] for b in bounding_boxes)
    row_tolerance = 50 # Assuming grid alignment
    top_row_indices = [i for i, b in enumerate(bounding_boxes) if abs(b[1] - min_y) < row_tolerance]
    
    # Sort top row by x
    top_row_indices.sort(key=lambda i: bounding_boxes[i][0])
    
    target_index = top_row_indices[0]
    target_contour = valid_contours[target_index]
    
    print(f"Targeting sticker at {bounding_boxes[target_index]}")
    
    # Draw outline on the main image
    # Thickness 20
    cv2.drawContours(img, [target_contour], -1, (255, 255, 255), 20)
    
    cv2.imwrite(output_path, img)
    print(f"Saved full image with outline to {output_path}")

    # Create isolated sticker
    x, y, w, h = bounding_boxes[target_index]
    # Add padding for outline
    pad = 30
    x1 = max(0, x - pad)
    y1 = max(0, y - pad)
    x2 = min(img.shape[1], x + w + pad)
    y2 = min(img.shape[0], y + h + pad)
    
    crop = img[y1:y2, x1:x2]
    cv2.imwrite(single_output_path, crop)
    print(f"Saved isolated sticker to {single_output_path}")

if __name__ == "__main__":
    process_single_sticker()
