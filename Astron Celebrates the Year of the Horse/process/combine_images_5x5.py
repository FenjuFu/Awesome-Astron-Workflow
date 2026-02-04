import os
import re
from PIL import Image

def combine_images():
    directory = r"d:\Awesome-Astron-Workflow\Astron Celebrates the Year of the Horse"
    output_path = os.path.join(directory, "combined_5x5.png")
    
    # Find files
    files = {}
    print("Scanning files...")
    for filename in os.listdir(directory):
        if not filename.lower().endswith(".png"):
            continue
        
        # Match number at start
        match = re.match(r"^(\d+)", filename)
        if match:
            num = int(match.group(1))
            if 1 <= num <= 25:
                files[num] = os.path.join(directory, filename)
                print(f"Found {num}: {filename}")
    
    # Check if all files exist
    missing = [i for i in range(1, 26) if i not in files]
    if missing:
        print(f"Missing files for numbers: {missing}")
        return

    # Determine cell size
    max_w = 0
    max_h = 0
    
    # Store images in memory
    images = {}
    
    print("Loading images to determine size...")
    for i in range(1, 26):
        path = files[i]
        try:
            img = Image.open(path).convert("RGBA")
            images[i] = img
            max_w = max(max_w, img.width)
            max_h = max(max_h, img.height)
        except Exception as e:
            print(f"Error loading {path}: {e}")
            return

    print(f"Max image size: {max_w}x{max_h}")
    
    # Set cell size to max dimension to ensure everything fits
    cell_size = max(max_w, max_h)
    
    # Create blank canvas
    # 5 columns, 5 rows
    canvas_width = cell_size * 5
    canvas_height = cell_size * 5
    # Use transparent background
    canvas = Image.new("RGBA", (canvas_width, canvas_height), (255, 255, 255, 0))
    
    print(f"Creating canvas {canvas_width}x{canvas_height} (Cell size: {cell_size})...")
    
    for i in range(1, 26):
        img = images[i]
        
        # Calculate position
        # i is 1-based.
        # row: (i-1) // 5
        # col: (i-1) % 5
        row = (i - 1) // 5
        col = (i - 1) % 5
        
        x = col * cell_size
        y = row * cell_size
        
        # Center image in cell
        x_offset = (cell_size - img.width) // 2
        y_offset = (cell_size - img.height) // 2
        
        # Paste
        canvas.paste(img, (x + x_offset, y + y_offset), img)
        
    print(f"Saving to {output_path}...")
    canvas.save(output_path)
    print("Done!")

if __name__ == "__main__":
    combine_images()
