module.exports = {

  
  
gravity:`


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


}`

,

simplex:`


#pragma glslify: noise = require( 'glsl-noise/simplex/3d' )
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

  vec3 force = vec3( 0. , 0. , 0. );

  vec3 dif = pos.xyz - centerPos;

  force -= (noise( pos.xyz )+ 1. ) * .1 * length( dif ) * length( dif ) * normalize( dif ) * .01;


  vel += force * dT;

  vec3 p = pos.xyz + vel;


  gl_FragColor = vec4( p , 1. );


}`

,

curl:`


#pragma glslify: noise = require( 'glsl-curl-noise' )
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


  force += noise( pos.xyz  * 4.1)* .001;


  vel += force * dT;

  vec3 p = pos.xyz + vel;


  gl_FragColor = vec4( p , 1. );


}`






}
