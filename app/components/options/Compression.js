import React from 'react';
import SidebarGroup from '../SidebarGroup';
import Option from './Option';

export default class Compression extends Option {
  
  constructor(props, content) {
    super(props, content);
    this.defaultState = {
      type: 'COMPRESSION',
      disabled: true
    };
    this.state = Object.assign({}, this.defaultState);
  }
  
  render() {
    const controls = [
      
    ];
    return (<SidebarGroup checkbox={true} checked={!this.state.disabled} onChecked={this.onEnableToggle} controls={controls} title="Compression" />);
  }
}