import React, {Component} from 'react';
import _ from 'lodash';

export default class Option extends Component {
  
  constructor(props, content) {
    super(props, content);
    this.onEnableToggle = this.onEnableToggle.bind(this);
    this.applyOption = _.debounce(this.applyOption, 500);
  }
  
  componentWillReceiveProps(nextProps) {
    this.setState(Object.assign({}, this.defaultState, nextProps.canvas.options[this.defaultState.type]));
  }
  
  onEnableToggle(event, enabled) {
    const {canvas, applyOption} = this.props;
    applyOption(canvas, Object.assign({}, this.state, {
      disabled: !enabled
    }));
  }
  
  applyOption(option) {
    const {canvas, applyOption, index} = this.props;
    option = Object.assign({}, option, {index});
    applyOption(canvas, option);
  }
}