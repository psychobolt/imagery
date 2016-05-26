import React, { Component } from 'react';
import { List } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import SpatialResolution from './SpatialResolution';
import GrayLevel from './GrayLevel';
import GrayScale from './GrayScale';
import Histogram from './Histogram';
import NoiseReduce from './NoiseReduce';
import Sharpen from './Sharpen'
import BitPlanes from './BitPlanes';
import FloodFill from './FloodFill';
import BoundaryFill from './BoundaryFill';
import Erosion from './Erosion';
import DistanceFill from './DistanceFill';
import Skeletonization from './Skeletonization';

export default class Filter extends Component {
  
  render() {
    const { canvases, canvas, applyFilter } = this.props;
    const layer = canvas.layers[0];
    let index = 0;
    return (
      <List>
        <Subheader>Filters</Subheader>
        <SpatialResolution index={index++} canvas={canvas} layer={layer} applyFilter={applyFilter} />
        <GrayScale index={index++} canvas={canvas} layer={layer} applyFilter={applyFilter} />
        <GrayLevel index={index++} canvas={canvas} layer={layer} applyFilter={applyFilter} />
        <Histogram index={index++} canvas={canvas} canvases={canvases} layer={layer} applyFilter={applyFilter} />
        <NoiseReduce index={index++} canvas={canvas} canvases={canvases} layer={layer} applyFilter={applyFilter} />
        <Sharpen index={index++} canvas={canvas} canvases={canvases} layer={layer} applyFilter={applyFilter} />
        <BitPlanes index={index++} canvas={canvas} canvases={canvases} layer={layer} applyFilter={applyFilter} />
        <Divider />
        <Subheader>Fills</Subheader>
        <FloodFill index={index++} canvas={canvas} layer={layer} applyFilter={applyFilter} />
        <BoundaryFill index={index++} canvas={canvas} layer={layer} applyFilter={applyFilter} />
        <Erosion index={index++} canvas={canvas} layer={layer} applyFilter={applyFilter} />
        <DistanceFill index={index++} canvas={canvas} layer={layer} applyFilter={applyFilter} />
        <Divider />
        <Subheader>Morphs</Subheader>
        <Skeletonization index={index++} canvas={canvas} layer={layer} applyFilter={applyFilter} />
      </List>
    );
  }
}