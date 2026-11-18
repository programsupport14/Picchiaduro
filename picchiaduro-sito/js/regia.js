// regia.js: telecamera cinematografica degli Accoppalo (angolo, inclinazione, carrellate, orbite, stacchi) e post-produzione
// (profondità di campo, bloom, vignettatura, grana, colore). Solo grafica. La post-produzione gira soltanto durante gli Accoppalo.
const POST={k:0,rt:null,off:false,focus:0};
function postResize(){if(!POST.rt)return;for(const k of['frame','rtD','rtH','rt','rtB1','rtB2'])POST[k].dispose();POST.rt=null}
function postInit(){if(POST.rt||POST.off)return;try{const w=Math.max(4,cv.width&~3),h=Math.max(4,cv.height&~3),o={depthBuffer:false,type:THREE.UnsignedByteType};
 POST.frame=new THREE.FramebufferTexture(w,h);POST.frame.minFilter=POST.frame.magFilter=THREE.LinearFilter;
 POST.rtD=new THREE.WebGLRenderTarget(w/2,h/2,{type:THREE.UnsignedByteType});POST.rtD.texture.minFilter=POST.rtD.texture.magFilter=THREE.NearestFilter;
 POST.rtH=new THREE.WebGLRenderTarget(w/2,h/2,o);POST.rt=new THREE.WebGLRenderTarget(w/2,h/2,o);POST.rtB1=new THREE.WebGLRenderTarget(w/4,h/4,o);POST.rtB2=new THREE.WebGLRenderTarget(w/4,h/4,o);
 POST.depthMat=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,side:THREE.DoubleSide});
 POST.cam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);POST.scene=new THREE.Scene();POST.quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),null);POST.quad.frustumCulled=false;POST.scene.add(POST.quad);
 const VS='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',mk=(u,fs)=>new THREE.ShaderMaterial({uniforms:u,vertexShader:VS,fragmentShader:fs,depthTest:false,depthWrite:false,toneMapped:false});
 POST.blur=mk({t:{value:null},d:{value:new THREE.Vector2()},thr:{value:0}},`uniform sampler2D t;uniform vec2 d;uniform float thr;varying vec2 vUv;void main(){vec3 c=vec3(0.);float w[5];w[0]=.227;w[1]=.194;w[2]=.122;w[3]=.054;w[4]=.016;
  for(int i=-4;i<=4;i++){vec3 s=texture2D(t,vUv+d*float(i)).rgb;if(thr>0.){float l=max(s.r,max(s.g,s.b));s*=smoothstep(thr,thr+.2,l);}int a=i<0?-i:i;c+=s*w[a];}gl_FragColor=vec4(c,1.);}`);
 POST.fin=mk({tF:{value:POST.frame},tB:{value:POST.rt.texture},tG:{value:POST.rtB2.texture},tD:{value:POST.rtD.texture},uK:{value:0},uFocus:{value:1500},uNear:{value:10},uFar:{value:6000},uTime:{value:0},uBloom:{value:.5},uDof:{value:1}},`uniform sampler2D tF,tB,tG,tD;uniform float uK,uFocus,uNear,uFar,uTime,uBloom,uDof;varying vec2 vUv;
  #include <packing>
  float rnd(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+uTime)*43758.5453);}
  void main(){float vz=-perspectiveDepthToViewZ(unpackRGBAToDepth(texture2D(tD,vUv)),uNear,uFar);float coc=clamp((abs(vz-uFocus)-uFocus*.2)/(uFocus*1.1),0.,1.)*uK*uDof;
   vec2 c=vUv-.5;float r2=dot(c,c);vec2 ab=c*r2*.012*uK;vec3 sh=vec3(texture2D(tF,vUv+ab).r,texture2D(tF,vUv).g,texture2D(tF,vUv-ab).b);
   vec3 col=clamp(mix(sh,texture2D(tB,vUv).rgb,coc*.85)+texture2D(tG,vUv).rgb*uBloom*uK,0.,1.);
   float l=dot(col,vec3(.299,.587,.114));vec3 g=mix(vec3(l),col,1.-.12*uK);g=mix(g,g*g*(3.-2.*g),.4*uK);g+=(vec3(-.025,0.,.035)*(1.-l)+vec3(.035,.012,-.03)*l)*uK;
   g*=1.-uK*.85*smoothstep(.12,.62,r2*1.5);g+=(rnd(vUv*vec2(1920.,1080.))-.5)*.04*uK;gl_FragColor=vec4(clamp(g,0.,1.),1.);}`)}catch(e){console.warn('post-produzione non disponibile',e);POST.off=true}}
