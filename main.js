const { draw } = require('./pattern.js');
const { yieldToEventLoop } = require('./lib/tools');
const OPC = new require('./lib/opc');

async function main(args) {
  const client = new OPC('localhost', 7890);

  while (true) {
    draw(client);
    client.writePixels();
    await yieldToEventLoop(); // let network IO run
  }
}

(async () => main(process.argv.slice(2)))().then(
  (result) => {
    process.exit(result);
  }, (err) => {
    console.log(err);
    process.exit(1);
  }
);
