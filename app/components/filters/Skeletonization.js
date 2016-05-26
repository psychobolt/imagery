import React from 'react';
import {ListItem} from 'material-ui/List';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import Checkbox from 'material-ui/Checkbox';
import ColorizeIcon from 'material-ui/svg-icons/image/colorize';
import {cyanA700} from 'material-ui/styles/colors';
import SidebarGroup from '../SidebarGroup';
import ColorFill from './ColorFill';
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
  },
  
  inputButton : {
    top: 'initial', 
    zIndex: 1
  }
};

export default class Skeletonization extends ColorFill {
    
    constructor(props, content) {
      super(props, content);
      this.defaultState = {
        type: 'SKELETONIZATION',
        disabled: true,
        method: 1,
        filter: Filters.skeletonization,
        xPosition: '',
        yPosition: '',
        targetColor: 0,
        listeners: {
          colorPick: null,
          pixelPos: null
        }
      };
      this.state = Object.assign({}, this.defaultState);
      this.onMethodChange = this.onMethodChange.bind(this);
    }
    
    onMethodChange(event, index, method) {
      const options = {method};
      this.applyFilter(Object.assign({}, this.state, options));
      this.setState(options);
    }
    
    render() {
      const controls = [
        <ListItem key="select" disabled={true} primaryText={
          <SelectField style={styles.select} disabled={this.state.disabled} value={this.state.method} onChange={this.onMethodChange}>
            <MenuItem value={1} primaryText="Zhang-Suen"/>
            <MenuItem value={2} primaryText="Zhang-Suen (BFS)"/>
          </SelectField>
        } />,
        <ListItem key="color" disabled={true} primaryText={
          <TextField style={styles.input} value={this.state.targetColor} onChange={this.onTargetColorChange} floatingLabelText='Background Color' 
            disabled={this.state.disabled} />
        } rightIconButton={
          <IconButton style={styles.inputButton} onClick={this.onColorSelect} disabled={this.state.disabled}>
            <ColorizeIcon color={this.state.listeners.colorPick ? cyanA700 : undefined} hoverColor={cyanA700} />
          </IconButton>
        } />,
        <ListItem key="label" disabled={true} primaryText="Foreground Pixel" rightIconButton={
          <IconButton onClick={this.onPixelSelect} disabled={this.state.disabled}>
            <ColorizeIcon color={this.state.listeners.pixelPos ? cyanA700 : undefined} hoverColor={cyanA700} />
          </IconButton>
        } />,
        <ListItem key="seed" style={this.state.method === 1 ? {display: 'none'} : undefined} disabled={true} primaryText="Is Seed" leftCheckbox={
          <Checkbox disabled={true} checked={true} />
        } />,
        <ListItem key="xPosition" disabled={true} primaryText={
          <TextField style={styles.input} value={this.state.xPosition} onChange={this.onXpositionChange} floatingLabelText='X Position' 
            disabled={this.state.disabled} />
        } />,
        <ListItem key="yPosition" disabled={true} primaryText={
          <TextField style={styles.input} value={this.state.yPosition} onChange={this.onYpositionChange} floatingLabelText='Y Position' 
            disabled={this.state.disabled} />
        } />
      ];
      return (<SidebarGroup checkbox={true} checked={!this.state.disabled} onChecked={this.onEnableToggle} controls={controls} title="Skeletonization" />);
    }
    
}