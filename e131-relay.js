// You can run this as an alternative to main.js if you just want to
// listen for and relay e131 data

const e131 = require('e131');
const OPC = new require('./lib/opc');
const client = new OPC('localhost', 7890);

// There are 60 * 8 * 3 = 1440 channels per sign, so 3 universes
// Use default e131 port 5568
const numStrips = 8;
const pixelsPerStrip = 60;
const numPixels = numStrips * pixelsPerStrip;
const numChannels = 3;
const numUniverses = 3;
const firstUniverse = 0;
const channelsPerUniverse = 510;
// set to 0 for the first sign or numPixels for the second sign
// (an easier way to handle this might be to use different
// universes for each kitty's data, so we don't need to
// configure each one separately, but I'll leave that for next
// time)
const opcPixelOffset = 0; // first OPC pixel (not channel) to address
const server = new e131.Server([1, 2, 3], 5568);
const buffer = new Uint8Array(numPixels * numChannels);
const debugPackets = false;
const debugData = false;
const safetyTimeoutMs = 5000;

// Update the OPC client and send an update to Fadecandy
function writeFrame() {
  for (let i = 0; i < numPixels; i ++) {
    client.setPixel(i + opcPixelOffset, //255, 0, 0);/*
      buffer[i * 3 + 0],
      buffer[i * 3 + 1],
      buffer[i * 3 + 2]);
  }

  //  console.log(`b0: ${buffer[0]} ${buffer[1]} ${buffer[2]}`);
  client.writePixels();
  //  console.log(`wrote pixels`);
}

// To aid testing, set all channels to 255 so that any channels
// that were never written to will be easier to see. Also write a
// frame immediately to trigger OPC connection setup.
for (let i = 0; i < numPixels * numChannels; i ++) {
  buffer[i] = 255;
}
writeFrame();

// Print a helpful channel address table for humans
for (let i = 0; i < numStrips; i ++) {
  const startChannel = i * pixelsPerStrip * numChannels;
  const startUniverse = 
    firstUniverse + Math.floor(startChannel / channelsPerUniverse);
  const startOffset = startChannel % channelsPerUniverse;
  console.log(`Strip ${i}: ${pixelsPerStrip} pixels starting at ` +
    `universe ${startUniverse} offset ${startOffset}`);
}

server.on('listening', function() {
  console.log('server listening on port %d, universes %j', this.port, this.universes);
});

// If no OSC data received for a while, set all pixels to
// white so that an art car doesn't crash into the kitties
let safetyTimer = null;
function resetSafetyTimer() {
  function writeSafetyPixels() {
    console.log("sending safety pixels");
    for (let i = 0; i < numPixels * numChannels; i ++)
      buffer[i] = 255;
    writeFrame();
  } 

  if (safetyTimer)
    clearTimeout(safetyTimer);
  safetyTimer = setTimeout(writeSafetyPixels, safetyTimeoutMs);
}
resetSafetyTimer();

server.on('packet', function (packet) {
  resetSafetyTimer();

  var sourceName = packet.getSourceName();
  var sequenceNumber = packet.getSequenceNumber();
  var universe = packet.getUniverse();
  var slotsData = packet.getSlotsData();

  if (debugPackets)
    console.log('source="%s", seq=%d, universe=%d, slots=%d',
      sourceName, sequenceNumber, universe, slotsData.length);
  if (debugData)
    console.log('slots data = %s', slotsData.toString('hex'));

  // Copy newly received E131 data into our buffer, based on
  // the universe number in the E131 packet
  let channel = (universe - firstUniverse) * channelsPerUniverse;
  const firstChannel = channel;
  for (let i = 0; i < slotsData.length; i ++) {
    buffer[channel ++] = slotsData[i];
  }
  if (debugPackets)
    console.log(`updated channels [${firstChannel}, ${channel-1}]`);
  writeFrame();
});
