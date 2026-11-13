// gioco.js: logica del combattimento, fatality, disegno, controlli e online. I lottatori sono in lottatori.js.
const W=1280,H=720,AW=1800,BITS={left:1,right:2,up:4,down:8,block:16,jab:32,cross:64,kick:128,special:256,reset:512},GROUND=650,S=.29,SC=1.5,cv=document.getElementById('c'),g=document.getElementById('o').getContext('2d');
const J={root:[338,880],head:[330,262],nS:[135,368],nE:[105,592],nW:[112,812],fS:[462,368],nH:[262,880],nK:[185,1230],nA:[135,1560],fH:[415,880],fK:[420,1220],fA:[440,1548]};
const d2=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]),ang=(a,b)=>Math.atan2(b[1]-a[1],b[0]-a[0]),rad=x=>x*Math.PI/180;
const LEN={ua:d2(J.nS,J.nE),la:d2(J.nE,J.nW),nt:d2(J.nH,J.nK),ns:d2(J.nK,J.nA),ft:d2(J.fH,J.fK),fs:d2(J.fK,J.fA)};
const REST={ua:ang(J.nS,J.nE),la:ang(J.nE,J.nW),nt:ang(J.nH,J.nK),ns:ang(J.nK,J.nA),ft:ang(J.fH,J.fK),fs:ang(J.fK,J.fA)};
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]],rot=(p,a)=>[p[0]*Math.cos(a)-p[1]*Math.sin(a),p[0]*Math.sin(a)+p[1]*Math.cos(a)];
const base={h:532,x:0,t:14,hd:15,tw:38,n:[292,38],f:[262,-82],nl:[-380,0,0],fl:[292,0,0],rot:0,drop:0};
const P=o=>Object.assign({},base,o);
const POSE={
 guard:P({}),
 crouch:P({h:372,t:20,hd:-6,n:[250,-90],f:[190,-90],nl:[-235,0,0],fl:[205,0,0]}),
 air:P({h:640,t:6,nl:[-120,250,10],fl:[170,290,-10],n:[230,-90],f:[200,-80]}),
 block:P({h:520,t:-5,hd:10,n:[285,-250],f:[85,-235],x:-14}),
 crouchBlock:P({h:372,t:12,hd:8,n:[285,-235],f:[85,-225],nl:[-235,0,0],fl:[205,0,0]}),
 hit:P({h:530,t:-20,hd:-16,x:-46,n:[210,10],f:[130,40]}),
 ko1:P({h:560,t:-30,hd:-22,x:-40,n:[-40,250],f:[60,260],rot:-rad(35),drop:30}),
 ko2:P({h:640,t:-6,hd:-10,x:0,n:[-120,380],f:[100,400],nl:[-120,0,8],fl:[70,0,-6],rot:-rad(88),drop:505}),
 win:P({h:672,t:-2,hd:-6,n:[110,-410],f:[140,70],nl:[-130,0,0],fl:[120,0,0]})
};
const MOVES={
 jab:{name:'Pugno rapido',keys:[[3,P({h:540,t:8,tw:-20,f:[100,-80]}),.6],[5,P({h:525,t:18,x:34,tw:-46,f:[455,-55],hd:10}),.75],[10,POSE.guard,.32]],hit:{from:3,to:7,pt:'fW',dmg:6,kb:9}},
 cross:{name:'Pugno pesante',keys:[[8,P({h:545,t:-8,x:-22,tw:-55,n:[110,-55],f:[230,-90]}),.5],[6,P({h:520,t:26,x:68,tw:205,hd:16,n:[446,-65],f:[100,-20],nl:[-400,0,0],fl:[310,0,0]}),.75],[15,POSE.guard,.25]],hit:{from:8,to:13,pt:'nW',dmg:12,kb:15}},
 kick:{name:'Calcio',keys:[[7,P({h:640,t:-8,x:12,nl:[100,310,-22],fl:[130,0,0],n:[240,-40],f:[140,-50]}),.5],[7,P({h:640,t:-27,x:-20,hd:12,nl:[575,505,-58],fl:[105,0,0],n:[170,20],f:[240,-90]}),.72],[14,POSE.guard,.27]],hit:{from:7,to:13,pt:'nA',dmg:11,kb:15}},
 sweep:{name:'Spazzata',keys:[[6,POSE.crouch,.5],[8,P({h:336,t:24,x:-30,hd:-12,nl:[590,12,-40],fl:[-150,0,0],n:[120,110],f:[250,-30]}),.75],[14,POSE.crouch,.27]],hit:{from:6,to:13,pt:'nA',dmg:9,kb:10,low:1}},
 special:{name:'Colpo speciale',keys:[[13,P({h:525,t:-14,x:-20,n:[120,60],f:[-35,75],hd:6}),.42],[6,P({h:525,t:24,x:50,tw:150,n:[446,-90],f:[430,-40],hd:14,nl:[-400,0,0],fl:[310,0,0]}),.75],[18,POSE.guard,.22]],fire:13},
 win:{name:'Vittoria',keys:[[70,POSE.win,.14]],loop:1},
 dizzy:{keys:[[34,P({h:600,t:-10,hd:-14,x:-20,tw:0,n:[60,330],f:[-20,340],nl:[-170,0,0],fl:[130,0,0]}),.08],[34,P({h:585,t:9,hd:12,x:24,tw:0,n:[110,320],f:[30,350],nl:[-170,0,0],fl:[130,0,0]}),.08]],loop:1,stun:1},
 hurt:{keys:[[13,POSE.hit,.6]],stun:1},
 ko:{keys:[[16,POSE.ko1,.22],[999,POSE.ko2,.13]],stun:1,ko:1}
};
const clone=p=>JSON.parse(JSON.stringify(p));
function lerp(a,b,k){const o={};for(const n in b){o[n]=Array.isArray(b[n])?b[n].map((v,i)=>a[n][i]+(v-a[n][i])*k):a[n]+(b[n]-a[n])*k}return o}
function layout(p){const R=J.root,o={};o.torso=rad(p.t);const tw=p.tw;
 o.head=rot(sub(J.head,R),o.torso);let nS=rot(sub(J.nS,R),o.torso);nS[0]+=tw*.9;let fS=rot(sub(J.fS,R),o.torso);fS[0]-=tw*.28;
 o.nS=nS;o.fS=fS;
 const nW=[nS[0]+p.n[0],nS[1]+p.n[1]],fW=[fS[0]+p.f[0],fS[1]+p.f[1]];
 const A=(a,b,s)=>{let dx=b[0]-a[0],dy=b[1]-a[1],D=Math.hypot(dx,dy)||1,l1=s.a,l2=s.b,m=l1+l2-1;if(D>m){b=[a[0]+dx/D*m,a[1]+dy/D*m];dx=b[0]-a[0];dy=b[1]-a[1];D=m}if(D<Math.abs(l1-l2)+1)D=Math.abs(l1-l2)+1;const x=(D*D+l1*l1-l2*l2)/(2*D),y=Math.sqrt(Math.max(0,l1*l1-x*x));return{j:[a[0]+dx/D*x-dy/D*y*s.s,a[1]+dy/D*x+dx/D*y*s.s],e:b}};
 let r=A(nS,nW,{a:LEN.ua,b:LEN.la,s:1});o.nE=r.j;o.nW=r.e;r=A(fS,fW,{a:LEN.ua*.95,b:LEN.la*.95,s:1});o.fE=r.j;o.fW=r.e;
 const nH=sub(J.nH,R),fH=sub(J.fH,R);o.nH=nH;o.fH=fH;
 const foot=l=>[l[0]-p.x,p.h-l[1]];
 r=A(nH,foot(p.nl),{a:LEN.nt,b:LEN.ns,s:-1});o.nK=r.j;o.nA=r.e;r=A(fH,foot(p.fl),{a:LEN.ft,b:LEN.fs,s:-1});o.fK=r.j;o.fA=r.e;return o}
const b2=(s,T)=>{const r=atob(s),u=new Uint8Array(r.length);for(let i=0;i<r.length;i++)u[i]=r.charCodeAt(i);return new T(u.buffer)};
const SCL=249,LEGK=.00116,ANK=.13,YAW=rad(55);let renderer,scene,cam3,sun,hemi,rim,TEX={},headTex=null,heldPiece=null,flyRef=null,MATCH=null;
const v3=(a,b,c)=>new THREE.Vector3(a,b,c),qe=new THREE.Euler(),q1=new THREE.Quaternion();
const AH=new THREE.Quaternion(),AS=new THREE.Quaternion();
function setAbs(b,parentAbs,abs){b.quaternion.copy(parentAbs).invert().multiply(abs);return abs}
function aim(rest,x,y,z,base){const d=v3(x,y,z).normalize();return base.clone().multiply(new THREE.Quaternion().setFromUnitVectors(rest,d))}
const ABS={hips:new THREE.Quaternion(),spine:new THREE.Quaternion(),neck:new THREE.Quaternion(),head:new THREE.Quaternion()};
function pose3D(c){const R=c.rig,M=R.model,p=c.p,L=layout(p),near=c.f>0?'R':'L',far=c.f>0?'L':'R',sN=near==='R'?-1:1,tw=rad(p.tw*.22)*(near==='R'?1:-1);
 R.setVis(!c.gone);R.G.scale.setScalar(SCL*(1+(c.swell||0)));R.G.position.set(c.x,SCL-c.y,0);R.G.rotation.y+=((c.faceCam?c.f*.12:c.f*YAW)-R.G.rotation.y)*(c.faceCam?.07:1);
 const hy=M.ankH+(p.h-p.drop)*LEGK*M.legR;R.setHips(0,hy-1,p.x*LEGK*M.legR);
 AH.setFromEuler(qe.set(p.rot*1,0,0));ABS.hips.copy(AH);
 AS.copy(AH).multiply(q1.setFromEuler(qe.set(rad(p.t),tw,0,'XYZ')));ABS.spine.copy(AS);
 ABS.neck.copy(AS).multiply(q1.setFromEuler(qe.set(rad(p.hd*.5),0,0)));ABS.head.copy(AS).multiply(q1.setFromEuler(qe.set(rad(p.hd),0,0)));
 const arm=(side,S,E,W,sg)=>{const u=sub(E,S),l=sub(W,E);ABS['u'+side]=aim(DIRS['u'+side],sg*.34*LEN.ua,-u[1],u[0],AH);ABS['l'+side]=aim(DIRS['l'+side],sg*.05*LEN.la,-l[1],l[0],AH)};
 arm(near,L.nS,L.nE,L.nW,sN);arm(far,L.fS,L.fE,L.fW,-sN);
 const leg=(side,H,K,A,sg,fa,spread)=>{const u=sub(K,H),l=sub(A,K);ABS['t'+side]=aim(DIRS['t'+side],sg*spread*LEN.nt,-u[1],u[0],AH);ABS['s'+side]=aim(DIRS['s'+side],sg*spread*.55*LEN.ns,-l[1],l[0],AH);ABS['f'+side]=AH.clone().multiply(q1.setFromEuler(qe.set(rad(fa),0,0)))};
 leg(near,L.nH,L.nK,L.nA,sN,p.nl[2],.13);leg(far,L.fH,L.fK,L.fA,-sN,p.fl[2],.13);
 applyPose(R,ABS);R.G.updateMatrixWorld(true);const fl=Math.max(c.flash>3?.3:0,(c.glow||0)*3);for(const m of R.mats)m.emissiveIntensity=fl;
 if(R.head3D){R.m.userData.u.uHide.value=c.noHead?5:-1;R.head.visible=false;return}
 const nw=new THREE.Vector3();R.B.neck.getWorldPosition(nw);const ang=-c.f*rad(p.t*.35+p.hd*.25)+p.rot*c.f*-1;R.head.visible=!c.noHead&&!c.gone;R.head.position.set(nw.x+Math.sin(-ang)*35,nw.y+Math.cos(ang)*35,nw.z+22);R.head.rotation.set(0,0,ang);R.head.scale.x=c.f}
