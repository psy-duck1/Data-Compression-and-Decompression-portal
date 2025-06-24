class HuffmanNode {
    constructor(char, freq, left = null, right = null) {
        this.char = char;
        this.freq = freq;
        this.left = left;
        this.right = right;
    }

    isLeaf() {
        return !this.left && !this.right;
    }
}

class HuffmanCoding {
    constructor() {
        this.codes = {};
        this.root = null;
    }

    
    buildFrequencyTable(data) {
        const freq = {};
        for (let i = 0; i < data.length; i++) {
            const byte = data[i];
            freq[byte] = (freq[byte] || 0) + 1;
        }
        return freq;
    }

    
    buildHuffmanTree(frequencies) {
        const heap = [];
        
        for (const char in frequencies) {
            heap.push(new HuffmanNode(parseInt(char), frequencies[char]));
        }
        
        heap.sort((a, b) => a.freq - b.freq);

        
        while (heap.length > 1) {
            const left = heap.shift();
            const right = heap.shift();
            const merged = new HuffmanNode(null, left.freq + right.freq, left, right);
            
            let inserted = false;
            for (let i = 0; i < heap.length; i++) {
                if (merged.freq <= heap[i].freq) {
                    heap.splice(i, 0, merged);
                    inserted = true;
                    break;
                }
            }
            if (!inserted) {
                heap.push(merged);
            }
        }

        return heap[0];
    }

    
    generateCodes(node, code = '', codes = {}) {
        if (!node) return codes;
        if (node.isLeaf()) {
            codes[node.char] = code || '0'; 
            return codes;
        }
        this.generateCodes(node.left, code + '0', codes);
        this.generateCodes(node.right, code + '1', codes);
        return codes;
    }

    
    compress(inputBuffer) {
        if (inputBuffer.length === 0) {
            return {
                compressedData: Buffer.alloc(0),
                tree: {},
                originalSize: 0,
                padding: 0
            };
        }

        const frequencies = this.buildFrequencyTable(inputBuffer);
        
        
        if (Object.keys(frequencies).length === 1) {
            const char = parseInt(Object.keys(frequencies)[0]);
            return {
                compressedData: Buffer.from([char]),
                tree: { [char]: '0' },
                originalSize: inputBuffer.length,
                singleChar: true
            };
        }

        this.root = this.buildHuffmanTree(frequencies);
        this.codes = this.generateCodes(this.root);

        
        let encodedBits = '';
        for (let i = 0; i < inputBuffer.length; i++) {
            encodedBits += this.codes[inputBuffer[i]];
        }

        
        const padding = (8 - (encodedBits.length % 8)) % 8;
        
        encodedBits += '0'.repeat(padding);

        
        let compressedData = this.bitsToBytes(encodedBits);

        return {
            compressedData,
            tree: this.codes,
            originalSize: inputBuffer.length,
            padding
        };
    }

    
    decompress(compressedData, tree, originalSize, padding = 0, singleChar = false) {
        if (originalSize === 0) {
            return Buffer.alloc(0);
        }

        if (singleChar) {
            const char = compressedData[0];
            return Buffer.alloc(originalSize, char);
        }

        
        let bits = this.bytesToBits(compressedData);
        if (padding > 0 && bits.length > 0) {
            bits = bits.slice(0, -padding);
        }

        
        const root = this.rebuildTree(tree);
        const decodedData = [];
        let currentNode = root;

        for (let i = 0; i < bits.length && decodedData.length < originalSize; i++) {
            const bit = bits[i];
            currentNode = (bit === '0') ? currentNode.left : currentNode.right;

            if (currentNode && currentNode.isLeaf()) {
                decodedData.push(currentNode.char);
                currentNode = root;
            }
        }

        
        return Buffer.from(decodedData.slice(0, originalSize));
    }

    
    bitsToBytes(bits) {
        if (bits.length === 0) {
            return Buffer.from([0]);
        }
        const bytes = [];
        for (let i = 0; i < bits.length; i += 8) {
            const byte = bits.slice(i, Math.min(i + 8, bits.length));
            bytes.push(parseInt(byte, 2));
        }
        return Buffer.from(bytes);
    }

    
    bytesToBits(buffer) {
        let bits = '';
        for (let i = 0; i < buffer.length; i++) {
            bits += buffer[i].toString(2).padStart(8, '0');
        }
        return bits;
    }

    
    rebuildTree(codes) {
        const root = new HuffmanNode(null, 0);
        for (const [char, code] of Object.entries(codes)) {
            let currentNode = root;
            for (let i = 0; i < code.length; i++) {
                const bit = code[i];
                if (bit === '0') {
                    if (!currentNode.left) {
                        currentNode.left = new HuffmanNode(null, 0);
                    }
                    currentNode = currentNode.left;
                } else {
                    if (!currentNode.right) {
                        currentNode.right = new HuffmanNode(null, 0);
                    }
                    currentNode = currentNode.right;
                }
            }
            currentNode.char = parseInt(char);
        }
        return root;
    }
}

module.exports = HuffmanCoding;
