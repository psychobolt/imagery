import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import styles from './Canvas.css';
import * as canvasUtils from '../utils/canvas-utils';
import { ipcRenderer } from 'electron';
import { Card, CardHeader, CardMedia } from 'material-ui/Card';
import Paper from 'material-ui/Paper';
import PubSub from 'pubsub-js';

export default class Canvas extends Component {
  
    constructor(props, content) {
      super(props, content);
      this.onLoadData = this.onLoadData.bind(this);
      this.onLoadComplete = this.onLoadComplete.bind(this);
      this.onCanvasSelect = this.onCanvasSelect.bind(this);
    }
  
    componentDidMount() {
      const { initContext, canvas } = this.props;
      const gl = this.refs.canvas.getContext('webgl', {preserveDrawingBuffer: true});
      initContext(canvas, gl);
      ipcRenderer.on('load-data', this.onLoadData);
      ipcRenderer.on('load-complete', this.onLoadComplete);
    }
    
    componentWillUnmount() {
      const { canvas } = this.props;
      canvasUtils.cleanUp(canvas.context);
      ipcRenderer.removeListener('load-data', this.onLoadData);
      ipcRenderer.removeListener('load-complete', this.onLoadComplete);
    }
    
    onLoadData(event, data) {
      const { canvas } = this.props;
      if (canvas.id !== data.id) {
        return;
      }
      const layer = canvas.layers.find((layer) => {
        return layer.filepath === data.filepath;
      });
      for (var i = 0; i < data.pixels.length; i++) {
        layer.pixels.push(data.pixels[i]);
      }
    }
    
    onLoadComplete(event, data) {
      const { canvas, renderLayers } = this.props;
      if (canvas.id !== data.id) {
        return;
      }
      renderLayers(canvas);
    }
    
    onCanvasSelect(event) {
      const {canvas, onSelect} = this.props;
      if (!canvas.selected) {
        onSelect(canvas);
      }
      const rect = this.refs.canvas.getBoundingClientRect();
      const xPosition = event.clientX - rect.left;
      const yPosition = event.clientY - rect.top;
      PubSub.publish('CANVAS_' + canvas.id + '_EVENT.SELECT_POS', {
        xPosition,
        yPosition 
      });
      PubSub.publish('CANVAS_' + canvas.id + '_EVENT.SELECT_COLOR', {
       targetColor: canvasUtils.getPixel(canvas, xPosition, yPosition)
      });
    }
  
    render() {
        const { canvas, connectDragPreview, connectDragSource, isDragging } = this.props;
        return connectDragPreview(
          <div className={styles.canvasContainer} selected={canvas.selected}
            style={{
              left: canvas.left,
              top: canvas.top,
              width: canvas.width,
              height: canvas.height + 50,
              opacity: isDragging ? 0 : 1,
              zIndex: canvas.selected ? 1000 : 1
            }}>
            <Paper zDepth={2}>
                <Card>
                  <CardHeader title={canvas.title + ' (' + canvas.width + ' x ' + canvas.height + ')'}
                    style={{cursor: "move"}}
                    ref={(cardHeader) => connectDragSource(findDOMNode(cardHeader))}
                    titleStyle={{textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap"}} />
                  <CardMedia>
                    <canvas id="canvas" className={styles.canvas} onClick={this.onCanvasSelect}
                      width={canvas.width} height={canvas.height} ref="canvas" />
                  </CardMedia>
                </Card>
            </Paper>
          </div>
        );
    }
}

export const canvasProps = {
  top: 10,
  left: 10,
  width: 640, 
  height: 320, 
  title: "<No Content>",
  layers: []
};

Canvas.defaultProps = canvasProps;