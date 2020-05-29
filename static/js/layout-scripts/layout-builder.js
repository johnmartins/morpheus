const fs = require('fs')

let matrixLayout = fs.readFileSync('static/html/matrix.html', {encoding: 'utf-8'})
document.getElementById('layout-workspace').innerHTML = matrixLayout

let menuLayout = fs.readFileSync('static/html/menu.html', {encoding: 'utf-8'})
document.getElementById('layout-menu').innerHTML = menuLayout



