import os
from PIL import Image, ImageFilter, ImageOps

def add_outline(input_path, output_path, outline_color=(211, 211, 211), thickness=10):
    """
    Adds an outline to the non-transparent parts of an image.
    """
    try:
        img = Image.open(input_path).convert("RGBA")
        
        # Get the alpha channel
        r, g, b, a = img.split()
        
        # Create a mask from the alpha channel
        # We want to expand the non-zero alpha regions
        mask = a.point(lambda x: 255 if x > 0 else 0)
        
        # Dilate the mask to create the outline area
        # Using MaxFilter to simulate dilation
        # Since MaxFilter is square, we might want to do it iteratively or use a larger kernel
        # For a smoother outline, we can use a combination of MaxFilter and GaussianBlur
        
        outline_mask = mask
        # Expand the mask by 'thickness' pixels
        # MaxFilter with size 3 expands by 1 pixel in each direction (roughly)
        # So we repeat it 'thickness' times, or use a larger filter
        # Note: MaxFilter takes an odd integer size. size=3 -> radius 1. size=2*t+1 -> radius t.
        
        filter_size = 2 * thickness + 1
        outline_mask = outline_mask.filter(ImageFilter.MaxFilter(filter_size))
        
        # Optional: Blur the mask slightly to smooth edges, then threshold again?
        # For sticker cut lines, usually sharp or slightly rounded is good.
        # MaxFilter gives a square-ish expansion. 
        # Better approach for rounder corners: Gaussian blur + threshold, or multiple small dilations.
        # Let's try a large MaxFilter first, it's fast. 
        # Actually, MaxFilter(size) checks a box of size x size. 
        
        # Create a solid color image for the outline
        outline_img = Image.new("RGBA", img.size, outline_color + (255,))
        
        # Apply the expanded mask to the outline image
        outline_img.putalpha(outline_mask)
        
        # Composite: Paste the original image on top of the outline
        # We need to make sure the outline is only where the original is transparent? 
        # Or just put original on top.
        
        final_img = Image.alpha_composite(outline_img, img)
        
        final_img.save(output_path)
        print(f"Successfully saved outlined image to {output_path}")
        
    except Exception as e:
        print(f"Error processing image: {e}")

if __name__ == "__main__":
    input_file = r"d:\Awesome-Astron-Workflow\Astron Celebrates the Year of the Horse\combined_result.png"
    output_file = r"d:\Awesome-Astron-Workflow\Astron Celebrates the Year of the Horse\combined_result_outlined.png"
    
    # Light Gray color: (211, 211, 211) -> #D3D3D3
    # Thickness: 10 pixels (adjust as needed for 2500x2500 image)
    add_outline(input_file, output_file, outline_color=(220, 220, 220), thickness=15)
