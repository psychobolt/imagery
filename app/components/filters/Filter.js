import React, {Component} from 'react';
import _ from 'lodash';

export default class Filter extends Component {
  
  constructor(props, content) {
    super(props, content);
    this.onEnableToggle = this.onEnableToggle.bind(this);
    this.applyFilter = _.debounce(this.applyFilter, 500);
  }
  
  componentWillReceiveProps (nextProps) {
    this.setState(Object.assign({}, this.defaultState, nextProps.layer.filters[this.defaultState.type]));
  }
  
  onEnableToggle(event, enabled) {
    const { canvas, layer, applyFilter } = this.props;
    applyFilter(canvas, layer, Object.assign({}, this.state, {
        disabled: !enabled
    }));
  }
  
  applyFilter(options) {
    const { canvas, layer, applyFilter } = this.props;
    applyFilter(canvas, layer, options);
  }
  
}