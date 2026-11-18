// titoli.js: le scritte 3D da picchiaduro e il logo della schermata iniziale. Ogni lettera è un pezzo a sé che arriva per conto suo.
// Lettere in metallo con sfumatura (oro rovente, acciaio, sangue lucido), bordo nero, pennellata scura dietro, onda d'urto, scintille, gocce.
// Solo grafica, guidata da tick (o dall'orologio del menu): non tocca la logica (l'online resta deterministico).
const TIT={scene:null,cam:null,cur:null,fonts:{},cache:{},parts:[],light:null,lt:-1};
const TSTY={
 'CAFUDDRA!':{font:'ferro',kind:'slam',life:112,y:.28,size:2.05,top:0xfff2b8,bot:0xff3c0a,side:0x3a0a04,hot:.55,crack:.35,spark:0xffa030,snd:'titolo',br1:0x120202,br2:0xd02208,brW:1},
 'FINISCILO!':{font:'ferro',kind:'drop',life:150,y:.36,size:1.5,top:0xffffff,bot:0x5a6676,side:0x14181e,hot:0,crack:.25,glow:0xff2010,spark:0xff3020,snd:'titolo2',br1:0x0a0000,br2:0xa00a08,brW:.8},
 'ACCOPPALO':{font:'ferro',kind:'blood',life:420,y:-.3,size:2.15,top:0xe01a16,bot:0x420004,side:0x100001,crack:.18,glow:0xa00808,blood:1,spark:0x8a0010,snd:'titolo3',br1:0x050000,br2:0x6a0408,brW:1.25},
 'K.O.':{font:'ferro',kind:'ko',life:100,y:.3,size:2.5,top:0xfff2b8,bot:0xff3c0a,side:0x3a0a04,hot:.6,crack:.35,spark:0xffc040,snd:'titolo',br1:0x120202,br2:0xd02208,brW:1.1},
 ROUND:{font:'ferro',kind:'round',life:50,y:.34,size:1.1,top:0xffffff,bot:0x8a8f98,side:0x15171c,hot:0,crack:.2,spark:0xffa030,snd:'titolo2',br1:0x0a0303,br2:0x8a1808,brW:.6},
 LOGO:{font:'ferro',kind:'logo',life:1e12,y:.44,size:2.3,top:0xfff2b8,bot:0xff3c0a,side:0x3a0a04,hot:.6,crack:.35,spark:0xffa030,snd:'titolo',br1:0x0c0101,br2:0xc01c06,brW:1.15}};
