import * as canvasUtils from '../../utils/canvas-utils';
import _ from 'lodash';

function subsample(layer, ratio) {
  const width = layer.width * ratio >> 0;
  const height = layer.height * ratio >> 0;
  const averagePixelCountW = layer.width / width >> 0;
  const averagePixelCountH = layer.height / height >> 0;
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

function getNeighborPixels(layer, index, total, dimension) {
  const half = (dimension - 1) / 2;
  let pixels = [];
  let rowIndex = index / layer.width >> 0; 
  for (let y = -half; y <= half; y++) {
    const rowOffset = y * layer.width;
    const leftOffset = rowOffset + index - half;
    const rowTarget = y + rowIndex;
    for (let x = leftOffset; x < leftOffset + dimension; x++) {
      let row = x / layer.width >> 0;
      if (row === rowTarget && 0 <= x && x < total && x != index) {
        pixels.push(layer.pixels[x]);
      }
    }
  }
  return pixels;
}

function padRows(pixels, rows, cols) {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        pixels.push(0);
      }
    }
}

function padData(layer, maskDimension) {
  if (maskDimension < 3) {
    return layer.pixels;
  }
  let pixels = [];
  const paddedRows = (maskDimension - 1) / 2;
  const paddedCols = (maskDimension - 1) / 2;
  const width = layer.width + maskDimension - 1;
  const height = layer.height + maskDimension - 1;
  pixels = [];
  padRows(pixels, paddedRows, width);
  for (let y = 0; y < layer.height; y++) {
    padRows(pixels, 1, paddedCols);
    const colOffset = y * layer.width;
    for (let x = colOffset; x < colOffset + layer.width; x++) {
      pixels.push(layer.pixels[x]);
    }
    padRows(pixels, 1, paddedCols);
  }
  padRows(pixels, paddedRows, width);
  return Object.assign({}, layer, {pixels, width, height});
}

function blur(pixel, neighbors, maskDimension) {
  const weight = 1 / (maskDimension * maskDimension);
  return neighbors.reduce((prev, value) => prev + weight * value, weight * pixel) >> 0;
}

function min(pixel, neighbors, maskDimension) {
  const sorted = [pixel, ...neighbors].sort();
  return sorted[0];
}

function median(pixel, neighbors, maskDimension) {
  const sorted = [pixel, ...neighbors].sort();
  return sorted[(sorted.length - 1) / 2];
}

function max(pixel, neighbors, maskDimension) {
  const sorted = [pixel, ...neighbors].sort();
  return sorted[sorted.length - 1];
}

function midpoint(pixel, neighbors, maskDimension) {
  const sorted = [pixel, ...neighbors].sort();
  const midpoint = (sorted[0] + sorted[sorted.length - 1]) / 2;
  return midpoint >> 0;
}

function arithmeticMean(pixel, neighbors, maskDimension) {
  const total = neighbors.reduce((prev, value) => prev + value, pixel);
  return total / (neighbors.length + 1) >> 0;
}

function geometricMean(pixel, neighbors, maskDimension) {
  const product = neighbors.reduce((prev, value) => prev * value, pixel);
  return Math.pow(product, 1 / (maskDimension * maskDimension)) >> 0;
}

function harmonicMean(pixel, neighbors, maskDimension) {
  const mean = (maskDimension * maskDimension) / neighbors.reduce((prev, value) => prev + 1 / value, 1 / pixel);
  return mean >> 0;
}

function contraharmonicMean(pixel, neighbors, maskDimension, order) {
  const orderOffset = order + 1;
  const numerator = neighbors.reduce((prev, value) => 
    prev + Math.pow(value, orderOffset), Math.pow(pixel, orderOffset));
  const denominator =  neighbors.reduce((prev, value) => 
    prev + Math.pow(value, order), Math.pow(pixel, order));
  const mean = numerator / denominator;
  return mean >> 0;
}

function alphaTrimmedMean(pixel, neighbors, maskDimension, constantD) {
  const sorted = [pixel, ...neighbors].sort();
  const A = Math.floor(constantD / 2);
  const total = sorted.slice(A, sorted.length - A).reduce((prev, value) => prev + value);
  return (total / (maskDimension * maskDimension - (2 * A)))  >> 0;
}

function laplace(pixel, neighbors, maskDimension) {
  let midBit = maskDimension * maskDimension - 1;
  let filtered = neighbors.reduce((prev, value) => prev - value, midBit * pixel);
  filtered = pixel + filtered - Math.min(0, filtered);
  filtered = 255 * filtered / Math.max(255, filtered);
  return filtered >> 0;
}