function worldPt(c,q){const p=c.p;const r=rot(q,p.rot);return[c.x+c.f*S*(p.x+r[0]),GROUND+c.y+S*(-p.h+p.drop+r[1])]}
const mk=(x,f,rig,name)=>({x,y:0,vx:0,vy:0,f,rig,name,hp:100,show:100,p:clone(POSE.guard),m:null,t:0,hitDone:false,block:false,flash:0,walk:0,w:0,noHead:false,headOn:false,fpose:null,fk:.3,crouch:false,ko:false,gone:false,cd:0,inp:{}});
let mode='cpu',roundN=1,clock=0,introT=0,roundT=0,finishT=0,winnerC=null,loserC=null,fatT=-1,killer=null,victim=null,decals=[],winT=0,prevB=[0,0],cam={x:900,z:1},p1,p2,fx=[],shots=[],stop=0,shake=0,state='fight',msg='',msgT=0,tick=0,dark=0,demo=null;
function reset(keep){const w=keep?[p1.w,p2.w]:[0,0];roundN=keep?roundN+1:1;p1=mk(650,1,RIG[0],fname(0));p2=mk(1150,-1,RIG[1],fname(1));clearFat();p1.w=w[0];p2.w=w[1];fx=[];shots=[];decals=[];winT=0;fatT=-1;killer=victim=null;clock=99*60;state='intro';introT=85;say('ROUND '+roundN,48);demo=null}
function say(t,d=80){msg=t;msgT=d}
function start(c,id){c.m=id;c.t=0;c.key=0;c.kt=0;c.hitDone=false;c.fired=false}
const WH={jab:1,cross:1,kick:1,sweep:1,special:1};
function busy(c){return c.m&&!MOVES[c.m].loop}
function act(c,id){if(state!=='fight'||c.ko||busy(c)||c.gone)return false;if(id==='kick'&&c.crouch&&c.y===0)id='sweep';if(c.y<0&&id==='sweep')id='kick';start(c,id);sfx('swing');return true}
function spark(x,y,dir,blood){for(let i=0;i<(blood?30:12);i++){const a=Math.random()*6.28,v=2+Math.random()*(blood?11:7);fx.push({x,y,z:(Math.random()-.5)*40,vz:(Math.random()-.5)*2,vx:Math.cos(a)*v+dir*4,vy:Math.sin(a)*v-3,l:24+Math.random()*22,c:blood?'#b90f1c':'#ffd27a',r:blood?1.5+Math.random()*3.5:1.5+Math.random()*2,g:.42,blood,stain:blood})}fx.push({x,y,ring:1,l:9,L:9})}
function damage(t,a,h,at){if(t.ko||t.gone)return;const blocked=t.block&&!h.unblock;const low=h.low&&t.block&&!t.crouch;const real=blocked&&!low;const dmg=real?Math.ceil(h.dmg*.15):h.dmg;t.hp=Math.max(0,t.hp-dmg);t.vx=a.f*(real?h.kb*.4:h.kb);t.flash=7;stop=real?3:6;sfx(real?'block':'hit');shake=real?2:h.dmg*.75;spark(at[0],at[1],a.f,!real);
 if(a.pad!=null){const q=pads().find(x=>x.index===a.pad);if(q&&q.vibrationActuator)try{q.vibrationActuator.playEffect('dual-rumble',{duration:110,strongMagnitude:.7,weakMagnitude:.5}).catch(()=>{})}catch(e){}}
 if(t.hp<=0)endRound(a,t);else if(!real)start(t,'hurt')}
function endRound(w,l){l.ko=true;w.w++;winnerC=w;loserC=l;sfx('ko');if(w.w>=2){state='finish';finishT=430;l.vx=0;start(l,'dizzy');say('FINISCILO!',170)}else{state='roundEnd';roundT=175;l.vx=w.f*15;start(l,'ko');say('K.O.',100)}}
function update(c,o){const i=c.inp;c.flash=Math.max(0,c.flash-1);
 c.block=false;if(state==='fight'&&!c.ko&&!busy(c)){c.f=o.x>=c.x?1:-1;const air=c.y<0;c.crouch=!air&&i.down;c.block=!!i.block&&!air;
  if(!air){c.vx=0;if(!c.crouch&&!c.block){if(i.left)c.vx=-4.4;if(i.right)c.vx=4.4;if(i.left&&c.f>0||i.right&&c.f<0)c.vx*=.72}if(i.up&&!c.block){c.vy=-16.5;c.vx=(i.left?-5.5:i.right?5.5:0)}}}
 else if(c.y===0&&!c.ko)c.vx*=.74;else if(c.ko&&c.y===0)c.vx*=.88;
 c.x+=c.vx;if(c.y<0||c.vy<0){c.vy+=.82;c.y+=c.vy;if(c.y>=0){c.y=0;c.vy=0;c.vx=0}}
 c.x=Math.max(90,Math.min(AW-90,c.x));if(!c.ko&&!o.ko&&!c.gone&&!o.gone)c.x=Math.max(o.x-860,Math.min(o.x+860,c.x));
 let target;
 if(c.m){const M=MOVES[c.m],K=M.keys[c.key];target=K[1];c.k=K[2];c.t++;c.kt++;if(c.kt>=K[0]){if(c.key<M.keys.length-1){c.key++;c.kt=0}else if(!M.loop){if(!M.ko)c.m=null}else{c.kt=0;c.key=0}}
  if(M.hit&&c.m&&!c.hitDone&&c.t>=M.hit.from&&c.t<=M.hit.to){const L=layout(c.p),P=worldPt(c,L[M.hit.pt]),tp=o.y+GROUND-(o.crouch?250:470);if(!o.ko&&!o.gone&&Math.abs(P[0]-o.x)<98&&P[1]>tp-30&&P[1]<GROUND+o.y+10){c.hitDone=true;damage(o,c,M.hit,P)}}
  if(M.fire!=null&&c.t>=M.fire&&!c.fired){c.fired=true;shots.push({x:c.x+c.f*150,y:GROUND-345,vx:c.f*13,o:c,a:0})}
 }
 if(!c.m){c.k=.3;if(c.y<0)target=POSE.air;else if(c.block)target=c.crouch?POSE.crouchBlock:POSE.block;else if(c.crouch)target=POSE.crouch;else if(Math.abs(c.vx)>.5){c.walk+=.2*Math.sign(c.vx)*c.f;const s=Math.sin(c.walk),t=Math.cos(c.walk);target=P({h:530+Math.abs(t)*10,t:15,nl:[-345+s*105,Math.max(0,-t)*46,0],fl:[270-s*105,Math.max(0,t)*46,0]});c.k=.55}
  else{const b=Math.sin(tick*.09+c.x);target=P({h:532+b*7,t:14+b*1.5,n:[292,38+b*6],f:[262,-82+b*7]})}}
 if(c.fpose){target=c.fpose;c.k=c.fk||.3}
 c.p=lerp(c.p,target,c.k);
 c.show+=(c.hp-c.show)*.09}
function pushApart(){if(p1.ko||p2.ko||p1.gone||p2.gone)return;const d=p2.x-p1.x,m=185;if(Math.abs(d)<m&&Math.abs(p1.y-p2.y)<230){const s=(m-Math.abs(d))/2*(d>=0?1:-1);p1.x-=s;p2.x+=s}}
function shotsStep(){for(const s of shots){s.x+=s.vx;s.a+=.3;fx.push({x:s.x-s.vx*.7+(Math.random()-.5)*14,y:s.y+(Math.random()-.5)*16,vx:-s.vx*.08,vy:-.5,l:15,c:'#ff8a2c',r:7*Math.random()+4,g:0,glow:1});const t=s.o===p1?p2:p1;if(!t.ko&&!t.gone&&Math.abs(s.x-t.x)<80&&s.y>GROUND-(t.crouch?250:470)+t.y){damage(t,s.o,{dmg:14,kb:17},[s.x,s.y]);s.dead=1}if(s.x<-40||s.x>AW+40)s.dead=1}shots=shots.filter(s=>!s.dead)}
const FK=['head','half','heart','boom','knife'];
function clearFat(){jets=[];if(!heldHead)return;KNIFE.visible=false;KNIFE.userData.blade.color.set(0xe2e6ea);for(const r of RIG)r.G.rotation.y=0;if(p1)p1.faceCam=p2.faceCam=0;for(const w of WOUND){w.eyes.forEach(e=>e.visible=false);w.mouth.forEach(m=>{m.visible=false;m.geometry.setDrawRange(0,0)})}for(const r of RIG){r.m.userData.u.uMode.value=0}GUT.forEach(m=>m.visible=false);decals=[];heldHead.visible=false;heldSpine.visible=false;for(const r of RIG)for(const q of r.pool||[]){q.P.visible=false;q.r.m.userData.u.uMode.value=0;q.r.cap.visible=false}if(heldPiece){heldHead.add(heldSpine);heldSpine.position.set(0,0,0);heldSpine.rotation.set(0,0,0);heldPiece=null}flyRef=null;pieces=[];ropes=[];flyers=[];HALF.forEach(m=>m.visible=false);flyHead.visible=false;heartM.visible=false;slowN=1;flash=0;chestHole=0;slash=null;cam.shot=null}
window.shot=shot;function shot(x,h,z,snap){cam.shot={x:Math.max(300,Math.min(AW-300,x)),h,z,snap:!!snap}}
function fatal(k,v,kind){state='fatality';say('',0);fatT=0;fatKind=kind||FK[tick%4];killer=k;victim=v;k.m=null;v.m=null;k.f=v.x>k.x?1:-1;v.f=-k.f;k.vx=v.vx=0;v.fpose=clone(MOVES.dizzy.keys[0][1]);v.fk=.2;k.fpose=P({h:575,t:26,hd:18,tw:50,n:[300,-90],f:[420,-110]});k.fk=.3;shot((k.x+v.x)/2,330,1.12);sfx('drone')}
function spawn(v,cfg){const S0=v.rig,it=S0.pool[pieces.length],r=it.r;S0.bones.forEach((b,i)=>{r.bones[i].position.copy(b.position);r.bones[i].quaternion.copy(b.quaternion)});r.G.quaternion.copy(S0.G.quaternion);r.G.scale.copy(S0.G.scale);it.P.position.set(cfg.c[0],cfg.c[1],cfg.c[2]);it.P.rotation.set(0,0,0);it.P.visible=true;r.G.position.copy(S0.G.position).sub(it.P.position);const u=r.m.userData.u;u.uTint.value.copy(S0.m.userData.u.uTint.value);u.uHide.value=-1;if(cfg.cut){u.uMode.value=1;u.uCut.value.set(...cfg.cut);r.cap.visible=true}else{u.uMode.value=2;u.uPart.value=cfg.part}const p=Object.assign({it,ang:0,w:0,vx:0,vy:0,vz:0,rx:0,ry:0,rz:0,floor:26},cfg);pieces.push(p);return p}
function bonePos(v,n){const q=new THREE.Vector3();v.rig.B[n].getWorldPosition(q);return[q.x,q.y,q.z]}
function pieceStep(){for(const p of pieces){const P=p.it.P;if(p.held)continue;if(p.hinge){p.w+=.0016;p.ang=Math.min(1.5,p.ang+p.w);P.rotation.z=-p.side*p.ang;P.position.x+=p.side*.5}else{p.vy-=.95;P.position.x+=p.vx;P.position.y+=p.vy;P.position.z+=p.vz;P.rotation.x+=p.rx;P.rotation.y+=p.ry;P.rotation.z+=p.rz;if(P.position.y<p.floor){P.position.y=p.floor;p.vy*=-.28;p.vx*=.55;p.vz*=.55;p.rx*=.4;p.ry*=.4;p.rz*=.4}}}
 for(const f of flyers){if(f.hinge){const p=f.hinge,a=-p.side*p.ang,c=Math.cos(a),s=Math.sin(a);f.m.position.set(p.it.P.position.x+f.hx*c-f.hy*s,f.hx*s+f.hy*c,f.z);f.m.rotation.z=a+f.r0}else{f.vy-=.95;f.m.position.x+=f.vx;f.m.position.y+=f.vy;f.m.rotation.z+=f.vr;if(f.m.position.y<40){f.m.position.y=40;f.vy*=-.35;f.vx*=.6;f.vr*=.4}}}}
