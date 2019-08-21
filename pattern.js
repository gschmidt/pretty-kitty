const { hsv } = require('./lib/tools');

// Render one frame.
function draw(client) {
  let secs = new Date().getTime() / 1000;

  // There are two cats and each is 60 pixels wide by 8 pixels high. Loop
  // over the pixels and compute the color of each based on the current time.
  for (let cat = 0; cat < 2; cat++) {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 60; col++) {

       // Get an (x,y) coordinate for this pixel.
       //   * y goes from 0.0 at the top to 1.0 at the bottom
       //   * x goes from tip to tail (0.0 near the cat’s nose, 1.0 near the
       //     tail)
       //
       // The physical scale is meters. 1 unit of distance = 1 meter.
       //
       // Since x goes from tip to tail, and the two cats are mirror images,
       // the x axis on the two cats is flipped. This is usually convenient
       // since you probably want to write symmetrical patterns, but you can
       // easily override it.
       let x = col / 59;
       let y = row / 7;
         
       // A simple rainbow fade
       // (this is the actual pattern – put your code here!)
       let t = secs - x - y * 2;
       let [red, green, blue] = hsv(Math.sin(t) / 2 + .5, 1,
                                    Math.sin(t) / 2 + .5);

       // Save the computed pixel value in a buffer
       client.setPixel(cat * 60 * 8 + row * 60 + col, red, green, blue);
      }
    }
  }

  // When this function returns the frame will be drawn. Pixel values will be
  // gamma corrected to a 16-bit value, temporally dithered, and interpolated
  // between frames thanks to the FadeCandy hardware.
}

module.exports = { draw };
