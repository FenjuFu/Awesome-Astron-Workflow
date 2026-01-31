import os
import re
from PIL import Image

def natural_sort_key(s):
    return [int(text) if text.isdigit() else text.lower()
            for text in re.split('([0-9]+)', s)]

def stitch_images():
    source_dir = r"d:\Awesome-Astron-Workflow\Astron Celebrates the Year of the Horse"
    output_path = os.path.join(source_dir, "combined_result.png")
    
    # Get all png files
    files = [f for f in os.listdir(source_dir) if f.lower().endswith('.png') and f != "combined_result.png"]
    
    # Sort files numerically based on the leading number
    files.sort(key=natural_sort_key)
    
    if len(files) != 25:
        print(f"Warning: Found {len(files)} images, expected 25. Proceeding anyway...")
    
    images = []
    for f in files:
        img_path = os.path.join(source_dir, f)
        img = Image.open(img_path)
        images.append(img)
    
    if not images:
        print("No images found.")
        return

    # Determine cell size (max width and max height to accommodate all)
    max_width = max(img.width for img in images)
    max_height = max(img.height for img in images)
    
    print(f"Max cell size: {max_width}x{max_height}")
    
    # Grid size
    cols = 5
    rows = 5
    
    # Create new image
    # Use max_width * cols and max_height * rows
    total_width = max_width * cols
    total_height = max_height * rows
    
    new_im = Image.new('RGBA', (total_width, total_height), (0, 0, 0, 0))
    
    for index, img in enumerate(images):
        if index >= 25:
            break
            
        row = index // cols
        col = index % cols
        
        x_offset = col * max_width
        y_offset = row * max_height
        
        # Calculate centering offset if image is smaller than cell
        x_center = x_offset + (max_width - img.width) // 2
        y_center = y_offset + (max_height - img.height) // 2
        
        new_im.paste(img, (x_center, y_center))
        print(f"Pasted {files[index]} at ({x_center}, {y_center})")

    new_im.save(output_path)
    print(f"Saved combined image to {output_path}")

if __name__ == "__main__":
    try:
        stitch_images()
    except Exception as e:
        print(f"Error: {e}")
