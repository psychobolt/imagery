import vertexShader from '../shaders/2d-texture.vert';
import fragmentShader from '../shaders/2d-image.frag';

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

export function initContext(gl) {
  let context = {gl};
  
  //create vertex buffer
  const vertexBuffer = gl.createBuffer();
  const vertices = new Float32Array([
      //Position    //TexCoord
		-1.0, 1.0, 0.0, 0.0, // Top-left
		1.0, 1.0, 1.0, 0.0,  // Top-right
		1.0, -1.0, 1.0, 1.0, // Bottom-right
		-1.0, -1.0, 0.0, 1.0  // Bottom-left
  ]);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  
  //create element array
  const elementBuffer = gl.createBuffer();
  const elements = new Uint8Array([
    0, 1, 2,
    2, 3, 0
  ]);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, elements, gl.STATIC_DRAW);
  
  const program = gl.createProgram();
  //create shaders
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
  
  const texUnitLocation = gl.getUniformLocation(program, "texUnit");
  gl.uniform1i(texUnitLocation, 0);
  
  //specify the layout of the vertex data
  const positionLocation = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, gl.FALSE, 4 * 4, 0);
  
  const texCoordInLocation = gl.getAttribLocation(program, "texCoordIn");
  gl.enableVertexAttribArray(texCoordInLocation);
  gl.vertexAttribPointer(texCoordInLocation, 2, gl.FLOAT, gl.FALSE, 4 * 4, 2 * 4);

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
  layer.pixels.forEach((pixel, index) => {
    pixels[index] = pixel;
    pixels[++index] = pixel;
    pixels[++index] = pixel;
  });
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, width, height, 0, gl.RGB, gl.UNSIGNED_BYTE, pixels);
  gl.clearColor (0.3, 0.3, 0.3, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.activeTexture(gl.TEXTURE0);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
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