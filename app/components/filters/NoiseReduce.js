import React from 'react';
import {ListItem} from 'material-ui/List';
import SidebarGroup from '../SidebarGroup';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import MaskFilter from './MaskFilter';
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

export default class NoiseReduce extends MaskFilter {
  
  constructor(props, content) {
    super(props, content);
    this.defaultState = {
      type: 'NOISE_REDUCE',
      disabled: true,
      filter: Filters.noiseReduce,
      method: 1,
      dimension: 3,
      order: 1,
      constantD: 1
    };
    this.state = Object.assign({}, this.defaultState);
    this.onDimensionChange = this.onDimensionChange.bind(this);
    this.onMethodChange = this.onMethodChange.bind(this);
    this.onOrderChange = this.onOrderChange.bind(this);
    this.onConstantDChange = this.onConstantDChange.bind(this);
  }
  
  onDimensionChange(event, dimension) {
    if (dimension && dimension > -1) {
      const constantD = this.clampConstantD(this.state.constantD, dimension);
      this.applyConstantDChange(constantD, this.state);
    }
    super.onDimensionChange(event, dimension);
  }
  
  onMethodChange(event, index, method) {
    const options = {method};
    this.applyFilter(Object.assign({}, this.state, options));
    this.setState(options);
  }
  
  onOrderChange(event, order) {
    let options = {order};
    order = parseFloat(order);
    if (order && !Number.isNaN(order)) {
      this.applyFilter(Object.assign({}, this.state, {order}));
    }
    this.setState(options);
  }
  
  onConstantDChange(event, constantD) {
    let options = {constantD};
    this.applyConstantDChange(constantD, options);
    this.setState(options);
  }
  
  applyConstantDChange(constantD, options) {
    constantD = parseInt(constantD);
    constantD = this.clampConstantD(constantD, this.state.dimension);
    if (order && Number.isInteger(constantD)) {
      options = {constantD};
      this.applyFilter(Object.assign({}, this.state, options));
      this.setState(options);
    }
  }
  
  clampConstantD(constantD, dimension) {
    if (constantD < 0) {
      constantD = 0;
    } else if (constantD > dimension * dimension - 1) {
      constantD = dimension * dimension - 1;
    }
    return constantD;
  }
  
  render() {
    const controls = [
      <ListItem key="select" disabled={true} primaryText={
        <SelectField style={styles.select} disabled={this.state.disabled} value={this.state.method} onChange={this.onMethodChange}>
          <MenuItem value={1} primaryText="Blur"/>
          <MenuItem value={2} primaryText="Min" />
          <MenuItem value={3} primaryText="Median"/>
          <MenuItem value={4} primaryText="Max" />
          <MenuItem value={5} primaryText="Midpoint" />
          <MenuItem value={6} primaryText="Arithmetic Mean" />
          <MenuItem value={7} primaryText="Geometric Mean" />
          <MenuItem value={8} primaryText="Harmonic Mean" />
          <MenuItem value={9} primaryText="Contraharmonic Mean" />
          <MenuItem value={10} primaryText="Alpha-trimmed Mean" />
        </SelectField>
      } />,
      <ListItem key="maskSize" type="number" disabled={true} primaryText={
        <TextField id="mask_size" style={styles.input} value={this.state.dimension} onChange={this.onDimensionChange} floatingLabelText='Symmetric "N x N"' 
          disabled={this.state.disabled} />
      } />,
      <ListItem key="order" type="number" disabled={true} style={this.state.method === 9 ? null : {display: 'none'}} primaryText={
        <TextField id="order" style={styles.input} value={this.state.order} onChange={this.onOrderChange} floatingLabelText='Order "Q"' 
          disabled={this.state.disabled} />
      } />,
      <ListItem key="constantD" type="number" disabled={true} style={this.state.method === 10 ? null : {display: 'none'}} primaryText={
        <TextField id="constant_d" style={styles.input} value={this.state.constantD} onChange={this.onConstantDChange} floatingLabelText='Alpha "a"' 
          disabled={this.state.disabled} />
      } />
    ];
    return (<SidebarGroup checkbox={true} checked={!this.state.disabled} onChecked={this.onEnableToggle} controls={controls} title="Noise Reduce" />);
  }
}