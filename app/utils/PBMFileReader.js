import fs from 'fs';
import * as imageUtils from './image-utils'; 

function defaultReducer(pixels) {
  return pixels;
}

function readBytes(fd, position, length = 1) {
  const buffer = new Buffer(length);
  let size = fs.readSync(fd, buffer, 0, length, position);
  if (size) {
    if (size === length) {
      return buffer;
    }
    const resized = Buffer.allocUnsafe(size);
    buffer.copy(resized, 0, 0, size);
    return resized;
  }
  return new Buffer(0);
}

function getUTF8String(fd, offset, term) {
  let content = '';
  let buffer = new Buffer(1);
  if (offset) {
    readBytes(fd, offset);
  }
  while (buffer.length) {
    buffer = readBytes(fd);
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
  let buffer = readBytes(fd, position);
  let length = 0;
  while (buffer.length) {
    length += 8;
    collector(buffer);
    buffer = readBytes(fd);
    if (term && term == buffer.toString()) {
      break;
    }
  }
  return length;
}

function readPGMCompressedRLE(fd, collector, position) {
  collector = collector|| function () {};
  let pixelBuffer = readBytes(fd, position);
  let length = 0;
  while (pixelBuffer.length) {
    length += 8;
    collector(pixelBuffer);
    let countBuffer = new Buffer(4);
    for (let i = 0; i < 4; i++) { // read 4 bytes or a 32 bit unsigned integer
      countBuffer[i] = readBytes(fd)[0];
    }
    length += 32;
    collector(countBuffer);
    pixelBuffer = readBytes(fd);
  }
  return length;
}

function readPGMCompressedHME(fd, collector, position) {
  let index = 0;
  let codeBook = {};
  let value;
  let length = 0;
  readPGMBinary(fd, (buffer) => {
    if (index ++ % 2 === 0) {
      value = buffer.readUInt8(0);
    } else {
      codeBook[buffer.readUInt8(0).toString(2)] = value;
    }
    length += 8;
  }, position, '\n');
  let encoded = '';
  readPGMBinary(fd, (buffer) => {
    let binary = buffer.readUInt8(0).toString(2);
    encoded += "00000000".substring(0, 8 - binary.length) + binary;
    length += 8;
  });
  value = null;
  let code = '';
  for(let i = 0; i < encoded.length; i++) {
    code += encoded.charAt(i);
    value = codeBook[code];
    if (value !== null) {
      collector(value);
      code = '';
      value = null;
    }
  }
  return length;
}

function readPGMCompressedLZW(fd, collector, position) {
  collector = collector || function () {};
  let buffer = readBytes(fd, position, 2);
  let index = 255;
  let dictionary = {};
  let length = 0;
  buffer = readBytes(fd, position, 2);
  while (buffer.length) {
    length += 16;
    const bytes = buffer.readUInt16BE(0);
    let pixels;
    if (dictionary[bytes]) {
      pixels = dictionary[bytes];
    }
    buffer = readBytes(fd, null, 2);
  }
  console.log(dictionary);
  return length;
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
    let processor = defaultReducer;
    let pixels = [];
    let length = 0;
    const collector = function (data) {
      if (data !== undefined) {
        if (Number.isInteger(data)) {
            pixels.push(data);
        } else if (data.length === 4) {
            pixels.push(data.readUInt32BE(0));
        } else {
            pixels.push(data.readUInt8(0));
        }
        if (pixels.length === batchSize) {
            onRead(processor(pixels));
            pixels = [];
        }
      }
    };
    if (this.format.indexOf('PGM_BIN_RLE') === 0) {
      processor = imageUtils.runLengthDecode;
      length = readPGMCompressedRLE(this.fd, collector);
    } else if (this.format.indexOf('PGM_BIN_HME') === 0) {
      length = readPGMCompressedHME(this.fd, collector);
    } else if (this.format.indexOf('PGM_BIN_LZW') === 0) {
      length = readPGMCompressedLZW(this.fd, collector);
    } else if (this.format.indexOf('PGM_BIN') === 0) {
      length = readPGMBinary(this.fd, collector);
    }
    if (pixels.length) {
        onRead(processor(pixels));
    }
    return length;
  }
}