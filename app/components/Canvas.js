import React, { Component } from 'react';
import styles from './Canvas.css';
import * as canvasUtils from '../utils/canvas-utils';
import { ipcRenderer } from 'electron';

export default class Canvas extends Component {
  
    constructor(props, content) {
      super(props, content);
      this.loadData = this.loadData.bind(this);
      this.renderCanvasData = this.renderCanvasData.bind(this);
    }
  
    componentDidMount() {
      const { initContext, canvas } = this.props;
      const gl = this.refs.canvas.getContext('webgl');
      initContext(canvas, gl);
      ipcRenderer.on('load-data', this.loadData);
      ipcRenderer.on('load-complete', this.renderCanvasData);
    }
    
    componentWillUnmount() {
      const { canvas } = this.props;
      canvasUtils.cleanUp(canvas.context);
      ipcRenderer.removeListener('load-data', this.loadData);
      ipcRenderer.removeListener('load-complete', this.renderCanvasData);
    }
    
    loadData(event, data) {
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
    
    renderCanvasData(event, data) {
      const { canvas } = this.props;
      if (canvas.id !== data.id) {
        return;
      }
      const layer = canvas.layers.find((layer) => {
        return layer.filepath === data.filepath;
      });
      canvasUtils.renderCanvasData(canvas.context, layer);
    }
  
    render() {
        const { canvas } = this.props;
        return (
          <div className={styles.canvasContainer} style={{marginLeft: -canvas.width/2, marginTop: -canvas.height/2}}>
            <canvas id="canvas" className={styles.canvas} width={canvas.width} height={canvas.height} ref="canvas">
            </canvas>
          </div>
        );
    }
}