function highboost(pixel, neighbors, maskDimension, maskFactor) {
  const mask = Math.max(0, pixel - blur(pixel, neighbors, maskDimension));
  return Math.min(pixel + maskFactor * mask, 255);
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
  const scaleFactor = 1 / options.ratio >> 0;
  let pixels = [];
  let step = 0;
  for (let y = 0; y < height; y++) {
    const xOffset = y * width;
    const rowIndex = step >> 0;
    const pixelOffset = rowIndex * layer.width
    let colIndex = 0;
    for (let x = xOffset; x < xOffset + width; x++) {
      pixels[x] = layer.pixels[pixelOffset + ((colIndex++ * options.ratio) >> 0)];
    }
    step += options.ratio;
  }
  return Object.assign({}, layer, {pixels, width, height});
}

function bilinear(layer, options) {
  const width = layer.width / options.ratio;
  const height = layer.height / options.ratio;
  const scaleFactor = 1 / options.ratio >> 0;
  let pixels = [];
  let step = 0;
  for (let y = 0; y < height; y++) {
    const xOffset = y * width;
    const rowIndex = step >> 0;
    const pixelOffset = rowIndex * layer.width
    let colIndex = 0;
    for (let x = xOffset; x < xOffset + width; x++) {
      if (colIndex % scaleFactor === 0) {
        pixels[x] = layer.pixels[pixelOffset + ((colIndex * options.ratio) >> 0)];
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

export function noiseReduce(layer, context, options) {
  const width = layer.width;
  const height = layer.height;
  let pixels = [];
  const offset = (options.dimension - 1) / 2;
  layer = padData(layer, options.dimension);
  for (let y = offset; y < offset + height; y++) {
    const colOffset = offset + y * layer.width;
    for (let x = colOffset; x < colOffset + width; x++) {
      let pixel;
      const neighbors = getNeighborPixels(layer, x, layer.pixels.length, options.dimension);
      if (options.method == 1) {
        pixel = blur(layer.pixels[x], neighbors, options.dimension);
      } else if (options.method == 2) {
        pixel = min(layer.pixels[x], neighbors, options.dimension);
      } else if (options.method == 3) {
        pixel = median(layer.pixels[x], neighbors, options.dimension);
      } else if (options.method == 4) {
        pixel = max(layer.pixels[x], neighbors, options.dimension);
      } else if (options.method == 5) {
        pixel = midpoint(layer.pixels[x], neighbors, options.dimension);
      } else if (options.method == 6) {
        pixel = arithmeticMean(layer.pixels[x], neighbors, options.dimension);
      } else if (options.method == 7) {
        pixel = geometricMean(layer.pixels[x], neighbors, options.dimension);
      } else if (options.method == 8) {
        pixel = harmonicMean(layer.pixels[x], neighbors, options.dimension);
      } else if (options.method == 9) {
        pixel = contraharmonicMean(layer.pixels[x], neighbors, options.dimension, options.order);
      } else if (options.method = 10) {
        pixel = alphaTrimmedMean(layer.pixels[x], neighbors, options.dimension, options.constantD);
      } else {
        pixel = layer.pixels[index];
      }
      pixels.push(pixel);
    }
  }
  return Object.assign({}, layer, {pixels, width, height});
}

export function sharpen(layer, context, options) {
  const width = layer.width;
  const height = layer.height;
  let pixels = [];
  const offset = (options.dimension - 1) / 2;
  layer = padData(layer, options.dimension);
  for (let y = offset; y < offset + height; y++) {
    const colOffset = offset + y * layer.width;
    for (let x = colOffset; x < colOffset + width; x++) {
      let pixel;
      const neighbors = getNeighborPixels(layer, x, layer.pixels.length, options.dimension);
      if (options.method == 1) {
        pixel = laplace(layer.pixels[x], neighbors, options.dimension);
      } else if (options.method == 2) {
        pixel = highboost(layer.pixels[x], neighbors, options.dimension, options.maskFactor);
      } else {
        pixel = layer.pixels[index];
      }
      pixels.push(pixel);
    }
  }
  return Object.assign({}, layer, {pixels, width, height});
}

export function bitPlanes(layer, context, options) {
  const disabledBits = Object.keys(options.planes).filter((bit) => !options.planes[bit]);
  const binaryReducer = disabledBits.map((bit) => { 
    return {
      value: bit,
      binary : (Math.pow(2, bit - 1) >>> 0).toString(2)
    };
  });
  const pixels = layer.pixels.map((pixel) => {
    const binary = (pixel >>> 0).toString(2);
    const result = binaryReducer.reduce((prev, bit) => { 
      return prev - (prev.toString().charAt(8 - bit.value) == 1 ? bit.binary : '0');
    }, binary);
    return parseInt(result, 2);
  });
  return Object.assign({}, layer, {pixels});
}