function gushAt(p,n,up,dir){gush(p,n,up,dir||0)}
function jet(o){jets.push(Object.assign({age:0,life:120,rate:6,sp:15,spread:.13,r:2.2},o))}
function jetStep(){for(const j of jets){j.age++;if(j.age>j.life)continue;const k=1-j.age/j.life,pl=.25+.75*Math.pow(Math.max(0,Math.sin(j.age*.32)),2),s=j.src(),a=typeof j.ang==='function'?j.ang():j.ang,n=Math.round(j.rate*pl*Math.sqrt(k)+Math.random()*.6);for(let i=0;i<n;i++){const aa=a+(Math.random()-.5)*j.spread,v=j.sp*(.55+.55*pl)*Math.sqrt(k)*(.85+Math.random()*.3);fx.push({x:s[0]+(Math.random()-.5)*4,y:s[1]+(Math.random()-.5)*4,z:14+Math.random()*10,vz:(Math.random()-.5)*.6,vx:Math.cos(aa)*v,vy:Math.sin(aa)*v,l:90,c:'#a00c18',r:j.r*(.75+Math.random()*.4),g:.5,blood:1,stain:1,jet:1})}}jets=jets.filter(j=>j.age<=j.life)}
function pool(x,R,z=0){decals.push({x,z,r:0,R,c:'#7a0711',slow:1})}
function toScreen(a){return[a[0],GROUND-a[1]]}
function bones(q,n){for(let i=0;i<n;i++){const a=Math.random()*6.28,s=4+Math.random()*15;fx.push({chunk:1,z:(Math.random()-.5)*50,vz:(Math.random()-.5)*4,x:q[0],y:q[1],vx:Math.cos(a)*s,vy:Math.sin(a)*s-8,l:60+Math.random()*30,c:i%3?'#7d0f1b':'#e9dcc6',r:3+Math.random()*5,g:.6,stain:1})}}
const HANG=P({h:672,t:-5,hd:-20,tw:0,n:[40,430],f:[-30,425],nl:[-48,0,14],fl:[42,0,18]});
function gush(q,n,up,dir){for(let i=0;i<n;i++){const a=(Math.random()-.5)*.9,v=up*(.55+Math.random()*.6);fx.push({z:(Math.random()-.5)*30,vz:(Math.random()-.5)*2.5,x:q[0]+(Math.random()-.5)*10,y:q[1],vx:Math.sin(a)*v+dir*Math.random()*2,vy:-Math.cos(a)*v,l:60+Math.random()*40,c:Math.random()<.2?'#6d0a12':'#c8101f',r:1.5+Math.random()*4.5,g:.5,blood:1,stain:1})}}
function fatalStep(){pieceStep();const k=killer,v=victim,T=++fatT,f=k.f;if(fatKind!=='head'){({half:fHalf,heart:fHeart,boom:fBoom,knife:fKnife})[fatKind](T,k,v,f);return}
 if(T===26)shot((k.x+v.x)/2+f*20,430,1.55,1);if(T===62)shot(v.x,400,1.9,1);if(T===104)shot(v.x-f*20,455,2.1,1);if(T===118)slowN=2;if(T===150){slowN=1;shot(v.x-f*90,350,1.25,1)}if(T===236)shot(k.x+f*60,450,1.9,1);
 if(T<=26){k.x+=(v.x-f*345-k.x)*.2}
 if(T===26){k.fk=.5;sfx('thud');shake=12}
 if(T>=26&&T<118){const u=Math.min(1,(T-26)/24);let n=[140,10],tw=0;if(T>=56&&T<104){const c=(T-56)%16;if(c<6){n=[446,-30+((T-56)>>4)*-30];tw=170}else n=[100,20]}if(T>=104){n=[446,-250];tw=135}k.fpose=P({h:600+u*50,t:6-u*18,hd:-8,tw,x:-16,n,f:[300+(1-u)*120,-120-u*210],nl:[-340,0,0],fl:[250,0,0]});k.fk=T>=56?.72:.4;v.fpose=HANG;v.fk=.22;const s=Math.sin(tick*.5)*(T>56?16:6);v.fpose=Object.assign({},HANG,{nl:[-48+s,0,14],fl:[42-s,0,18]});
  const W=worldPt(k,layout(k.p).fW),N=worldPt(v,layout(v.p).head);v.x+=W[0]-N[0]+f*2;v.y=Math.min(0,v.y+W[1]-N[1]+20)}
 if(T===62||T===78||T===94){const L=layout(v.p),q=worldPt(v,[L.head[0]*.5,L.head[1]*.45]);spark(q[0],q[1],f,true);gush(q,18,14,-f);shake=17;v.flash=6;stop=5;sfx('hit');sfx('squish')}
 if(T===118){const q=worldPt(v,layout(v.p).head);v.rig.m.userData.u.uMode.value=1.3;v.rig.m.userData.u.uCut.value.set(1,0,0,-9);pool(v.x,110);v.noHead=true;k.headOn=true;heldSpine.visible=true;if(v.rig.head3D){heldPiece=spawn(v,{c:bonePos(v,v.rig.B.neck?'neck':'head'),part:5,held:1});heldPiece.it.P.add(heldSpine);heldSpine.position.set(0,48,0)}say('ACCOPPALO',420);shake=34;stop=14;sfx('rip');gush(q,40,24,0);v.fpose=null;start(v,'ko');const neck=()=>{const L=layout(v.p);return worldPt(v,[L.head[0]*.86,L.head[1]*.86])},dir=()=>{const L=layout(v.p),a=worldPt(v,[0,0]),b=worldPt(v,L.head);return Math.atan2(b[1]-a[1],b[0]-a[0])};jet({src:neck,ang:dir,life:150,rate:13,sp:17,r:2,spread:.08});jet({src:()=>{const q2=handS(k);return[q2[0],q2[1]-10]},ang:Math.PI/2,life:140,rate:1.4,sp:1.5,spread:.5,r:1.8});v.vy=.1;k.fpose=P({h:650,t:-9,hd:-14,tw:0,x:-10,n:[255,-345],f:[110,70],nl:[-300,0,0],fl:[230,0,0]});k.fk=.2}
 if(T===254){const q=worldPt(k,layout(k.p).nW);k.headOn=false;heldSpine.visible=false;gush([q[0],q[1]-20],90,22,0);shake=26;stop=9;sfx('squish');sfx('hit');for(let i=0;i<22;i++){const a=Math.random()*6.28,s=4+Math.random()*13;fx.push({x:q[0],y:q[1]-20,vx:Math.cos(a)*s,vy:Math.sin(a)*s-8,l:60+Math.random()*30,c:i%3?'#d3a07f':'#efe4d0',r:3+Math.random()*4,g:.6,stain:1})}}
 if(T===320){k.fpose=null;start(k,'win');shot(k.x,330,1.12)}}
function endWin(k){k.fpose=null;start(k,'win');shot(k.x,330,1.12)}
function fHalf(T,k,v,f){if(T<=30)k.x+=(v.x-f*300-k.x)*.2;if(T===1)v.fpose=P({h:640,t:0,hd:4,tw:0,n:[120,330],f:[20,340],nl:[-150,0,0],fl:[120,0,0]});
 if(T===30){k.fpose=P({h:650,t:-14,hd:-6,tw:0,n:[200,-440],f:[110,-400],nl:[-280,0,0],fl:[230,0,0]});k.fk=.2;shot(k.x+f*30,480,1.75,1);sfx('drone')}
 if(T>30&&T<84){const q=worldPt(k,layout(k.p).nW);for(let i=0;i<3;i++)fx.push({x:q[0]+(Math.random()-.5)*26,y:q[1]-Math.random()*60,vx:(Math.random()-.5)*3,vy:-3-Math.random()*5,l:16,c:'#bfe6ff',r:2+Math.random()*4,g:0,glow:1})}
 if(T===84){k.fpose=P({h:470,t:36,hd:18,tw:120,n:[446,170],f:[400,190],nl:[-430,0,0],fl:[330,0,0]});k.fk=.85;shot(v.x,350,1.45,1);slash={x:v.x,l:16,L:16};flash=.85;shake=34;stop=12;sfx('rip');sfx('hit');const u=v.rig.m.userData.u;u.uMode.value=1.3;u.uCut.value.set(1,0,0,0)}
 if(T>90&&T<150){const top=GROUND-660+ (T-90)*0,yy=GROUND-120-Math.random()*520;if(tick%2===0){fx.push({x:v.x+(Math.random()-.5)*6,y:yy,z:22+Math.random()*10,vz:.5,vx:(Math.random()-.5)*1.5,vy:Math.random()*2,l:80,c:'#9e0b18',r:1.5+Math.random()*2.5,g:.35,blood:1,stain:1})}if(T===110||T===132){v.x+=(T===110?2:-2);sfx('squish')}}
 if(T===150){shot(v.x,370,1.7,1);slowN=2;v.gone=true;const c=[v.x,0,0],H0=v.rig.head;[[1,1],[-1,-1]].forEach(([nx,side])=>{spawn(v,{c,cut:[nx,0,0,0],hinge:1,side})});const pr=pieces[0],pl=pieces[1],hp=H0.position;pool(v.x,150);pool(v.x-90,80,30);pool(v.x+90,90,-25);if(!v.rig.head3D)HALF.forEach((m,i)=>{m.visible=true;m.material.map=v.rig.model.headTex;m.material.color.copy(H0.material.color);m.scale.x=v.f;const sd=(i===0?-1:1)*v.f,p=sd>0?pr:pl;flyers.push({m,hinge:p,hx:hp.x-v.x+m.userData.off*v.f,hy:hp.y,z:hp.z,r0:H0.rotation.z})});sfx('squish');ropes.push({a:()=>{const p=pl.it.P,a2=-pl.side*pl.ang;return toScreen([p.position.x+Math.sin(-a2)*300*-1*0+(-Math.sin(a2))*300,Math.cos(a2)*300])},b:()=>{const p=pr.it.P,a2=-pr.side*pr.ang;return toScreen([p.position.x+(-Math.sin(a2))*280,Math.cos(a2)*280])},l:999},{a:()=>{const p=pl.it.P,a2=-pl.side*pl.ang;return toScreen([p.position.x+(-Math.sin(a2))*200,Math.cos(a2)*200])},b:()=>{const p=pr.it.P,a2=-pr.side*pr.ang;return toScreen([p.position.x+(-Math.sin(a2))*220,Math.cos(a2)*220])},l:999},{a:()=>{const p=pl.it.P,a2=-pl.side*pl.ang;return toScreen([p.position.x+(-Math.sin(a2))*140,Math.cos(a2)*140])},b:()=>{const p=pr.it.P,a2=-pr.side*pr.ang;return toScreen([p.position.x+(-Math.sin(a2))*150,Math.cos(a2)*150])},l:999})}
 if(T===152){for(const p of [pieces[0],pieces[1]]){const tp=()=>{const P2=p.it.P,a2=-p.side*p.ang;return toScreen([P2.position.x+(-Math.sin(a2))*560,Math.cos(a2)*560])};jet({src:tp,ang:()=>-Math.PI/2+p.side*(.25+p.ang*.6),life:120,rate:9,sp:13,r:1.9,spread:.09});const md=()=>{const P2=p.it.P,a2=-p.side*p.ang;return toScreen([P2.position.x+(-Math.sin(a2))*300,Math.cos(a2)*300])};jet({src:md,ang:()=>-Math.PI/2+p.side*(.9+p.ang*.5),life:100,rate:6,sp:7,r:1.8,spread:.1})}}
 if(T===215){slowN=1;say('ACCOPPALO',420);shake=22;shot(v.x,300,1.15,1);sfx('thud')}if(T===250)shot(v.x,150,1.05,1);if(T===330){ropes=[];shot(v.x,300,1.15,1)}
 if(T===360)endWin(k)}
