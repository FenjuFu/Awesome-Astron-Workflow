import cv2
import numpy as np

def inspect():
    path = r"d:\Awesome-Astron-Workflow\Astron Celebrates the Year of the Horse\sticker_result.png"
    img = cv2.imread(path)
    if img is None:
        print("Could not read image")
        return

    print(f"Image shape: {img.shape}")

    # Check background color (top-left pixel)
    bg_color = img[0,0]
    print(f"Top-left pixel color (BGR): {bg_color}")

    # Create mask based on top-left pixel
    tolerance = 10
    lower = np.clip(bg_color - tolerance, 0, 255)
    upper = np.clip(bg_color + tolerance, 0, 255)
    mask = cv2.inRange(img, lower, upper)
    fg_mask = cv2.bitwise_not(mask)

    contours, _ = cv2.findContours(fg_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Sort contours by position (top-left to bottom-right)
    # y first, then x
    # Bounding box: x, y, w, h
    bounding_boxes = [cv2.boundingRect(c) for c in contours]
    
    # Filter small noise
    valid_contours = []
    valid_boxes = []
    for i, c in enumerate(contours):
        x, y, w, h = bounding_boxes[i]
        if w * h > 1000: # Arbitrary threshold
            valid_contours.append(c)
            valid_boxes.append((x,y,w,h))

    print(f"Found {len(valid_contours)} valid objects.")
    
    # Sort boxes
    # Heuristic sorting: row by row. 
    # We can sort by y, then group by y range, then sort by x.
    # Simple sort by y + x might fail for grid alignment.
    # Let's just sort by y for now to find the "top" ones, then x.
    
    if not valid_boxes:
        return

    # Sort by y first
    valid_boxes.sort(key=lambda b: b[1])
    
    # Get top row (approximate)
    top_y = valid_boxes[0][1]
    row_tolerance = valid_boxes[0][3] // 2 # half height of first item
    
    top_row = [b for b in valid_boxes if abs(b[1] - top_y) < row_tolerance]
    # Sort top row by x
    top_row.sort(key=lambda b: b[0])
    
    first_box = top_row[0]
    print(f"Top-left 1st image box: {first_box}")

if __name__ == "__main__":
    inspect()
