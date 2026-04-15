from PIL import Image
import os

def convert_to_pdf(input_path, output_path):
    try:
        if not os.path.exists(input_path):
            print(f"Error: File not found: {input_path}")
            return

        print(f"Reading {input_path}...")
        img = Image.open(input_path)
        
        # Convert to RGB if necessary (PDF doesn't support transparency directly in this save method usually)
        if img.mode == 'RGBA':
            print("Converting RGBA to RGB...")
            background = Image.new("RGB", img.size, (255, 255, 255))
            background.paste(img, mask=img.split()[3]) # 3 is the alpha channel
            img = background
        elif img.mode != 'RGB':
             img = img.convert('RGB')
        
        print(f"Saving to {output_path}...")
        img.save(output_path, "PDF", resolution=300.0)
        print("Done!")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    folder = r"d:\Awesome-Astron-Workflow\Astron Celebrates the Year of the Horse"
    input_file = os.path.join(folder, "combined_5x5_bordered_ultrares.png")
    output_file = os.path.join(folder, "combined_5x5_bordered_ultrares.pdf")
    
    convert_to_pdf(input_file, output_file)
