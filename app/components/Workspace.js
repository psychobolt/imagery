import React, { Component } from 'react';
import Canvas from '../containers/Canvas';
import { canvasProps } from '../components/Canvas';
import { ipcRenderer } from 'electron';
import styles from './Workspace.css';

export default class Workspace extends Component {
  
  constructor(props, content) {
    super(props, content);
    this.onCanvasSelect = this.onCanvasSelect.bind(this);
  }
  
  componentDidMount() {
    const { canvases, addCanvas, removeCanvas } = this.props;
    ipcRenderer.on('load-image', function (event, canvas) {
      if (!canvases[0].id) {
        removeCanvas(canvases[0]);
      }
      const width = canvas.imageFile.width;
      const height = canvas.imageFile.height;
      const paths = canvas.imageFile.filepath.split('\\');
      addCanvas(Object.assign({}, canvasProps, {
        id: canvas.id,
        title: paths[paths.length - 1],
        width,
        height,
        layers: [Object.assign({}, canvas.imageFile, {
          filters: {}
        })],
        options: {}
      }));
    });
  }
  
  onCanvasSelect(canvas) {
    const { selectCanvas } = this.props;
    selectCanvas(canvas);
  }
  
  render () {
    const { canvases, sidebarOpen, connectDropTarget } = this.props;
    return connectDropTarget(
      <div className={styles.workspace} style={{
          width: 'calc(100% - ' + (sidebarOpen ? 256 : 0) + 'px)',
          marginLeft: (sidebarOpen ? 256 : 0) + 'px'
        }}>
        {canvases.map((canvas, index) => <Canvas key={index} canvas={canvas} onSelect={this.onCanvasSelect}></Canvas>)}
      </div>
    );  
  }
}