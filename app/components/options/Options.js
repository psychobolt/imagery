import React, { Component } from 'react';
import { List } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Compression from './Compression';

export default class Options extends Component {
  
  render() {
    const {canvases, canvas, applyOption} = this.props;
    let index = 0;
    return (
      <List>
        <Subheader>Options</Subheader>
        <Compression index={index++} canvas={canvas} applyOption={applyOption} />
      </List>
    );
  }
}