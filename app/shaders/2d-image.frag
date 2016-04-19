precision mediump float;

uniform sampler2D texUnit;
varying vec2 texCoord;

void main() {
  gl_FragColor = texture2D(texUnit, texCoord);
}