import fs from 'fs';
import readline from 'line-reader';

const IMAGE_FORMATS = {
  //"P1" : "PBM_ASCII",
  "P2" : "PGM_ASCII",
  //"P3" : "PPM_ASCII",
  //"P4" : "PBM_BIN",
  //"P5" : "PGM_BIN",
  //"P6" : "PPM_BIN"
};

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
        this.pixels = [];
    }
    
    on(event, callback) {
        this[event] = callback;
    }
    
    load() {
        const onLoad = this['load-data'] || function () {};
        const onComplete = this['load-complete'] || function() {};
        const onError = this['load-error'] || function(error) {};
        fs.open(this.filepath, 'r', (status, fd) => {
            if (status) {
                onError();
                return;
            }
            const header = new Buffer(2);
            fs.readSync(fd, header, 0, 2, 0);
            const format = IMAGE_FORMATS[header.toString('utf-8')];
            if (!format) {
                fs.close(fd, () => onError('File is not a supported image format. Supported image formats:\n' + JSON.stringify(IMAGE_FORMATS, null, 2)));
            } else if (format.indexOf('_ASCII')) {
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
                            onLoad(line.split(/\s+/).map((val) => parseInt(val)));
                        } else if (onLoad) {
                            onLoad(line.split(/\s+/).map((val) => parseInt(val)));
                        } else {
                            reader.close('File is not a supported image format. Supported image formats:\n' + JSON.stringify(IMAGE_FORMATS, null, 2));
                        }
                    }
                }, (err) => {
                    if (err) {
                        onError(err);
                    } else {
                        onComplete();
                        console.log('Loaded image: ' + this.filepath + ' ' + this.width + ' ' + this.height + ' ' + this.colorBits);
                    }
                });
            } else if (format.indexOf('_BIN')) {
                fs.close(fd, () => {
                    onComplete();
                    console.log('Loaded image: ' + this.filepath + ' ' + this.width + ' ' + this.height + ' ' + this.colorBits);
                });
            } else {
                fd.close(fd, () => onError('Unexpected error'));
            }
        });
    }
    
}