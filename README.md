# About
This is a graphical tool for creating morphological matrices. It can be used to quickly create a matrix with "functional requirements" (FR) and "design solutions" (DS). New FRs and DSs can be created by clicking the "+ FR" and "+ DS" cells (the + DS cell is only visible after you have created your first FR).  You can attach images to any design solution by hovering over its cell and clicking the camera icon. To change the name of the matrix, simply click on the title and rename it to whatever you want.

# Development
- clone repository
- cd to local repo directory
- `npm install`
- `npm run start` starts the program
- `npm run make` builds the executable
- `npm run watch` tracks changes to scss files

# Build

## Mac
To build for mac, run `npm run package-mac`. This will yield a .app-directory in `out/` directory

## For windows
To build for windows you need to either
- be on a windows machine
- be on a mac with wine installed
- be on a linux with mono installed

To build a windows installer, run `npm run make`.
To build a windows package, run `npm run package-win`

### Signing the windows installer
To sign your windows installer you need the files `win.pfx` and `win-pwd.txt`. These files needs to be in the `build-resources/certificates/` directory. They are not included in this project repository since they are secret (and should be kept secret by the developers) for security reasons.