class LZ77 {
    constructor(windowSize = 4096, lookaheadSize = 256) {
        this.windowSize = windowSize;
        this.lookaheadSize = lookaheadSize;
    }

    
    findLongestMatch(data, position) {
        const windowStart = Math.max(0, position - this.windowSize);
        const lookaheadEnd = Math.min(data.length, position + this.lookaheadSize);
        let bestMatch = { distance: 0, length: 0 }; 

        
        for (let i = windowStart; i < position; i++) {
            let currentMatchLength = 0;
            
            while (position + currentMatchLength < lookaheadEnd &&
                   data[i + currentMatchLength] === data[position + currentMatchLength] &&
                   currentMatchLength < this.lookaheadSize) { 
                currentMatchLength++;
            }

            
            if (currentMatchLength > bestMatch.length) {
                bestMatch = {
                    distance: position - i, 
                    length: currentMatchLength
                };
            }
        }

        return bestMatch;
    }

    
    compress(inputBuffer) {
        if (inputBuffer.length === 0) {
            return {
                compressedData: Buffer.alloc(0), 
                originalSize: 0
            };
        }

        const compressed = [];
        let position = 0;
        
        while (position < inputBuffer.length) {
            const match = this.findLongestMatch(inputBuffer, position);
            
            
            if (match.length >= 3) {
                
                const nextChar = (position + match.length < inputBuffer.length) ?
                                  inputBuffer[position + match.length] : 0; 
                
                
                compressed.push(0xFF); 
                compressed.push((match.distance >> 8) & 0xFF); 
                compressed.push(match.distance & 0xFF);      
                compressed.push(match.length & 0xFF);        
                compressed.push(nextChar);                   
                
                position += match.length + 1; 
            } else {
                
                const byte = inputBuffer[position];
                
                
                if (byte === 0xFF) {
                    compressed.push(0xFF);
                    compressed.push(0x00); 
                } else {
                    compressed.push(byte);
                }
                position++; 
            }
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
        let i = 0; 
        
        while (i < compressedData.length && decompressed.length < originalSize) {
            const byte = compressedData[i];

            if (byte === 0xFF) { 
                if (i + 1 < compressedData.length && compressedData[i + 1] === 0x00) {
                    
                    decompressed.push(0xFF);
                    i += 2;
                } else if (i + 4 < compressedData.length) {
                    
                    const distance = (compressedData[i + 1] << 8) | compressedData[i + 2];
                    const length = compressedData[i + 3];
                    const nextChar = compressedData[i + 4];

                    
                    if (distance > 0 && distance <= decompressed.length && length > 0) {
                        
                        const startCopyIdx = decompressed.length - distance;
                        for (let k = 0; k < length && decompressed.length < originalSize; k++) {
                            
                            
                            if (startCopyIdx + k < decompressed.length) {
                                decompressed.push(decompressed[startCopyIdx + k]);
                            } else {
                                
                                
                                decompressed.push(decompressed[decompressed.length - distance]);
                            }
                        }
                        
                        
                        if (decompressed.length < originalSize) {
                            decompressed.push(nextChar);
                        }
                        i += 5; 
                    } else {
                        
                        console.warn(`LZ77 Decompress: Invalid match token at index ${i}. Distance: ${distance}, Length: ${length}. Treating 0xFF as literal.`);
                        decompressed.push(0xFF);
                        i++;
                    }
                } else {
                    
                    console.warn(`LZ77 Decompress: Malformed 0xFF sequence at index ${i}. Treating as literal.`);
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
            console.warn(`Standard LZ77 decompression failed, trying fallback: ${error.message}`);
        }

        
        
        
        console.warn(`LZ77 decompressSimple: LZ77 decompression failed. Returning buffer of estimated size ${estimatedSize} (likely corrupted data).`);
        return Buffer.alloc(estimatedSize, 0); 
    }
}

module.exports = LZ77;
