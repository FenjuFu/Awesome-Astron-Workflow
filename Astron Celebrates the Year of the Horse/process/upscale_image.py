from PIL import Image
import os

def upscale_image(input_path, output_path, scale_factor=2):
    try:
        if not os.path.exists(input_path):
            print(f"Error: File not found: {input_path}")
            return

        print(f"Reading {input_path}...")
        img = Image.open(input_path)
        print(f"Original size: {img.size}")
        
        new_width = int(img.width * scale_factor)
        new_height = int(img.height * scale_factor)
        
        print(f"Upscaling to {new_width}x{new_height} using LANCZOS resampling...")
        
        # Upscale using Lanczos filter for high quality
        upscaled_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        upscaled_img.save(output_path)
        print(f"Saved upscaled image to {output_path}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    folder = r"d:\Awesome-Astron-Workflow\Astron Celebrates the Year of the Horse"
    input_file = os.path.join(folder, "combined_5x5_bordered_cutlines.png")
    output_file = os.path.join(folder, "combined_5x5_bordered_cutlines_ultrares.png")
    
    upscale_image(input_file, output_file, scale_factor=4)
