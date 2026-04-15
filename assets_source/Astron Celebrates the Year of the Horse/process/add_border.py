from PIL import Image
import os

def add_transparent_border(input_path, output_path, border_size):
    try:
        img = Image.open(input_path)
        print(f"Original size: {img.size}")
        
        # Calculate new size
        new_width = img.width + 2 * border_size
        new_height = img.height + 2 * border_size
        
        # Create new image with transparent background
        new_img = Image.new("RGBA", (new_width, new_height), (0, 0, 0, 0))
        
        # Paste original image in center
        new_img.paste(img, (border_size, border_size))
        
        # Save
        new_img.save(output_path)
        print(f"Saved to {output_path}")
        print(f"New size: {new_img.size}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    folder = r"d:\Awesome-Astron-Workflow\Astron Celebrates the Year of the Horse"
    input_file = os.path.join(folder, "combined_5x5.png")
    output_file = os.path.join(folder, "combined_5x5_bordered.png")
    
    # You can adjust the border size here
    BORDER_SIZE = 100 
    
    if os.path.exists(input_file):
        add_transparent_border(input_file, output_file, BORDER_SIZE)
    else:
        print(f"File not found: {input_file}")
