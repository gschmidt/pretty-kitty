const { hsv } = require('./lib/tools');

let pattern = [
"X     X  X     X  X     X  XXXXXXX",
"XX   XX  XX    X  XX   XX     X   ",
"X X X X  X X   X  X X X X     X   ",
"X  X  X  X  X  X  X  X  X     X   ",
"X     X  X  X  X  X     X     X   ",
"X     X  X   X X  X     X     X   ",
"X     X  X    XX  X     X     X   ",
"X     X  X     X  X     X     X   "
];

// Render one frame.
function draw(client) {
  let secs = new Date().getTime() / 1000;

  // There are two panels and each is 60 pixels wide by 8 pixels high. Loop
  // over the pixels and compute the color of each based on the current time.
  for (let panel = 0; panel < 2; panel++) {
    for (let rawRow = 0; rawRow < 8; rawRow++) {
      for (let rawCol = 0; rawCol < 60; rawCol++) {

       // col goes from 0 to 119
       // row goes from 0 to 7
       // (0,0) is in the bottom left corner
       let col = (panel ? rawCol : 119 - rawCol);
       let row = 7 - rawRow;

       // A simple rainbow fade
       // (this is the actual pattern – put your code here!)
       let t = secs;
       let [red, green, blue] = hsv(Math.sin(t)/2 + .5, 1,
                                    Math.sin(t) / 2 + .5);

       let isOn = (pattern[row][Math.floor(col/4)] === "X");
       [red, green, blue] = isOn? [255,255,255] : [0, 0, 0];

       // Save the computed pixel value in a buffer
       client.setPixel(panel * 60 * 8 + row * 60 + col, red, green, blue);
      }
    }
  }

  // When this function returns the frame will be drawn. Pixel values will be
  // gamma corrected to a 16-bit value, temporally dithered, and interpolated
  // between frames thanks to the FadeCandy hardware.
}

module.exports = { draw };