if(!window.__FONTS)fetch('font/titoli.json').then(r=>r.ok?r.json():null).then(j=>{if(j)window.__FONTS=j}).catch(()=>{});
const titNow=()=>typeof HOME!=='undefined'&&HOME.open?HOME.t:tick;
function titInit(){if(TIT.scene)return true;if(!window.__FONTS||!THREE.Font||!THREE.TextGeometry)return false;
 for(const k in window.__FONTS)TIT.fonts[k]=new THREE.Font(window.__FONTS[k]);TIT.scene=new THREE.Scene();TIT.cam=new THREE.PerspectiveCamera(30,16/9,.1,300);TIT.cam.position.set(0,0,14);
 try{const pm=new THREE.PMREMGenerator(renderer);TIT.scene.environment=pm.fromScene(new THREE.RoomEnvironment(),.04).texture}catch(e){}
 const key=new THREE.DirectionalLight(0xffffff,2.6);key.position.set(-3,6,8);const rim=new THREE.DirectionalLight(0xff7030,2.4);rim.position.set(4,-4,3);TIT.light=new THREE.PointLight(0xffffff,0,30,1.5);
 TIT.scene.add(key,rim,TIT.light,new THREE.AmbientLight(0xffffff,.35));
 // pennellata dietro la scritta e anello dell'onda d'urto
 TIT.brush=new THREE.Mesh(new THREE.PlaneGeometry(17,5.2),new THREE.ShaderMaterial({transparent:true,depthWrite:false,depthTest:false,toneMapped:false,uniforms:{uA:{value:0},uO:{value:1},uSeed:{value:1},uW:{value:1},uC1:{value:new THREE.Color()},uC2:{value:new THREE.Color()},uT:{value:0}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`uniform float uA,uO,uSeed,uW,uT;uniform vec3 uC1,uC2;varying vec2 vUv;`+TNOISE0()+`
  void main(){vec2 p=vUv-.5;p.x*=3.27;float ax=abs(p.x)/1.55;float n=tf(vec2(p.x*2.6+uSeed,p.y*16.))*.55+tf(vec2(p.x*8.+uSeed,p.y*44.+3.))*.45;
   float w=.25*uW*(1.-ax*ax*.75)*(.7+.6*n),d=abs(p.y+(tn(vec2(p.x*1.7+uSeed,1.))-.5)*.1-p.x*.035);
   float a=smoothstep(w,w*.5,d)*smoothstep(1.02,.86,ax/max(.001,uA))*smoothstep(-.25,.25,n+(1.-ax)*1.5-.55);
   float sp=smoothstep(.72,.8,tf(vUv*vec2(26.,9.)+uSeed))*smoothstep(w*2.4,w*.9,d)*step(ax,uA)*.9;a=max(a,sp);
   vec3 col=mix(uC1,uC2,smoothstep(w*.45,w*.98,d)*(.6+.4*sin(uT*2.+p.x*5.)));gl_FragColor=vec4(col,a*uO);}`}));
 TIT.brush.position.z=-1.3;TIT.brush.renderOrder=-2;TIT.brush.visible=false;TIT.scene.add(TIT.brush);
 TIT.ring=new THREE.Mesh(new THREE.RingGeometry(.93,1,72),new THREE.MeshBasicMaterial({color:0xffd9a0,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false,toneMapped:false,side:THREE.DoubleSide}));TIT.ring.position.z=-.6;TIT.ring.visible=false;TIT.scene.add(TIT.ring);
 return true}
function TNOISE0(){return`float th(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float tn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(th(i),th(i+vec2(1,0)),f.x),mix(th(i+vec2(0,1)),th(i+vec2(1,1)),f.x),f.y);}float tf(vec2 p){return tn(p)*.6+tn(p*2.3+7.)*.28+tn(p*5.1+3.)*.12;}`}
const TNOISE=TNOISE0();
function titMat(s,front){const m=new THREE.MeshStandardMaterial({color:0xffffff,metalness:s.blood?.3:.92,roughness:s.blood?.07:front?.24:.5,transparent:true,envMapIntensity:s.blood?1.4:1.25}),
  U={uT:{value:0},uHot:{value:s.hot||0},uCrack:{value:s.crack||0},uBlood:{value:s.blood||0},uGlow:{value:new THREE.Color(s.glow||0xff5a10)},uSeed:{value:Math.random()*50},uPulse:{value:0},uTop:{value:new THREE.Color(front?s.top:s.side)},uBot:{value:new THREE.Color(front?s.bot:s.side)},uFront:{value:front?1:0}};m.userData.u=U;
 m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vOP;').replace('#include <begin_vertex>','#include <begin_vertex>\nvOP=position;');
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vOP;uniform float uT,uHot,uCrack,uBlood,uSeed,uPulse,uFront;uniform vec3 uGlow,uTop,uBot;float tEm=0.;\n'+TNOISE)
   .replace('#include <map_fragment>',`#include <map_fragment>
   {float gy=smoothstep(-.34,.62,vOP.y);vec3 gc=mix(uBot,uTop,gy*gy*(3.-2.*gy));float band=smoothstep(.02,.0,abs(gy-.52+.06*sin(vOP.x*3.+uSeed)))*.35*uFront*(1.-uBlood);diffuseColor.rgb=gc+band;
    vec2 q=vOP.xy*2.6+uSeed;float n=tf(q),cr=(1.-smoothstep(0.,.03,abs(n-.5)))*uCrack,cr2=(1.-smoothstep(0.,.014,abs(tf(q*2.1+9.)-.5)))*uCrack*.6;
    float gr=tn(vOP.xy*42.)*.3+tn(vOP.xy*9.+4.)*.3;diffuseColor.rgb*=mix(1.,.7+gr,min(1.,uCrack+uBlood*.5));diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.03,.012,.008),max(cr,cr2)*.85);
    float heat=smoothstep(.3,-.34,vOP.y)*(.5+.5*tn(vec2(vOP.x*3.,vOP.y*2.-uT*1.6)));tEm=uHot*(max(cr,cr2*.7)*(1.2+.6*sin(uT*3.+n*20.))+heat*.75)*uFront+uPulse;
    if(uBlood>0.){float d=tn(vec2(vOP.x*7.+uSeed,vOP.y*1.3+uT*.25));diffuseColor.rgb*=.6+.55*d;diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.13,0.,.008),smoothstep(.6,.8,tn(vec2(vOP.x*5.,vOP.y*.8-uT*.12+uSeed))));tEm+=.06*uFront;}}`)
   .replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=uGlow*tEm;')};m.customProgramCacheKey=()=>'tit';return m}
function titBuild(key,text){const ck=key+'|'+text;if(TIT.cache[ck])return TIT.cache[ck];const s=TSTY[key],font=TIT.fonts[s.font],G=new THREE.Group(),L=[],fm=titMat(s,1),sm=titMat(s,0),om=new THREE.MeshBasicMaterial({color:0x0c0202,transparent:true,toneMapped:false}),res=font.data.resolution||1000;let x=0;
 for(const ch of text){const gl=font.data.glyphs[ch]||font.data.glyphs['?'],adv=(gl?gl.ha:500)/res;if(ch!==' '){const g=new THREE.TextGeometry(ch,{font,size:1,height:.5,depth:.5,curveSegments:5,bevelEnabled:true,bevelThickness:.08,bevelSize:.045,bevelSegments:3});g.computeBoundingBox();const b=g.boundingBox,cx=(b.max.x+b.min.x)/2;g.translate(-cx,-.36,-.25);
   const m=new THREE.Mesh(g,[fm,sm]),o=new THREE.Mesh(g,om),w=b.max.x-b.min.x;o.scale.set(1+.12/Math.max(.3,w),1.1,1);o.position.set(0,-.012,-.16);o.renderOrder=-1;m.add(o);G.add(m);L.push({m,x:x+cx,w,r:Math.random()})}x+=adv*1.03}
 for(const l of L)l.x-=x/2;G.userData={L,w:x,mats:[fm,sm,om]};G.visible=false;TIT.scene.add(G);TIT.cache[ck]=G;return G}
// Scritte disegnate (immagini fornite): CAFUDDRA! all'inizio del round, ACCOPPALO! al posto di FINISCILO! (come il "Finish Him").
// Sono elementi HTML sopra il canvas: non pesano sul rendering 3D. A fine mossa finale non compare più nessuna scritta.
const TIMG={'CAFUDDRA!':['cafuddra','go'],'FINISCILO!':['accoppalo','fin']};
function titImg(k,cls){const e=document.getElementById('tit');if(!e)return false;e.className='';e.innerHTML='';if(!k)return true;const im=new Image();im.src='img/'+k+'.webp';im.alt='';im.draggable=false;e.append(im);void e.offsetWidth;e.className=cls;return true}
function title3D(t,life){if(window.__noTit)return false;if(t==='ACCOPPALO'){titClear();return true}if(t==='K.O.'&&document.getElementById('tit'))return titBrush(['K.O.'],'ko',1);if(TIMG[t]&&document.getElementById('tit')){titClear();return titImg(TIMG[t][0],TIMG[t][1])}if(!titInit())return false;const key=TSTY[t]&&t!=='LOGO'?t:/^ROUND /.test(t)?'ROUND':null;if(!key)return false;const s=TSTY[key],G=titBuild(key,t);titClear();TIT.cur={t,G,s,t0:titNow(),life:life||s.life,hit:0};G.visible=true;return true}

// Scritte nello stile di CAFUDDRA! disegnate al volo (K.O. e "<nome> HA VINTO"): pennello corsivo (Knewave), giallo-arancio-rosso, bordo nero ruvido,
// pennellata rossa sotto, schizzi. Diventano un'immagine nel livello #tit come quelle fornite: non pesano sul 3D.
const BRF={ok:0};try{const ff=new FontFace('Knewave','url(font/knewave.woff2)');ff.load().then(f=>{document.fonts.add(f);BRF.ok=1}).catch(()=>{})}catch(e){}
function brushTitle(lines,big){const W=1400,lh=big?380:200,H=Math.max(big?620:460,lines.length*lh+190),cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d'),R=(()=>{let s=7;return()=>(s=(s*16807)%2147483647)/2147483647})();
 const fam=BRF.ok?'Knewave':"'Metal Mania'",fit=(s,px)=>{x.font=`${px}px ${fam}`;const w=x.measureText(s).width;return w>W*.86?px*W*.86/w:px};
 x.translate(W/2,H/2);x.rotate(-.075);x.transform(1,0,-.2,1,0,0);
 const L=lines.map((s,i)=>{const px=fit(s,i===0?(big?420:200):150);return{s,px,y:(i-(lines.length-1)/2)*lh*(i?0.86:1)+(lines.length>1&&i===0?-10:0)}});
 // pennellata sotto (nero, poi rosso-arancio)
 const yb=L[L.length-1].y+L[L.length-1].px*.42,sw=(col,th,ex)=>{x.fillStyle=col;x.beginPath();x.moveTo(-W*.43-ex,yb+th*.3);x.quadraticCurveTo(0,yb-th*1.1,W*.47+ex,yb-th*.9);x.lineTo(W*.47+ex,yb-th*.62);x.quadraticCurveTo(0,yb+th*.35,-W*.43-ex,yb+th*.75);x.closePath();x.fill()};
 sw('#000',62,14);const g0=x.createLinearGradient(-W/2,0,W/2,0);g0.addColorStop(0,'rgba(255,60,10,.0)');g0.addColorStop(.25,'#ff3c0a');g0.addColorStop(1,'#ff7a12');sw(g0,40,0);
 // schizzi
 x.fillStyle='#000';for(let i=0;i<34;i++){const a=R()*6.28,d=W*(.3+R()*.22),r=2+R()*7;x.beginPath();x.arc(Math.cos(a)*d,Math.sin(a)*d*.38,r,0,6.28);x.fill()}
 // bordo nero ruvido: tanti tratti spostati a caso
 x.lineJoin='round';x.textAlign='center';x.textBaseline='middle';
 for(const l of L){x.font=`${l.px}px ${fam}`;x.strokeStyle='#000';for(let k=0;k<7;k++){x.lineWidth=l.px*(.2+R()*.06);x.strokeText(l.s,(R()-.5)*8,l.y+(R()-.5)*8)}x.fillStyle='#000';x.fillText(l.s,4,l.y+10)}
 // riempimento: giallo in alto, arancio, rosso in basso
 for(const l of L){x.font=`${l.px}px ${fam}`;const g=x.createLinearGradient(0,l.y-l.px*.42,0,l.y+l.px*.42);g.addColorStop(0,'#fff27a');g.addColorStop(.3,'#ffc21e');g.addColorStop(.62,'#ff7a12');g.addColorStop(1,'#ff2a08');x.fillStyle=g;x.fillText(l.s,0,l.y);
  x.lineWidth=Math.max(2,l.px*.018);x.strokeStyle='rgba(255,246,190,.55)';x.strokeText(l.s,-2,l.y-3)}
 // grana e graffi scuri dentro le lettere
 x.globalCompositeOperation='source-atop';x.strokeStyle='rgba(60,8,0,.35)';for(let i=0;i<70;i++){x.lineWidth=1+R()*3;const px=(R()-.5)*W*.9,py=(R()-.5)*H*.7,l=20+R()*90;x.beginPath();x.moveTo(px,py);x.lineTo(px+l,py-l*.25);x.stroke()}
 x.globalCompositeOperation='source-over';return cv.toDataURL('image/webp',.92)}
function titBrush(lines,cls,big){if(window.__noTit)return false;const e=document.getElementById('tit');if(!e)return false;titClear();const im=new Image();im.src=brushTitle(lines,big);im.alt='';im.draggable=false;e.append(im);void e.offsetWidth;e.className=cls;if(typeof sfx==='function')sfx('titolo');return true}
function titWin(name){return titBrush([String(name||'').toUpperCase(),'HA VINTO!'],'win')}
// dietro la schermata VS: lettere già costruite e shader già compilati, così CAFUDDRA! non fa scattare il primo fotogramma
function titWarm(){if(window.__noTit||TIT.warm||!titInit())return;TIT.warm=1;try{for(const k of['CAFUDDRA!','FINISCILO!','ACCOPPALO','K.O.'])titBuild(k,k);renderer.compile(TIT.scene,TIT.cam)}catch(e){}for(const k of['cafuddra','accoppalo']){const im=new Image();im.src='img/'+k+'.webp';if(im.decode)im.decode().catch(()=>{})}}
// logo della schermata iniziale: resta finché il menu è aperto
function titLogo(){if(document.getElementById('tit')){const e=document.getElementById('tit');if(e.className!=='logo'){titClear();titImg('cafuddra','logo')}return true}if(!titInit())return false;if(TIT.cur&&TIT.cur.s===TSTY.LOGO)return true;const G=titBuild('LOGO','CAFUDDRA!');titClear();TIT.cur={t:'LOGO',G,s:TSTY.LOGO,t0:titNow(),life:1e12,hit:0};G.visible=true;return true}
function titPart(x,y,z,vx,vy,vz,col,r,l,g){const o=new THREE.Mesh(TIT.pg||(TIT.pg=new THREE.SphereGeometry(1,7,5)),new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:g?2.6:.3,metalness:.2,roughness:.2,transparent:true}));o.scale.setScalar(r);o.position.set(x,y,z);TIT.scene.add(o);TIT.parts.push({o,vx,vy,vz,l,L:l,g:g===2?.0016:g?-.006:-.012,st:!g,r})}
function titBurst(x,y,n,col,glow,sp){for(let i=0;i<n;i++){const an=glow?Math.random()*6.28:Math.PI*(.1+.8*Math.random()),v=(.08+Math.random()*.24)*(sp||1);titPart(x+(Math.random()-.5)*.4,y+(Math.random()-.5)*.5,.4,Math.cos(an)*v*(glow?1:1.5),Math.sin(an)*v+(glow?.04:0),Math.random()*.1,col,.03+Math.random()*.05,(glow?24:50)+Math.random()*26,glow)}}
function titStep(){const C=TIT.cur,now=titNow();if(!C||TIT.lt===now)return;TIT.lt=now;const a=now-C.t0,G=C.G,s=C.s,D=G.userData,L=D.L,n=L.length,sc=Math.min(s.size,(s.kind==='logo'?10.2:11.6)/D.w),e3=x=>1-Math.pow(1-Math.min(1,Math.max(0,x)),3),ein=x=>Math.pow(Math.min(1,Math.max(0,x)),2.4),Y=s.y*4.2,menu=s.kind==='logo';
 if(a>=C.life){titClear();return}let op=a>C.life-16?(C.life-a)/16:1,all=0,pulse=0;const out=a>C.life-16?1-op:0;G.position.set(0,Y,0);G.scale.setScalar(sc);G.rotation.set(-.1,Math.sin(a*.021)*.045,s.kind==='blood'?-.035:0);
 L.forEach((l,i)=>{const m=l.m;let x=l.x,y=0,z=0,rx=0,ry=0,rz=0,k=1,ky=1,vis=true,land=0;
  if(s.kind==='slam'||menu){const d=i*(menu?4:3),u=(a-d)/7,q=1-ein(u);land=d+7;if(u<0)vis=false;z=9.5*q;y=-1.2*q;rz=(l.r-.5)*1.6*q;rx=.9*q;const b=a-land;if(b>=0){k=1+.34*Math.exp(-b/2.6)*Math.cos(b*1.05);rz=(l.r-.5)*.14*Math.exp(-b/7)*Math.cos(b*.8)}all=(n-1)*(menu?4:3)+7;
   if(a>all){const b2=a-all;k*=1+.16*Math.exp(-b2/5)*Math.cos(b2*.7);y+=.035*Math.sin(a*.075+i*.8);if(menu){rz+=.012*Math.sin(a*.05+i);z+=.12*Math.sin(a*.04+i*1.3)}}z+=out*out*(9+l.r*4);x+=out*(l.x)*.9;rz+=out*(l.r-.5)*3;y+=out*out*(l.r-.3)*3}
  else if(s.kind==='drop'){const d=i*2,u=(a-d)/9;land=d+9;if(u<0)vis=false;y=9*(1-ein(u));rx=-2.2*(1-ein(u));const b=a-land;if(b>=0){y=.5*Math.exp(-b/5)*Math.abs(Math.sin(b*.55));rx=.06*Math.sin(a*.05+i);k=1+.2*Math.exp(-b/3)}all=(n-1)*2+9;y-=out*out*6;rz=out*(l.r-.5)*2}
  else if(s.kind==='blood'){const d=i*3,u=(a-d)/6;land=d+6;if(u<0)vis=false;ky=.05+.95*e3(u);k=1.5-.5*e3(u);rz=(l.r-.5)*.5*(1-e3(u))+(l.r-.5)*.09;x+=(1-e3(u))*.6;const b=a-land;if(b>=0){k=1+.22*Math.exp(-b/3)*Math.cos(b*.9);y=.07*Math.sin(a*.06+i*.9);rz=(l.r-.5)*.09+.03*Math.sin(a*.05+i)}all=(n-1)*3+6;y-=out*1.2}
  else if(s.kind==='ko'){const sd=l.x<0?-1:1,u=a/7;land=7;x=l.x+sd*14*(1-ein(u));rz=sd*.8*(1-ein(u));const b=a-7;if(b>=0){k=1+.4*Math.exp(-b/4)*Math.cos(b*.8);x=l.x+sd*.3*Math.exp(-b/5)}all=7;z=out*out*9}
  else{const d=i*1.4,u=(a-d)/7;land=Math.round(d+7);if(u<0)vis=false;x=l.x-16*(1-e3(u));ry=-1.2*(1-e3(u));all=(n-1)*1.4+7;x+=out*out*14}
  m.visible=vis;m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.scale.set(k,k*ky,k);
  if(a===land&&vis){const wx=x*sc,wy=Y+y*sc;if(s.kind!=='round')titBurst(wx,wy-.3*sc,s.blood?12:10,s.spark,!s.blood,s.kind==='ko'?1.8:1.1);if(!menu&&(s.kind==='slam'||s.kind==='drop'||s.kind==='blood')){shake=Math.max(shake,s.kind==='blood'?8:6);if(i%2===0)sfx(s.blood?'taglio':'lettera')}}});
 const A=Math.round(all);if(a===A&&!C.hit){C.hit=1;if(!menu){shake=Math.max(shake,s.kind==='round'?4:s.kind==='blood'?22:20);if(s.kind!=='round')flash=Math.max(flash,s.kind==='ko'?.5:.32)}sfx(s.snd);if(s.kind==='blood'){sfx('risata');titBurst(0,Y-.4,60,s.spark,0,1.5)}else if(s.kind!=='round')titBurst(0,Y,46,s.spark,1,1.7)}
 if(a>=A)pulse=.9*Math.exp(-(a-A)/7);if(s.kind==='drop'&&a>A)pulse+=.18+.14*Math.sin(a*.2);if(menu&&a>A)pulse+=.05+.05*Math.sin(a*.045);
 if(s.blood&&a>A&&a<C.life-30&&a%2===0){const l=L[(Math.random()*n)|0];titPart((l.x+(Math.random()-.5)*l.w*.8)*sc,Y-.44*sc,.2,0,-.004,0,0x8a0010,.035+Math.random()*.045,90,0)}
 if(menu&&a>A&&a%3===0){const l=L[(Math.random()*n)|0];titPart((l.x+(Math.random()-.5)*l.w)*sc,Y-.5*sc+Math.random()*.4,.3+Math.random(),(Math.random()-.5)*.02,.012+Math.random()*.02,0,Math.random()<.5?0xffb040:0xff5a10,.018+Math.random()*.03,70+Math.random()*50,2)}
 // pennellata e onda d'urto
 {const B=TIT.brush,u=B.material.uniforms,st=s.kind==='ko'||s.kind==='round'?0:Math.max(0,A-8),pr=e3((a-st)/(s.kind==='round'?8:11));B.visible=a>=st;B.position.set(0,Y-.02*sc,-1.3);B.scale.set(Math.min(1,D.w*sc/11.6)*1.02,sc/1.85,1);B.rotation.z=s.kind==='blood'?-.035:0;u.uA.value=pr;u.uO.value=op*.92;u.uW.value=s.brW;u.uC1.value.set(s.br1);u.uC2.value.set(s.br2);u.uSeed.value=D.mats[0].userData.u.uSeed.value;u.uT.value=a*.05;
  const R=TIT.ring,b=a-A;R.visible=b>=0&&b<22&&s.kind!=='round';if(R.visible){const rr=.6+b*.62;R.position.set(0,Y,-.6);R.scale.set(rr*1.5,rr,1);R.material.opacity=Math.max(0,1-b/22)*.8;R.material.color.set(s.blood?0xff2020:0xffd9a0)}}
 for(const mt of D.mats){mt.opacity=op;const u=mt.userData.u;if(u){u.uT.value=a*.05;u.uPulse.value=pulse}}
 const sw=((a*.016)%1.9)-.45;TIT.light.position.set((sw*2-1)*D.w*sc*.6,Y+.7,2.4);TIT.light.intensity=a<A?0:46*op;
 for(const p of TIT.parts){p.l--;p.vy+=p.g;p.o.position.x+=p.vx;p.o.position.y+=p.vy;p.o.position.z+=p.vz;if(p.st)p.o.scale.y=Math.min(p.r*4,p.o.scale.y+.005);p.vx*=.96;p.o.material.opacity=Math.min(1,p.l/14)*op}
 TIT.parts=TIT.parts.filter(p=>{if(p.l>0)return true;TIT.scene.remove(p.o);p.o.material.dispose();return false})}
function titRender(){if(!TIT.cur)return;titStep();if(!TIT.cur)return;renderer.autoClear=false;renderer.clearDepth();renderer.render(TIT.scene,TIT.cam);renderer.autoClear=true}
function titClear(){{const e=document.getElementById('tit');if(e&&e.className){e.className='';e.innerHTML=''}}if(TIT.cur){TIT.cur.G.visible=false;TIT.cur=null}if(TIT.brush){TIT.brush.visible=false;TIT.ring.visible=false}for(const p of TIT.parts){TIT.scene.remove(p.o);p.o.material.dispose()}TIT.parts=[]}
