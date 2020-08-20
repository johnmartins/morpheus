# About
This is a graphical tool for creating morphological matrices. It can be used to quickly create a matrix with "sub-functions" (SF) and "sub-solutions" (SS). New SFs and SSs can be created by clicking the "+ SF" and "+ SS" cells (the + SS cell is only visible after you have created your first SF).  You can attach images to any sub-solution by hovering over its cell and clicking the camera icon. To change the name of the matrix, simply click on the title and rename it to whatever you want.

# Development
- clone repository
- cd to local repo directory
- `npm install`
- `npm run start` starts the program
- `npm run make` builds the executable
- `npm run watch` tracks changes to scss files

# Build

## For windows
To build for windows you need to either
- be on a windows machine
- be on a mac with wine installed (not tested)
- be on a linux with mono installed (not tested)

To build a windows installer, run `npm run make`.
To build a windows package, run `npm run package-win`

### Sign windows installer automatically
It is possible to automatically sign the installation files when running `npm run make`. However, this does not currently support "timestamping". Thus, the signed files will loose their certified status when the certificate expires (IF the certificate expires).

In the file `forge.config.js` you need to find the variable `const skipCertificate` and set it to true if it isn't already.
To sign your windows installer you need the files `win.pfx` and `win-pwd.txt`. These files needs to be in the `build-resources/certificates/` directory. They are not included in this project repository since they are secret (and should be kept secret by the developers) for security reasons. 

### Sign with Digicert Util
- Download DigiCert Util: https://www.digicert.com/util/
- Import certificate (.pfx) into the util tool
- Enter the password
- Use the DigiCert Util tool to select the certificate, select which files to sign, and sign them. Ensure that you use the timestamp.
- Done.

## Mac
To build for mac, run `npm run package-mac`. This will yield a .app-directory in `out/` directory.

### Sign mac build
There is currently no certificate for Mac.

