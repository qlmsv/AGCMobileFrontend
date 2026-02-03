const Jimp = require('jimp');

async function processIcon() {
  try {
    console.log('Reading newlogo.png...');
    const image = await Jimp.read('newlogo.png');

    // Original dimensions: 1536 x 1024
    // 1. Crop the center square (1024x1024)
    const cropX = (image.bitmap.width - 1024) / 2;
    image.crop(cropX, 0, 1024, 1024);

    // 2. Resize to 768x768 (75% of target size)
    image.resize(768, 768);

    // 3. Create white background 1024x1024
    const bg = new Jimp(1024, 1024, 0xffffffff);

    // 4. Calculate position
    const x = (1024 - 768) / 2;
    let y = (1024 - 768) / 2;

    // 5. Apply "make it lower" offset
    const offset = 50; // Shift down by 50px
    y += offset;

    // 6. Composite
    bg.composite(image, x, y);

    console.log(`Writing to assets/final_icon.png (Offset Y: +${offset}px)`);
    await bg.writeAsync('assets/final_icon.png');
    console.log('Done!');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

processIcon();