function fHeart(T,k,v,f){if(T<=24)k.x+=(v.x-f*290-k.x)*.22;const L=layout(v.p),chest=worldPt(v,[L.head[0]*.6,L.head[1]*.66]);
 if(T===1)k.fpose=P({h:540,t:6,hd:14,tw:-40,n:[60,0],f:[260,-120]});
 if(T===24){k.fpose=P({h:520,t:26,hd:16,tw:190,n:[446,-30],f:[120,-40],nl:[-400,0,0],fl:[310,0,0]});k.fk=.85;shot(chest[0]-f*30,GROUND-chest[1],2.15,1)}
 if(T===30){v.fpose=P({h:640,t:-16,hd:-22,tw:0,x:-6,n:[120,250],f:[60,260],nl:[-130,0,0],fl:[110,0,0]});v.fk=.5;spark(chest[0],chest[1],f,true);gush(chest,50,17,-f);shake=26;stop=9;v.flash=7;sfx('hit');sfx('squish');chestHole=1;const ch=()=>{const l=layout(v.p);return worldPt(v,[l.head[0]*.6,l.head[1]*.66])};jet({src:ch,ang:Math.atan2(-.3,-f),life:75,rate:9,sp:10,r:1.8,spread:.08})}
 if(T===66){sfx('rip');slowN=2;k.fpose=P({h:540,t:-6,hd:6,tw:30,n:[150,-120],f:[210,-100]});k.fk=.16;heartM.visible=true}
 if(T===66)ropes.push({a:()=>handS(k),b:()=>{const l=layout(v.p);return worldPt(v,[l.head[0]*.6,l.head[1]*.66])},l:999});
 if(T===102){ropes=[];pool(v.x,90);gush(chest,30,16,-f);jet({src:()=>{const l=layout(v.p);return worldPt(v,[l.head[0]*.6,l.head[1]*.66])},ang:Math.atan2(-.55,-f),life:110,rate:11,sp:14,r:2,spread:.08});shake=20;slowN=1;sfx('squish')}
 if(T===120){shot(k.x+f*70,440,2,1);k.fpose=P({h:610,t:-10,hd:-10,tw:0,n:[300,-340],f:[120,40],nl:[-310,0,0],fl:[240,0,0]});k.fk=.22;sfx('thud')}
 if(T===200){shot(v.x,250,1.45,1);v.fpose=null;start(v,'ko');sfx('ko')}
 if(T===262){shot((k.x+v.x)/2,350,1.15,1);say('ACCOPPALO',420)}
 if(T===300){const q=handS(k);heartM.visible=false;gush([q[0],q[1]-10],90,20,0);bones([q[0],q[1]-10],10);shake=22;stop=8;sfx('squish')}
 if(heartM.visible){const q=handS(k),b=1+(Math.sin(T*.33)>.6?.2:0);heartM.position.set(q[0]+k.f*8,GROUND-q[1]+40,90);heartM.scale.setScalar(26*b)}
 if(T===370)endWin(k)}
const _w=new THREE.Vector3(),_hq=new THREE.Quaternion();
function knifeTip(k){const s=k.f>0?'R':'L',T=k.rig.handTip(s);return{hand:T.hand,d:T.d,tip:T.hand.clone().addScaledVector(T.d,72)}}
function woundW(v,i){const w=WOUND[RIG.indexOf(v.rig)];const p=new THREE.Vector3();if(i<2)w.eyes[i].getWorldPosition(p);else{const L=w.mouth[0].geometry.parameters.path.getPointAt(Math.min(1,Math.max(0,i-2)));p.copy(L);w.mouth[0].parent.localToWorld(p)}return p}
function aimKnife(k,target,gain=1){const K=knifeTip(k),e=target.clone().sub(K.tip),p=k.fpose;p.n[0]=Math.max(-120,Math.min(455,p.n[0]+k.f*e.x*1.1*gain));p.n[1]=Math.max(-420,Math.min(430,p.n[1]-e.y*1.1*gain));if(p.n[0]>=450&&k.f*e.x>4)k.x+=k.f*Math.min(6,k.f*e.x*.3);if(p.n[0]<=60&&k.f*e.x<-10)k.x+=k.f*Math.max(-6,k.f*e.x*.3);return e.length()}
function fKnife(T,k,v,f){const shot=(x,h,z,sn)=>window.shot(x,v.rig.head3D&&T>=150?Math.max(h,woundW(v,2).y+15):h,z,sn);pose3D(k);pose3D(v);const W=WOUND[RIG.indexOf(v.rig)],G2=q=>[q.x,GROUND-q.y],K=knifeTip(k);KNIFE.visible=true;KNIFE.position.copy(K.hand);KNIFE.quaternion.setFromUnitVectors(_u,K.d);
 const ST=P({h:600,t:4,hd:6,tw:0,x:0,n:[120,-170],f:[300,-150],nl:[-150,0,0],fl:[120,0,0]});
 if(T===1){v.fpose=P({h:640,t:-4,hd:-8,tw:0,n:[60,330],f:[-10,335],nl:[-160,0,0],fl:[130,0,0]});v.fk=.3;k.fpose=P({h:560,t:16,hd:14,tw:40,n:[150,-90],f:[340,-120]});k.fk=.3;shot((k.x+v.x)/2,380,1.2);sfx('block')}
 if(T<=28)k.x+=(v.x-f*235-k.x)*.18;
 if(T===28){k.fpose=Object.assign(ST,{f:[360,-215]});k.fk=.45;shot((k.x+v.x)/2+f*30,440,1.6,1)}
 const stab=(t0,i,deep,cam)=>{const tg=woundW(v,i),pre=tg.clone().add(v3(-f*110,i<2?20:-10,0)),inn=tg.clone().add(v3(f*26,0,0));
  if(T>=t0&&T<t0+14){aimKnife(k,pre,.8);k.fk=.5}
  if(T===t0+14){if(cam)shot(cam[0],cam[1],cam[2],1);sfx('swing')}
  if(T>=t0+14&&T<t0+19){aimKnife(k,inn,1.4);k.fk=.85}
  if(T===t0+18){const q=G2(tg);if(i<2)W.eyes[i].visible=true;stop=deep?9:6;shake=deep?22:15;v.flash=6;sfx('hit');sfx('squish');gush(q,deep?18:12,9,-f);v.fpose=Object.assign(clone(v.fpose),{t:-14,hd:-18,x:-10});v.fk=.5;KNIFE.userData.blade.color.lerp(new THREE.Color(0x9a2028),.45)}
  if(T>=t0+19&&T<t0+30){aimKnife(k,inn,1)}
  if(T===t0+30&&i<2){v.fpose=Object.assign(clone(v.fpose),{t:-6,hd:-10,x:0});v.fk=.2;sfx('squish');const wi=i;jet({src:()=>G2(woundW(v,wi)),ang:Math.atan2(-.15,-f),life:28,rate:5,sp:7,r:1.7,spread:.12});jet({src:()=>G2(woundW(v,wi)),ang:Math.PI/2,life:110,rate:.6,sp:1,r:1.3,spread:.3})}
  if(T>=t0+30&&T<t0+40&&i<2)aimKnife(k,tg.clone().add(v3(-f*90,0,0)),1)};
 stab(40,0,0,[v.x-f*40,430,1.75]);stab(84,1,0,[v.x-f*20,440,2.05]);
 if(T===124){shot(v.x-f*30,420,2.15,1);sfx('drone')}
 if(T===150){k.fpose=Object.assign(clone(ST),{h:500,t:30,hd:16,f:[330,-60]});k.fk=.3;shot(v.x-f*30,320,1.9,1)}
 if(T>=150&&T<174){aimKnife(k,woundW(v,2).add(v3(-f*120,-10,0)),.8)}
 if(T===174)sfx('swing');
 if(T>=174&&T<180){aimKnife(k,woundW(v,2).add(v3(f*28,0,0)),1.4);k.fk=.85}
 if(T===179){stop=10;shake=24;v.flash=6;sfx('hit');sfx('squish');gush(G2(woundW(v,2)),18,10,-f);v.fpose=Object.assign(clone(v.fpose),{t:-20,hd:-24,x:-8,h:615});v.fk=.4;W.mouth.forEach(m=>m.visible=true);slowN=2;KNIFE.userData.blade.color.set(0x7a1018);jet({src:()=>K2(),ang:Math.atan2(-.25,-f),life:60,rate:3,sp:6,r:1.6,spread:.2})}
 const K2=()=>G2(knifeTip(k).tip.clone().add(v3(-f*30,0,0)));
 if(T>=182&&T<240){const s=Math.min(1,(T-182)/52),tg=woundW(v,2+s).add(v3(f*24,0,0));aimKnife(k,tg,1.3);k.fk=.7;const n=W.mouth[0].geometry.index.count;W.mouth.forEach(m=>m.geometry.setDrawRange(0,Math.ceil(m.geometry.index.count*s)));if(T%9===0){sfx('squish');shake=6}if(T%6===0)gush(G2(woundW(v,2+s)),2,5,-f)}
 if(T===240){slowN=1;stop=8;shake=26;sfx('rip');aimKnife(k,woundW(v,2.6).add(v3(-f*170,80,0)),2);gush(G2(woundW(v,3)),30,14,-f);k.fpose=Object.assign(clone(k.fpose),{n:[60,-300],f:[200,-60],h:600,t:-6});k.fk=.35;shot(v.x,400,1.5,1)}
 if(T===262){v.fpose=P({h:640,t:-2,hd:-10,tw:0,x:0,n:[90,330],f:[60,330],nl:[-150,0,0],fl:[120,0,0]});v.fk=.15;v.faceCam=1;k.fpose=Object.assign(clone(k.fpose),{h:600});k.x-=f*120;shot(v.x,300,1.85,1);jet({src:()=>G2(woundW(v,2.3)),ang:Math.PI/2,life:150,rate:.8,sp:1.5,r:1.5,spread:.4});jet({src:()=>G2(woundW(v,2.75)),ang:Math.PI/2,life:150,rate:.8,sp:1.5,r:1.5,spread:.4});sfx('drone')}
 if(T>262&&T<330){v.x-=f*.15}if(T===300)shot(v.x,310,2.05);if(T===326)say('ACCOPPALO',420);
 if(T===340){v.faceCam=0;v.fpose=null;start(v,'ko');sfx('ko');shot((k.x+v.x)/2,330,1.12,1)}
 if(T===410){KNIFE.visible=false;endWin(k)}}
function handS(k){return worldPt(k,layout(k.p).nW)}
function fBoom(T,k,v,f){if(T<=24)k.x+=(v.x-f*560-k.x)*.15;if(T===1){k.fpose=P({h:575,t:12,hd:12,tw:0,n:[440,-130],f:[420,-60]});v.fpose=P({h:640,t:-4,hd:-16,tw:0,n:[230,-140],f:[-60,-130],nl:[-190,0,0],fl:[150,0,0]});v.fk=.25}
 if(T===24){shot(v.x,380,1.7,1);sfx('drone')}if(T===60)shot(v.x,445,2.3,1);
 if(T>10&&T<110){const u=(T-10)/100;v.x+=Math.sin(T*2.1)*(1+u*7);v.glow=u*.16*(.6+.4*Math.sin(T*.9));v.swell=u*u*.13;if(tick%2===0){const q=handS(k);fx.push({x:q[0],y:q[1],vx:(v.x-q[0])/14+(Math.random()-.5)*5,vy:(Math.random()-.5)*7-1,l:14,c:'#ffb648',r:3+Math.random()*5,g:0,glow:1})}}
 if(T===110){flash=1;slowN=2;shake=44;stop=7;sfx('ko');sfx('rip');sfx('hit');shot(v.x,330,1.08,1);const hp=v.rig.head.position.clone(),mk0=(n,part,s)=>{const c=bonePos(v,n);spawn(v,{c,part,vx:s[0],vy:s[1],vz:s[2],rx:(Math.random()-.5)*.35,ry:(Math.random()-.5)*.35,rz:(Math.random()-.5)*.45})};mk0('spine',0,[(Math.random()-.5)*5,22,-3]);mk0('lL',2,[15,28,6]);mk0('lR',1,[-15,26,8]);mk0('sL',4,[12,18,-5]);mk0('sR',3,[-13,20,5]);v.gone=true;if(v.rig.head3D){flyRef=spawn(v,{c:bonePos(v,'head'),part:5,vx:-f*11,vy:34,vz:4,rx:.06,ry:.12,rz:f*.18}).it.P}else{flyRef=flyHead;flyHead.visible=true;flyHead.material.map=v.rig.model.headTex;flyHead.position.copy(hp);flyHead.scale.x=v.f;flyHead.rotation.z=0;flyHead.material.color.copy(v.rig.head.material.color);flyers.push({m:flyHead,vx:-f*11,vy:34,vr:f*.18})}const q=[v.x,GROUND-300];gush(q,170,34,0);bones(q,50);pool(v.x,170);say('ACCOPPALO',420)}
 if(T===170)slowN=1;
 if(T===220)shot((flyRef||flyHead).position.x,120,1.9,1);
 if(T===300)endWin(k)}

