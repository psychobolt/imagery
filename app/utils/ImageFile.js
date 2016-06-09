import fs from 'fs';
import readline from 'line-reader';
import PBMFileReader from './PBMFileReader';

const PBM_COMPRESSED_FORMATS = {
  "E1" : "PGM_ASCII_RLE_COMPRESSED",
  "E2" : "PGM_BIN_RLE_COMPRESSED",
  "E3" : "PGM_ASCII_HME_COMPRESSED",
  "E4" : "PGM_BIN_HME_COMPRESSED"
}

const PBM_IMAGE_FORMATS = Object.assign({}, {
  //"P1" : "PBM_ASCII",
  "P2" : "PGM_ASCII",
  //"P3" : "PPM_ASCII",
  //"P4" : "PBM_BIN",
  "P5" : "PGM_BIN",
  //"P6" : "PPM_BIN",
}, PBM_COMPRESSED_FORMATS);

class PBMAsciiReader {
    
    constructor(filepath, onLine, onClose) {
        let index = 0;
        readline.eachLine(filepath, (line, last) => {
            if (onLine) {
                onLine(line, index++, last);
            }
            if (last || this.error) {
                onClose(this.error);
                return false;
            }
        });
    }
    
    close(error) {
        this.error = error;
    }
    
}

export default class ImageFile {
    
    constructor (filepath) {
        this.filepath = filepath;
        this.length = 0;
        this.pixels = [];
    }
    
    on(event, callback) {
        this[event] = callback;
    }
    
    load() {
        const onLoad = this['load-data'] || function () {};
        const onError = this['load-error'] || function(error) {};
        const onComplete = this['load-complete'] || function() {};
        const complete = () => {
            if (this.length !== this.pixels.length) {
                this.compressionRatio = Math.ceil(this.pixels.length / this.length);
                console.log('Compressed pixel count: ' + this.length);
                console.log('Original pixel count: ' + this.pixels.length);
                console.log('Compression Ratio: ' + this.compressionRatio);
                this.length = this.pixels.length;
            }
            onComplete();
            console.log('Loaded image: ' + this.filepath + ' ' + this.width + ' ' + this.height + ' ' + this.colorBits);
        };
        const getImagePixels = (pixels) => { //TODO refactor
            pixels.forEach((pixel) => {
                this.pixels.push(pixel);
            });
            return pixels;
        };
        const fd = fs.openSync(this.filepath, 'r');
        if (!fd) {
            onError('Unable to open file');
            return;
        }
        const header = new Buffer(2);
        fs.readSync(fd, header, 0, 2, 0);
        this.format = PBM_IMAGE_FORMATS[header.toString()];
        if (!this.format) {
            fs.close(fd, () => onError('File is not a supported image format. Supported image formats:\n' + JSON.stringify(IMAGE_FORMATS, null, 2)));
        } else {
            if (this.format.indexOf('_ASCII') !== -1) {
                fs.close(fd);
                const reader = new PBMAsciiReader(this.filepath, (line, index) => {
                    if (index === 0) return;
                    if (!line.startsWith('#')) {
                        if (!this.width && !this.height) {
                            const resolution = line.split(/\s+/);
                            this.width = parseInt(resolution[0]);
                            this.height = parseInt(resolution[1]);
                        } else if (!this.colorBits) {
                            this.colorBits = parseInt(line);
                            } else if (this['load-init']) {
                            this['load-init']();
                            delete this['load-init'];
                            onLoad(getImagePixels(line.split(/\s+/))); //TODO refactor
                        } else if (onLoad) {
                            onLoad(getImagePixels(line.split(/\s+/))); //TODO refactor
                        } else {
                            reader.close('File is not a supported image format. Supported image formats:\n' + JSON.stringify(IMAGE_FORMATS, null, 2));
                        }
                    }
                }, (err) => {
                    if (err) {
                        onError(err);
                    } else {
                        complete();
                    }
                });
            } else if (this.format.indexOf('_BIN') !== -1) {
                const reader = new PBMFileReader(fd, this.format);
                Object.assign(this, reader.getInfo());
                this['load-init']();
                reader.readPixels((pixels) => onLoad(getImagePixels(pixels)), 64);
                fs.close(fd, complete);
            } else {
                fd.close(fd, () => onError('Unexpected error'));
            }
        }
    }
    
}