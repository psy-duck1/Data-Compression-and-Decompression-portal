const fs = require('fs');

class Node {
  constructor(byte, freq, left = null, right = null) {
    this.byte = byte;
    this.freq = freq;
    this.left = left;
    this.right = right;
  }
}

function buildFrequencyMap(buffer) {
  const freqMap = {};
  for (const byte of buffer) {
    freqMap[byte] = (freqMap[byte] || 0) + 1;
  }
  return freqMap;
}

function buildHuffmanTree(freqMap) {
  const nodes = Object.entries(freqMap).map(([byte, freq]) => new Node(Number(byte), freq));
  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq);
    const left = nodes.shift();
    const right = nodes.shift();
    const parent = new Node(null, left.freq + right.freq, left, right);
    nodes.push(parent);
  }
  return nodes[0];
}

function generateCodes(node, prefix = '', map = {}) {
  if (!node) return;
  if (node.byte !== null) map[node.byte] = prefix;
  generateCodes(node.left, prefix + '0', map);
  generateCodes(node.right, prefix + '1', map);
  return map;
}

function encodeData(buffer, codeMap) {
  let bitString = '';
  for (const byte of buffer) {
    bitString += codeMap[byte];
  }
  return bitString;
}

function decodeData(bitString, codeMap) {
  const reverseMap = Object.fromEntries(
    Object.entries(codeMap).map(([byte, code]) => [code, Number(byte)])
  );

  const output = [];
  let current = '';
  for (const bit of bitString) {
    current += bit;
    if (reverseMap.hasOwnProperty(current)) {
      output.push(reverseMap[current]);
      current = '';
    }
  }

  return Buffer.from(output);
}

function writeCompressedFile(encodedStr, codeMap, outputPath) {
  const byteArray = [];
  for (let i = 0; i < encodedStr.length; i += 8) {
    const byte = encodedStr.slice(i, i + 8);
    byteArray.push(parseInt(byte.padEnd(8, '0'), 2));
  }

  const dataBuffer = Buffer.from(byteArray);
  const codeMapStr = JSON.stringify(codeMap);
  const codeMapBuffer = Buffer.from(codeMapStr, 'utf-8');

  const sizeBuffer = Buffer.alloc(4);
  sizeBuffer.writeUInt32BE(codeMapBuffer.length, 0);

  const finalBuffer = Buffer.concat([sizeBuffer, codeMapBuffer, dataBuffer]);
  fs.writeFileSync(outputPath, finalBuffer);
}

function compress(inputPath, outputPath) {
  const inputBuffer = fs.readFileSync(inputPath);
  const freqMap = buildFrequencyMap(inputBuffer);
  const tree = buildHuffmanTree(freqMap);
  const codeMap = generateCodes(tree);
  const encodedStr = encodeData(inputBuffer, codeMap);
  writeCompressedFile(encodedStr, codeMap, outputPath);
}

function decompress(inputPath, outputPath) {
  const fileBuffer = fs.readFileSync(inputPath);

  const headerSize = fileBuffer.readUInt32BE(0);
  const headerBuffer = fileBuffer.slice(4, 4 + headerSize);
  const codeMap = JSON.parse(headerBuffer.toString('utf-8'));

  const dataBuffer = fileBuffer.slice(4 + headerSize);

  let bitString = '';
  for (const byte of dataBuffer) {
    bitString += byte.toString(2).padStart(8, '0');
  }

  const decodedBuffer = decodeData(bitString, codeMap);
  fs.writeFileSync(outputPath, decodedBuffer);
}

module.exports = {
  compress,
  decompress,
};
