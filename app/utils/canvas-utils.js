import vertexShader from '../shaders/image-spatial.vert';
import fragmentShader from '../shaders/image-raster.frag';
import {Readable} from 'stream';
import fs from 'fs';
import _ from 'lodash';
import HuffmanTree from './HuffmanTree';

function isError(gl, shader) {
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    console.error("Could not compile vertex shader. \n\n" + info);
    return true;
  }
  return false;
}

export function createVertexShader(gl, program) {
  const shader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(shader, vertexShader);
  gl.compileShader(shader);
  if (isError(gl, shader)) {
    return null;
  }
  return shader;
}

export function createFragmentShader(gl, program) {
  const shader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(shader, fragmentShader);
  gl.compileShader(shader);
  if (isError(gl, shader)) {
    return;
  }
  return shader;
}

export function initContext(canvas, gl) {
  let context = {gl};
  
  //create and init shaders
  const program = gl.createProgram();
  const vertexShader = createVertexShader(gl, program);
  const fragmentShader = createFragmentShader(gl, program);
  if (!vertexShader || !fragmentShader) {
    gl.deleteProgram(program);
    return;
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    var info = gl.getProgramInfoLog(program);
    console.error("Error in program linking:" + info);
    cleanUp(context);
    return;
  }
  gl.useProgram(program);
  
  //create texture coordinate buffer
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,
    0.0, 1.0,
    1.0, 0.0,
    1.0, 1.0
  ]), gl.STATIC_DRAW);
  
  //specify the location of the texture coordinate data
  const texCoordInLocation = gl.getAttribLocation(program, "a_texCoord");
  gl.enableVertexAttribArray(texCoordInLocation);
  gl.vertexAttribPointer(texCoordInLocation, 2, gl.FLOAT, false, 0, 0);
  
  // set the resolution
  const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

  return Object.assign({}, context, {
      program,
      vertexShader,
      fragmentShader
  });
}

function isPowerOfTwo(x) {
  return (x & (x - 1)) == 0;
}

function nextHighestPowerOfTwo(x) {
  --x;
  for (var i = 1; i < 32; i <<= 1) {
      x = x | x >> i;
  }
  return x + 1;
}

export function renderLayer(context, layer, layerIndex) {
  if (layerIndex > 31) {
    console.error("Only up to 32 layers per Canvas is supported");
    return;
  }
  const gl = context.gl;
  
  // apply filters
  const filters = _.values(layer.filters).sort((a, b) => a.index - b.index);
  filters.forEach((options) => {
    if (!options.disabled) {
      layer = options.filter(layer, context, options);
    }
  });
  
  const register = gl['TEXTURE' + layerIndex];
  const program = context.program;
  const width = isPowerOfTwo(layer.width) ? layer.width : nextHighestPowerOfTwo(layer.width);
  const height = isPowerOfTwo(layer.height) ? layer.height : nextHighestPowerOfTwo(layer.height);
  const texture = gl.createTexture();
  const pixels = new Uint8Array(3 * width * height);
  const offset = width - layer.width;
  let index = 0;
  let rowIndex = 0;
  
  //map pixels for grayscale
  layer.pixels.forEach((pixel) => {
    const remaining = layer.width - index;
    if (remaining % layer.width === 0) {
      rowIndex = index / layer.width;
    }
    pixels[index++ + rowIndex * offset] = pixel;
    pixels[index++ + rowIndex * offset] = pixel;
    pixels[index++ + rowIndex * offset] = pixel;
  });
  
  //create pixel data buffer
  const textureBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0.0, 0.0,
    width, 0.0,
    0.0, height,
    0.0, height,
    width, 0.0,
    width, height
  ]), gl.STATIC_DRAW);
  
  //specify the location of the pixel position data
  const positionLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  
  //config texture
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, pixels);
  
  //render
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.activeTexture(register);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  
  // cleanup
  gl.deleteBuffer(textureBuffer);
  gl.deleteTexture(texture);
}

export function getPixels(canvas) {
  const gl = canvas.context.gl;
  let pixels = new Uint8Array(4 * canvas.width * canvas.height);
  gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  const last = pixels.length / 4 - 1;
  let rawPixels = [];
  let index = last;
  let offset = 0;
  for (let i = 0; i < pixels.length; i+=4) {
    const pixel = Math.round((pixels[i] + pixels[i+1] + pixels[i+2]) / 3);
    if ((index + 1) % canvas.width === 0) {
      offset = index;
    }
    rawPixels[offset + (offset - index--)] = pixel;
  }
  return rawPixels;
}

