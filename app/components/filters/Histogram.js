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
}

export default class Histogram extends Filter {
  
  constructor(props, content) {
    super(props, content);
    this.defaultState = {
      type: 'HISTOGRAM',
      disabled: true,
      filter: Filters.histogram,
      global: true,
      dimension: 5,
      canvasId: null
    };
    this.state = Object.assign({}, this.defaultState);
    this.onLocalityChange = this.onLocalityChange.bind(this);
    this.onDimensionChange = this.onDimensionChange.bind(this);
    this.onMatchingChange = this.onMatchingChange.bind(this);
  }
  
  onLocalityChange(event, index, global) {
    const options = {global};
    this.applyFilter(Object.assign({}, this.state, options));
    this.setState(options);
  }
  
  onDimensionChange(event, dimension) {
    const { layer } = this.props;
    let global = false;
    if (dimension >= layer.colorBits) {
      global = true;
      dimension = this.state.dimension;
    }
    let options = {dimension, global};
    dimension = parseInt(dimension);
    if (dimension && Number.isInteger(dimension)) {
      if (dimension % 2 === 0) {
        options = Object.assign({}, options, {dimension: dimension + 1});
      }
      this.applyFilter(Object.assign({}, this.state, options));
    }
    this.setState(options);
  }
  
  onMatchingChange(event, index, canvasId) {
    const { canvases } = this.props;
    const options = {canvasId};
    this.applyFilter(Object.assign({}, this.state, Object.assign({}, options, {
      match: canvases.find((canvas) => canvas.id === canvasId)
    })));
    this.setState(options);
  }
  
  render() {
    const { canvases, canvas } = this.props;
    let canvasMenuItems = []; 
    canvases.forEach((_canvas) => {
      if (canvas.id !== _canvas.id) {
        canvasMenuItems = [...canvasMenuItems, <MenuItem key={_canvas.id} value={_canvas.id} primaryText={_canvas.title} />];
      }
    });
    const controls = [
      <ListItem key="equalization" disabled={true} secondaryText="Equalization" primaryText={
        <SelectField style={styles.select} disabled={this.state.disabled} value={this.state.global} onChange={this.onLocalityChange}>
          <MenuItem value={true} primaryText="Global"/>
          <MenuItem value={false} primaryText="Local"/>
        </SelectField>
      } />,
      <ListItem key="maskSize" type="number" style={this.state.global ? {display: 'none'} : null} disabled={true} primaryText={
        <TextField id="constant" style={styles.input} value={this.state.dimension} onChange={this.onDimensionChange} floatingLabelText='Symmetric "N x N"' 
          disabled={this.state.disabled} />
      } />,
      <ListItem key="matching" disabled={true} style={this.state.global ? null : {display: 'none'}} secondaryText="Matching" primaryText={
        <SelectField style={styles.select} disabled={this.state.disabled} value={this.state.canvasId} onChange={this.onMatchingChange}>
          <MenuItem value={null} primaryText="None"/>
          {canvasMenuItems}
        </SelectField>
      } />
    ];
    return (<SidebarGroup checkbox={true} checked={!this.state.disabled} onChecked={this.onEnableToggle} controls={controls} title="Histogram" />);
  }
}