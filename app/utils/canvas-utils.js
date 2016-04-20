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
  
  //create pixel data buffer
  const textureBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0.0, 0.0,
    canvas.width, 0.0,
    0.0, canvas.height,
    0.0, canvas.height,
    canvas.width, 0.0,
    canvas.width, canvas.height
  ]), gl.STATIC_DRAW);
  
  //specify the location of the pixel position data
  const positionLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  
  // bind texture0 as shader texture
  const textureLocation = gl.getUniformLocation(program, "u_image");
  gl.uniform1i(textureLocation, 0);

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

export function renderCanvasData(context, layer) {
  const gl = context.gl;
  const width = isPowerOfTwo(layer.width) ? layer.width : nextHighestPowerOfTwo(layer.width);
  const height = isPowerOfTwo(layer.height) ? layer.height : nextHighestPowerOfTwo(layer.height);
  const texture = gl.createTexture();
  const pixels = new Uint8Array(3 * width * height);
  let index = 0;
  layer.pixels.forEach((pixel) => {
    pixels[index++] = pixel;
    pixels[index++] = pixel;
    pixels[index++] = pixel;
  });
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, pixels);
  gl.activeTexture(gl.TEXTURE0);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
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