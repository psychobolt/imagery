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

export default class Sharpen extends MaskFilter {
  
  constructor(props, content) {
    super(props, content);
    this.defaultState = {
      type: 'SHARPEN',
      disabled: true,
      filter: Filters.sharpen,
      method: 1,
      dimension: 3,
      maskFactor: 8
    };
    this.state = Object.assign({}, this.defaultState);
    this.onMethodChange = this.onMethodChange.bind(this);
    this.onMaskFactorChange = this.onMaskFactorChange.bind(this);
  }
  
  onMethodChange(event, index, method) {
    const options = {method};
    this.applyFilter(Object.assign({}, this.state, options));
    this.setState(options);
  }
  
  onMaskFactorChange(event, maskFactor) {
    let options = {maskFactor};
    maskFactor = parseInt(maskFactor);
    if (maskFactor < 1) {
      maskFactor = 1;
      options = {maskFactor};
    }
    if (maskFactor && Number.isInteger(maskFactor)) {
      this.applyFilter(Object.assign({}, this.state, options));
    }
    this.setState(options);
  }
  
  render() {
    const controls = [
      <ListItem key="select" disabled={true} primaryText={
        <SelectField style={styles.select} disabled={this.state.disabled} value={this.state.method} onChange={this.onMethodChange}>
          <MenuItem value={1} primaryText="Laplacian"/>
          <MenuItem value={2} primaryText="Highboost"/>
        </SelectField>
      } />,
      <ListItem key="maskSize" type="number" disabled={true} primaryText={
        <TextField id="constant" style={styles.input} value={this.state.dimension} onChange={this.onDimensionChange} floatingLabelText='Symmetric "N x N"' 
          disabled={this.state.disabled} />
      } />,
      <ListItem key="maskFactor" type="number" style={this.state.method === 1 ? {display: 'none'} : null} disabled={true} primaryText={
        <TextField id="factor" style={styles.input} value={this.state.maskFactor} onChange={this.onMaskFactorChange} floatingLabelText='Mask Factor "A"' 
          disabled={this.state.disabled} />
      } />
    ];
    return (<SidebarGroup checkbox={true} checked={!this.state.disabled} onChecked={this.onEnableToggle} controls={controls} title="Sharpen" />);
  }
}