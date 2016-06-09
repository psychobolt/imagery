import fs from 'fs';

function defaultReducer(pixels) { 
  return pixels;
}

function readByte(fd, position) {
  const buffer = new Buffer(1);
  const length = fs.readSync(fd, buffer, 0, 1, position);
  return length ? buffer : new Buffer(0);
}

function getUTF8String(fd, offset, term) {
    let content = '';
    let buffer = new Buffer(1);
    if (offset) {
      readByte(fd, offset);
    }
    while (true) {
      const buffer = readByte(fd);
      const val = buffer.toString();
      if (!term) {
        return val;
      } else if (Array.isArray(term) && term.find((term) => val === term)) {
        return content;
      } else if (val === term) {
        return content;
      } else {
        content += val;
      }
    }
}

function readPGMBinary(fd, collector, position, term) {
    collector = collector || function () {};
    let buffer = readByte(fd, position);
    while (buffer.length && (term !== undefined || term != buffer.toString())) {
      if (buffer.length) {
        collector(buffer);
      }
      buffer = readByte(fd);
    }
}

function readPGMCompressedRLE(fd, collector, position) {
    collector = collector || function () {};
    let pixelBuffer = readByte(fd, position);
    while (pixelBuffer.length) {
      if (pixelBuffer.length) {
        collector(pixelBuffer);
        let countBuffer = new Buffer(4);
        for (let i = 0; i < 4; i++) { // read 4 bytes or a 32 bit unsigned integer
          countBuffer[i] = readByte(fd)[0];
        }
        collector(countBuffer);
      }
      pixelBuffer = readByte(fd);
    }
}

export default class PBMFileReader {

  constructor(fd, format) {
    this.fd = fd;
    this.format = format;
  }

  getInfo() {
    let width, height, colorBits;
    let str = getUTF8String(this.fd, 2, [' ', '\n']);
    while (str && (!width || !height || !colorBits)) {
      if (str.indexOf('#') === 0) {
        str = getUTF8String(this.fd, null, '\n');
      } else if (!width) {
        width = parseInt(str);
        str = getUTF8String(this.fd, null, [' ', '\n']);
      } else if (!height) {
        height = parseInt(str);
        str = getUTF8String(this.fd, null, '\n');
      } else if (!colorBits) {
        colorBits = parseInt(str);
        if (!colorBits) {
          str = getUTF8String(this.fd, null, '\n');
        }
      }
    }
    return {width, height, colorBits}; 
  }

  readPixels(onRead, batchSize) {
    let pixels = [];
    let processor = defaultReducer;
    const collect = function (buffer) {
      if (buffer.length === 4) {
          pixels.push(buffer.readUInt32BE(0));
      } else {
          pixels.push(buffer.readUInt8(0));
      }
      if (pixels.length === batchSize) {
          onRead(processor(pixels));
          pixels = [];
      }
    };
    if (this.format.indexOf('PGM_BIN_RLE') === 0) {
      processor = function (data) {
        let pixels = [];
        let prev;
        data.forEach((value, index) => {
          if (index % 2 === 1) {
            let count = value;
            for(let i = 0; i < count; i++) {
              pixels.push(prev);
            }
          }
          prev = value;
        });
        return pixels;
      };
      readPGMCompressedRLE(this.fd, collect);
    } else if (this.format.indexOf('PGM_BIN_HME') === 0) {
      const codeBook = {};
      let index = 0;
      let value;
      readPGMBinary(this.fd, (buffer) => {
        if (index++ % 2 == 0) {
          value = buffer.readUInt8(0);
        } else {
          codeBook[buffer.readUInt8(0).toString(2)] = value;
        }
      }, '\n');
      let encoded = [];
      index = 0;
      readPGMBinary(this.fd, (buffer) => {
        buffer.readUInt8(0).toString(2).split().filter((bit) => {
          // TODO find value from code book and then push remaining bits into encoded for next buffer
        });
      });
    } else if (this.format.indexOf('PGM_BIN') === 0) {
      readPGMBinary(this.fd, collect);
    }
    if (pixels.length) {
        onRead(processor(pixels));
    }
  }
}