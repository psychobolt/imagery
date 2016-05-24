import React from 'react';
import {ListItem} from 'material-ui/List';
import Slider from 'material-ui/Slider';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import SidebarGroup from '../SidebarGroup';
import Filter from './Filter';
import * as Filters from './';

const styles = {
  slider : {
    overflow: 'visible',
    marginTop: -20,
    width: 165
  },
  
  select : {
    marginTop: -20,
    marginLeft: 2,
    width: 170,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis'
  }
};

export default class SpatialResolution extends Filter {

  constructor(props, content) {
    super(props, content);
    this.defaultState = {
      type: 'SPATIAL_RESOLTUION',
      ratio: 1,
      zoomMethod: 1,
      disabled: true,
      filter: Filters.spatialResolution
    };
    this.state = Object.assign({}, this.defaultState);
    this.onRatioChange = this.onRatioChange.bind(this);
    this.onZoomMethodChange = this.onZoomMethodChange.bind(this);
  }
  
  onRatioChange(event, value) {
    const options = {ratio: value};
    this.applyFilter(Object.assign({}, this.state, options));
    this.setState(options);
  }
  
  onZoomMethodChange(event, index, value) {
    const options = {zoomMethod: value};
    this.applyFilter(Object.assign({}, this.state, options));
    this.setState(options);
  }

  render() {
    const { layer } = this.props;
    const resolution = '(' + (Math.floor(layer.width * this.state.ratio)) + ' X ' + (Math.floor(layer.height * this.state.ratio)) + ') ratio = ' + this.state.ratio;
    const controls = [
      <ListItem key="select" disabled={true} primaryText={
        <SelectField style={styles.select} disabled={this.state.disabled} value={this.state.zoomMethod} onChange={this.onZoomMethodChange}>
          <MenuItem value={1} primaryText="Nearest Neighbor"/>
          <MenuItem value={2} primaryText="Bilinear Interpolation"/>
        </SelectField>
      } />,
      <ListItem key="slider" primaryText={resolution} disabled={true} style={this.state.disabled ? {color: 'rgba(0, 0, 0, 0.298039)'} : null} secondaryText={
        <div style={styles.slider}>
          <Slider onChange={this.onRatioChange} min={0.50} step={0.50} value={this.state.ratio} disabled={this.state.disabled} />
        </div>
      } />
    ];
    return (<SidebarGroup checkbox={true} checked={!this.state.disabled} onChecked={this.onEnableToggle} controls={controls} title="Spatial Resolution" />);
  }
}