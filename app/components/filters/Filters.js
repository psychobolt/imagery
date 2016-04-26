import React, { Component } from 'react';
import { List } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import SpatialResolution from './SpatialResolution';
import GrayLevel from './GrayLevel';
import GrayScale from './GrayScale';
import Histogram from './Histogram';

export default class Filter extends Component {
  
  render() {
    const { canvases, canvas, applyFilter } = this.props;
    const layer = canvas.layers[0];
    return (
      <List>
        <Subheader>Filters</Subheader>
        <SpatialResolution canvas={canvas} layer={layer} applyFilter={applyFilter} />
        <GrayLevel canvas={canvas} layer={layer} applyFilter={applyFilter} />
        <GrayScale canvas={canvas} layer={layer} applyFilter={applyFilter} />
        <Histogram canvas={canvas} canvases={canvases} layer={layer} applyFilter={applyFilter} />
      </List>
    );
  }
}