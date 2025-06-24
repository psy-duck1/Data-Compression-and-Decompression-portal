class RunLengthEncoding {
    constructor() {
        this.maxRunLength = 255; 
    }

    
    compress(inputBuffer) {
        if (inputBuffer.length === 0) {
            return {
                compressedData: Buffer.alloc(0), 
                originalSize: 0
            };
        }

        const compressed = [];
        let i = 0;
        
        while (i < inputBuffer.length) {
            const currentByte = inputBuffer[i];
            let runLength = 1;
            
            
            while (i + runLength < inputBuffer.length &&
                   inputBuffer[i + runLength] === currentByte &&
                   runLength < this.maxRunLength) { 
                runLength++;
            }

            
            compressed.push(runLength);
            compressed.push(currentByte);
            i += runLength;
        }

        return {
            compressedData: Buffer.from(compressed),
            originalSize: inputBuffer.length
        };
    }

    
    decompress(compressedData, originalSize) {
        if (compressedData.length === 0) {
            return Buffer.alloc(0);
        }

        const decompressed = [];
        
        for (let i = 0; i < compressedData.length; i += 2) {
            if (i + 1 >= compressedData.length) {
                
                console.warn(`RLE Decompress: Malformed data at index ${i}. Expected byteValue but none found.`);
                break; 
            }
            
            const runLength = compressedData[i];
            const byteValue = compressedData[i + 1];
            
            
            if (runLength <= 0 || runLength > this.maxRunLength) {
                console.warn(`RLE Decompress: Invalid run length ${runLength} at index ${i}. Skipping this pair.`);
                
                
                continue; 
            }

            
            for (let j = 0; j < runLength && decompressed.length < originalSize; j++) {
                decompressed.push(byteValue);
            }
        }

        
        const resultBuffer = Buffer.from(decompressed);
        if (resultBuffer.length > originalSize) {
            return resultBuffer.slice(0, originalSize);
        } else if (resultBuffer.length < originalSize) {
            const paddedBuffer = Buffer.alloc(originalSize, 0); 
            resultBuffer.copy(paddedBuffer);
            return paddedBuffer;
        }
        return resultBuffer;
    }

    
    compressEnhanced(inputBuffer) {
        if (inputBuffer.length === 0) {
            return {
                compressedData: Buffer.alloc(0),
                originalSize: 0
            };
        }

        const compressed = [];
        let i = 0;
        
        while (i < inputBuffer.length) {
            const currentByte = inputBuffer[i];
            let runLength = 1;
            
            
            while (i + runLength < inputBuffer.length &&
                   inputBuffer[i + runLength] === currentByte &&
                   runLength < this.maxRunLength) {
                runLength++;
            }

            if (runLength >= 3) { 
                
                compressed.push(0xFF); 
                compressed.push(runLength);
                compressed.push(currentByte);
            } else {
                
                for (let j = 0; j < runLength; j++) {
                    if (currentByte === 0xFF) { 
                        compressed.push(0xFF);
                        compressed.push(0x00); 
                    } else {
                        compressed.push(currentByte);
                    }
                }
            }
            i += runLength;
        }

        return {
            compressedData: Buffer.from(compressed),
            originalSize: inputBuffer.length,
            enhanced: true
        };
    }

    
    decompressEnhanced(compressedData, originalSize) {
        if (compressedData.length === 0) {
            return Buffer.alloc(0);
        }

        const decompressed = [];
        let i = 0;
        
        while (i < compressedData.length && decompressed.length < originalSize) {
            const byte = compressedData[i];

            if (byte === 0xFF) { 
                if (i + 1 < compressedData.length && compressedData[i + 1] === 0x00) {
                    
                    decompressed.push(0xFF);
                    i += 2;
                } else if (i + 2 < compressedData.length) {
                    
                    const runLength = compressedData[i + 1];
                    const byteValue = compressedData[i + 2];

                    if (runLength <= 0 || runLength > this.maxRunLength) {
                        console.warn(`RLE Decompress Enhanced: Invalid run length ${runLength} at index ${i}. Treating 0xFF as literal.`);
                        decompressed.push(0xFF); 
                        i++;
                        continue;
                    }
                    
                    for (let j = 0; j < runLength && decompressed.length < originalSize; j++) {
                        decompressed.push(byteValue);
                    }
                    i += 3;
                } else {
                    
                    console.warn(`RLE Decompress Enhanced: Malformed 0xFF sequence at index ${i}. Treating as literal.`);
                    decompressed.push(0xFF);
                    i++;
                }
            } else {
                
                decompressed.push(byte);
                i++;
            }
        }

        
        const resultBuffer = Buffer.from(decompressed);
        if (resultBuffer.length > originalSize) {
            return resultBuffer.slice(0, originalSize);
        } else if (resultBuffer.length < originalSize) {
            const paddedBuffer = Buffer.alloc(originalSize, 0); 
            resultBuffer.copy(paddedBuffer);
            return paddedBuffer;
        }
        return resultBuffer;
    }

    
    decompressSimple(compressedBuffer, estimatedSize) {
        try {
            
            const decompressed = this.decompress(compressedBuffer, estimatedSize);
            
            if (decompressed.length > 0 && decompressed.length !== compressedBuffer.length) {
                return decompressed;
            }
        } catch (error) {
            console.warn(`Standard RLE decompression failed, trying enhanced RLE: ${error.message}`);
        }

        try {
            
            const decompressed = this.decompressEnhanced(compressedBuffer, estimatedSize);
            return decompressed;
        } catch (error) {
            console.error(`Enhanced RLE decompression also failed: ${error.message}`);
            
            
            console.warn(`RLE decompressSimple: Both standard and enhanced RLE failed. Returning buffer of estimated size ${estimatedSize} (likely corrupted data).`);
            return Buffer.alloc(estimatedSize);
        }
    }
}

module.exports = RunLengthEncoding;
