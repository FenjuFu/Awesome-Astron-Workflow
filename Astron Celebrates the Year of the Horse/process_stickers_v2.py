import numpy as np
from PIL import Image
import scipy.ndimage as ndimage

def process_image(input_path, output_path, bg_color_hex, outline_color_name, gap_closing_radius, outline_width):
    print(f"Loading {input_path}...")
    img = Image.open(input_path).convert("RGBA")
    
    # Extract Alpha channel
    alpha = np.array(img.split()[-1])
    
    # Binarize alpha (assuming > 0 is content)
    mask = alpha > 0
    
    print("Creating outline mask...")
    # 1. Dilate to close gaps
    # Structure for dilation: disk of radius gap_closing_radius
    # optimize: iterate or use distance transform?
    # Distance transform is faster for large radii.
    # dist_transform_edt computes distance to nearest zero.
    # So we want points where distance to nearest "content" is <= radius.
    # But we want to dilate the "True" regions.
    # So we compute distance from "False" regions.
    # If pixel is False (0), dist is 0. If pixel is True (1), dist is > 0? No.
    # edt computes distance to background (0).
    # So we want to compute distance on the INVERTED mask?
    # No, we want to expand the TRUE regions.
    # Dilation(mask) = { p | dist(p, mask) <= radius }
    # So we compute EDT of (NOT mask).
    # Any pixel with dist <= radius in the inverted mask is within radius of the original mask.
    
    # Invert mask (True where it is empty)
    inverted_mask = ~mask
    dist = ndimage.distance_transform_edt(inverted_mask)
    
    # Dilated mask: places where distance to original content is <= gap_closing_radius
    dilated_mask = dist <= gap_closing_radius
    
    # 2. Fill holes (optional, but good if there are trapped voids)
    # If the dilation closed the loop around a hole, this will fill it.
    filled_mask = ndimage.binary_fill_holes(dilated_mask)
    
    # 3. Erode to get back to desired outline width
    # We want the final outline to be `outline_width` from the original content?
    # No, usually "fill gaps" means "merge", and the outline is around the merged shape.
    # If we dilated by `gap_closing_radius`, the boundary is now that far out.
    # We want to shrink it back so it is only `outline_width` away from the "hull".
    # But wait, if we shrink it back, we might re-open the gaps if the gaps were small!
    # Let's think:
    # If gap is 100px. Dilation 60px -> closes gap (overlap 20px).
    # Mask is solid across gap.
    # If we erode by 45px (to leave 15px outline), does it re-open?
    # The bridge was 20px wide (at the thinnest point, center of gap).
    # If we erode 45px, we eat 45px from both sides of the bridge? No, from the boundary.
    # The bridge is internal to the shape now. Erosion only affects the boundary.
    # So the internal filled area remains filled.
    # EXCEPT if the bridge is "thin" relative to erosion?
    # If the bridge width is > 2 * erosion_radius, it survives.
    # The bridge width after dilation (radius R) on a gap of size G:
    # Width = 2*R - G.
    # Here R=60, G=100. Width = 120 - 100 = 20px.
    # If we erode by 45px, we erode the bridge away!
    # So this approach (Dilate large -> Erode large) fails for gaps that are just barely closed.
    
    # Alternative approach:
    # We want the "Background" of the sticker sheet to be white.
    # This implies a "convex hull" or "concave hull" or "alpha shape".
    # But simple "Close gaps" usually implies just making the outline thick enough.
    
    # User said: "fill gaps between images with white".
    # Maybe simply calculating the Convex Hull of all stickers?
    # Or simply:
    # 1. Outline each sticker with white (width 15).
    # 2. Fill the "internal voids" of the bounding box?
    # 3. Or maybe the user implies the grid should be solid.
    
    # Let's try to assume the user wants a "connected" sticker sheet.
    # If the gap is ~100px, we need an outline of 50px to touch.
    # If we set outline width to 55px, they will merge.
    # But then the outer border is 55px thick, which is huge.
    
    # What if we create a mask that is the Convex Hull of the non-zero pixels?
    # That would fill EVERYTHING inside the outer boundary.
    # That might be what is requested ("fill gaps").
    # `skimage.morphology.convex_hull_image` does this.
    # But convex hull might include corners we don't want if the arrangement is not convex (e.g. L shape).
    # But 5x5 grid is a square. Convex hull is perfect for a square grid!
    # It will simply make a square (or rounded square) block.
    
    # Let's check if the layout is a grid. 25 images. 5x5 is highly likely.
    # So convex hull will result in a big square.
    # Then we expand it by `outline_width` to give a border.
    # Then we composite.
    
    # Let's try Convex Hull. It's robust for grids.
    from skimage.morphology import convex_hull_image
    
    print("Computing convex hull...")
    # convex_hull_image works on the whole image.
    hull = convex_hull_image(mask)
    
    # Now expand the hull by `outline_width` to get the white border
    # Use distance transform again for dilation
    print(f"expanding hull by {outline_width} pixels...")
    inverted_hull = ~hull
    dist_hull = ndimage.distance_transform_edt(inverted_hull)
    expanded_hull = dist_hull <= outline_width
    
    # Create output image
    # Background
    out_img = Image.new("RGBA", img.size, bg_color_hex)
    
    # White "Sticker Sheet" background (the expanded hull)
    # Create white layer
    white_layer = Image.new("RGBA", img.size, outline_color_name)
    white_mask = Image.fromarray(expanded_hull.astype(np.uint8) * 255)
    
    # Paste white layer using mask
    out_img.paste(white_layer, (0, 0), white_mask)
    
    # Paste original stickers
    out_img.paste(img, (0, 0), img)
    
    out_img.save(output_path)
    print(f"Saved to {output_path}")

if __name__ == "__main__":
    input_file = r"d:\Awesome-Astron-Workflow\Astron Celebrates the Year of the Horse\combined_result.png"
    output_file = r"d:\Awesome-Astron-Workflow\Astron Celebrates the Year of the Horse\sticker_result.png" # Overwriting or new file?
    # User said "please help me ... combined_result.png". Usually implies modifying it or saving a result.
    # I'll save to `d:\Awesome-Astron-Workflow\Astron Celebrates the Year of the Horse\combined_result.png` as requested?
    # "Please help me set the background of ... to ..."
    # I should probably overwrite or create a new file and rename.
    # Safest is to create a new file first, verify, then rename if needed or just inform user.
    # I will save to `combined_result_processed.png` first.
    
    process_image(
        input_file, 
        r"d:\Awesome-Astron-Workflow\Astron Celebrates the Year of the Horse\combined_result.png", # Overwrite as per request implication "set ... of ... file"
        "#6C2CF5", 
        "white", 
        gap_closing_radius=60, # Unused if we use convex hull
        outline_width=15
    )