function applyBits(B){if((B[0]|B[1])&BITS.reset&&!((prevB[0]|prevB[1])&BITS.reset)){prevB=B.slice();reset();return}[p1,p2].forEach((c,i)=>{const b=B[i],p=prevB[i];c.inp={left:b&1,right:b&2,up:b&4,down:b&8,block:b&16};for(const id of['jab','cross','kick','special'])if(b&BITS[id]&&!(p&BITS[id]))press(c,id)});prevB=B.slice()}
function step(B){tick++;flash*=.86;if(slash&&--slash.l<=0)slash=null;if(state==='fatality'&&slowN>1&&tick%slowN&&!(B&&(B[0]|B[1])&BITS.reset))return;if(demo)demoStep();else applyBits(B||[0,0]);if(state==='intro'){if(--introT===34)say('COMBATTI',40);if(introT<=0)state='fight'}if(state==='fight'&&--clock<=0){const l=p1.hp<p2.hp?p1:p2;endRound(l===p1?p2:p1,l)}if(state==='roundEnd'){if(--roundT===75&&!winnerC.ko){start(winnerC,'win')}if(roundT<=0){reset(true);return}}if(state==='finish'&&--finishT<=0){state='over';start(loserC,'ko');start(winnerC,'win');say('',0)}if(state==='fatality')fatalStep();if(stop>0){stop--;fx=fx.filter(f=>f.ring||f.l>0);return}
 update(p1,p2);update(p2,p1);pushApart();
 shotsStep();
 for(const f of fx){f.l--;if(!f.ring){f.vy+=f.g||0;f.x+=f.vx;f.y+=f.vy;if(f.z!=null)f.z+=f.vz||0;if(f.stain&&f.y>GROUND-1){if(f.blood||Math.random()<.5)decals.push({x:f.x,z:f.z||0,r:0,R:f.r*(2.2+Math.random()*1.6),c:f.c});if(decals.length>480)decals.shift();f.l=0}}}
 jetStep();fx=fx.filter(f=>f.l>0);for(const d2 of decals)if(d2.r<d2.R)d2.r+=(d2.R-d2.r)*(d2.slow?.025:.2);
 if(msgT>0)msgT--;shake*=.86;if(dark>0&&state!=='fatality')dark*=.9}
let ARENAS={},curArena='monument',KNIFE=null,WOUND=[],BLOB=null,blobScene=null,bloodRT=null,compScene=null,ortho=null,jets=[],DEC=null,GUT=[],capTex=null,RIG=[],heldHead=null,POOL=[],HALF=[],heartM=null,flyHead=null,heldSpine=null,pieces=[],ropes=[],fatKind='head',slowN=1,flash=0,chestHole=0,slash=null,flyers=[];
function pruneFaces(R){const GEO=R.model.GEO,m=R.mesh,idx=GEO.index.array,VP=GEO.attributes.position.array,n=VP.length/3,bad=new Uint8Array(idx.length/3),mk=p=>({p,f:1,x:0,y:0,rig:R,flash:0,noHead:true,gone:false});const poses=[P({}),...['jab','cross','kick','sweep','special'].flatMap(k=>MOVES[k].keys.slice(0,2).map(q=>q[1]))];const cur=new Float32Array(n*3),v=new THREE.Vector3();
 for(const face of[1,-1])for(const p of poses){const c=mk(p);c.f=face;pose3D(c);R.G.updateMatrixWorld(true);m.skeleton.update();for(let i=0;i<n;i++){m.getVertexPosition(i,v);cur[i*3]=v.x;cur[i*3+1]=v.y;cur[i*3+2]=v.z}for(let t=0;t<bad.length;t++){if(bad[t])continue;const a=idx[t*3],b=idx[t*3+1],d=idx[t*3+2];for(const[u,w]of[[a,b],[b,d],[d,a]]){const r=Math.hypot(VP[u*3]-VP[w*3],VP[u*3+1]-VP[w*3+1],VP[u*3+2]-VP[w*3+2]),q=Math.hypot(cur[u*3]-cur[w*3],cur[u*3+1]-cur[w*3+1],cur[u*3+2]-cur[w*3+2]);if(q>r*2.4+.012){bad[t]=1;break}}}}
 const out=[];for(let t=0;t<bad.length;t++)if(!bad[t])out.push(idx[t*3],idx[t*3+1],idx[t*3+2]);GEO.setIndex(new THREE.BufferAttribute(new Uint32Array(out),1));window.__pruned=bad.reduce((a,b)=>a+b,0)}
function fleshTex(){return canvasTex(512,1024,b=>{const W2=512,H2=1024,Y=y=>(.70-y)/.81*H2,U=u=>u*W2,rr=(a=>()=>(a=(a*16807)%2147483647)/2147483647)(5);
 let g2=b.createLinearGradient(0,0,W2,0);g2.addColorStop(0,'#5e0710');g2.addColorStop(.5,'#9b1424');g2.addColorStop(1,'#6b0a14');b.fillStyle=g2;b.fillRect(0,0,W2,H2);
 b.strokeStyle='rgba(40,0,6,.35)';b.lineWidth=2;for(let i=0;i<260;i++){const x=rr()*W2,y=rr()*H2;b.beginPath();b.moveTo(x,y);b.lineTo(x+(rr()-.5)*30,y+20+rr()*30);b.stroke()}
 const ell=(u,y,rx,ry,c,s)=>{b.fillStyle=c;b.beginPath();b.ellipse(U(u),Y(y),rx,ry,0,0,7);b.fill();if(s){b.strokeStyle=s;b.lineWidth=3;b.stroke()}};
 // lungs
 for(let i=0;i<500;i++){const u=.32+rr()*.46,y=.25+rr()*.3;ell(u,y,5+rr()*9,5+rr()*9,rr()<.5?'#c86c7c':'#b25566')}
 // heart
 b.fillStyle='#4f040b';b.beginPath();b.ellipse(U(.66),Y(.37),70,62,.3,0,7);b.fill();b.fillStyle='#7c0b16';b.beginPath();b.ellipse(U(.64),Y(.38),38,30,.3,0,7);b.fill();
 // diaphragm
 b.fillStyle='#8a1220';b.fillRect(U(.25),Y(.215),U(.68),18);
 // intestines
 b.lineCap='round';for(let k=0;k<26;k++){let x=U(.32+rr()*.5),y=Y(-.08+rr()*.26);b.strokeStyle=k%3?'#d88a8f':'#c46f78';b.lineWidth=20;b.beginPath();b.moveTo(x,y);for(let s=0;s<5;s++){x+=(rr()-.5)*70;y+=(rr()-.5)*60;b.lineTo(Math.max(U(.3),Math.min(U(.86),x)),Math.max(Y(.19),Math.min(Y(-.1),y)))}b.stroke();b.strokeStyle='rgba(90,10,20,.5)';b.lineWidth=3;b.stroke()}
 // liver
 b.fillStyle='#5a1414';b.beginPath();b.ellipse(U(.6),Y(.17),95,34,0,0,7);b.fill();
 // fat + skin + cloth rim
 for(const[u0,u1]of[[0,.075],[.925,1]]){b.fillStyle='#e7c06f';b.fillRect(U(u0),0,U(u1-u0),H2);b.fillStyle='rgba(180,120,40,.5)';for(let i=0;i<120;i++)b.fillRect(U(u0+rr()*(u1-u0)),rr()*H2,4,4)}
 b.fillStyle='#d9a582';b.fillRect(0,0,U(.022),H2);b.fillRect(U(.978),0,U(.022),H2);b.fillStyle='#101012';b.fillRect(0,0,U(.01),H2);b.fillRect(U(.99),0,U(.01),H2);
 // ribs
 for(let i=0;i<8;i++){const y=.52-i*.04;ell(.2,y,13,8,'#efe4cc','#b9a888');ell(.87,y-.01,12,8,'#efe4cc','#b9a888')}
 b.fillStyle='#efe4cc';b.fillRect(U(.9),Y(.55),18,Y(.28)-Y(.55));
 // spine
 for(let y=-.06;y<.66;y+=.032){b.fillStyle='#efe4cc';b.fillRect(U(.11),Y(y)-22,U(.15),22);b.strokeStyle='#a99878';b.lineWidth=2;b.strokeRect(U(.11),Y(y)-22,U(.15),22);b.fillStyle='#c4475a';b.fillRect(U(.11),Y(y),U(.15),6)}
 b.fillStyle='#f3ddb0';b.fillRect(U(.165),Y(.66),U(.04),Y(-.06)-Y(.66));
 // trachea
 b.fillStyle='#e6c9c0';b.fillRect(U(.55),Y(.70),40,Y(.5)-Y(.70));b.fillStyle='#3a0a10';b.fillRect(U(.55)+10,Y(.70),20,Y(.5)-Y(.70));
 // wet highlights
 for(let i=0;i<160;i++){b.fillStyle=`rgba(255,220,220,${rr()*.25})`;b.beginPath();b.ellipse(rr()*W2,rr()*H2,2+rr()*5,1+rr()*2,rr()*3,0,7);b.fill()}})}
