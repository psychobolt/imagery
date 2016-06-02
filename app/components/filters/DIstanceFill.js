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

export default class DistanceFill extends ColorFill {
  
  constructor (props, content) {
    super(props, content);
    this.defaultState = {
      type: 'DISTANCE_FILL',
      filter: Filters.distanceFill,
      disabled: true,
      xPosition: '',
      yPosition: '',
      targetColor: 0,
      scaleFactor: 1,
      listeners: {
        colorPick: null,
        pixelPos: null
      }
    }
    this.state = Object.assign({}, this.defaultState);
    this.onScaleFactorChange = this.onScaleFactorChange.bind(this);
  }
  
  onScaleFactorChange(event, scaleFactor) {
    let options = {scaleFactor};
    scaleFactor = parseInt(scaleFactor);
    if (scaleFactor < 0) {
      scaleFactor = 1;
      options = {scaleFactor};
    }
    if (Number.isInteger(scaleFactor)) {
      this.applyFilter(Object.assign({}, this.state, {scaleFactor}));
    }
    this.setState(options);
  }
  
  render() {
    const controls = [
      <ListItem key="color" disabled={true} primaryText={
        <TextField style={styles.input} value={this.state.targetColor} onChange={this.onTargetColorChange} floatingLabelText='Initial Color' 
          disabled={this.state.disabled} />
      } rightIconButton={
        <IconButton style={styles.inputButton} onClick={this.onColorSelect} disabled={this.state.disabled}>
          <ColorizeIcon color={this.state.listeners.colorPick ? cyanA700 : undefined} hoverColor={cyanA700} />
        </IconButton>
      } />,
      <ListItem key="scale" disabled={true} primaryText={
        <TextField style={styles.input} value={this.state.scaleFactor} onChange={this.onScaleFactorChange} floatingLabelText='Scale Factor' 
          disabled={this.state.disabled} />
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
    return (<SidebarGroup checkbox={true} checked={!this.state.disabled} onChecked={this.onEnableToggle} controls={controls} title="Distance Fill" />);
  }
}