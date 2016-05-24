import React from 'react';
import PubSub from 'pubsub-js';
import Filter from './Filter';

export default class ColorFill extends Filter {
  
  constructor(props, content) {
    super(props, content);
    this.onXpositionChange = this.onXpositionChange.bind(this);
    this.onYpositionChange = this.onYpositionChange.bind(this);
    this.onTargetColorChange = this.onTargetColorChange.bind(this);
    this.onColorSelect = this.onColorSelect.bind(this);
    this.onColorRecieve = this.onColorRecieve.bind(this);
    this.onPixelSelect = this.onPixelSelect.bind(this);
    this.onPixelRecieve = this.onPixelRecieve.bind(this);
  }
  
  componentWillReceiveProps(nextProps) {
    super.componentWillReceiveProps(nextProps);
    this.removeListeners(nextProps.layer.filters[this.defaultState.type]);
  }
  
  componentDidUpdate(prevProps, prevState) {
    if (!prevState.disabled && this.state.disabled) {
      this.removeListeners();
    }
  }
  
  componentWillUnmount() {
    this.removeListeners();
  }
  
  onXpositionChange(event, xPosition) {
    const { layer } = this.props; 
    let options = {xPosition};
    xPosition = parseInt(xPosition);
    if (xPosition < 0) {
      xPosition = 0;
    } else if (xPosition >= layer.width) {
      xPosition = layer.width - 1;
    }
    if (Number.isInteger(xPosition)) {
      options = Object.assign({}, this.state, {xPosition});
      this.applyFilter(options);
    }
    this.setState(options);
  }
  
  onYpositionChange(event, yPosition) {
    const { layer } = this.props; 
    let options = {yPosition};
    yPosition = parseInt(yPosition);
    if (yPosition < 0) {
      yPosition = 0;
    } else if (yPosition >= layer.height) {
      yPosition = layer.height - 1;
    }
    if (Number.isInteger(yPosition)) {
      options = Object.assign({}, this.state, {yPosition});
      this.applyFilter(options);
    }
    this.setState(options);
  }
  
  onTargetColorChange(event, targetColor) {
    const { layer } = this.props;
    targetColor = parseInt(targetColor);
    if (targetColor < 0) {
      targetColor = 0;
    } else if (targetColor >= layer.colorBits) {
      targetColor = layer.colorBits;
    }
    let options = {targetColor};
    if (Number.isInteger(targetColor)) {
      options = Object.assign({}, this.state, {targetColor});
      this.applyFilter(options);
    }
    this.setState(options);
  }
  
  onColorSelect() {
    const {canvas} = this.props;
    if (this.state.listeners.colorPick) {
      this.removeListener('colorPick');
    } else {
      this.addListener('CANVAS_' + canvas.id + '_EVENT.SELECT_COLOR', 'colorPick', this.onColorRecieve);
    }
  }
  
  onColorRecieve(topic, options) {
    const {canvas, layer} = this.props;
    const targetColor = {targetColor: options.targetColor};
    options = Object.assign({}, this.state, targetColor);
    this.setState(targetColor);
    this.applyFilter(options);
  }
  
  onPixelSelect() {
    const {canvas} = this.props;
    if (this.state.listeners.pixelPos) {
      this.removeListener('pixelPos');
    } else {
      this.addListener('CANVAS_' + canvas.id + '_EVENT.SELECT_POS', 'pixelPos', this.onPixelRecieve);
    }
  }
  
  onPixelRecieve(topic, position) {
    this.applyFilter(Object.assign({}, this.state, position));
  }
  
  addListener(topic, listener, callback) {
    callback = callback || function () {};
    const token = PubSub.subscribe(topic, (topic, content) => {
      this.removeListener(listener);
      callback(topic, content);
    });
    const options = {listeners : Object.assign({}, this.state.listeners, {
      [listener]: token
    })};
    this.setState(options);
  }
  
  removeListener(listener) {
    if (!this.state.listeners[listener]) {
      return;
    }
    PubSub.unsubscribe(this.state.listeners[listener]);
    const options = {listeners : Object.assign({}, this.state.listeners, {
      [listener]: null
    })};
    this.setState(options);
  }
  
  removeListeners(listeners) {
    const options = {listeners : Object.assign({}, this.state.listeners)};
    let change = false;
    Object.keys(this.state.listeners).forEach((listener) => { 
      if (!listeners || !listeners[listener]) {
        PubSub.unsubscribe(this.state.listeners[listener]);
        options.listeners[listener] = null;
        change = true;
      }
    });
    if (change) {
      this.setState(options);
    }
  }
}