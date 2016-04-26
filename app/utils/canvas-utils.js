import vertexShader from '../shaders/image-spatial.vert';
import fragmentShader from '../shaders/image-raster.frag';

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
  Object.keys(layer.filters).forEach((type) => {
    const options = layer.filters[type];
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
  let rawPixels = [];
  for (let i = 0; i < pixels.length; i+=4) {
    const pixel = Math.round((pixels[i] + pixels[i+1] + pixels[i+2]) / 3);
    rawPixels.push(pixel);
  }
  return rawPixels;
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