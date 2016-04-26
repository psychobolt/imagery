import React, { Component } from 'react';
import {ListItem} from 'material-ui/List';
import SidebarGroup from '../SidebarGroup';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import Filter from './Filter';
import * as Filters from './';

const styles = {
  select : {
    marginTop: -20,
    marginLeft: 2,
    width: 170,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  },
  
  input : {
    marginTop: -20,
    width: 170
  }
};

export default class GrayScale extends Filter {
  
  constructor(props, content) {
    super(props, content);
    this.defaultState = {
      type: 'GRAY_SCALE',
      disabled: true,
      filter: Filters.grayScale,
      transformMethod: 1,
      constant: 1.5,
      gamma: 1
    };
    this.state = Object.assign({}, this.defaultState);
    this.onTransformMethodChange = this.onTransformMethodChange.bind(this);
    this.onConstantChange = this.onConstantChange.bind(this);
    this.onGammaChange = this.onGammaChange.bind(this);
  }
  
  onTransformMethodChange(event, index, value) {
    const options = {transformMethod: value};
    this.applyFilter(Object.assign({}, this.state, options));
    this.setState(options);
  }
  
  onConstantChange(event, value) {
    const options = {constant: value};
    this.applyFilter(Object.assign({}, this.state, options));
    this.setState(options);
  }
  
  onGammaChange(event, value) {
    const options = {gamma: value};
    this.applyFilter(Object.assign({}, this.state, options));
    this.setState(options);
  }
  
  render() {
    const controls = [
      <ListItem key="select" disabled={true} primaryText={
        <SelectField style={styles.select} disabled={this.state.disabled} value={this.state.transformMethod} onChange={this.onTransformMethodChange}>
          <MenuItem value={1} primaryText="Log"/>
          <MenuItem value={2} primaryText="Power"/>
        </SelectField>
      } />,
      <ListItem key="constantField" disabled={true} primaryText={
        <TextField id="constant" style={styles.input} value={this.state.constant} onChange={this.onConstantChange} floatingLabelText='Constant "c"' 
          disabled={this.state.disabled} />
      } />,
      <ListItem key="gammaField" style={this.state.transformMethod !== 2 ? {display: 'none'} : null} disabled={true} primaryText={
        <TextField id="constant" style={styles.input} value={this.state.gamma} onChange={this.onGammaChange} floatingLabelText='Gamma "γ"' 
          disabled={this.state.disabled} />
      } />
    ];
    return (<SidebarGroup checkbox={true} checked={!this.state.disabled} onChecked={this.onEnableToggle} controls={controls} title="Gray Scale" />);
  }
}