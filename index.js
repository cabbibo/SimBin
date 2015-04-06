var examples    = require('./examples')
var fragShaders = require('./fragShaders')
var debounce = require('frame-debounce')
var fit      = require('canvas-fit')
var xhr      = require('xhr')
var url      = require('url')

var sourceId = String(window.location.pathname).slice(1).split('/')
if (sourceId[0] === 's') {
  xhr({
    uri: '/shaders/' + sourceId[1] + '.json',
    method: 'GET',
    json: true
  }, function(err, res, body) {
    if (err) throw err
    init(body.shader)
  })
} else {
  init(examples.curl.trim())
}

function init(source) {
  
  var editor = require('./editor')(document.body, source)

  var canvas = document.querySelector('canvas')
  var fitter  = fit(canvas)
  
  toggleFullscreen();
  
  var display = require('./display')(canvas)

  window.addEventListener('resize', debounce(fitter), false)

  editor.on('update', function(src) {
    display.update(src)
  })

  document.querySelector('.buttons .play').addEventListener('click', e => {
    editor.reload()
    e.preventDefault()
    e.stopPropagation()
  }, false)

/*  document.querySelector('.buttons .full').addEventListener('click', e => {
    toggleFullscreen()
    e.preventDefault()
    e.stopPropagation()
  })*/

  document.querySelector('.buttons .auto').addEventListener('click', e => {
    editor.instant = !editor.instant
    e.preventDefault()
    e.stopPropagation()
  })

  document.querySelector('.buttons .save').addEventListener('click', e => {
    var value = editor.editor.getValue()

    xhr({
      uri: '/-/share',
      method: 'POST',
      json: {
        shader: value
      },
    }, function(err, res, body) {
      if (err) throw err
      window.location = url.parse(body.url).pathname
    })
  })

  editor.on('fullscreen', toggleFullscreen)
  
  function toggleFullscreen() {
    document.body.classList.toggle('fullscreen')
    fitter(canvas)
    editor.resize()
  }

  var egSelector = document.querySelector('[name="examples"]')
  var szSelector = document.querySelector('[name="scale"]')
  var fsSelector = document.querySelector('[name="fragShader"]')
  var rsSelector = document.querySelector('[name="resetSize"]')
  
  var examples = require('./examples')

  egSelector.addEventListener('change', e => {
    var name = egSelector.value
    if(!name) return

    editor.value(examples[egSelector.value].trim())
  })

  szSelector.addEventListener('change', e => {
    var value = Number(szSelector.value)
    if (!value) return
    display.updateSize( value ); 
  })

  fsSelector.addEventListener('change', e => {
    var value = fragShaders[fsSelector.value].trim()
    display.createParticles( value ); 
  })

  rsSelector.addEventListener('change', e => {
    var value = Number(rsSelector.value);
    if (!value) return
    
    display.reset( value ); 
  })

}
