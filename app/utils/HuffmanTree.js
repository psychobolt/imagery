export default class HuffmanTree {
  
  constructor(histogram, seperator, total) {
    seperator = seperator || '';
    const nodes = Object.keys(histogram).map((key) => {
      return {
        token: key.toString(),
        probability: histogram[key] / total,
        parent: null
      };
    });
    nodes.sort((current, next) => current.probability - next.probability);
    this.leaves = [...nodes];
    while (nodes.length) {
      const current = nodes.shift();
      const next = nodes.shift();
      if (next) {
        const parent = {
          token: current.token + seperator + next.token,
          probability: current.probability + next.probability,
          left: current,
          right: next
        };
        current.parent = parent;
        current.bit = '0';
        next.parent = parent;
        next.bit = '1';
        nodes.push(parent);
        if (parent.probability < nodes[nodes.length - 1].probability) {
          nodes.sort((current, next) => current.probability - next.probability);
        }
      } else {
        this.root = current;
      }
    }
  }
}