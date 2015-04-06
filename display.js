//On Window Object
const PhysicsRenderer     = require( './lib/PhysicsRenderer' );
const THREE               = require( './lib/three.min.js' );
const TrackballControls   = require( './lib/TrackballControls.js' );

module.exports = Display

const frag = `
 
uniform sampler2D t_oPos;
uniform sampler2D t_pos;

uniform vec2  resolution;

uniform float dT;
uniform vec3 centerPos;

void main(){

  vec2 uv = gl_FragCoord.xy / resolution;
  vec4 oPos = texture2D( t_oPos , uv );
  vec4 pos  = texture2D( t_pos , uv );

  vec3 vel = pos.xyz - oPos.xyz;

  vec3 force = vec3( 0. );

  vec3 dif = pos.xyz - centerPos;

  force -= length( dif ) * length( dif ) * normalize( dif ) * .01;


  vel += force * dT;

  vec3 p = pos.xyz + vel;


  gl_FragColor = vec4( p , 1. );


}

`

const renderVert = `

uniform sampler2D t_pos;

void main(){

  vec4 pos = texture2D( t_pos , position.xy );

  vec3 dif = cameraPosition - pos.xyz;
  
  gl_PointSize = min( 5. ,  50. / length( dif ));
  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos.xyz , 1. );


}

`

const renderFrag = `

void main(){

  gl_FragColor = vec4( 1. );

}

`

function Display(canvas) {
 
  if (!(this instanceof Display)) return new Display(canvas)

 

  this.SIZE = 128;

  this.simulationUniforms = {
  
    dT:{ type:"f" , value: 0 },
    centerPos: { type:"v3" , value: new THREE.Vector3( 0 ) }
  }

  this.renderUniforms = {

    t_pos:{ type:"t" , value: null }

  }
  
  
  this.init( canvas );
  this.animate();

 

  

}

Display.prototype.init =  function( canvas ){

  /*

     Default threejs stuff!

  */

  this.canvas = canvas;

  this.scene = new THREE.Scene();

  var ar = canvas.width / canvas.height;

  this.camera = new THREE.PerspectiveCamera( 75, ar , 1, 1000 );
  this.camera.position.z = 100;

  this.renderer = new THREE.WebGLRenderer({
    canvas: canvas 
  });

  console.log( 'WIDSZ');
  console.log( canvas.width )
  this.renderer.setSize( canvas.width, canvas.height );

 // document.body.appendChild( this.renderer.domElement );


  this.controls = new THREE.TrackballControls( this.camera );
  this.clock = new THREE.Clock();

  this.createSimulation( this.SIZE , frag );

 
}


Display.prototype.createSimulation = function( size , simShader ){

  this.SIZE = size;

  if( this.particles ){ this.scene.remove( this.particles ); }

  this.particles = null;

  this.simulation = new PhysicsRenderer( this.SIZE , simShader , this.renderer );
  
  var geo = this.createLookupGeometry( this.SIZE );

  var mat = new THREE.ShaderMaterial({
    uniforms:       this.renderUniforms,
    vertexShader:   renderVert,
    fragmentShader: renderFrag,
  });

  this.simulation.setUniforms( this.simulationUniforms );

  this.particles = new THREE.PointCloud( geo , mat );
  this.particles.frustumCulled = false;
  this.scene.add( this.particles );

  this.simulation.addBoundTexture( this.renderUniforms.t_pos , 'output' );
  this.simulation.resetRand( 5 );

}


Display.prototype.animate = function(){

    requestAnimationFrame( this.animate.bind( this ) );
 
    this.simulationUniforms.dT.value = this.clock.getDelta();
    this.simulation.update();

    this.controls.update();

    this.checkResize();
//    this.renderer.setSize( window.innerWidth , window.innerHeight - 48 );
    this.renderer.render( this.scene , this.camera );


}

Display.prototype.createLookupGeometry = function( size ){        
        
  var geo = new THREE.BufferGeometry();

  var positions = new Float32Array(  size * size * 3 );

  for ( var i = 0, j = 0, l = positions.length / 3; i < l; i ++, j += 3 ) {

    positions[ j     ] = (( i % size ) + .5) / size;
    positions[ j + 1 ] = (Math.floor( i / size ) + .5 ) / size;
  
  }

  var posA = new THREE.BufferAttribute( positions , 3 );
  geo.addAttribute( 'position', posA );

  return geo;
  
}


Display.prototype.checkResize = function(){

  if( 
      this.canvas.width  != this.renderer.width  || 
      this.canvas.height != this.renderer.height
  ){ this.resize(); }


}

Display.prototype.resize = function(){

  var h = window.innerHeight - 48
  var w = window.innerWidth;
  this.camera.aspect = w / h;
  this.camera.updateProjectionMatrix();

  //console.log( this.canvas.width )
	this.renderer.setSize( w , h );

}

Display.prototype.update = function(source) {

  console.log('UPDARTED');
  //this.shader.update(vert, source)

}
