//On Window Object
const PhysicsRenderer     = require( './lib/PhysicsRenderer' );
const THREE               = require( './lib/three.min.js' );
const glslify             = require( 'glslify' );

module.exports = Display

const frag = glslify( `

uniform sampler2D t_oPos;
uniform sampler2D t_pos;

uniform vec2  resolution;

uniform float dT;



void main(){

  vec2 uv = gl_FragCoord.xy / resolution;
  vec4 oPos = texture2D( t_oPos , uv );
  vec4 pos  = texture2D( t_pos , uv );

  vec3 vel = pos.xyz - oPos.xyz;

  vec3 force = vec3( 0. , .0 , 0. );


  //force += noise( pos.xyz  * .01)* .01;


  vel += force * dT;

  vec3 p = pos.xyz + vel;


  gl_FragColor = vec4( p , 1. );


}` , { inline: true }); 


const renderVert = `

uniform sampler2D t_pos;
uniform sampler2D t_oPos;
uniform sampler2D t_ooPos;

varying vec3 vPos;
varying vec3 vVel;
varying vec3 vAcc;

void main(){

  vec4 pos = texture2D( t_pos , position.xy );
  vec4 oPos = texture2D( t_oPos , position.xy );
  vec4 ooPos = texture2D( t_ooPos , position.xy );

  vec3 vel = pos.xyz - oPos.xyz;
  vec3 oVel = oPos.xyz - ooPos.xyz;

  vPos = pos.xyz;
  vVel = vel;
  vAcc = vel - oVel;

  vec3 dif = cameraPosition - pos.xyz;
  
  gl_PointSize = min( 5. ,  50. / length( dif ));
  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos.xyz , 1. );


}

`

const renderFrag = `

varying vec3 vVel;

void main(){

  gl_FragColor = vec4( normalize( vVel ) * .5 + .5  , 1. );

}

`

function Display(canvas) {
 
  if (!(this instanceof Display)) return new Display(canvas)




  this.SIZE = 128;

  this.resetSize = .1;

  this.simulationUniforms = {
  
    dT:{ type:"f" , value: 0 },
    time:{ type:"f" , value: 0 },
    centerPos: { type:"v3" , value: new THREE.Vector3( 0 ) }
  }

  this.renderUniforms = {

    t_pos:    { type:"t" , value: null },
    t_oPos:   { type:"t" , value: null },
    t_ooPos:  { type:"t" , value: null }

  }
  
  
  this.fragShader = renderFrag; 
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

  this.camera = new THREE.PerspectiveCamera( 75, ar , .01, 10 );
  this.camera.position.z = 1;

  this.radius = 1;

  this.renderer = new THREE.WebGLRenderer({
    canvas: canvas 
  });

  console.log( 'WIDSZ');
  console.log( canvas.width )
  this.renderer.setSize( canvas.width, canvas.height );

 // document.body.appendChild( this.renderer.domElement );


  this.clock = new THREE.Clock();

  this.createSimulation( frag );
 
 
}


Display.prototype.createSimulation = function( simShader ){


  if( this.particles ){ this.scene.remove( this.particles ); }

  this.particles = null;

  this.simulation = new PhysicsRenderer( this.SIZE , simShader , this.renderer );
  
  this.geo = this.createLookupGeometry( this.SIZE );

  var mat = new THREE.ShaderMaterial({
    uniforms:       this.renderUniforms,
    vertexShader:   renderVert,
    fragmentShader: this.fragShader,
  });

  this.simulation.setUniforms( this.simulationUniforms );

  this.particles = new THREE.PointCloud( this.geo , mat );
  this.particles.frustumCulled = false;
  this.scene.add( this.particles );
  
  this.simulation.addBoundTexture( this.renderUniforms.t_pos    , 'output'    );
  this.simulation.addBoundTexture( this.renderUniforms.t_oPos   , 'oOutput'   );
  this.simulation.addBoundTexture( this.renderUniforms.t_ooPos  , 'ooOutput'  );

  this.simulation.resetRand( this.resetSize );

}

Display.prototype.createParticles = function( fragShader ){



  this.fragShader = fragShader;

  if( this.particles ){ this.scene.remove( this.particles ); }

   var mat = new THREE.ShaderMaterial({
    uniforms:       this.renderUniforms,
    vertexShader:   renderVert,
    fragmentShader: this.fragShader,
  });


  this.particles = new THREE.PointCloud( this.geo , mat );
  this.particles.frustumCulled = false;
  this.scene.add( this.particles );


}


Display.prototype.animate = function(){

    requestAnimationFrame( this.animate.bind( this ) );

    var su = this.simulationUniforms
    su.dT.value = this.clock.getDelta();
    su.time.value += su.dT.value;


    var t = su.time.value * .1;

    this.camera.position.x = this.radius * Math.cos( t );
    this.camera.position.z = this.radius * Math.sin( t );

    this.camera.lookAt( su.centerPos.value );

    this.simulation.update();


    this.checkResize();
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

  this.simShader = source
  this.createSimulation( this.simShader );
  //this.shader.update(vert, source)

}

Display.prototype.updateSize = function( size ) {
  
  this.SIZE = size;
  this.createSimulation( this.simShader );

}

Display.prototype.updateRender = function( source ) {
 
  this.fragShader = source; 
  this.createParticles( source );

}

Display.prototype.reset = function( size ){

  this.resetSize = size;

  this.simulation.resetRand( size );

}
