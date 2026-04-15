from PIL import Image, ImageFilter

def add_outline_and_background(input_path, output_path, bg_color, outline_color, outline_width):
    print(f"Processing {input_path}...")
    try:
        # Open image
        img = Image.open(input_path).convert("RGBA")
        
        # Get alpha channel
        # We handle the case where alpha might be fully opaque if the image is not transparent,
        # but the user request implies extracting objects.
        # If the image has no transparency, this whole process simply draws a box around the image.
        # Assuming the input has transparency for the 25 stickers.
        alpha = img.split()[-1]
        
        # Create outline by dilating the alpha channel
        # Size must be odd. 
        # width 10 -> radius 10 -> diameter 21
        kernel_size = outline_width * 2 + 1
        print(f"Generating outline with width {outline_width} (kernel size {kernel_size})...")
        
        # MaxFilter is effectively a morphological dilation for grayscale images
        outline_mask = alpha.filter(ImageFilter.MaxFilter(kernel_size))
        
        # Create the outline layer
        outline_layer = Image.new("RGBA", img.size, outline_color)
        outline_layer.putalpha(outline_mask)
        
        # Create background layer
        # If bg_color is hex, PIL handles it.
        bg_layer = Image.new("RGBA", img.size, bg_color)
        
        # Composite: Background <- Outline <- Image
        print("Compositing layers...")
        
        # 1. Paste outline over background using the outline mask
        bg_layer.paste(outline_layer, (0, 0), outline_layer)
        
        # 2. Paste original image over the result using its own alpha
        bg_layer.paste(img, (0, 0), img)
        
        # Save
        bg_layer.save(output_path)
        print(f"Successfully saved to {output_path}")
        
    except Exception as e:
        print(f"Error processing image: {e}")

if __name__ == "__main__":
    input_file = r"d:\Awesome-Astron-Workflow\Astron Celebrates the Year of the Horse\combined_result.png"
    # Saving to a new file to avoid overwriting
    output_file = r"d:\Awesome-Astron-Workflow\Astron Celebrates the Year of the Horse\sticker_result.png"
    
    # Requirements: Background #6C2CF5, White Outline
    bg_color = "#6C2CF5"
    outline_color = "white"
    
    # Heuristic for outline width. 
    # If the image is 4000px wide, 10px might be too thin.
    # Let's check size first or just use a robust default. 
    # For a typical sticker sheet (e.g. 1024x1024 or 2048x2048), 10-15px is usually visible.
    outline_width = 15 
    
    add_outline_and_background(input_file, output_file, bg_color, outline_color, outline_width)
