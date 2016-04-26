import * as canvasUtils from '../../utils/canvas-utils';
import _ from 'lodash';

function subsample(layer, ratio) {
  const width = Math.floor(layer.width * ratio);
  const height = Math.floor(layer.height * ratio);
  const averagePixelCountW =  Math.floor(layer.width / width);
  const averagePixelCountH =  Math.floor(layer.height / height);
  const totalAveragePixels = averagePixelCountW * averagePixelCountH;
  const pixels = [];
  let colOffset = 0;
  for (let nextRow = 0; nextRow < layer.width; nextRow += averagePixelCountW) {
    colOffset = nextRow * layer.width;
    for (let nextCol = colOffset; nextCol < colOffset + layer.width; nextCol+= averagePixelCountW) {
      let sum = 0;
      let subIndex = 0;
      for (let nextSubCol = nextCol; nextSubCol < nextCol + averagePixelCountH; nextSubCol++) {
        for (let i = nextSubCol; i < nextSubCol + averagePixelCountW; i++) {
          sum += layer.pixels[i];
          if (subIndex + 1 === totalAveragePixels) {
            pixels.push(Math.round(sum / totalAveragePixels));
          }
          subIndex++;
        }
      }
    }
  }
  return Object.assign({}, layer, {
    width,
    height,
    pixels
  });
}

export function getNeighborPixels(layer, index, total, dimension) {
  const half = (dimension - 1) / 2;
  let pixels = [];
  let rowIndex = Math.floor(index / layer.width); 
  for (let y = -half; y <= half; y++) {
    const rowOffset = y * layer.width;
    const leftOffset = rowOffset + index - half;
    for (let x = leftOffset; x < leftOffset + dimension; x++) {
      let row = x / layer.width;
      row = x < 0 ? Math.ceil(row) : Math.floor(row);
      if (row == (y + rowIndex) && 0 <= x && x < total && x != index) {
        pixels.push(layer.pixels[x]);
      }
    }
  }
  return pixels;
}

function getHistogram(pixels, colorBits, total, target) {
  let frequency = {};
  pixels.forEach((pixel) => {
    frequency[pixel] = (frequency[pixel] || 0) + 1;
  });
  let prev = 0;
  let histogram = {};
  for (let pixel in frequency) {
    prev += frequency[pixel] / total * colorBits;
    histogram[pixel] = Math.round(prev);
    if (pixel == target) return histogram;
  }
  return histogram;
}

function getHistogramValue(layer, index, total, subtotal, dimension) {
  const target = layer.pixels[index];
  let pixels = getNeighborPixels(layer, index, total, dimension);
  pixels.push(layer.pixels[index]);
  const histogram = getHistogram(pixels, layer.colorBits, subtotal, target);
  return histogram[target];
}

function replication(layer, options) {
  const width = layer.width / options.ratio;
  const height = layer.height / options.ratio;
  const scaleFactor = Math.floor(1 / options.ratio);
  let pixels = [];
  let step = 0;
  for (let y = 0; y < height; y++) {
    const xOffset = y * width;
    const rowIndex = Math.floor(step);
    const pixelOffset = rowIndex * layer.width
    let colIndex = 0;
    for (let x = xOffset; x < xOffset + width; x++) {
      pixels[x] = layer.pixels[pixelOffset + Math.floor(colIndex++ * options.ratio)];
    }
    step += options.ratio;
  }
  return Object.assign({}, layer, {pixels, width, height});
}

function bilinear(layer, options) {
  const width = layer.width / options.ratio;
  const height = layer.height / options.ratio;
  const scaleFactor = Math.floor(1 / options.ratio);
  let pixels = [];
  let step = 0;
  for (let y = 0; y < height; y++) {
    const xOffset = y * width;
    const rowIndex = Math.floor(step);
    const pixelOffset = rowIndex * layer.width
    let colIndex = 0;
    for (let x = xOffset; x < xOffset + width; x++) {
      if (colIndex % scaleFactor === 0) {
        pixels[x] = layer.pixels[pixelOffset + Math.floor(colIndex * options.ratio)];
      } else {
        pixels[x] = null;
      }
      colIndex++;
    }
    step += options.ratio;
  }
  layer = Object.assign({}, layer, {pixels, width, height});
  for (let i = 0; i < pixels.length; i++) {
    if (pixels[i] == null) {
      const neighbors = getNeighborPixels(layer, i, pixels.length, 3);
      let sum = 0;
      let count = 0;
      neighbors.forEach((pixel) => {
        if (pixel != null) {
          count++;
          sum += pixel;
        }
      });
      pixels[i] = sum / count;
    }
  }
  return layer;
}

export function spatialResolution(layer, context, options) {
  layer = subsample(layer, options.ratio);
  if (options.zoomMethod === 1) {
    layer = replication(layer, options);
  } else if (options.zoomMethod === 2) {
    layer = bilinear(layer, options);
  }
  return layer;
}

export function grayLevel(layer, context, options) {
  const colors = Math.pow(2, options.level);
  const colorsBits = colors - 1;
  let pixels = layer.pixels.map((pixel) => {
    return Math.round(pixel / layer.colorBits * colorsBits) * 255;
  });
  return Object.assign({}, layer, {pixels});
}

export function grayScale(layer, context, options) {
  let pixels = layer.pixels;
  let c = options.constant;
  let gamma = options.gamma; 
  if (options.transformMethod === 1) {
    pixels = pixels.map((pixel) => {
      let r = pixel / layer.colorBits;
      let s = c * Math.log(1 + r);
      return Math.min(layer.colorBits, Math.round(layer.colorBits * s));
    });
  } else if (options.transformMethod === 2) {
    pixels = pixels.map((pixel) => {
      let r = pixel / layer.colorBits;
      let s = c * Math.pow(r, gamma);
      return Math.min(layer.colorBits, Math.round(layer.colorBits * s));
    });
  }
  return Object.assign({}, layer, {pixels});
}

export function histogram(layer, context, options) {
  let MN = layer.width * layer.height;
  let pixels;
  if (!options.global) {
      const mn = options.dimension * options.dimension;
      pixels = layer.pixels.map((pixel, index) => {
        return getHistogramValue(layer, index, MN, mn, options.dimension); 
      });
  } else {
    let map = getHistogram(layer.pixels, layer.colorBits, MN);
    if (options.match) {
      const canvas = options.match;
      MN = canvas.width * canvas.height;
      const targetPixels = canvasUtils.getPixels(canvas);
      const targetMap = getHistogram(targetPixels, 256, MN);
      const targetValues = _.values(targetMap);
      let matchingMap = {};
      for (var pixel in map) {
        const value = map[pixel];
        let beforePixel, afterPixel, targetPixel;
        for (targetPixel in targetMap) {
          let targetValue = targetMap[targetPixel];
          if (targetValue < value) {
            beforePixel = targetPixel;
          }
          if (targetValue == value) {
            break;
          }
          if (targetValue > value) {
            targetPixel = null;
            break;
          }
        }
        if (!targetPixel) {
          if (!afterPixel || value - targetMap[beforePixel] < targetMap[afterPixel] - value) {
            targetPixel = beforePixel;
          } else {
            targetPixel = afterPixel;
          }
        }
        matchingMap[pixel] = targetPixel;
      }
      map = matchingMap;
    }
    pixels = layer.pixels.map((pixel) => {
      return map[pixel];
    });
  }
  return Object.assign({}, layer, {pixels});
}