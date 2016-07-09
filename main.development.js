import { app, BrowserWindow, Menu, shell, dialog } from 'electron';
import ImageFile from './app/utils/ImageFile';

let menu;
let commands;
let template;
let mainWindow = null;
let canvasId = 0;


if (process.env.NODE_ENV === 'development') {
  require('electron-debug')(); // eslint-disable-line global-require
}


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

function createMenuTemplate(commands) {
  let fileMenus = [{
    label: '&File',
    submenu: [{
      label: '&Open',
      accelerator: commands.open,
      click() {
        let filepaths = dialog.showOpenDialog({
          properties: ['openFile']
        });
        if (filepaths) {
          const id = ++canvasId;
          const filepath = filepaths[0];
          const imageFile = new ImageFile(filepath);
          imageFile.on('load-init', () => mainWindow.webContents.send('load-image', {id, imageFile})); 
          imageFile.on('load-data', (pixels) => mainWindow.webContents.send('load-data', {id, filepath, pixels}));
          imageFile.on('load-complete', () => mainWindow.webContents.send('load-complete', {id, filepath, compressionRatio: imageFile.compressionRatio}));
          imageFile.on('load-error', (message) => 
            dialog.showMessageBox({
              type: 'error',
              title: 'Failed to load image',
              buttons: ['Close'],
              message
            })
          );
          imageFile.load();
        } else {
          console.error('Failed to load image!');
        }
      }
    }, {
      label: '&Save As',
      accelerator: commands.save,
      click() {
        const filepath = dialog.showSaveDialog({});
        if (filepath) { 
          mainWindow.webContents.send('save-image', filepath);
        }
      }
    }]
  }];
  if (process.platform !== 'darwin') {
    fileMenus[0].submenu.push({
      label: '&Close',
      accelerator: 'Ctrl+W',
      click() {
        mainWindow.close();
      }
    });
  } 
  return [
    ...fileMenus, 
    {
      label: '&View',
      submenu: (process.env.NODE_ENV === 'development') ? [{
      label: '&Reload',
      accelerator: commands.reload,
      click() {
        mainWindow.webContents.reload();
      }
    }, {
      label: 'Toggle &Full Screen',
      accelerator: commands.fullscreen,
      click() {
        mainWindow.setFullScreen(!mainWindow.isFullScreen());
      }
    }, {
      label: 'Toggle &Developer Tools',
      accelerator: commands.devTools,
      click() {
        mainWindow.toggleDevTools();
      }
    }] : [{
      label: 'Toggle &Full Screen',
      accelerator: commands.fullscreen,
      click() {
        mainWindow.setFullScreen(!mainWindow.isFullScreen());
      }
    }]
  }, {
    label: 'Help',
    role: 'help',
    submenu: [{
      label: 'Learn More',
      click() {
        shell.openExternal('https://github.com/psychobolt/imagery');
      }
    }, {
      label: 'Documentation',
      click() {
        shell.openExternal('https://github.com/psychobolt/imagery/blob/master/README.md');
      }
    }, {
      label: 'Search Issues',
      click() {
        shell.openExternal('https://github.com/psychobolt/imagery/issues');
      }
    }]
  }];
}

const installExtensions = async () => {
  if (process.env.NODE_ENV === 'development') {
    const installer = require('electron-devtools-installer'); // eslint-disable-line global-require
    const extensions = [
      'REACT_DEVELOPER_TOOLS',
      'REDUX_DEVTOOLS'
    ];
    const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
    for (const name of extensions) {
      try {
        await installer.default(installer[name], forceDownload);
      } catch (e) {} // eslint-disable-line
    }
  }
};

app.on('ready', async () => {
  await installExtensions();

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728
  });

  mainWindow.loadURL(`file://${__dirname}/app/app.html`);

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.openDevTools();
    mainWindow.webContents.on('context-menu', (e, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([{
        label: 'Inspect element',
        click() {
          mainWindow.inspectElement(x, y);
        }
      }]).popup(mainWindow);
    });
  }
  
  if (process.platform === 'darwin') {
    commands = {
      open: 'Command+O',
      save: 'Command+Shift+S',
      hide: 'Command+H',
      quit: 'Command+Q',
      reload: 'Command+R',
      fullscreen: 'Ctrl+Command+F',
      devTools: 'Alt+Command+I'
    };
    template = createMenuTemplate(commands);
    template = [{
      label: 'Imagery',
      submenu: [{
        label: 'About Imagery',
        selector: 'orderFrontStandardAboutPanel:'
      }, {
        type: 'separator'
      }, {
        label: 'Services',
        submenu: []
      }, {
        type: 'separator'
      }, {
        label: 'Hide Imagery',
        accelerator: commands.hide,
        selector: 'hide:'
      }, {
        label: 'Hide Others',
        accelerator: 'Command+Shift+H',
        selector: 'hideOtherApplications:'
      }, {
        label: 'Show All',
        selector: 'unhideAllApplications:'
      }, {
        type: 'separator'
      }, {
        label: 'Quit',
        accelerator: commands.quit,
        click() {
          app.quit();
        }
      }]
    }, 
    ...template];
    
    menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  } else {
    commands = {
      open: 'Ctrl+O',
      save: 'Ctrl+Shift+S',
      reload: 'Ctrl+R',
      fullscreen: 'F11',
      devTools: 'Alt+Ctrl+I'
    };
    template = createMenuTemplate(commands);
    menu = Menu.buildFromTemplate(template);
    mainWindow.setMenu(menu);
  }
});