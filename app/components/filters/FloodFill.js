import React from 'react';
import {ListItem} from 'material-ui/List';
import TextField from 'material-ui/TextField';
import IconButton from 'material-ui/IconButton';
import ColorizeIcon from 'material-ui/svg-icons/image/colorize';
import {cyanA700} from 'material-ui/styles/colors';
import SidebarGroup from '../SidebarGroup';
import ColorFill from './ColorFill';
import * as Filters from './';

const styles = {
  
  input : {
    marginTop: -20,
    width: 170
  },
  
  inputButton : {
    top: 'initial', 
    zIndex: 1
  }
};

export default class FloodFill extends ColorFill {
  
  constructor(props, content) {
    super(props, content);
    this.defaultState = {
      type: 'FLOOD_FILL',
      filter: Filters.floodfill,
      disabled: true,
      xPosition: '',
      yPosition: '',
      targetColor: 0,
      listeners: {
        colorPick: null,
        pixelPos: null
      }
    };
    this.state = Object.assign({}, this.defaultState);
  }
  
  render() {
    const controls = [
      <ListItem key="color" disabled={true} primaryText={
        <TextField style={styles.input} value={this.state.targetColor} onChange={this.onTargetColorChange} floatingLabelText='Target Color' 
          disabled={this.state.disabled} />
      } rightIconButton={
        <IconButton style={styles.inputButton} onClick={this.onColorSelect} disabled={this.state.disabled}>
          <ColorizeIcon color={this.state.listeners.colorPick ? cyanA700 : undefined} hoverColor={cyanA700} />
        </IconButton>
      } />,
      <ListItem key="label" disabled={true} primaryText="Pixel Seed" rightIconButton={
        <IconButton onClick={this.onPixelSelect} disabled={this.state.disabled}>
          <ColorizeIcon color={this.state.listeners.pixelPos ? cyanA700 : undefined} hoverColor={cyanA700} />
        </IconButton>
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
    return (<SidebarGroup checkbox={true} checked={!this.state.disabled} onChecked={this.onEnableToggle} controls={controls} title="Flood Fill" />);
  }
}