const _pv=new THREE.Vector2(0,0);
function postRun(fat){POST.k+=((fat?1:0)-POST.k)*.12;if(POST.k<.02||window.__noPost){POST.k=fat?POST.k:0;return}postInit();if(POST.off||!POST.rt)return;
 const R=renderer,pass=(mat,src,dst,dx,dy,thr)=>{POST.quad.material=mat;if(mat===POST.blur){mat.uniforms.t.value=src;mat.uniforms.d.value.set(dx,dy);mat.uniforms.thr.value=thr||0}R.setRenderTarget(dst);R.render(POST.scene,POST.cam)};
 R.copyFramebufferToTexture(_pv,POST.frame);
 // profondità: seconda passata della scena con un materiale che scrive solo la distanza
 const hid=[];scene.traverse(o=>{if(o.visible&&(o.isPoints||o.isLine||o.isLight&&0||(o.material&&o.material.blending===THREE.AdditiveBlending))){o.visible=false;hid.push(o)}});
 scene.overrideMaterial=POST.depthMat;const sh=R.shadowMap.autoUpdate;R.shadowMap.autoUpdate=false;R.setRenderTarget(POST.rtD);R.setClearColor(0xffffff,1);R.clear();R.render(scene,cam3);scene.overrideMaterial=null;R.shadowMap.autoUpdate=sh;for(const o of hid)o.visible=true;
 const px=1/960,py=1/540;pass(POST.blur,POST.frame,POST.rtH,px*1.6,0);pass(POST.blur,POST.rtH.texture,POST.rt,0,py*1.6);pass(POST.blur,POST.rt.texture,POST.rtH,px*2.6,0);pass(POST.blur,POST.rtH.texture,POST.rt,0,py*2.6);
 pass(POST.blur,POST.frame,POST.rtB1,px*3,0,.8);pass(POST.blur,POST.rtB1.texture,POST.rtB2,0,py*3);pass(POST.blur,POST.rtB2.texture,POST.rtB1,px*5,0);pass(POST.blur,POST.rtB1.texture,POST.rtB2,0,py*5);
 const u=POST.fin.uniforms;u.uK.value=POST.k;u.uFocus.value=POST.focus||1500;u.uNear.value=cam3.near;u.uFar.value=cam3.far;u.uTime.value=(tick%977)*.37;u.uDof.value=cam.dof==null?1:cam.dof;pass(POST.fin,null,null);R.setRenderTarget(null);R.setClearColor(0x000000,1)}
// proiezione di un punto del mondo "2D" (x, y dello schermo di gioco, z) sullo schermo: serve agli effetti disegnati sul canvas quando la telecamera gira
const _pj=new THREE.Vector3(),_pf=new THREE.Vector3();
function PJ(x,y,z){_pj.set(x,GROUND-y,z||0);const dist=_pf.copy(_pj).sub(cam3.position).dot(cam3.getWorldDirection(new THREE.Vector3()));_pj.project(cam3);return{x:(_pj.x*.5+.5)*W,y:(-_pj.y*.5+.5)*H,k:dist>1?(H/2)/(dist*Math.tan(rad(cam3.fov)/2)):0}}
// telecamera degli Accoppalo: posizione da bersaglio, distanza (zoom), angolo, inclinazione; piccola mano libera
function cineCam(sx,sy){const z=cam.z,f=cam.fov||26;if(cam3.fov!==f){cam3.fov=f;cam3.updateProjectionMatrix()}const d=(H/2)/(z*Math.tan(rad(f)/2)),yw=cam.yaw||0,pc=cam.pitch||0,rl=cam.roll||0,t=tick*.05,hx=Math.sin(t*1.3)*2.2+Math.sin(t*2.9)*1.1,hy=Math.cos(t*1.7)*1.8+Math.sin(t*3.3)*.9,tx=cam.x+hx/z,ty=(cam.h==null?330:cam.h)+hy/z;
 cam3.position.set(tx+d*Math.sin(yw)*Math.cos(pc)-sx/z,Math.max(14,ty+d*Math.sin(pc)+sy/z),d*Math.cos(yw)*Math.cos(pc));cam3.up.set(Math.sin(rl),Math.cos(rl),0);cam3.lookAt(tx,ty,0);POST.focus=d;if(!POST.fill){POST.fill=new THREE.DirectionalLight(0xfff0e0,0);scene.add(POST.fill,POST.fill.target)}POST.fill.position.copy(cam3.position).add(_pf.set(0,160,0));POST.fill.target.position.set(tx,ty,0);POST.fill.intensity=((curArena==='rotonda'||curArena==='agip')?1.9:1.1)*Math.min(1,fatT/20)*(1-.6*(typeof stormK!=='undefined'?stormK:0))}
function cineOff(){if(POST.fill)POST.fill.intensity=0;if(cam3.fov!==26){cam3.fov=26;cam3.updateProjectionMatrix()}cam3.up.set(0,1,0);cam.yaw=cam.pitch=cam.roll=0;cam.fov=26}
