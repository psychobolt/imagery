import React from 'react';
import {ListItem} from 'material-ui/List';
import MenuItem from 'material-ui/MenuItem';
import SelectField from 'material-ui/SelectField';
import SidebarGroup from '../SidebarGroup';
import Option from './Option';

const styles = {
  select : {
    marginTop: -20,
    marginLeft: 2,
    width: 170,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  }
};

export default class Compression extends Option {
  
  constructor(props, content) {
    super(props, content);
    this.defaultState = {
      type: 'COMPRESSION',
      disabled: true,
      method: 1,
      mode: 2
    };
    this.state = Object.assign({}, this.defaultState);
    this.onMethodChange = this.onMethodChange.bind(this);
    this.onModeChange = this.onModeChange.bind(this);
  }
  
  onMethodChange(event, index, method) {
    const options = {method};
    this.applyOption(Object.assign({}, this.state, options));
    this.setState(options);
  }

  onModeChange(event, index, mode) {
    const options = {mode};
    this.applyOption(Object.assign({}, this.state, options));
    this.setState(options);
  }
  
  render() {
    const controls = [
      <ListItem key="method" disabled={true} primaryText={
        <SelectField style={styles.select} disabled={this.state.disabled} value={this.state.method} onChange={this.onMethodChange}>
          <MenuItem value={1} primaryText="Run Length Encoding"/>
          <MenuItem value={2} primaryText="Huffman Tree"/>
          {/*
          <MenuItem value={3} primaryText="Differential PCM"/>
          <MenuItem value={4} primaryText="LZW"/>
          */}
        </SelectField>
      } />,
      <ListItem key="mode" disabled={true} primaryText={
        <SelectField style={styles.select} disabled={this.state.disabled} value={this.state.mode} onChange={this.onModeChange}>
          {/*
          <MenuItem value={1} primaryText="ASCII"/>
          */}
          <MenuItem value={2} primaryText="Binary"/>
        </SelectField>
      } />
    ];
    return (<SidebarGroup checkbox={true} checked={!this.state.disabled} onChecked={this.onEnableToggle} controls={controls} title="Compression" />);
  }
}