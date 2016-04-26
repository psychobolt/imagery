import React, { Component } from 'react';
import {ListItem} from 'material-ui/List';
import Slider from 'material-ui/Slider';
import SidebarGroup from '../SidebarGroup';
import Filter from './Filter';
import * as Filters from './';

const styles = {
  slider : {
    overflow: 'visible',
    marginTop: -20,
    width: 165
  }
}

export default class GrayLevel extends Filter {
  
  constructor(props, content) {
    super(props, content);
    this.defaultState = {
      type: 'GRAY_LEVEL',
      disabled: true,
      level: 8,
      filter: Filters.grayLevel
    };
    this.state = Object.assign({}, this.defaultState);
    this.onLevelChange = this.onLevelChange.bind(this);
  }
  
  onLevelChange(event, level) {
    const options = {level}
    this.applyFilter(Object.assign({}, this.state, options));
    this.setState(options);
  }
  
  render() {
    const controls = [
      <ListItem key="slider" primaryText={this.state.level + '-bit'} disabled={true} style={this.state.disabled ? {color: 'rgba(0, 0, 0, 0.298039)'} : null} secondaryText={
        <div style={styles.slider}>
          <Slider onChange={this.onLevelChange} min={1} step={1} max={8} value={this.state.level} disabled={this.state.disabled} />
        </div>
      } />
    ];
    return (<SidebarGroup checkbox={true} checked={!this.state.disabled} onChecked={this.onEnableToggle} controls={controls} title="Gray Level" />);
  }
}