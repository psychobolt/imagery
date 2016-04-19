import React, { Component } from 'react';
import Canvas from '../containers/Canvas';
import { ipcRenderer } from 'electron';

export default class Editor extends Component {
    
    componentDidMount() {
      const { canvases, addCanvas, removeCanvas } = this.props;
      ipcRenderer.on('load-image', function (event, canvas) {
        if (!canvases[0].id) {
          removeCanvas(canvases[0]);
        }
        const width = canvas.imageFile.width;
        const height = canvas.imageFile.height;
        addCanvas({
          id: canvas.id,
          width,
          height,
          layers: [canvas.imageFile]
        });
      });
    }
    
    render() {
        const { canvases } = this.props;
        const canvasCollection = canvases.map((canvas, index) => {
           return  <Canvas key={index} canvas={canvas}></Canvas>;
        });
        return (
          <div>
            {canvasCollection}
          </div>
        );
    }
}