function canvasTex(w,h,f){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'));const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t}
function buildBG(){scene=new THREE.Scene();scene.fog=new THREE.Fog(0xd77a44,1500,3200);renderer=new THREE.WebGLRenderer({canvas:cv,antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});renderer.setSize(1920,1080,false);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;cam3=new THREE.PerspectiveCamera(26,16/9,10,6000);
 const rnd=(a=>()=>(a=(a*16807)%2147483647)/2147483647)(77);
 const skyT=canvasTex(1024,512,b=>{const s=b.createLinearGradient(0,0,0,512);s.addColorStop(0,'#2c1233');s.addColorStop(.45,'#a93636');s.addColorStop(.78,'#ef953d');s.addColorStop(1,'#ffdf98');b.fillStyle=s;b.fillRect(0,0,1024,512);const q=b.createRadialGradient(512,410,10,512,410,330);q.addColorStop(0,'rgba(255,240,190,1)');q.addColorStop(.16,'rgba(255,220,140,.75)');q.addColorStop(1,'rgba(255,190,100,0)');b.fillStyle=q;b.fillRect(0,0,1024,512)});
 const skyM=new THREE.Mesh(new THREE.PlaneGeometry(9000,3400),new THREE.MeshBasicMaterial({map:skyT,toneMapped:false,fog:false}));skyM.position.set(900,900,-2600);scene.add(skyM);
 const mtnT=canvasTex(2048,400,b=>{b.clearRect(0,0,2048,400);for(const[c,h,v]of[['#a44c3a',230,110],['#6e2a26',150,70]]){b.fillStyle=c;b.beginPath();b.moveTo(0,400);for(let x=0;x<=2048;x+=44)b.lineTo(x,400-h-rnd()*v-Math.sin(x*.005)*30);b.lineTo(2048,400);b.fill()}});
 const mtnM=new THREE.Mesh(new THREE.PlaneGeometry(6200,1000),new THREE.MeshBasicMaterial({map:mtnT,transparent:true,toneMapped:false,fog:false}));mtnM.position.set(900,420,-2300);scene.add(mtnM);
 const floorT=canvasTex(1024,1024,b=>{b.fillStyle='#9a6d4b';b.fillRect(0,0,1024,1024);for(let i=0;i<9000;i++){b.fillStyle=`rgba(${rnd()<.5?'30,14,8':'255,214,170'},${rnd()*.06})`;b.fillRect(rnd()*1024,rnd()*1024,rnd()*24+1,rnd()*24+1)}b.strokeStyle='rgba(28,12,7,.65)';b.lineWidth=5;for(let i=0;i<=4;i++){b.beginPath();b.moveTo(0,i*256);b.lineTo(1024,i*256);b.stroke();for(let k=0;k<4;k++){const x=(k*256+(i%2?128:0))%1024;b.beginPath();b.moveTo(x,i*256);b.lineTo(x,i*256+256);b.stroke()}}});floorT.wrapS=floorT.wrapT=THREE.RepeatWrapping;floorT.repeat.set(18,12);
 const fl=new THREE.Mesh(new THREE.PlaneGeometry(5400,3600),new THREE.MeshStandardMaterial({map:floorT,roughness:.96,metalness:0}));fl.rotation.x=-Math.PI/2;fl.position.set(900,0,-400);fl.receiveShadow=true;scene.add(fl);
 const stone=new THREE.MeshStandardMaterial({color:0xb37a55,roughness:.92}),dark=new THREE.MeshStandardMaterial({color:0x8d5b41,roughness:.95});
 const temple=(ox,z,n)=>{const G=new THREE.Group();for(let i=0;i<n;i++){const c=new THREE.Mesh(new THREE.CylinderGeometry(50,62,620,20),stone);c.position.set(i*250,310,0);c.castShadow=true;c.receiveShadow=true;G.add(c);const cap=new THREE.Mesh(new THREE.BoxGeometry(150,34,150),dark);cap.position.set(i*250,637,0);G.add(cap)}const beam=new THREE.Mesh(new THREE.BoxGeometry((n-1)*250+220,84,180),dark);beam.position.set((n-1)*125,696,0);G.add(beam);const sh=new THREE.Shape();const wd=((n-1)*250+250)/2;sh.moveTo(-wd,0);sh.lineTo(wd,0);sh.lineTo(0,170);sh.lineTo(-wd,0);const pd=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:170,bevelEnabled:false}),stone);pd.position.set((n-1)*125,738,-85);G.add(pd);G.position.set(ox,0,z);scene.add(G)};
 temple(-150,-720,5);temple(1330,-720,5);temple(620,-1500,4);
 ARENAS.temple=new THREE.Group();for(const o of scene.children.slice())ARENAS.temple.add(o);scene.add(ARENAS.temple);
 hemi=new THREE.HemisphereLight(0xffd9b0,0x3a241a,1.15);scene.add(hemi);
 sun=new THREE.DirectionalLight(0xffe2bd,2.5);sun.position.set(620,1050,900);sun.target.position.set(900,100,0);scene.add(sun,sun.target);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-1200,right:1200,top:900,bottom:-500,near:100,far:3000});sun.shadow.bias=-.0006;sun.shadow.radius=5;
 rim=new THREE.DirectionalLight(0xff8a3a,3);rim.position.set(900,420,-1400);rim.target.position.set(900,200,0);scene.add(rim,rim.target);
 capTex=fleshTex();capMat=new THREE.MeshStandardMaterial({map:capTex,roughness:.28,metalness:.05,side:THREE.DoubleSide,emissive:0x2a0004,emissiveIntensity:.35});
 const sg=new THREE.SphereGeometry(1,8,6);BLD=new THREE.InstancedMesh(sg,new THREE.MeshStandardMaterial({roughness:.18,metalness:.1}),1600);BLD.count=0;BLD.frustumCulled=false;BLD.castShadow=true;scene.add(BLD);
 blobScene=new THREE.Scene();bloodRT=new THREE.WebGLRenderTarget(960,540,{type:THREE.HalfFloatType,depthBuffer:false});
 BLOB=new THREE.InstancedMesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending,vertexShader:`varying vec2 vU;void main(){vU=uv*2.-1.;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 vU;void main(){float r=dot(vU,vU);if(r>1.)discard;float f=1.-r;gl_FragColor=vec4(f*f,0.,0.,1.);}`}),2400);BLOB.count=0;BLOB.frustumCulled=false;blobScene.add(BLOB);
 ortho=new THREE.OrthographicCamera(-1,1,1,-1,0,1);compScene=new THREE.Scene();compScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({transparent:true,depthTest:false,depthWrite:false,uniforms:{T:{value:bloodRT.texture},px:{value:new THREE.Vector2(1/960,1/540)}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
 fragmentShader:`uniform sampler2D T;uniform vec2 px;varying vec2 vUv;void main(){float c=texture2D(T,vUv).r;float a=smoothstep(.26,.55,c);if(a<.01)discard;float l=texture2D(T,vUv-vec2(px.x,0.)).r,r=texture2D(T,vUv+vec2(px.x,0.)).r,d=texture2D(T,vUv-vec2(0.,px.y)).r,u=texture2D(T,vUv+vec2(0.,px.y)).r;vec3 n=normalize(vec3((l-r)*3.2,(d-u)*3.2,1.));float th=clamp((c-.5)/2.2,0.,1.);vec3 base=mix(vec3(.62,.035,.06),vec3(.26,.0,.02),th);vec3 L=normalize(vec3(-.45,.6,.66));float dif=.5+.5*max(dot(n,L),0.);vec3 h=normalize(L+vec3(0.,0.,1.));float sp=pow(max(dot(n,h),0.),55.)*1.1+pow(max(dot(n,h),0.),8.)*.08;vec3 col=base*dif+vec3(1.,.82,.82)*sp;col*=mix(.7,1.,smoothstep(.32,.8,c));gl_FragColor=vec4(col,a);}`})));
 const dg=new THREE.CircleGeometry(1,18);dg.rotateX(-Math.PI/2);DEC=new THREE.InstancedMesh(dg,new THREE.MeshLambertMaterial({polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),500);{const c0=new THREE.Color(0x6a0610);for(let i=0;i<500;i++)DEC.setColorAt(i,c0);const c1=new THREE.Color(0xb90f1c);for(let i=0;i<1600;i++)BLD.setColorAt(i,c1)}DEC.count=0;DEC.frustumCulled=false;DEC.receiveShadow=true;scene.add(DEC);
 GUT=[0,1,2].map(()=>{const m=new THREE.Mesh(new THREE.BufferGeometry(),new THREE.MeshStandardMaterial({color:0xb84a58,roughness:.22,metalness:.05,emissive:0x2a0308,emissiveIntensity:.4}));m.visible=false;m.castShadow=true;scene.add(m);return m});
 HALF=[[0,.58],[.58,1]].map(([a,b])=>{const w=553*.145,h=700*.145,G=new THREE.PlaneGeometry((b-a)*w,h),uv=G.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,a+uv.getX(i)*(b-a));uv.needsUpdate=true;const m=new THREE.Mesh(G,new THREE.MeshBasicMaterial({map:headTex,transparent:true,alphaTest:.04,toneMapped:false}));m.visible=false;scene.add(m);m.userData.off=((a+b)/2-.5)*w;return m});
 heartM=new THREE.Group();const hmat=new THREE.MeshStandardMaterial({color:0x8c0f1c,roughness:.35,emissive:0x3a0208});[[-.42,.34,.72],[.42,.34,.72],[0,-.12,.86]].forEach(([x,y,s])=>{const q=new THREE.Mesh(new THREE.SphereGeometry(1,20,16),hmat);q.position.set(x,y,0);q.scale.set(s,s*(y<0?1.25:1),s);heartM.add(q)});heartM.visible=false;scene.add(heartM);
 flyHead=new THREE.Mesh(new THREE.PlaneGeometry(553*.145,700*.145),new THREE.MeshBasicMaterial({map:headTex,transparent:true,alphaTest:.04,toneMapped:false}));flyHead.visible=false;scene.add(flyHead);
 {const sh=new THREE.Shape();sh.moveTo(-5,0);sh.lineTo(5,0);sh.lineTo(4,40);sh.quadraticCurveTo(2,58,0,66);sh.lineTo(-5,8);sh.lineTo(-5,0);const bl=new THREE.Mesh(new THREE.ExtrudeGeometry(sh,{depth:1.2,bevelEnabled:true,bevelSize:.8,bevelThickness:.6,bevelSegments:1}),new THREE.MeshStandardMaterial({color:0xe2e6ea,metalness:.92,roughness:.18}));bl.position.set(0,10,-.6);const gd=new THREE.Mesh(new THREE.BoxGeometry(18,3,5),new THREE.MeshStandardMaterial({color:0x2b2b2e,metalness:.7,roughness:.35}));gd.position.y=9;const hd=new THREE.Mesh(new THREE.CylinderGeometry(3.4,3.8,26,10),new THREE.MeshStandardMaterial({color:0x1d1410,roughness:.6}));hd.position.y=-5;KNIFE=new THREE.Group();KNIFE.add(bl,gd,hd);KNIFE.userData.blade=bl.material;KNIFE.visible=false;KNIFE.castShadow=true;scene.add(KNIFE)}
 heldHead=new THREE.Mesh(new THREE.PlaneGeometry(553*.145,700*.145),new THREE.MeshBasicMaterial({map:headTex,transparent:true,alphaTest:.04,toneMapped:false}));heldHead.visible=false;scene.add(heldHead);heldSpine=new THREE.Group();const bm=new THREE.MeshStandardMaterial({color:0xe4d6bd,roughness:.6}),rm=new THREE.MeshStandardMaterial({color:0x8d1220,roughness:.4});for(let i=0;i<11;i++){const v=new THREE.Mesh(new THREE.BoxGeometry(15-i*.4,11,13),bm);v.position.set(Math.sin(i*.6)*7,-50-i*16,0);v.userData.i=i;heldSpine.add(v);const d=new THREE.Mesh(new THREE.CylinderGeometry(6.5,6.5,5,10),rm);d.position.set(Math.sin((i+.5)*.6)*7,-58-i*16,0);heldSpine.add(d)}heldSpine.visible=false;heldHead.add(heldSpine)}
function buildMonument(bt){const G=new THREE.Group(),Hp=1700,Wp=Hp*bt.image.width/bt.image.height,row=850/941;const bd=new THREE.Mesh(new THREE.PlaneGeometry(Wp,Hp),new THREE.MeshBasicMaterial({map:bt,toneMapped:false,fog:false}));const yFeet=-260;bd.position.set(900,yFeet-(1-row)*Hp+Hp/2,-1400);G.add(bd);
  const sf=new THREE.Mesh(new THREE.PlaneGeometry(4200,900),new THREE.ShadowMaterial({opacity:.5,color:0x1a0c06}));sf.rotation.x=-Math.PI/2;sf.position.set(900,0,0);sf.receiveShadow=true;G.add(sf);
  const sheen=new THREE.Mesh(new THREE.PlaneGeometry(4200,900),new THREE.MeshBasicMaterial({color:0xffc070,transparent:true,opacity:.06,blending:THREE.AdditiveBlending,depthWrite:false}));sheen.rotation.x=-Math.PI/2;sheen.position.set(900,.3,0);G.add(sheen);G.visible=false;scene.add(G);ARENAS.monument=G}
function camera(){const fat=state==='fatality';if(fat&&cam.shot){const s=cam.shot,ty=H/2-GROUND+s.z*s.h;if(s.snap){cam.x=s.x;cam.z=s.z;cam.y=ty;s.snap=false}else{cam.x+=(s.x-cam.x)*.1;cam.z+=(s.z-cam.z)*.08;cam.y=(cam.y||0)+(ty-(cam.y||0))*.08}return}let d=Math.abs(p1.x-p2.x),z=fat?1.1:Math.max(.74,Math.min(1.16,1000/(d+620))),x=(p1.x+p2.x)/2;const hw=W/2/z;x=Math.max(hw,Math.min(AW-hw,x));cam.x+=(x-cam.x)*.12;cam.z+=(z-cam.z)*.08;cam.y=(cam.y||0)+((fat?26:0)-(cam.y||0))*.08}
function worldTf(sx,sy){const z=cam.z;g.setTransform(SC*z,0,0,SC*z,SC*(W/2-cam.x*z+sx),SC*(GROUND-GROUND*z+sy+(cam.y||0)))}
function hud(){if(state==='fatality'){const k=Math.min(1,fatT/12),bh=84*k;g.fillStyle='#000';g.fillRect(0,0,W,bh);g.fillRect(0,H-bh,W,bh);if(fatT<18){g.fillStyle=`rgba(0,0,0,${1-fatT/18})`;g.fillRect(0,0,W,H)}}else{const bar=(x,w,c,flip)=>{g.fillStyle='rgba(10,5,5,.82)';g.fillRect(x-3,27,w+6,30);const r=c.hp/100,sh=c.show/100,wS=w*sh,wR=w*r;g.fillStyle='#fbe28a';g.fillRect(flip?x+w-wS:x,30,wS,24);const gr=g.createLinearGradient(0,30,0,54);gr.addColorStop(0,'#e23b2d');gr.addColorStop(1,'#8b1212');g.fillStyle=gr;g.fillRect(flip?x+w-wR:x,30,wR,24);g.fillStyle='#fff';g.font='700 19px Impact,"Arial Narrow",sans-serif';g.textAlign=flip?'right':'left';g.fillText(c.name,flip?x+w:x,82)};bar(40,510,p1,0);bar(730,510,p2,1);
 g.textAlign='center';g.fillStyle='rgba(10,5,5,.82)';g.fillRect(W/2-46,18,92,54);g.fillStyle='#fff';g.font='44px Impact,"Arial Narrow",sans-serif';g.fillText(Math.ceil(clock/60),W/2,62);for(let i=0;i<2;i++){for(const[c,x]of[[p1,540-i*26],[p2,740+i*26]]){g.beginPath();g.arc(x,74,9,0,7);g.fillStyle=c.w>i?'#ffd24c':'rgba(10,5,5,.82)';g.fill()}}}
 if(msgT>0&&msg){g.textAlign='center';const big=msg==='ACCOPPALO';g.font=`${big?118:82}px Impact,"Arial Narrow",sans-serif`;g.lineWidth=10;g.lineJoin='round';g.strokeStyle='#150404';const my=big?684:150;g.strokeText(msg,W/2,my);g.fillStyle=big?'#e0162a':'#ffd24c';g.fillText(msg,W/2,my)}}
