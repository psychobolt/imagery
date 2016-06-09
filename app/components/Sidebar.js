import React, { Component } from 'react';
import Drawer from 'material-ui/Drawer';
import { List, ListItem } from 'material-ui/List';
import TextField from 'material-ui/TextField';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';
import Options from '../containers/Options';
import Filters from '../containers/Filters';

const styles = {
  
  input : {
    marginTop: -35,
    width: 220
  }
}

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
          <Subheader>Canvas</Subheader>
          <ListItem key="color" disabled={true} primaryText={
            <TextField style={styles.input} value={"Canvas " + canvas.id} floatingLabelText='Name' 
              disabled={true} />
          } />
          <ListItem key="width" disabled={true} primaryText={
            <TextField style={styles.input} value={canvas.width} floatingLabelText="Width" disabled={true} />
          } />
          <ListItem key="height" disabled={true} primaryText={
            <TextField style={styles.input} value={canvas.height} floatingLabelText="Height" disabled={true} />
          } />
          <Divider />
          <Subheader>Layers</Subheader>
          {canvas.layers.length ? canvas.layers.map((layer, index) => 
            <List key={"layer_" + index}>
              <ListItem primaryText={"Layer " + index} secondaryText={
                <p style={{wordWrap: "break-word"}}>{layer.filepath}</p>
              } secondaryTextLines={2} disabled={true} />
              {layer.compressionRatio ? <ListItem primaryText="Compression Ratio" disabled={true} secondaryText={layer.compressionRatio + ':1'} /> : null}
            </List>)
            : <ListItem primaryText="Empty" disabled={true} />
          }
        </List>
        <Divider />
        {canvas.layers.length ? <Options canvas={canvas} /> : null}
        {canvas.layers.length ?  <Divider /> : null}
        {canvas.layers.length ? <Filters canvas={canvas} /> : null}
      </Drawer>
    );
  }
} 