import fs from 'fs';

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

function readPGMBinary(fd, callback, position) {
    callback = callback || function () {};
    let buffer = readByte(fd, position);
    while (buffer.length) {
      if (buffer.length) {
        callback(buffer);
      }
      buffer = readByte(fd);
    }
}

function readPGMCompressedRLE(fd, callback, position) {
    callback = callback || function () {};
    let pixelBuffer = readByte(fd, position);
    let index = 0;
    while (pixelBuffer.length) {
      if (pixelBuffer.length) {
        callback(pixelBuffer);
        let countBuffer = new Buffer(4);
        for (let i = 0; i < 4; i++) { // read 4 bytes or a 32 bit unsigned integer
          countBuffer[i] = readByte(fd)[0];
        }
        callback(countBuffer);
        index++;
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

  readPixels(onRead) {
    if (this.format.indexOf('PGM_BIN_RLE') === 0) {
      readPGMCompressedRLE(this.fd, onRead);
    } else if (this.format.indexOf('PGM_BIN') === 0) {
      readPGMBinary(this.fd, onRead);
    }
  }
}