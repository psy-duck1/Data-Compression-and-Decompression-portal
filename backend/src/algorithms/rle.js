const fs = require('fs');

function rleCompress(inputPath, outputPath) {
  const input = fs.readFileSync(inputPath);
  const output = [];

  let i = 0;
  while (i < input.length) {
    const byte = input[i];
    let count = 1;

    while (i + count < input.length && input[i + count] === byte && count < 255) {
      count++;
    }

    output.push(byte, count);
    i += count;
  }

  fs.writeFileSync(outputPath, Buffer.from(output));
}

function rleDecompress(inputPath, outputPath) {
  const input = fs.readFileSync(inputPath);
  const output = [];

  for (let i = 0; i < input.length; i += 2) {
    const byte = input[i];
    const count = input[i + 1];
    for (let j = 0; j < count; j++) {
      output.push(byte);
    }
  }

  fs.writeFileSync(outputPath, Buffer.from(output));
}

module.exports = { rleCompress, rleDecompress };
