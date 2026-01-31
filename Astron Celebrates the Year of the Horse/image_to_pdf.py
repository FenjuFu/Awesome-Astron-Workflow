from PIL import Image
import os

image_path = "sticker_result_outlined.png"
pdf_path = "sticker_result_outlined.pdf"

if os.path.exists(image_path):
    try:
        image = Image.open(image_path)
        
        # Handle transparency (RGBA) by compositing over white background
        if image.mode == 'RGBA':
            background = Image.new('RGB', image.size, (255, 255, 255))
            background.paste(image, mask=image.split()[3]) # Use alpha channel as mask
            image = background
        elif image.mode != 'RGB':
            image = image.convert('RGB')
            
        image.save(pdf_path, "PDF", resolution=100.0)
        print(f"Successfully converted {image_path} to {pdf_path}")
    except Exception as e:
        print(f"Error converting image to PDF: {e}")
else:
    print(f"File {image_path} not found.")
