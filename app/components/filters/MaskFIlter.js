import Filter from './Filter';
import _ from 'lodash';
  
export default class MaskFilter extends Filter {
  
  constructor(props, contents) {
    super(props, contents);
    this.onDimensionChange = this.onDimensionChange.bind(this);
    this.applyDimensionChange = _.debounce(this.applyDimensionChange, 500);
  }
  
  onDimensionChange(event, options) {
    let dimension = typeof options === 'object' ? options.dimension : options;
    options = Object.assign({}, options, {dimension});
    this.applyDimensionChange(dimension, options);
    this.setState(options);
  }
  
  applyDimensionChange(dimension, options) {
    dimension = parseInt(dimension);
    if (dimension < 3) {
      dimension = 3;
    } else if (dimension % 2 === 0) {
      dimension = dimension + 1;
    }
    if (dimension && Number.isInteger(dimension)) {
      options = Object.assign({}, options, {dimension});
      this.applyFilter(Object.assign({}, this.state, options));
      this.setState(options);
    }
  }
  
};