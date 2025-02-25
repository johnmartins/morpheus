# DEPRECATION WARNING
This tool has been replaced by a web-based alternative (https://morpheus.martinsson-bonde.com/) and is no longer being updated. If you are a student, it is strongly recommended that you instead use the web-based version. This repository will be kept online for research and documentation purposes.

# About
This is a graphical tool for creating morphological matrices. It can be used to quickly create a matrix with "sub-functions" (SF) and "sub-solutions" (SS). Once all SFs and SSs have been fed into the matrix the tool can be used to generate all possible solutions.

[![DOI](https://zenodo.org/badge/267880956.svg)](https://zenodo.org/badge/latestdoi/267880956)

## Features
- Add, remove and edit Sub-Functions and Sub-Solutions easily
- Import images to your sub-solutions for improved clarity
- Mark sub-solutions as incompatible using the Delimitations-view
- Get a count of the amount of possible solutions in the Delimitations-view
- Generate all possible solutions
- Export your matrix as an image, or a CSV-file
- Export one or all solutions as an image or a CSV-file
- Save the matrix as a .morph-file, allowing you to return to it at another time

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

## Mac
To build for mac, run `npm run package-mac`. This will yield a .app-directory in `out/` directory.

### Sign mac build
There is currently no certificate for Mac.