const _m=new THREE.Matrix4(),_q=new THREE.Quaternion(),_p=new THREE.Vector3(),_s=new THREE.Vector3(),_u=new THREE.Vector3(0,1,0),_d=new THREE.Vector3(),_c=new THREE.Color();
function blood3D(){if(!BLD)return;let n=0,nb=0;for(const f of fx){if(f.blood&&!f.chunk){if(nb>=2400)continue;const sp=Math.hypot(f.vx,f.vy),Rr=f.r*(f.jet?3.6:2.1);_p.set(f.x,GROUND-f.y,f.z||0);_d.set(f.vx,-f.vy,0);if(sp>.01)_d.normalize();else _d.set(0,1,0);_q.setFromUnitVectors(_u,_d);_s.set(Rr,Rr+sp*(f.jet?.75:.5),1);_m.compose(_p,_q,_s);BLOB.setMatrixAt(nb++,_m);continue}if(!f.chunk||n>=1600)continue;_p.set(f.x,GROUND-f.y,f.z||0);const sp=Math.hypot(f.vx,f.vy);if(f.chunk){_q.setFromEuler(qe.set(f.l*.2,f.l*.3,0));_s.set(f.r*1.3,f.r,f.r*1.1)}else{_d.set(f.vx,-f.vy,0).normalize();_q.setFromUnitVectors(_u,_d);_s.set(f.r*.42,f.r*.42+sp*.3,f.r*.42)}_m.compose(_p,_q,_s);BLD.setMatrixAt(n,_m);BLD.setColorAt(n,_c.set(f.c));n++}BLD.count=n;BLD.instanceMatrix.needsUpdate=true;BLOB.count=nb;BLOB.instanceMatrix.needsUpdate=true;if(BLD.instanceColor)BLD.instanceColor.needsUpdate=true;
 let k=0;_q.identity();for(const d2 of decals){if(k>=500)break;_p.set(d2.x,.4+k*.004,d2.z);_s.set(d2.r*1.15,1,d2.r*.9);_m.compose(_p,_q,_s);DEC.setMatrixAt(k,_m);DEC.setColorAt(k,_c.set(d2.c==='#6d0a12'?'#4a050b':'#6a0610'));k++}DEC.count=k;DEC.instanceMatrix.needsUpdate=true;if(DEC.instanceColor)DEC.instanceColor.needsUpdate=true;
 for(let i=0;i<GUT.length;i++){const r=ropes[i],m=GUT[i];if(!r){m.visible=false;continue}const a=r.a(),b=r.b(),A=new THREE.Vector3(a[0],GROUND-a[1],18+i*8),B=new THREE.Vector3(b[0],GROUND-b[1],14+i*6),M=A.clone().lerp(B,.5);M.y-=60+i*28+Math.sin(tick*.12+i)*12;M.z+=30;const cur=new THREE.CatmullRomCurve3([A,A.clone().lerp(M,.5).add(new THREE.Vector3(0,-14,8)),M,B.clone().lerp(M,.5).add(new THREE.Vector3(0,-10,-6)),B]);m.geometry.dispose();m.geometry=new THREE.TubeGeometry(cur,28,6.5-i*1.2,8,false);m.visible=true}}
function render(){camera();const sx=(Math.random()-.5)*shake,sy=(Math.random()-.5)*shake;pose3D(p1);pose3D(p2);
 const fat=state==='fatality';sun.intensity+=((fat?.55:2.5)-sun.intensity)*.08;hemi.intensity+=((fat?.34:1.15)-hemi.intensity)*.08;rim.intensity+=((fat?5.5:3)-rim.intensity)*.08;
 if(killer&&killer.headOn&&heldPiece){const q=worldPt(killer,layout(killer.p).nW),P2=heldPiece.it.P;P2.position.set(q[0],GROUND-q[1]+14,40);P2.rotation.set(0,0,.2*killer.f);heldSpine.rotation.z=Math.sin(tick*.2)*.14}else if(heldPiece&&killer&&!killer.headOn)heldPiece.it.P.visible=false;else if(killer&&killer.headOn){const q=worldPt(killer,layout(killer.p).nW);heldHead.visible=true;heldHead.material.map=victim.rig.model.headTex;heldHead.position.set(q[0],GROUND-q[1]+38,50);heldHead.scale.x=victim.f;heldHead.rotation.z=.2*killer.f;heldHead.material.color.copy(victim.rig.head.material.color);heldSpine.rotation.z=Math.sin(tick*.2)*.14}else if(heldHead)heldHead.visible=false;
 blood3D();
 const z=cam.z,fov=rad(cam3.fov),d=(H/2)/(z*Math.tan(fov/2)),yc=(GROUND-H/2+(cam.y||0))/z;cam3.position.set(cam.x-sx/z,yc+sy/z+0,d);cam3.rotation.set(0,0,0);renderer.render(scene,cam3);if(BLOB.count){renderer.setRenderTarget(bloodRT);renderer.setClearColor(0x000000,0);renderer.clear();renderer.render(blobScene,cam3);renderer.setRenderTarget(null);renderer.autoClear=false;renderer.render(compScene,ortho);renderer.autoClear=true}
 g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,1920,1080);worldTf(sx,sy);
 for(const s of shots){const R=(s.big?58:32),q=g.createRadialGradient(s.x,s.y,4,s.x,s.y,R);q.addColorStop(0,'#fff6d0');q.addColorStop(.4,'#ff9a2e');q.addColorStop(1,'rgba(255,50,0,0)');g.fillStyle=q;g.beginPath();g.arc(s.x,s.y,R,0,7);g.fill()}
 for(const f of fx){if(f.ring){g.strokeStyle=`rgba(255,240,190,${f.l/f.L})`;g.lineWidth=5;g.beginPath();g.arc(f.x,f.y,(f.L-f.l)*7,0,7);g.stroke()}else if(f.blood||f.chunk){}else{g.fillStyle=f.c;g.globalAlpha=Math.min(1,f.l/10)*(f.glow?.7:1);g.beginPath();g.arc(f.x,f.y,f.r,0,7);g.fill();g.globalAlpha=1}}
 if(chestHole&&!victim.gone&&fatKind==='heart'){const l=layout(victim.p),q=worldPt(victim,[l.head[0]*.6,l.head[1]*.66]);g.fillStyle='#3b040b';g.beginPath();g.ellipse(q[0],q[1],19,25,0,0,7);g.fill();g.strokeStyle='#a01522';g.lineWidth=5;g.stroke()}
 if(slash){const a=slash.l/slash.L;g.strokeStyle=`rgba(255,250,235,${a})`;g.lineWidth=16*a+2;g.beginPath();g.moveTo(slash.x+24,GROUND-640);g.lineTo(slash.x-24,GROUND+20);g.stroke()}
 g.setTransform(SC,0,0,SC,0,0);if(flash>.02){g.fillStyle=`rgba(255,244,214,${flash})`;g.fillRect(0,0,W,H)}hud()}
const keys={};let latch=0;const map={KeyA:'left',KeyD:'right',KeyW:'up',KeyS:'down',ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',Space:'block',KeyJ:'jab',KeyI:'cross',KeyK:'kick',KeyL:'special',KeyR:'reset'};
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;if(selOpen()){selKey(e);return}if(map[e.code]){e.preventDefault();if(e.repeat)return;demo=null;keys[map[e.code]]=1;latch|=BITS[map[e.code]]}});
addEventListener('keyup',e=>{if(map[e.code])keys[map[e.code]]=0});
function press(c,id){const o=c===p1?p2:p1;if(state==='finish'&&o.ko&&!c.ko&&id==='special'){fatal(c,o);return}act(c,id)}
let padBlocked=false;function pads(){try{return navigator.getGamepads?[...navigator.getGamepads()].filter(Boolean):[]}catch(e){padBlocked=true;return[]}}
const padName=document.getElementById('pad');let lastPadTxt='';
function padBits(q){if(!q)return 0;const b=n=>q.buttons[n]&&q.buttons[n].pressed,ax=q.axes[0]||0,ay=q.axes[1]||0;return (b(14)||ax<-.4?1:0)|(b(15)||ax>.4?2:0)|(b(12)||ay<-.7?4:0)|(b(13)||ay>.6?8:0)|(b(5)?16:0)|(b(2)?32:0)|(b(3)?64:0)|(b(0)?128:0)|(b(1)?256:0)|(b(9)?512:0)}
function keyBits(){let v=latch;latch=0;for(const k in keys)if(keys[k])v|=BITS[k];return v}
function cpuBits(){const c=p2,o=p1,d=Math.abs(c.x-o.x),to=o.x>c.x?2:1,away=o.x>c.x?1:2;if(c.ko||o.ko)return 0;if(o.m&&MOVES[o.m].hit&&d<300&&Math.random()<.35)return 16;if(busy(c))return 0;if(d>250)return Math.random()<.015?4|to:to;if(d<215&&Math.random()<.04)return away;if(Math.random()<.05){const r=Math.random();return r<.4?32:r<.65?64:r<.9?128:256}return Math.random()<.5?0:(Math.random()<.5?to:away)}
function padStatus(ps){const t=padBlocked?'Controller non disponibile in questa anteprima: scarica il file e aprilo in Chrome sul PC.':ps.length?ps.slice(0,2).map((q,i)=>`G${i+1}: ${q.id.replace(/\s*\(.*/,'').slice(0,40)}`).join(' · '):'Nessun controller rilevato: collegalo e premi un tasto.';if(t!==lastPadTxt){padName.textContent=t;lastPadTxt=t}}
function sampleLocal(){const ps=pads();padStatus(ps);if(ps[0])p1.pad=(net&&net.slot===1)?null:ps[0].index;return{ps,a:keyBits()|padBits(ps[0])}}
let net=null;const NET_DELAY=5;
function advance(){if(net){if(!net.on)return false;const f=net.f;if(net.in[f]===undefined)return false;const a=sampleLocal().a;net.my[f+NET_DELAY]=a;net.c.send({f:f+NET_DELAY,b:a});const m=net.my[f],o=net.in[f],B=net.slot===0?[m,o]:[o,m];delete net.my[f];delete net.in[f];step(B);net.f++;if(net.f%60===0){const v=hash();net.h[net.f]=v;net.c.send({h:net.f,v});check(net.f)}return true}
 const {ps,a}=sampleLocal();let b=0;if(mode==='cpu')b=demo?0:cpuBits();else{b=padBits(ps[1]);if(ps[1])p2.pad=ps[1].index}step([a,b]);return true}
