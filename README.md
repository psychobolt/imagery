# Imagery

An application for applying filters on images. The application is built using a web stack framework such as WebGL, Javascript, HTML5. Imagery is a desktop application, powered by an set of NodeJS frameworks: Electron, React, and Redux.

## Building

1. Install NodeJS version v4+ LTS.
2. Install node-gyp: ```npm install -g node-gyp```. Please see https://www.npmjs.com/package/node-gyp for installing dependencies.
3. Then run the following commands
```
cd imagery/
npm install
npm run package # builds and packages the application on the your platform
```

## Download

Coming soon.

## Tutorial

1. Start up the application by opening the binary file. e.g Imagery.exe (Windows)
2. Maximize the window.
3. Open a image file: File > Open (See supported formats in Features section)
4. Sidebar should be populated. Apply a filter by checkbox. 
5. Click on the down arrow icon to expand the filter.
6. Change the settings.
7. Open another image file. (A new image will appear on top of current)
8. Select the image titlebar and drag it to available room.
9. Change the image selection, by selecting on the image. (Sidebar settings are image context sensitive)

> Image processing and the UI share the same process. Some filters such as Histogram Local Equalization may cause unresponsiveness. In Phase 2, there will be a redesign of the current architecture so image processing happens in a background process.

## Features

Supported image formats: PGM ASCII (P2)

> Development is ongoing to support various formats. Currently only PGM ASCII is supported. You can convert any image to PGM ASCII with instructions bellow.
 
1. Download and install Imagemagick. http://www.imagemagick.org/script/binary-releases.php
2. Run command ```convert image.png image.pgm```
3. Download and compile the program "pgmb_to_pgma.cpp" for your platform. e.g. ```g++ pgmb_to_pgma.cpp -o pgmb_to_pgma.exe``` http://people.sc.fsu.edu/~jburkardt/cpp_src/pgmb_to_pgma/pgmb_to_pgma.html
3. Execute the program e.g. ```pgmb_topgma.exe image.pgm image.pgma```

## Development

Development status is inactive.

To add new filters, see app/components/filters for examples.

The application is built ontop of the Electron-React boiler plate. Please see https://github.com/chentsulin/electron-react-boilerplate for running a development environment.