export function getPixel(canvas, x, y) {
  const gl = canvas.context.gl;
  let pixel = new Uint8Array(4);
  gl.readPixels(x, canvas.height - y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
  return pixel[0];
}

export function cleanUp(context) {
  if (!context) {
    return;
  }
  const gl = context.gl;
  gl.deleteProgram(context.program);
  gl.deleteShader(context.vertexShader);
  gl.deleteShader(context.fragmentShader);
}

export function runLengthEncode(stream, pixels, width, height, mode) {
    let magicNumber = 'E2';
    let count = 1;
    let prev;
    if (mode === 1) {
      magicNumber = 'E1';
    }
    stream.write(magicNumber + '\n' + width + ' ' + height + '\n255\n');
    pixels.forEach((pixel, index) => {
      if (prev === pixel) {
        count++;
      } else if (prev !== undefined && prev !== pixel) {
        if (mode === 1) { // ASCII
          stream.write(prev + ' ' + count + (index === pixels.length - 1 ? '\n' : ' '));
        } else { // BIN
          const pixelBuffer = new Buffer.allocUnsafe(1);
          const countBuffer = new Buffer(4);
          pixelBuffer.writeUInt8(prev);
          countBuffer.writeUInt32BE(count);
          stream.write(pixelBuffer);
          stream.write(countBuffer);
        }
        count = 1;
      }
      prev = pixel;
    });
}

export function huffmanEncode(stream, pixels, width, height, mode) {
  const histogram = {};
  pixels.forEach((pixel) => {
    if (histogram[pixel]) {
      histogram[pixel]++;
    } else {
      histogram[pixel] = 1;
    }
  });
  const tree = new HuffmanTree(histogram, ',', pixels.length);
  const codeBook = {};
  tree.leaves.forEach((node) => {
    if (node === tree.root) {
      return;
    }
    const token = node.token;
    codeBook[token] = node.bit;
    while (node.parent !== tree.root) {
      node = node.parent;
      codeBook[token] = node.bit + codeBook[token];
    }
  });
  let magicNumber = 'E4';
  if (mode === 1) {
    magicNumber = 'E3';
  }
  stream.write(magicNumber + '\n' + width + ' ' + height + '\n255\n');
  Object.keys(codeBook).forEach((key) => {
      const buffer = new Buffer.allocUnsafe(2);
      buffer.writeUInt8(parseInt(key));
      buffer.writeUInt8(parseInt(codeBook[key], 2), 1);
      stream.write(buffer);
  })
  let encoded = '';
  pixels.forEach((pixel, index) => {
      encoded += codeBook[pixel.toString()];
  });
  stream.write('\n');
  const chunks = encoded.match(/.{1,8}/g);
  chunks.forEach((chunk, index) => {
    let byte = parseInt(chunk, 2); 
    if (mode === 1) { // ASCII
      stream.write(byte + ' ');
    } else { // BIN
      const buffer = new Buffer(1);
      buffer.writeUInt8(byte); 
      stream.write(buffer);
    }
  });
}

export function exportCanvasAsImage(canvas, destination) {
  const stream = fs.createWriteStream(destination);
  const pixels = getPixels(canvas);
  const method = canvas.options.COMPRESSION ? canvas.options.COMPRESSION.method : 0;
  const mode = canvas.options.COMPRESSION ? canvas.options.COMPRESSION.mode : 0;
  if (method === 1) { // Run length encoding
    runLengthEncode(stream, pixels, canvas.width, canvas.height, mode);
  } else if (method === 2) { // huffman
    huffmanEncode(stream, pixels, canvas.width, canvas.height);
  } else if (method === 3) { // differential PCM
    
  } else if (method === 4) { // LZW
    
  } else {
    stream.write('P5\n' + canvas.width + ' ' + canvas.height + '\n255\n');
    pixels.forEach((pixel, index) => {
      const buffer = new Buffer.allocUnsafe(1);
      buffer.writeUInt8(pixel);
      stream.write(buffer);
    });
  }
  stream.end();
}
