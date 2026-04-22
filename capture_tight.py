import asyncio
from playwright.async_api import async_playwright
import os

async def capture_tight_cards():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        # High scale factor for HD
        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            device_scale_factor=3
        )
        
        files = [
            ('astron_relations_glass.html', 'astron_relations_glass.png'),
            ('astron_relations_glass_zh.html', 'astron_relations_glass_zh.png')
        ]
        
        for html_file, png_file in files:
            page = await context.new_page()
            file_path = os.path.abspath(html_file)
            if not os.path.exists(file_path):
                print(f"Error: {html_file} not found.")
                continue
                
            await page.goto(f'file:///{file_path}')
            # Wait for all effects to render
            await page.wait_for_timeout(2000)
            
            # Find the card container
            card = await page.query_selector('.card-container')
            if card:
                # Remove scale transform before capturing to get exact pixels
                await page.evaluate("document.querySelector('.card-container').style.transform = 'none'")
                # Take screenshot of just the card element
                await card.screenshot(path=png_file, animations="disabled")
                print(f"Successfully captured tight-cropped HD PNG: {png_file}")
            else:
                print(f"Error: Card container not found in {html_file}")
            
            await page.close()
            
        await browser.close()

if __name__ == "__main__":
    asyncio.run(capture_tight_cards())
