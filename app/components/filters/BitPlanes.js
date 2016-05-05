import React, { Component } from 'react';
import {ListItem} from 'material-ui/List';
import Toggle from 'material-ui/toggle';
import SidebarGroup from '../SidebarGroup';
import Filter from './Filter';
import * as Filters from './';

export default class BitPlanes extends Filter {
  
  constructor(props, content) {
    super(props, content);
    let planes = {};
    for (let i = 1; i <= 8; i++) {
      planes[i] = true;
    }
    this.defaultState = {
      type: 'BIT_PLANES',
      disabled: true,
      filter: Filters.bitPlanes,
      planes
    };
    this.state = Object.assign({}, this.defaultState);
    this.onToggleChange = this.onToggleChange.bind(this);
  }
  
  onToggleChange(event) {
    const target = event.target.id.split('_')[1];
    const bit = Object.keys(this.state.planes).find((bit) => bit == target);
    let planes = this.state.planes;
    if (bit) {
      planes = Object.assign({}, this.state.planes, {[bit] : !this.state.planes[bit]});
    }
    const options = {planes};
    this.applyFilter(Object.assign({}, this.state, options));
    this.setState(options);
  }
  
  render() {
    const controls = Object.keys(this.state.planes).map((bit) => (
      <ListItem key={"plane_" + bit} primaryText={"Plane " + bit} rightToggle={
        <Toggle id={"plane_" + bit} toggled={this.state.planes[bit]} onToggle={this.onToggleChange} disabled={this.state.disabled} />
      } />
    ));
    return (<SidebarGroup checkbox={true} checked={!this.state.disabled} onChecked={this.onEnableToggle} controls={controls} title="Bit Plane Slicing" />);
  }
}