function hash(){return[p1,p2].map(c=>[c.x.toFixed(2),c.y.toFixed(2),c.hp,c.m||'',c.t].join()).join('|')+tick}
function check(f){if(net.h[f]&&net.r[f]){if(net.h[f]!==net.r[f]){window.__desync=(window.__desync||0)+1;say('FUORI SINCRONIA: RICOMINCIA',120)}delete net.h[f];delete net.r[f]}}
async function startNet(c,slot,ids,arena){net={on:false,c,slot,f:0,my:{},in:{},h:{},r:{}};for(let i=0;i<NET_DELAY;i++){net.my[i]=0;net.in[i]=0}mode='online';closeSel();setOnline('Carico i lottatori…');const n0=net;try{await startMatch(ids,arena,true)}catch(e){setOnline('Errore nel caricamento: '+e.message);return}if(net!==n0)return;tick=0;prevB=[0,0];latch=0;reset();demo=null;net.on=true;setOnline(slot===0?'Connesso: sei il giocatore 1.':'Connesso: sei il giocatore 2.')}
function onData(d){if(!d)return;if(d.join===1&&!net&&pendingConn){const ids=[myFighter(),okId(d.f)],arena=curArena;pendingConn.send({start:1,arena,f:ids});startNet(pendingConn,0,ids,arena);return}if(d.start===1&&!net){startNet(pendingConn,1,(d.f||[]).map(okId),d.arena||'monument');return}if(!net)return;if(d.f!=null)net.in[d.f]=d.b;else if(d.h!=null){net.r[d.h]=d.v;check(d.h)}}
function onClose(){if(net){net.on=false;net=null;mode='cpu';reset();say('AVVERSARIO USCITO',120);setOnline('Connessione chiusa.')}}
let peer=null,pendingConn=null;const setOnline=t=>{document.getElementById('net').textContent=t};
const peerOpt=()=>Object.assign({debug:0},window.__peerOpt||{});
function hostGame(){if(net)return;if(peer)peer.destroy();const code=Array.from({length:5},()=>'ABCDEFGHJKLMNPQRSTUVWXYZ'[Math.floor(Math.random()*24)]).join('');setOnline('Preparo la partita…');peer=new Peer('pcd8f3a'+code,peerOpt());peer.on('open',()=>setOnline('Codice partita: '+code+'. Mandalo al tuo amico.'));peer.on('error',e=>setOnline('Errore di connessione: '+e.type));peer.on('connection',c=>{if(net)return;pendingConn=c;c.on('data',onData);c.on('close',onClose)})}
function joinGame(){if(net)return;const code=document.getElementById('code').value.trim().toUpperCase();if(code.length!==5){setOnline('Il codice ha 5 lettere.');return}if(peer)peer.destroy();setOnline('Mi collego…');peer=new Peer(undefined,peerOpt());peer.on('error',e=>setOnline(e.type==='peer-unavailable'?'Codice non trovato.':'Errore di connessione: '+e.type));peer.on('open',()=>{const c=peer.connect('pcd8f3a'+code,{reliable:true});pendingConn=c;c.on('data',onData);c.on('close',onClose);c.on('open',()=>c.send({join:1,f:myFighter()}))})}
const SEQ=[['jab',40],['cross',55],['kick',55],['sweep',60],['special',70],['block',60],['jump',55],['walk',70]];
function demoStep(){const d=demo;p1.inp={};p2.inp={};if(d.t--<=0){d.i++;if(d.i>=SEQ.length){if(d.i===SEQ.length){p1.w=1;p2.hp=8;p2.show=8;d.t=60;start(p1,'cross');return}if(d.i===SEQ.length+1){d.t=420;if(state==='finish')fatal(p1,p2);return}demo=null;return}d.t=SEQ[d.i][1];d.cur=SEQ[d.i][0];p1.x=p2.x-250;p2.hp=Math.max(p2.hp,40);if(d.cur==='sweep'){p1.crouch=true;start(p1,'sweep')}else if(MOVES[d.cur])start(p1,d.cur);say(d.cur==='jump'?'Salto':d.cur==='walk'?'Camminata':d.cur==='block'?'Parata':MOVES[d.cur].name,45)}
 if(d.cur==='block')p1.inp={block:1};if(d.cur==='walk')p1.inp={left:d.t>35,right:d.t<=35};if(d.cur==='jump'&&d.t===45)p1.inp={up:1}}
let ac=null,noiseB=null;function wake(){try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();if(!noiseB){noiseB=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);const d=noiseB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}}catch(e){}}
addEventListener('pointerdown',wake);addEventListener('keydown',wake);
function nz(dur,f,q,v,type='bandpass'){const t=ac.currentTime,s=ac.createBufferSource(),b=ac.createBiquadFilter(),g2=ac.createGain();s.buffer=noiseB;s.loop=true;b.type=type;b.frequency.value=f;b.Q.value=q;g2.gain.setValueAtTime(v,t);g2.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(b);b.connect(g2);g2.connect(ac.destination);s.start(t);s.stop(t+dur)}
function ton(dur,a,b,v,type='sine'){const t=ac.currentTime,o=ac.createOscillator(),g2=ac.createGain();o.type=type;o.frequency.setValueAtTime(a,t);o.frequency.exponentialRampToValueAtTime(b,t+dur);g2.gain.setValueAtTime(v,t);g2.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g2);g2.connect(ac.destination);o.start(t);o.stop(t+dur)}
function sfx(k){if(!ac||ac.state!=='running'||!noiseB)return;try{({hit(){ton(.16,150,42,.75);nz(.1,1500,.7,.6)},block(){nz(.06,3200,3,.4);ton(.05,700,300,.2,'square')},swing(){nz(.13,1100,1.2,.13)},ko(){ton(.55,120,28,.9);nz(.3,500,.6,.5)},thud(){ton(.25,90,35,.9)},squish(){nz(.28,620,2,.65);ton(.12,240,80,.3,'triangle')},rip(){nz(.75,950,1.1,.85);ton(.5,180,35,.8,'sawtooth')},drone(){ton(4.8,58,34,.55,'sawtooth');ton(4.8,87,50,.28)}})[k]()}catch(e){}}
function ui(){const box=document.getElementById('moves');const tap=id=>()=>{demo=null;latch|=BITS[id]};[['Scegli lottatori',()=>{if(net)return;openSel()},'main'],['Mostra tutte le mosse',async()=>{if(net)return;await ensureMatch();reset();state='fight';say('',0);demo={i:-1,t:30}}],['Pugno rapido',tap('jab'),'','J'],['Pugno pesante',tap('cross'),'','I'],['Calcio',tap('kick'),'','K'],['Speciale',tap('special'),'','L'],['Ricomincia',tap('reset'),'','R']].forEach(([t,f,c,k])=>{const b=document.createElement('button');b.textContent=t;if(c)b.className=c;if(k){const q=document.createElement('kbd');q.textContent=k;b.append(q)}b.onclick=()=>{f();b.blur()};box.append(b)});
 const tb=document.getElementById('touch');[['◀','left'],['▲','up'],['▼','down'],['▶','right'],['Parata','block']].forEach(([t,id])=>{const b=document.createElement('button');b.textContent=t;const on=e=>{e.preventDefault();demo=null;keys[id]=1},off=()=>{keys[id]=0};b.addEventListener('pointerdown',on);['pointerup','pointercancel','pointerleave'].forEach(n=>b.addEventListener(n,off));tb.append(b)});
 const ab=document.getElementById('arenas');[['Monumento','monument'],['Tempio','temple']].forEach(([n,k])=>{const b=document.createElement('button');b.textContent=n;b.dataset.a=k;b.onclick=async()=>{if(net)return;b.blur();selArena=k;markArena(k);if(p1&&!selOpen()){await loadArena(k);setArena(k)}};ab.append(b)});
 const fb=document.getElementById('fats');[['Testa e spina dorsale','head'],['Taglio a metà','half'],['Cuore strappato','heart'],['Esplosione','boom'],['Coltello: il sorriso','knife']].forEach(([n,k])=>{const b=document.createElement('button');b.textContent=n;b.onclick=async()=>{wake();b.blur();if(net)return;await ensureMatch();playFat(k);document.getElementById('wrap').scrollIntoView({block:'nearest'})};fb.append(b)});
 const m=document.getElementById('modes');[['Contro CPU',()=>setMode('cpu')],['Due controller',()=>setMode('2p')],['Crea partita online',hostGame]].forEach(([t,f])=>{const b=document.createElement('button');b.textContent=t;b.onclick=()=>{f();b.blur()};m.append(b)});document.getElementById('join').onclick=joinGame}
function playFat(kind){if(net)return;reset();demo=null;p1.x=720;p2.x=1080;p1.f=1;p2.f=-1;p1.w=2;p2.hp=0;p2.show=0;p2.ko=true;p2.m=null;clock=99*60;say('',0);fatal(p1,p2,kind)}
function setArena(a){if(!ARENAS[a])a=ARENAS.monument?'monument':'temple';curArena=a;selArena=a;for(const k in ARENAS)ARENAS[k].visible=k===a;try{localStorage.setItem('arena',a)}catch(e){}
 if(a==='monument'){scene.fog=null;sun.color.set(0xffd2a0);sun.position.set(-300,950,700);sun.target.position.set(900,100,0);hemi.color.set(0xbcd2ff);hemi.groundColor.set(0x6a4528);rim.color.set(0xffa050);rim.position.set(-600,500,-1200)}else{scene.fog=new THREE.Fog(0xd77a44,1500,3200);sun.color.set(0xffe2bd);sun.position.set(620,1050,900);sun.target.position.set(900,100,0);hemi.color.set(0xffd9b0);hemi.groundColor.set(0x3a241a);rim.color.set(0xff8a3a);rim.position.set(900,420,-1400)}
 markArena(a);playMusic(a)}
function markArena(a){document.querySelectorAll('#arenas button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.a===a))}
function setMode(x){if(net)return;mode=x;openSel()}
// ---------- incontro: carica solo i 2 lottatori scelti e l'arena ----------
const ARENE=[{id:'monument',nome:'Monumento',img:'arene/monumento.jpg',musica:null},{id:'temple',nome:'Tempio',musica:null}];
let selArena='monument',loading=false,music=null;
async function loadArena(a){const A=ARENE.find(x=>x.id===a);if(!A||ARENAS[a])return;if(a==='monument'){const t=await new THREE.TextureLoader().loadAsync(A.img);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;TEX.arena1=t;buildMonument(t)}}
function playMusic(a){const A=ARENE.find(x=>x.id===a),u=A&&A.musica;if(music&&music.dataset.u===u)return;if(music){music.pause();music=null}if(!u||window.__test)return;music=new Audio(u);music.dataset.u=u;music.loop=true;music.volume=.45;music.play().catch(()=>{})}
const okId=id=>{const e=rosterEntry(id);return e&&!e.bloccato?id:available()[0].id};
const myFighter=()=>okId(SEL.pick[0]||(MATCH&&MATCH.ids[0])||available()[0].id);
function fname(i){const e=MATCH&&rosterEntry(MATCH.ids[i]),n=(e&&e.nome||'Lottatore '+(i+1)).toUpperCase();return i===1&&mode==='cpu'?n+' · CPU':n}
async function prepareMatch(ids,arena,prog){const Ms=await Promise.all(ids.map((id,i)=>loadModel(id,x=>prog&&prog(i,x))));await loadArena(arena);
 clearFat();for(const r of RIG)disposeRig(r);const same=ids[0]===ids[1];
 RIG=Ms.map((M,i)=>{const alt=i===1&&same,R=makeRig(M,alt?(M.kind==='glb'?0xb8c8ff:0x7fa2e6):0xffffff,alt?0xaec6ff:0xffffff);R.pool=makePool(M,6);return R});
 for(const R of RIG)if(R.model.kind==='legacy'&&!R.model.pruned){pruneFaces(R);R.model.pruned=true}
 buildWounds();MATCH={ids:ids.slice(),arena};setArena(arena);if(!lowMem())Ms.forEach(M=>loadAlta(M).catch(()=>{}))}
const lowMem=()=>matchMedia('(pointer:coarse)').matches||(navigator.deviceMemory||8)<4;
async function startMatch(ids,arena,keepNet){loading=true;showLoad(0);const pr=[0,0];try{await prepareMatch(ids,arena,(i,x)=>{pr[i]=x;showLoad((pr[0]+pr[1])/2)})}catch(e){loading=false;hideLoad();showSelErr(e);throw e}hideLoad();closeSel();if(!keepNet)reset();loading=false}
async function ensureMatch(){if(!p1||!MATCH){const id=available()[0].id;await startMatch([id,id],selArena)}else closeSel()}
let last=0,acc=0;function loop(n){const dt=Math.min(100,n-last);last=n;if(selOpen()||loading||!p1){selPoll();acc=0}else{acc+=dt;while(acc>=16.667){if(!advance()){acc=Math.min(acc,50);break}acc-=16.667}}if(p1)render();requestAnimationFrame(loop)}
(async()=>{buildBG();ui();buildSel();let sa='monument';try{sa=localStorage.getItem('arena')||sa}catch(e){}selArena=ARENE.some(a=>a.id===sa)?sa:'monument';markArena(selArena);
 if(location.protocol==='file:'){showSelErr({message:'il gioco va aperto dal sito pubblicato (Netlify, GitHub Pages…), non con doppio clic sul file: il browser blocca il caricamento dei modelli dal disco.'});return}
 try{await loadRoster()}catch(e){showSelErr(e);return}fillSel();
 if(window.__test||window.__auto){const a=window.__auto,ids=Array.isArray(a)?a:[a||available()[0].id,a||available()[0].id];await startMatch(ids,window.__arena||selArena);window.__ready=1;if(!window.__test)requestAnimationFrame(loop);return}
 openSel();window.__ready=1;requestAnimationFrame(loop)})();
