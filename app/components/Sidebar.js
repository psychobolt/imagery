import React, { Component } from 'react';
import Drawer from 'material-ui/Drawer';
import { List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import Filters from '../containers/Filters';

export default class Sidebar extends Component {
  
  render() {
    const { open, canvas, applyFilter} = this.props;
    if (!canvas) {
      return (
        <Drawer open={open} zDepth={2}>
          <List>
            <Subheader>No Selected Canvas</Subheader>
          </List>
        </Drawer>
      );
    }
    return (
      <Drawer open={open} zDepth={2}>
        <List>
          <Subheader>Layers</Subheader>
          {canvas.layers.length ? canvas.layers.map((layer, index) => 
            <ListItem key={index} primaryText={"Layer " + index} secondaryText={
                <p style={{wordWrap: "break-word"}}>{layer.filepath}</p>
              } secondaryTextLines={2} disabled={true} />)
            : <ListItem primaryText="Empty" disabled={true} /> 
          }
        </List>
        <Divider />
        {canvas.layers.length ? <Filters canvas={canvas} /> : null}
      </Drawer>
    );
  }
} 