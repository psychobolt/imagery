export function runLengthDecode(data) {
  let pixels = [];
  let prev;
  data.forEach((value, index) => {
    value = Number.isInteger(value) ? value : parseInt(value)
    if (index % 2 === 1) {
      let count = value;
      for(let i = 0; i < count; i++) {
        pixels.push(prev);
      }
    }
    prev = value;
  });
  return pixels;
}