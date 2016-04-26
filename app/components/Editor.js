import React, { Component } from 'react';
import Sidebar from '../components/Sidebar';
import Workspace from '../containers/Workspace';

export default class Editor extends Component {
    
    render() {
      const { canvases } = this.props;
      const canvas = canvases.find((canvas) => canvas.selected);
      const sidebarOpen = canvas !== undefined;
      return (
        <div>
          <Sidebar canvas={canvas} open={sidebarOpen} />
          <Workspace sidebarOpen={sidebarOpen} />
        </div>
      );
    }
}