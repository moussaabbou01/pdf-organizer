import React from 'react';
import { Toolbar } from './Toolbar';
import { Sidebar } from './Sidebar';
import { ThumbnailGrid } from '../thumbnails/ThumbnailGrid';
import { StatusBar } from './StatusBar';
import './MainWindow.css';

export function MainWindow() {
  return (
    <div className="main-window">
      <Toolbar />
      <div className="main-content">
        <Sidebar />
        <div className="workspace">
          <ThumbnailGrid />
        </div>
      </div>
      <StatusBar />
    </div>
  );
}
