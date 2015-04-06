module.exports = {

  
  
velocityNormal:`

varying vec3 vVel;
void main(){

  gl_FragColor = vec4( normalize( vVel ) * .5 + .5  , 1. );

}`,

accelerationNormal:`

varying vec3 vAcc;
void main(){

  gl_FragColor = vec4( normalize( vAcc ) * .5 + .5  , 1. );

}`,

positionNormal:`

varying vec3 vPos;
void main(){

  gl_FragColor = vec4( normalize( vPos ) * .5 + .5  , 1. );

}`,

basic:`

varying vec3 vVel;
void main(){

  gl_FragColor = vec4( 1. );

}`,


}
