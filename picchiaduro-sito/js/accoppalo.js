// accoppalo.js: gli Accoppalo (fatality), uno solo per lottatore (più il cuore strappato, di tutti), girati come piccoli film: stacchi, primi piani, carrellate, rallentatore.
// Lorenzo: fulmine. Matteo: coltello nella pancia. Gabriele: siringa e poi esplode. Giupy: pugno di fuoco. Cholo: telefonata e camper dal cielo.
// Difo: pistola con le dita. Simba: alpenstock dai pantaloni. Solo grafica e sequenze: la logica della partita non dipende da qui.
const PROPS={},HOLD=[],SUB={t:'',to:0},XR={v:null};let stormK=0;
const SFX2={};
const mat=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c},o||{}));
const V3=a=>new THREE.Vector3(a[0],a[1],a[2]),G2v=q=>[q.x,GROUND-q.y],_up=new THREE.Vector3(0,1,0);
const CUT=(x,h,z,o)=>shot(x,h,z,1,o),MOVE=(x,h,z,o)=>shot(x,h,z,0,o);
function sottot(t,n){SUB.t=t;SUB.to=tick+n}
// ---------- presa: la mano si orienta sull'oggetto e l'oggetto passa esattamente nel pugno ----------
// B = direzione dell'oggetto, phi = angolo dell'impugnatura (0 = a martello, ~1 = di punta come un coltello), hint = verso dove vanno le nocche
const _g1=new THREE.Vector3(),_g2=new THREE.Vector3(),_gq=new THREE.Quaternion(),_gq2=new THREE.Quaternion(),_gm0=new THREE.Matrix4(),_gm1=new THREE.Matrix4();
function gripHand(k,sd,B,phi,hint){const R=k.rig,M=R.model,gr=M.grip&&M.grip[sd],hb=R.B['w'+sd];R.G.updateMatrixWorld(true);
 if(!gr||!hb){const T=R.handTip(sd);return{c:T.hand,F:T.d,T:B.clone(),N:new THREE.Vector3().crossVectors(T.d,B).normalize(),B:B.clone(),r:9,sc:1}}
 const sc=R.G.scale.x,e=R.B['l'+sd].getWorldPosition(_g1),w=hb.getWorldPosition(_g2).clone(),d=w.clone().sub(e).normalize(),U=(hint||d).clone();U.addScaledVector(B,-U.dot(B));if(U.lengthSq()<1e-3){U.set(0,1,0).addScaledVector(B,-B.y);if(U.lengthSq()<1e-3)U.set(1,0,0)}U.normalize();
 const a=gr.adj||{},ph=phi+(a.phi||0),F=B.clone().multiplyScalar(Math.sin(ph)).addScaledVector(U,Math.cos(ph)).normalize(),T=B.clone().multiplyScalar(Math.cos(ph)).addScaledVector(U,-Math.sin(ph)).normalize();
 if(a.rot){T.applyAxisAngle(F,rad(a.rot))}const N=new THREE.Vector3().crossVectors(F,T).normalize();
 R.G.getWorldQuaternion(_gq);const f0=gr.f.clone().applyQuaternion(_gq),t0=gr.t.clone().applyQuaternion(_gq),n0=new THREE.Vector3().crossVectors(f0,t0);
 _gm0.makeBasis(f0,t0,n0).transpose();_gm1.makeBasis(F,T,N).multiply(_gm0);const tgt=new THREE.Quaternion().setFromRotationMatrix(_gm1).multiply(_gq2.copy(_gq).multiply(gr.q));
 hb.parent.getWorldQuaternion(_gq2);hb.quaternion.copy(_gq2.invert().multiply(tgt));hb.updateMatrixWorld(true);
 const L=gr.len*sc,o=a.off||[0,0,0],w0=w.clone(),full=gr.len>.13?L:L*1.85;return{w:w0,full,hb,c:w.addScaledVector(F,L*(.52+o[0])).addScaledVector(T,L*o[1]).addScaledVector(N,L*o[2]),F,T,N,B:B.clone(),r:Math.min(L,full*.55)*.42,sc:L/22}}
// ---------- mani procedurali: sostituiscono la mano del modello mentre impugna un oggetto, così le dita lo stringono davvero ----------
// Mano destra: polso all'origine, +Y verso le nocche, +Z dorso, pollice a -X. Le dita si avvolgono attorno a un manico di raggio Rh che passa lungo X.
function handFor(sd,Rh){PROPS.hands=PROPS.hands||{};const key=sd+Rh;return PROPS.hands[key]||(PROPS.hands[key]=buildHand(Rh))}
// hold: l'oggetto (asse +Y dal manico alla punta) passa nel pugno. dir = direzione dell'oggetto; gy = punto del manico stretto dalla mano; len = distanza della punta;
// rh = raggio del manico; rev = punta dal lato del mignolo (presa "a pugnale"); bend = quanto può piegarsi il polso; hint = verso dove vanno le nocche se serve
function hold(obj,k,sd,o){unhold(obj,1);const h=Object.assign({obj,k,sd,phi:1,gy:0,len:0,rh:4.3},o);HOLD.push(h);obj.visible=true;holdApply(h);return h}
function unhold(obj,keep){for(let i=HOLD.length-1;i>=0;i--)if(HOLD[i].obj===obj){const h=HOLD[i],gr=h.k.rig.model.grip,hb=h.k.rig.B['w'+h.sd];if(hb){if(gr&&gr[h.sd])hb.quaternion.copy(gr[h.sd].local);hb.scale.setScalar(1)}if(h.hand)h.hand.visible=false;HOLD.splice(i,1)}if(obj&&!keep)obj.visible=false}
const _hY=new THREE.Vector3(),_hX=new THREE.Vector3(),_hZ=new THREE.Vector3(),_hQ=new THREE.Quaternion(),_hQ0=new THREE.Quaternion();
function holdApply(h){const B=(typeof h.dir==='function'?h.dir():h.dir).clone().normalize(),hint=h.hint?(typeof h.hint==='function'?h.hint():h.hint):null,R=h.k.rig,gr=R.model.grip&&R.model.grip[h.sd],hb=R.B['w'+h.sd];
 if(h.mano||!gr||!hb){const g=gripHand(h.k,h.sd,B,h.phi,hint);
  if(h.mano&&g.hb){g.hb.scale.setScalar(.001);const s=g.full/44*.86;_gm1.makeBasis(g.T.clone().negate(),g.F,g.N);h.obj.quaternion.setFromRotationMatrix(_gm1);h.obj.scale.setScalar(s);h.obj.position.copy(g.w);h.g=g;h.tip=g.w.clone().addScaledVector(g.F,44*s);return g}
  const X=new THREE.Vector3().crossVectors(B,g.N).normalize(),Z=new THREE.Vector3().crossVectors(X,B);_gm1.makeBasis(X,B,Z);h.obj.quaternion.setFromRotationMatrix(_gm1);if(h.roll)h.obj.rotateY(h.roll);
  h.obj.position.copy(g.c).addScaledVector(B,-h.gy+(h.fwd||0)*g.r);h.g=g;h.tip=h.obj.position.clone().addScaledVector(B,h.len);return g}
 R.G.updateMatrixWorld(true);const sc=R.G.scale.x,w=hb.getWorldPosition(new THREE.Vector3()),e=R.B['l'+h.sd].getWorldPosition(_g1),d=w.clone().sub(e).normalize();
 // direzione delle nocche: la continuazione dell'avambraccio resa perpendicolare al manico; il polso non si piega oltre "bend", il resto lo prende l'oggetto di traverso nel pugno
 const U=(h.force&&hint?hint:d).clone();U.addScaledVector(B,-U.dot(B));if(U.lengthSq()<.03){U.copy(hint||_up);U.addScaledVector(B,-U.dot(B));if(U.lengthSq()<1e-3)U.set(1,0,0)}U.normalize();
 const del=Math.acos(Math.max(-1,Math.min(1,U.dot(d)))),mx=h.bend==null?.9:h.bend;_hY.copy(d);if(del>1e-3)_hY.applyQuaternion(_hQ0.identity().slerp(_hQ.setFromUnitVectors(d,U),Math.min(1,mx/del)));_hY.normalize();
 const t=B.clone().addScaledVector(_hY,-B.dot(_hY));if(t.lengthSq()<1e-4)t.copy(U);t.normalize();const sg=(h.sd==='R'?1:-1)*(h.rev?-1:1);_hX.copy(t).multiplyScalar(-sg);_hZ.crossVectors(_hX,_hY).normalize();
 const hand=h.hand||(h.hand=handFor(h.sd,h.rh)),s=Math.max(.8,Math.min(1.3,(gr.len>.13?gr.len:gr.len*1.85)*sc/44)),C=hand.userData.C;handPaint(hand,h.col==null?gr.col:h.col);
 _gm1.makeBasis(_hX,_hY,_hZ);hand.quaternion.setFromRotationMatrix(_gm1);hand.scale.set(h.sd==='L'?-s:s,s,s);hand.position.copy(w);hand.visible=true;hb.scale.setScalar(.001);
 const c=w.clone().addScaledVector(_hY,C.y*s).addScaledVector(_hZ,C.z*s),X=new THREE.Vector3().crossVectors(B,_hZ).normalize(),Z=new THREE.Vector3().crossVectors(X,B);_gm1.makeBasis(X,B,Z);h.obj.quaternion.setFromRotationMatrix(_gm1);if(h.roll)h.obj.rotateY(h.roll);
 h.obj.position.copy(c).addScaledVector(B,-h.gy);h.g={c,w,F:_hY.clone(),T:t,N:_hZ.clone(),B:B.clone(),r:h.rh*s,sc:s,hb,full:44*s};h.tip=h.obj.position.clone().addScaledVector(B,h.len);return h.g}
// IK a due ossa per le braccia nello spazio 3D (solo grafica): porta la mano esattamente su un punto, anche in profondità,
// cosa che la posa a due assi non può fare. Le richieste stanno in ARMIK e vengono riapplicate a ogni disegno, dopo la posa.
const ARMIK=[],_aH=new THREE.Vector3(),_aE=new THREE.Vector3(),_aW=new THREE.Vector3(),_aT=new THREE.Vector3(),_aD=new THREE.Vector3(),_aP=new THREE.Vector3(),_aN=new THREE.Vector3(),_aQ=new THREE.Quaternion(),_aQ2=new THREE.Quaternion(),_aQ3=new THREE.Quaternion();
function boneTurn(b,from,to){_aQ.setFromUnitVectors(from.normalize(),to.normalize());b.parent.getWorldQuaternion(_aQ2);b.getWorldQuaternion(_aQ3);b.quaternion.copy(_aQ2.invert().multiply(_aQ.multiply(_aQ3)));b.updateMatrixWorld(true)}
function armIK(k,sd,T,pole){const B=k.rig.B,u=B['u'+sd],l=B['l'+sd],w=B['w'+sd];if(!u||!l||!w)return;k.rig.G.updateMatrixWorld(true);u.getWorldPosition(_aH);l.getWorldPosition(_aE);w.getWorldPosition(_aW);const a=_aH.distanceTo(_aE),b=_aE.distanceTo(_aW);
 _aD.copy(T).sub(_aH);let d=_aD.length();if(d<1e-3)return;_aD.multiplyScalar(1/d);d=Math.max(Math.abs(a-b)+.5,Math.min(a+b-.5,d));
 _aP.copy(pole||new THREE.Vector3(0,-1,0));_aP.addScaledVector(_aD,-_aP.dot(_aD));if(_aP.lengthSq()<1e-6)_aP.set(0,0,1);_aP.normalize();
 const x=(a*a-b*b+d*d)/(2*d),h=Math.sqrt(Math.max(0,a*a-x*x));_aN.copy(_aH).addScaledVector(_aD,x).addScaledVector(_aP,h);
 boneTurn(u,_aE.clone().sub(_aH),_aN.clone().sub(_aH));l.getWorldPosition(_aE);w.getWorldPosition(_aW);boneTurn(l,_aW.clone().sub(_aE),_aT.copy(_aH).addScaledVector(_aD,d).sub(_aE))}
// mezzo giro dell'avambraccio (la mano si gira di 180 gradi attorno al proprio asse), riapplicato a ogni disegno: FTWIST=[{k,sd}]
const FTWIST=[],_twA=new THREE.Vector3(),_twQ=new THREE.Quaternion();
function twistArm(k,sd){const B=k.rig.B,l=B['l'+sd],w=B['w'+sd];if(!l||!w||w.parent!==l||w.position.lengthSq()<1e-10)return;_twA.copy(w.position).normalize();l.quaternion.multiply(_twQ.setFromAxisAngle(_twA,Math.PI));l.updateMatrixWorld(true)}
function holdFrame(){for(const h of HOLD)holdApply(h);let ik=0;for(const r of ARMIK){const p=r.t();if(p){armIK(r.k,r.sd,p,r.pole);ik=1}}for(const r of FTWIST)twistArm(r.k,r.sd);if(ik)for(const h of HOLD)if(h.ik)holdApply(h)}// gli oggetti con ik:1 seguono la mano dopo l'IK
const nearS=k=>k.f>0?'R':'L';
// porta la punta dell'oggetto impugnato (o il centro del pugno, o la mano nuda) verso un punto muovendo il braccio della posa
function armTo(k,sd,e,gain){const p=k.fpose,key=sd===nearS(k)?'n':'f';p[key][0]=Math.max(-120,Math.min(455,p[key][0]+k.f*e.x*1.1*gain));p[key][1]=Math.max(-440,Math.min(430,p[key][1]-e.y*1.1*gain));if(p[key][0]>=450&&k.f*e.x>4)k.x+=k.f*Math.min(6,k.f*e.x*.3);return e.length()}
function aimHold(k,h,target,gain=1){holdApply(h);return armTo(k,h.sd,target.clone().sub(h.tip),gain)}
function aimGrip(k,h,target,gain=1){holdApply(h);return armTo(k,h.sd,target.clone().sub(h.g.c),gain)}
function aimHand(k,sd,target,gain=1){return armTo(k,sd,target.clone().sub(handW(k,sd)),gain)}
// ---------- punti sul corpo a riposo (pancia, petto) portati nel mondo: servono al sorriso di Matteo e al buco nel petto ----------
function restInfo(v){const R=v.rig,M=R.model;if(M.rest!==undefined)return M.rest;M.rest=null;try{const J=M.J;if(M.kind!=='glb'||!J||!J.hips||!(J.neck||J.head))return null;const top=(J.neck||J.head).y,hy=J.hips.y,Hh=top-hy,g=M.meshes[M.main].geometry,rp=g.attributes.aRP.array,pt=g.attributes.aPart.array,pts=[];
  for(let i=0;i<pt.length;i++)if(pt[i]===0&&rp[i*3+2]>0&&Math.abs(rp[i*3])<Hh*.5&&rp[i*3+1]>hy-Hh*.15&&rp[i*3+1]<top)pts.push(rp[i*3],rp[i*3+1],rp[i*3+2]);
  const fz=(x,y,r)=>{let z=-9;for(let i=0;i<pts.length;i+=3)if(Math.abs(pts[i]-x)<r&&Math.abs(pts[i+1]-y)<r&&pts[i+2]>z)z=pts[i+2];return z>-9?z:.11};
  let low=R.B.spine;while(low&&low!==R.B.hips&&low.parent&&low.parent!==R.B.hips&&low.parent.isBone)low=low.parent;const bi=b=>R.bones.indexOf(b),inv=i=>M.bones[i].matrixWorld.clone().invert(),iH=bi(R.B.hips),iL=bi(low||R.B.hips),iC=bi(R.B.spine);
  M.rest={Hh,hy,fz,iH,iL,iC,nH:inv(iH),nL:inv(iL),nC:inv(iC),belly:{x:0,y:hy+Hh*.36,s:Hh*.165},smile:{x:0,y:hy+Hh*.3,s:Hh*.22},chest:{x:Hh*.09,y:hy+Hh*.7,s:Hh*.115}}}catch(e){M.rest=null}return M.rest}
function restW(v,which,qx,qy,out){const I=restInfo(v);if(!I)return null;const a=I[which],x=a.x+qx*a.s,y=a.y+qy*a.s,z=I.fz(x,y,a.s*.3)+(out||0),R=v.rig,p=new THREE.Vector3(),q=new THREE.Vector3(),ids=which==='chest'?[[I.iC,I.nC]]:[[I.iH,I.nH],[I.iL,I.nL]];
 for(const[i,n]of ids)p.add(q.set(x,y,z).applyMatrix4(n).applyMatrix4(R.bones[i].matrixWorld));return p.multiplyScalar(1/ids.length)}
// ---------- oggetti di scena ----------
// ---------- oggetti GLB forniti (oggetti/<nome>.js, base64): caricati una volta sola e messi al posto dei pezzi disegnati, con le stesse misure,
// così le prese già calibrate (mani, distanze) restano valide. Se un file non arriva resta l'oggetto disegnato. Solo grafica.
const OGG={},OGGP={},OGGK={pray:['statua'],scream:['microfono'],burp:['birra'],bottle:['bottiglia'],syringe:['siringa'],camper:['telefono','camper'],police:['telefono'],disco:['telefono','palla'],head:['spina'],half:['intestino']};
function loadOgg(n){if(OGGP[n])return OGGP[n];return OGGP[n]=(async()=>{try{const r=await fetch('oggetti/'+n+'.js');if(!r.ok)throw new Error(r.status);const t=await r.text(),a=t.indexOf("='")+2,b=t.lastIndexOf("'"),u=b64bytes(t.slice(a,b));
  const gl=await new Promise((ok,ko)=>gltfLoader().parse(u.buffer,'oggetti/',ok,ko)),s=gl.scene;s.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;const m=o.material;if(m&&window.ENVTEX&&!m.envMap){m.envMap=ENVTEX;m.envMapIntensity=.75}}});OGG[n]=s;return s}catch(e){console.warn('oggetto non caricato',n,e);return null}})()}
function oggPrep(kind){return Promise.all((OGGK[kind]||[]).map(loadOgg))}
// G: l'oggetto disegnato. rot porta l'asse lungo del modello su quello dell'oggetto; poi scala sulla misura più lunga (per k) e centra sul suo ingombro.
function fitOgg(G,n,o={}){const s=OGG[n];if(!s||!G)return false;if(G.userData.ogg===n)return true;const par=G.parent,p=G.position.clone(),q=G.quaternion.clone(),sc=G.scale.clone(),vis=G.visible;if(par)par.remove(G);G.position.set(0,0,0);G.quaternion.identity();G.scale.set(1,1,1);G.updateMatrixWorld(true);
 const tb=new THREE.Box3().setFromObject(G),W=new THREE.Group(),m=s.clone();W.add(m);if(o.rot)m.rotation.set(o.rot[0],o.rot[1],o.rot[2]);W.updateMatrixWorld(true);const mb=new THREE.Box3().setFromObject(W),ts=tb.getSize(new THREE.Vector3()),ms=mb.getSize(new THREE.Vector3()),k=(o.k||1)*Math.max(ts.x,ts.y,ts.z)/Math.max(ms.x,ms.y,ms.z);
 m.scale.multiplyScalar(k);m.position.multiplyScalar(k);W.updateMatrixWorld(true);mb.setFromObject(W);m.position.add(tb.getCenter(new THREE.Vector3()).sub(mb.getCenter(new THREE.Vector3())));if(o.dy)m.position.y+=o.dy*ts.y;
 G.traverse(x=>{if(x.isMesh)x.visible=false});const into=o.into||G;into.updateMatrixWorld(true);W.applyMatrix4(new THREE.Matrix4().copy(into.matrixWorld).invert());into.add(W);W.traverse(x=>{if(x.isMesh)x.visible=true});
 if(par)par.add(G);G.position.copy(p);G.quaternion.copy(q);G.scale.copy(sc);G.visible=vis;G.userData.ogg=n;return true}
function oggApply(){if(typeof heldSpine!=='undefined'&&heldSpine)fitOgg(heldSpine,'spina');if(!PROPS.ok)return;fitOgg(PROPS.syr,'siringa',{rot:[0,0,-Math.PI/2],k:1.12});fitOgg(PROPS.phone,'telefono',{k:1.05});if(PROPS.camper)fitOgg(PROPS.camper,'camper',{into:PROPS.camper.userData.body});if(PROPS.disco)fitOgg(PROPS.disco.userData.spin,'palla',{k:1.04});if(PROPS.bottle)fitOgg(PROPS.bottle,'bottiglia',{k:1.02});if(PROPS.can)canFit(PROPS.can);if(PROPS.mic)fitOgg(PROPS.mic,'microfono',{k:1.05});if(PROPS.statua)fitOgg(PROPS.statua,'statua',{k:1})}
// nel menu degli Accoppalo: appena una voce resta evidenziata un attimo, comincia a scaricare il modello del proprietario e gli oggetti della mossa
let FPF=0;function fatPrefetch(kind){clearTimeout(FPF);FPF=setTimeout(()=>{try{oggPrep(kind);const own=ROSTER.find(e=>e&&e.id&&!e.bloccato&&e.accoppalo===kind);if(own&&typeof loadModel==='function')loadModel(own.id).catch(()=>{})}catch(e){}},220)}
// mentre è a schermo ACCOPPALO! (l'avversario barcolla) si prepara già la mossa: oggetti, copie per i pezzi tagliati, effetti video e shader.
// Così quando parte non c'è attesa né scatto. Una volta per partita e per lottatore.
async function fatPrep(k,v,kind0,force){try{const kind=kind0||(typeof persFat==='function'&&persFat(k))||'heart';await oggPrep(kind);if(kind==='burp'||kind==='scream')await muscLoad();if(kind==='lightning')await skelLoad();if(kind==='police'){try{await loadVolante()}catch(x){}}propsInit();if(kind==='police'&&PROPS.pc)for(const c of PROPS.pc)volanteReady(c);oggApply();if(typeof fire3Init==='function')fire3Init();for(const f of[arcsInit,airInit,drops3Init,bottleInit,prayInit])try{f()}catch(x){}
  PREP.hands=[];// le mani che stringono gli oggetti si costruiscono adesso (pesano: superficie calcolata), una per volta, non a metà mossa
  try{const fn=typeof FATF_EXTRA!=='undefined'&&FATF_EXTRA[kind];if(fn){let src=String(fn);for(const m of new Set([...src.matchAll(/\b([a-zA-Z_]\w{2,})\(/g)].map(x=>x[1])))if(m!=='hold'&&typeof window[m]==='function'&&window[m]!==fn&&/\bhold\(/.test(String(window[m])))src+=String(window[m]);const rs=new Set([...src.matchAll(/rh:([0-9.]+)/g)].map(m=>+m[1]));if(/hold\(/.test(src))rs.add(4.3);for(const r of rs)for(const sd of['L','R']){PREP.hands.push(handFor(sd,r));await new Promise(ok=>setTimeout(ok,0))}}}catch(x){}void v.rig.pool;if(typeof postInit==='function'&&!window.__noPost)postInit();if(state!=='finish'&&!force)return;
  // tutto ciò che la mossa può accendere (oggetti, copie per i pezzi tagliati, testa, organi, luci) si accende per un istante, si compila e si rispegne.
  // Le arene non in uso restano spente.
  // i corpi di ricambio (muscoli, scheletro) stanno fuori dalla scena finché non servono: li si aggiunge per la prova e poi si tolgono
  const addH=[];for(const h of PREP.hands||[])if(h&&!h.parent){scene.add(h);addH.push(h)}const parked=[];for(const R of[(kind==='burp'||kind==='scream')&&MUSC.R,kind==='lightning'&&SKX.R])if(R&&!R.G.parent){scene.add(R.G);R.G.position.set(v.x,0,0);parked.push(R)}
  const on=[],fc=[],skip=new Set(Object.entries(typeof ARENAS!=='undefined'?ARENAS:{}).filter(([key])=>key!==curArena).map(([,o])=>o)),hid=[],walk=o=>{if(skip.has(o))return;if(o.material&&!o.geometry&&!o.isSprite){hid.push([o,o.material]);o.material=undefined;return}// segnaposto con un finto materiale (la testa del rig): farebbe fallire la compilazione
   if(!o.visible&&o!==scene){o.visible=true;on.push(o)}if(o.isMesh&&o.frustumCulled){o.frustumCulled=false;fc.push(o)}for(const c of o.children)walk(c)};walk(scene);
  try{renderer.compile(scene,cam3);try{if(typeof blobScene!=='undefined'&&blobScene){const o0=renderer.getRenderTarget();if(bloodRT)renderer.setRenderTarget(bloodRT);try{renderer.compile(blobScene,cam3)}finally{renderer.setRenderTarget(o0)}}if(typeof compScene!=='undefined'&&compScene)renderer.compile(compScene,ortho)}catch(x){}
   // un disegno vero in piccolo: compila anche i materiali delle ombre (corpi, gocce, oggetti) e carica le texture nella scheda video
   {const rt=PREP.rt||(PREP.rt=new THREE.WebGLRenderTarget(96,54));const o0=renderer.getRenderTarget();renderer.setRenderTarget(rt);renderer.shadowMap.needsUpdate=true;renderer.render(scene,cam3);renderer.setRenderTarget(o0)}for(const o of on)o.traverse(m=>{if(m.material)for(const mt of[].concat(m.material))for(const k of['map','emissiveMap','normalMap','alphaMap','roughnessMap','metalnessMap'])if(mt[k]&&mt[k].isTexture)try{renderer.initTexture(mt[k])}catch(x){}});
   // anche gli effetti video della mossa (profondità, sfocatura, bagliore): un passaggio a vuoto adesso, ridisegnato subito dopo, così il primo fotogramma della mossa non si ferma a compilarli
   if(typeof postRun==='function'&&!window.__noPost&&typeof POST!=='undefined'){const k0=POST.k;try{render();POST.k=1;postRun(true)}finally{POST.k=k0}}}finally{for(const o of on)o.visible=false;for(const[o,m]of hid)o.material=m;for(const o of fc)o.frustumCulled=true;for(const R of parked){R.setVis(false);parkRig(R)}for(const h of addH)scene.remove(h)}if(typeof render==='function')render()}catch(e){console.warn('preparazione Accoppalo',e)}}
const PREP={};
function propsInit(){if(PROPS.ok)return oggApply();PROPS.ok=1;setTimeout(oggApply,0);
 // siringa (asse +Y dalla mano alla punta): corpo di vetro, liquido verde, stantuffo, ago
 {const G=new THREE.Group(),glass=new THREE.Mesh(new THREE.CylinderGeometry(4.6,4.6,46,16,1,true),mat(0xddeeff,{transparent:true,opacity:.35,roughness:.05,metalness:.1})),liq=new THREE.Mesh(new THREE.CylinderGeometry(3.9,3.9,1,14),mat(0x3cff5a,{emissive:0x22cc33,emissiveIntensity:1.2,roughness:.2}));
  glass.position.y=23;liq.position.y=23;liq.scale.y=44;const rod=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,30,8),mat(0xeeeeee,{roughness:.3})),thumb=new THREE.Mesh(new THREE.CylinderGeometry(6,6,1.6,16),mat(0xeeeeee,{roughness:.3}));rod.position.y=-10;thumb.position.y=-25;
  const tip=new THREE.Mesh(new THREE.CylinderGeometry(2.2,4.6,5,12),mat(0xdddddd,{metalness:.6,roughness:.25}));tip.position.y=48.5;const needle=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,26,6),mat(0xe8eef4,{metalness:1,roughness:.12}));needle.position.y=64;
  const fl=new THREE.Mesh(new THREE.BoxGeometry(16,1.6,6),mat(0xeeeeee,{roughness:.3}));G.add(glass,liq,rod,thumb,tip,needle,fl);G.userData={liq,rod,thumb,len:77};G.visible=false;scene.add(G);PROPS.syr=G}
 // alpenstock: bastone di legno con puntale di ferro, ghiera e laccio
 {const G=new THREE.Group(),L=380,pole=new THREE.Mesh(new THREE.CylinderGeometry(4.2,4.6,L,12),mat(0x7a4a22,{roughness:.75}));pole.position.y=L/2;
  const fer=new THREE.Mesh(new THREE.CylinderGeometry(5,5,18,12),mat(0x888c90,{metalness:.9,roughness:.3}));fer.position.y=L-6;const spike=new THREE.Mesh(new THREE.ConeGeometry(4.6,46,12),mat(0xb8bec4,{metalness:1,roughness:.18}));spike.position.y=L+20;
  const knob=new THREE.Mesh(new THREE.SphereGeometry(6.5,12,8),mat(0x5a3416,{roughness:.6})),strap=new THREE.Mesh(new THREE.TorusGeometry(10,1.4,6,18),mat(0x2a1a10,{roughness:.8}));strap.position.y=22;strap.rotation.x=Math.PI/2;
  for(const g of[pole,fer,spike,knob,strap])g.castShadow=true;G.add(pole,fer,spike,knob,strap);G.userData={L:L+43};G.visible=false;scene.add(G);PROPS.alp=G}
 // mano "a pistola" (js/mani.js): sostituisce la mano del modello, che non ha le ossa delle dita
 PROPS.gun=buildGunHand();
 PROPS.tube=buildTube();PROPS.pc=[buildVolante(),buildVolante(),buildVolante()];PROPS.disco=buildDisco();PROPS.eyeD=[new THREE.Object3D(),new THREE.Object3D()];for(const d of PROPS.eyeD)scene.add(d);
 // telefono: scocca scura, schermo acceso
 {const G=new THREE.Group(),b=new THREE.Mesh(new THREE.BoxGeometry(15,31,2.2),mat(0x15171a,{roughness:.35,metalness:.6})),s=new THREE.Mesh(new THREE.PlaneGeometry(13,28),new THREE.MeshBasicMaterial({color:0x9fd0ff,toneMapped:false}));s.position.z=1.16;const cam=new THREE.Mesh(new THREE.CylinderGeometry(1.6,1.6,.8,10),mat(0x050505));cam.rotation.x=Math.PI/2;cam.position.set(-4,11,-1.3);G.add(b,s,cam);G.userData={scr:s};G.visible=false;scene.add(G);PROPS.phone=G}
 // fulmine: segmenti con nucleo bianco e alone azzurro, ridisegnati a ogni guizzo
 {const segs=[],core=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}),glow=new THREE.MeshBasicMaterial({color:0x7aa8ff,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}),cg=new THREE.CylinderGeometry(1,1,1,6,1,true);
  for(let i=0;i<90;i++){const a=new THREE.Mesh(cg,core),b=new THREE.Mesh(cg,glow);a.visible=b.visible=false;a.renderOrder=b.renderOrder=13;scene.add(a,b);segs.push([a,b])}PROPS.bolt={segs,core,glow};
  PROPS.boltL=new LProxy(0xc8dcff,0,2600,0);scene.add(PROPS.boltL);PROPS.tracer=new THREE.Mesh(cg,core);PROPS.tracer.visible=false;scene.add(PROPS.tracer)}
 PROPS.gunL=new LProxy(0xffd080,0,900,0);scene.add(PROPS.gunL);
 PROPS.shadow=new THREE.Mesh(new THREE.CircleGeometry(1,48),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0,depthWrite:false}));PROPS.shadow.rotation.x=-Math.PI/2;PROPS.shadow.position.y=1.5;PROPS.shadow.visible=false;scene.add(PROPS.shadow);
 PROPS.camper=buildCamper();PROPS.camper.visible=false;scene.add(PROPS.camper);
 PROPS.heart=buildHeart();PROPS.clip=new THREE.Plane(new THREE.Vector3(0,1,0),0);PROPS.alpMats=[];PROPS.alp.traverse(o=>{if(o.isMesh)PROPS.alpMats.push(o.material)});renderer.localClippingEnabled=true}
// camper anni '80: cellula con mansarda, cabina, finestrini, porta, strisce, ruote, paraurti, fari, clima sul tetto, tendalino, scaletta
function buildCamper(){const G=new THREE.Group(),B=new THREE.Group(),white=mat(0xf1ece0,{roughness:.45,metalness:.05}),dark=mat(0x1b1d20,{roughness:.6}),glass=mat(0x1a2a38,{roughness:.08,metalness:.9,envMapIntensity:1.5}),chrome=mat(0xc9ced4,{roughness:.2,metalness:1}),rub=mat(0x101010,{roughness:.9}),or=mat(0xd9661f,{roughness:.5}),br=mat(0x6b3a1c,{roughness:.5}),grey=mat(0x8d9094,{roughness:.5,metalness:.4});
 const box=(w,h,d,m,x,y,z,p=B)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z||0);o.castShadow=true;p.add(o);return o},cyl=(r,l,m,x,y,z,ax,p=B)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,l,20),m);o.position.set(x,y,z||0);if(ax==='z')o.rotation.x=Math.PI/2;if(ax==='x')o.rotation.z=Math.PI/2;o.castShadow=true;p.add(o);return o};
 box(540,22,180,dark,10,58,0);                                   // telaio
 box(400,214,208,white,-70,176,0);                               // cellula
 box(196,82,208,white,214,244,0);const nose=cyl(41,208,white,312,244,0,'z');nose.scale.set(.45,1,1); // mansarda con frontale arrotondato
 box(150,112,196,white,212,118,0);const hood=box(70,56,190,white,300,96,0);hood.rotation.z=-.16;      // cabina e cofano
 const ws=box(6,74,172,glass,278,160,0);ws.rotation.z=-.42;                                         // parabrezza
 for(const sz of[1,-1]){box(96,58,3,glass,-176,206,sz*105);box(100,62,2,dark,-176,206,sz*104.2);box(84,58,3,glass,-40,206,sz*105);box(88,62,2,dark,-40,206,sz*104.2);box(70,50,3,glass,214,168,sz*99);box(74,54,2,dark,214,168,sz*98.4);
  box(58,26,3,glass,224,250,sz*105);box(404,15,2.4,or,-70,128,sz*104.6);box(404,8,2.4,br,-70,113,sz*104.6);box(150,15,2.4,or,212,128,sz*98.6);box(150,8,2.4,br,212,113,sz*98.6);box(196,10,2.4,or,214,214,sz*104.6);
  box(60,168,2.5,mat(0xe7e1d3,{roughness:.5}),60,156,sz*104.8);box(34,34,3,glass,60,206,sz*105.6);box(10,4,5,chrome,82,150,sz*106.5);box(5,172,3,dark,29,156,sz*105);box(5,172,3,dark,91,156,sz*105);
  for(const wx of[212,-150]){const t=cyl(46,36,rub,wx,46,sz*90,'z',G);cyl(24,38,chrome,wx,46,sz*90,'z',G);cyl(9,40,dark,wx,46,sz*90,'z',G);const ar=cyl(56,6,dark,wx,60,sz*103,'z');ar.scale.set(1,.8,1)}
  box(14,10,22,dark,262,190,sz*112);box(4,18,12,chrome,266,196,sz*124);cyl(8,300,grey,-70,276,sz*110,'x');box(10,14,10,dark,-210,276,sz*108);box(10,14,10,dark,70,276,sz*108);
  const hl=cyl(13,6,new THREE.MeshStandardMaterial({color:0xfff6d8,emissive:0xffe9a8,emissiveIntensity:1.6}),334,104,sz*68,'x');box(8,22,14,new THREE.MeshStandardMaterial({color:0xb01018,emissive:0xb01018,emissiveIntensity:.9}),-272,112,sz*84);box(8,12,14,new THREE.MeshStandardMaterial({color:0xe08a10,emissive:0xe08a10,emissiveIntensity:.7}),-272,130,sz*84)}
 box(14,20,214,chrome,338,66,0);box(14,20,214,chrome,-276,66,0);box(4,40,96,dark,336,108,0);for(let i=0;i<5;i++)box(5,3,90,chrome,339,94+i*7,0);     // paraurti e griglia
 box(4,20,52,mat(0xf5f5f0),-279,84,0);box(4,20,52,mat(0xf5f5f0),342,60,0);                                                                        // targhe
 box(92,26,70,mat(0xdcd7ca,{roughness:.6}),-90,296,0);box(40,10,40,grey,40,288,0);cyl(5,26,grey,150,296,40,'y');                                 // clima, oblò, antenna
 for(const lz of[-22,22])cyl(2.4,190,chrome,-276,180,lz,'y');for(let i=0;i<5;i++)cyl(2,44,chrome,-276,110+i*36,0,'z');                            // scaletta
 cyl(30,10,rub,-282,170,-60,'x');cyl(14,11,chrome,-283,170,-60,'x');                                                                             // ruota di scorta
 G.add(B);G.userData.body=B;G.scale.setScalar(1.7);G.traverse(o=>{if(o.isMesh)o.frustumCulled=false});return G}
function propsHide(){arcsHide();if(PROPS.statua){PROPS.statua.visible=false;PROPS.sf=null}if(PROPS.raggio)PROPS.raggio.visible=false;if(PROPS.bpool)PROPS.bpool.visible=false;PROPS.sq=0;if(typeof p1!=='undefined'&&p1){p1.squash=0;p2.squash=0}if(PROPS.mic){PROPS.mic.visible=false;PROPS.mf=null}if(typeof SKX!=='undefined'&&SKX.R&&SKX.R.G.parent){SKX.R.setVis(false);parkRig(SKX.R)}drops3Clear();airHide();if(PROPS.can){PROPS.can.visible=false;PROPS.can.scale.set(1,1,1);PROPS.cf=null;if(OGG.birra)canFit(PROPS.can)}if(typeof victim!=='undefined')unflay(victim);if(typeof p1!=='undefined'&&p1){unflay(p1);unflay(p2);p1.swell=p2.swell=0}if(PROPS.bottle){PROPS.bottle.visible=false;PROPS.bt=null}if(PROPS.cig){PROPS.cig.visible=false;PROPS.cg=null}for(const c of[p1,p2])if(c){c.glow=0;c.fclip=null;c.yawO=null;c.zO=0};SUB.t='';xray(null);for(let i=HOLD.length-1;i>=0;i--)unhold(HOLD[i].obj);if(typeof KNIFE!=='undefined'&&KNIFE)KNIFE.visible=false;if(PROPS.film){PROPS.film.visible=false;PROPS.reel.visible=false}if(PROPS.sp&&PROPS.sp.gut)PROPS.sp.gut.visible=false;ARMIK.length=0;FTWIST.length=0;if(!PROPS.ok)return;for(const k of['syr','alp','gun','tracer','phone','camper','shadow','heart','tube'])PROPS[k].visible=false;for(const c of PROPS.pc){c.visible=false;volanteFlash(c,0,0)}PROPS.disco.visible=false;for(const l of PROPS.disco.userData.L)l.intensity=0;PROPS.eh=null;try{window.speechSynthesis&&speechSynthesis.cancel()}catch(e){}if(PROPS.ps)PROPS.ps.sir=0;for(const r of RIG){const u=r.m.userData.u;if(u&&u.uMeltK)u.uMeltK.value=0;r.G.position.z=0}for(const m of PROPS.alpMats)m.clippingPlanes=null;for(const k in PROPS.hands||{})PROPS.hands[k].visible=false;PROPS.ah=PROPS.ah2=PROPS.ph=PROPS.kh=PROPS.sh=PROPS.hh=null;for(const s of PROPS.bolt.segs){s[0].visible=s[1].visible=false}PROPS.boltL.intensity=0;PROPS.gunL.intensity=0;stormK=0;
 for(const r of RIG)for(const m of r.mats||[r.m])m.emissive&&m.emissive.set(0x6a3a30)}
function segMesh(m,a,b,r){const d=b.clone().sub(a),L=d.length();m.position.copy(a).addScaledVector(d,.5);m.quaternion.setFromUnitVectors(_up,d.normalize());m.scale.set(r,L,r);m.visible=true}
function bellyW(v,k){const h=V3(bonePos(v,'hips')),s=V3(bonePos(v,'spine'));const p=h.lerp(s,.42);p.x+=Math.sign(k.x-v.x)*24;p.z+=22;return p}
function neckW(v,k){const n=V3(bonePos(v,v.rig.B.neck?'neck':'spine'));n.x+=Math.sign(k.x-v.x)*14;n.z+=14;return n}
function headW(v){return V3(bonePos(v,v.rig.B.head?'head':'neck')).add(new THREE.Vector3(0,22,0))}
function chestW3(v,k){const c=V3(bonePos(v,'spine'));c.x+=Math.sign(k.x-v.x)*18;c.z+=16;return c}
function handW(k,sd){return V3(bonePos(k,'w'+(sd||nearS(k))))}
const KNEEL=()=>P({h:330,t:26,hd:34,tw:0,x:6,n:[110,250],f:[40,262],nl:[-40,0,0],fl:[260,0,0]});
const DAZE=()=>P({h:630,t:-6,hd:-10,tw:0,n:[60,330],f:[-10,335],nl:[-160,0,0],fl:[130,0,0]});
// scheletro ai raggi X (fulmine): corpo nero e ossa bianche disegnate sopra
// ---------- scheletro 3D ai raggi X (GLB fornito, riggato): segue la posa della vittima, si vede attraverso il corpo ----------
const SKX={p:null,R:null,A:null};
function skelLoad(){if(!SKX.p)SKX.p=loadGLB({id:'scheletro',js:'scheletro.js',nome:'scheletro',pugni:false},'oggetti/').then(M=>{const R=makeRig(M,0xffffff);for(const m of R.mats){m.color.set(0xf2f8ff);if(m.emissive){m.emissive.set(0xa8d4ff);m.emissiveIntensity=.55}m.depthTest=false;m.depthWrite=false;m.transparent=true;m.opacity=.96}for(const ms of R.meshes)ms.renderOrder=20;R.setVis(false);parkRig(R);SKX.R=R}).catch(e=>console.warn('scheletro non caricato',e));return SKX.p}
function skelPose(v,on){const R=SKX.R;if(!R)return;if(!on){if(R.G.parent){R.setVis(false);parkRig(R)}return}if(!R.G.parent){scene.add(R.G);fitRigTo(R,v.rig,v)}R.G.visible=true;const r0=v.rig,a0=v.A;v.rig=R;v.A=SKX.A;try{pose3D(v)}finally{SKX.A=v.A;v.rig=r0;v.A=a0}R.setVis(true)}
function xray(v){if(XR.v&&XR.v!==v)for(const m of XR.v.rig.mats||[])if(m.userData.c0){m.color.copy(m.userData.c0)}XR.v=v;if(v)for(const m of v.rig.mats||[]){if(!m.userData.c0)m.userData.c0=m.color.clone();m.color.setScalar(0)}}
function fatDraw(cine){if(state!=='fatality')return;g.setTransform(SC,0,0,SC,0,0);const v=XR.v;
 if(v&&cine&&!v.gone&&!SKX.R){const B=v.rig.B,P2=n=>{if(!B[n])return null;const w=B[n].getWorldPosition(new THREE.Vector3());return PJ(w.x,GROUND-w.y,w.z)},L=(...ns)=>{const ps=ns.map(P2).filter(Boolean);if(ps.length<2)return;g.beginPath();g.moveTo(ps[0].x,ps[0].y);for(const p of ps.slice(1))g.lineTo(p.x,p.y);g.stroke()};
  const h=P2(B.head?'head':'neck'),s=P2('spine'),hp=P2('hips'),k=h?h.k:1;g.save();g.strokeStyle='#f4fbff';g.fillStyle='#f4fbff';g.lineCap='round';g.lineJoin='round';g.shadowColor='#8fc4ff';g.shadowBlur=18*k;g.lineWidth=7*k;
  L('hips','spine','neck');for(const sd of'RL'){L('spine','u'+sd,'l'+sd,'w'+sd);L('hips','t'+sd,'s'+sd,'f'+sd)}
  if(s&&hp){g.lineWidth=4*k;for(let i=0;i<5;i++){const u=i/5,cx=s.x+(hp.x-s.x)*u*.5,cy=s.y+(hp.y-s.y)*u*.55-10*k;g.beginPath();g.ellipse(cx,cy,(30-i*2)*k,7*k,0,.15,Math.PI-.15);g.stroke()}g.lineWidth=9*k;g.beginPath();g.ellipse(hp.x,hp.y,26*k,12*k,0,0,7);g.stroke()}
  if(h){// cranio ai raggi X: calotta, zigomi, mandibola staccata, orbite scavate, cavità nasale, denti (niente faccina)
   const hy=h.y-24*k,X=(x,y)=>[h.x+x*k,hy+y*k],M=(x,y)=>g.moveTo(...X(x,y)),Q=(a,b,x,y)=>g.quadraticCurveTo(...X(a,b),...X(x,y)),Ln=(x,y)=>g.lineTo(...X(x,y));
   g.beginPath();M(-20,8);Q(-25,-30,0,-31);Q(25,-30,20,8);Q(18,14,12,16);Ln(-12,16);Q(-18,14,-20,8);g.fill();// calotta e mascella
   g.beginPath();M(-15,17);Q(-16,29,-6,32);Q(0,34,6,32);Q(16,29,15,17);Ln(10,19);Q(0,21,-10,19);g.closePath();g.globalAlpha=.88;g.fill();g.globalAlpha=1;// mandibola
   g.shadowBlur=0;const og=g.createRadialGradient(...X(0,-2),2*k,...X(0,-2),22*k);og.addColorStop(0,'#000');og.addColorStop(1,'#1b2a3a');g.fillStyle=og;
   for(const s of[-1,1]){g.beginPath();M(s*2.5,-6);Q(s*9,-12,s*16,-6);Q(s*18,1,s*13,5);Q(s*6,7,s*3,3);Q(s*1.5,-2,s*2.5,-6);g.fill()}// orbite
   g.beginPath();M(0,4);Q(-4,9,-3.5,12);Q(-1.5,13,0,11);Q(1.5,13,3.5,12);Q(4,9,0,4);g.fill();// naso
   g.fillStyle='rgba(8,14,22,.75)';for(const s of[-1,1]){g.beginPath();M(s*20,4);Q(s*15,8,s*13,14);Ln(s*16,15);Q(s*19,10,s*20,4);g.fill()}// sotto gli zigomi
   g.strokeStyle='#0a121c';g.lineWidth=1.6*k;g.beginPath();M(-11,18.5);Q(0,21,11,18.5);g.stroke();g.lineWidth=1.1*k;for(let i=-4;i<=4;i++){const x=i*2.5;g.beginPath();M(x,15.5+Math.abs(i)*.3);Ln(x,21.5-Math.abs(i)*.2);g.stroke()}// denti
   g.strokeStyle='rgba(10,18,28,.5)';g.lineWidth=1*k;g.beginPath();M(-6,-29);Q(-2,-22,-7,-16);g.stroke()// sutura
  }g.restore()}
 if(SUB.t&&tick<SUB.to){g.font='italic 600 30px Georgia,"Times New Roman",serif';g.textAlign='center';g.lineWidth=6;g.strokeStyle='rgba(0,0,0,.85)';g.lineJoin='round';g.strokeText(SUB.t,W/2,H-108);g.fillStyle='#fff7df';g.fillText(SUB.t,W/2,H-108)}}
// ---------- Matteo: il coltello nella pancia. Due colpi per gli occhi, poi incide il sorriso: resta uno smile insanguinato ----------
// Il disegno è nello shader del lottatore, in coordinate del corpo a riposo: resta attaccato alla pancia mentre si muove, e cola.
function fBelly(T,k,v,f){propsInit();pose3D(k);pose3D(v);holdFrame();const sd=nearS(k),mid=(k.x+v.x)/2,I=restInfo(v),U=v.rig.m.userData.u,
  W=(qx,qy,o)=>I?restW(v,'smile',qx,qy,o||0):bellyW(v,k).add(new THREE.Vector3(0,qy*40,qx*40)),B=W(0,.1,0),
  sm=p=>{if(I&&U.uSm){U.uSm.value.set(I.smile.x,I.smile.y,I.smile.s,p);U.uSmT.value=PROPS.smT||0}},back=(p,d,up)=>p.clone().add(new THREE.Vector3(-f*d,up||0,0));
 if(T===1){PROPS.smT=0;PROPS.smP=0;sm(0);v.fpose=DAZE();v.fk=.2;k.fpose=P({h:560,t:10,hd:12,tw:40,n:[150,60],f:[300,-110]});k.fk=.3;KNIFE.userData.blade.color.set(0xe2e6ea);PROPS.kt=back(B,120);
  PROPS.kh=hold(KNIFE,k,sd,{dir:()=>{const h=PROPS.kh,c=h&&h.g?h.g.c:handW(killer),d=PROPS.kt.clone().sub(c);d.y*=.6;if(d.lengthSq()<1)d.set(killer.f,0,0);return d.normalize()},gy:-5,len:76,rh:3.8,bend:.8});CUT(mid,340,1.15,{yaw:-f*.14,dol:.0014});sfx('lama')}
 if(T<=30)k.x+=(v.x-f*238-k.x)*.16;const H=PROPS.kh;
 if(T===18){const h=handW(k);CUT(h.x+f*14,h.y+10,3,{yaw:f*.5,pitch:.06,fov:24,dol:.001,pan:f*.25})}
 if(T===38)CUT(v.x-f*20,300,1.9,{yaw:-f*.42,pitch:.05,fov:30,dol:.0012});
 // i due occhi
 // gli occhi sono due tagli verticali sul petto: la lama entra in alto e scende
 const stab=(t0,qx,n,cam)=>{const sl=Math.max(0,Math.min(1,(T-t0-12)/8)),tg=W(qx+.04*(1-2*sl)*(qx<0?1:-1),1.88-.86*sl,-.012),pre=back(W(qx,1.9,-.012),105,6);if(T===t0){k.fpose=P({h:575,t:12,hd:10,tw:60,x:6,n:[200,70],f:[330,-90],nl:[-360,0,0],fl:[270,0,0]});k.fk=.45;if(cam)cam()}
  if(T>=t0&&T<t0+12){PROPS.kt=pre;aimHold(k,H,pre,.8);k.fk=.5}if(T===t0+12)sfx('swingH');if(T>=t0+12&&T<t0+21){PROPS.kt=tg;aimHold(k,H,tg,1.6);k.fk=.9;if(T>t0+12&&T%2===0)gush(G2v(tg),4,4,-f)}
  if(T===t0+16){PROPS.smP=n?.34:.16;stop=n?8:7;shake=n?20:16;v.flash=6;sfx('kickH');sfx('taglio');gush(G2v(tg),16,8,-f);jet({src:()=>G2v(W(qx,1.5,0)),ang:Math.atan2(.3,-f),life:34,rate:4,sp:6,r:1.6,spread:.25});jet({src:()=>G2v(W(qx,1.1,0)),ang:Math.PI/2,life:60,rate:1.5,sp:1,r:1.4,spread:.3});sweat(G2v(headW(v))[0],G2v(headW(v))[1],-f,8);
   v.fpose=P({h:612-n*8,t:10+n*4,hd:14,tw:0,x:-10,n:[150,-60+n*200],f:[110,180],nl:[-170,0,0],fl:[140,0,0]});v.fk=.5;KNIFE.userData.blade.color.lerp(new THREE.Color(0x8a1018),.4)}
  if(T>=t0+21&&T<t0+28){PROPS.kt=pre;aimHold(k,H,pre,.9)}};
 stab(44,-.75,0);stab(72,.75,1,()=>CUT(v.x+f*30,330,2.3,{yaw:f*.38,pitch:.04,fov:28,dol:.0015}));
 // il sorriso: la punta segue l'arco da un angolo della bocca all'altro
 if(T===100){CUT(B.x-f*16,B.y+4,3,{yaw:-f*.62,pitch:.07,fov:26,dol:.0008});k.fpose=P({h:565,t:14,hd:14,tw:70,x:8,n:[240,90],f:[330,-80],nl:[-360,0,0],fl:[270,0,0]});k.fk=.4;sfx('lama')}
 if(T>=100&&T<170){const pm=Math.max(0,Math.min(1,(T-108)/56)),u=.11+.78*pm,a=Math.PI*(1-u),tg=W(Math.cos(a)*.82,.34-Math.sin(a)*.82,-.014);PROPS.kt=T<108?back(tg,70):tg;aimHold(k,H,PROPS.kt,T<108?.9:1.5);k.fk=.8;
  if(T>=108){PROPS.smP=.36+.64*pm;if(T%3===0)gush(G2v(tg),3,4,-f);if(T%10===0){sfx('taglio');shake=Math.max(shake,5)}if(T===108){stop=5;shake=14;v.flash=5;sfx('urlo')}v.fpose.hd=20+Math.sin(T*.7)*5;v.fpose.n=[150+Math.sin(T*.9)*18,150+Math.cos(T*.8)*20]}}
 if(T===136)CUT(B.x+f*10,B.y+10,2.5,{yaw:f*.2,pitch:.1,fov:28,orb:-f*.003});
 if(T===170){PROPS.smP=1;stop=8;shake=24;flash=Math.max(flash,.16);sfx('rip');sfx('swingH');gush(G2v(W(.7,.1,0)),40,13,-f);PROPS.kt=back(W(.7,.2,0),150,90);k.fpose=P({h:590,t:-4,hd:4,tw:10,x:-10,n:[120,-200],f:[300,-100],nl:[-340,0,0],fl:[260,0,0]});k.fk=.3;KNIFE.userData.blade.color.set(0x7a1018);
  v.fpose=P({h:628,t:-4,hd:-16,tw:0,x:-4,n:[110,140],f:[70,160],nl:[-160,0,0],fl:[130,0,0]});v.fk=.25}
 if(T>=170){PROPS.smT=Math.min(2.4,(PROPS.smT||0)+(T<240?.016:.006));if(T<232)k.x-=f*1.1;if(T<186)aimHold(k,H,PROPS.kt,.8)}
 // primo piano sullo smile che cola
 if(T===176){CUT(B.x-f*4,B.y-6,3.3,{yaw:-f*.6,pitch:.04,fov:26,dol:.0016});sottot('«Sorridi.»',64)}
 if(T>176&&T<236){if(T%12===0)sfx('squish');if(T%7===0)jet({src:()=>G2v(W((Math.random()-.5)*1.3,-.4,0)),ang:Math.PI/2,life:14,rate:.8,sp:1.2,r:1.3,spread:.3})}
 if(T===206){v.fpose=P({h:626,t:10,hd:44,tw:0,x:-4,n:[150,120],f:[110,140],nl:[-160,0,0],fl:[130,0,0]});v.fk=.08}
 if(T===238){const h=headW(v);CUT(h.x,h.y-8,2.7,{yaw:-f*.35,pitch:-.03,fov:28,dol:.001});sfx('urlo')}
 if(T===262){v.fpose=KNEEL();v.fpose.n=[150,150];v.fpose.f=[120,160];v.fk=.1;CUT(v.x,240,1.6,{yaw:-f*.5,pitch:.02,fov:34,dol:.001});sfx('thud');pool(v.x-f*30,110);jet({src:()=>G2v(W(0,-.5,0)),ang:Math.atan2(.6,-f),life:90,rate:5,sp:5,r:1.8,spread:.35})}
 if(T===296){const h=headW(k);k.fpose=P({h:575,t:4,hd:6,tw:20,n:[240,40],f:[300,-100]});k.fk=.15;CUT(h.x,h.y-6,2.7,{yaw:f*.45,fov:28,dol:.0012})}
 if(T===318){v.fpose=null;start(v,'ko');sfx('thud');CUT(v.x,170,1.5,{yaw:-f*.25,pitch:.3,orb:f*.002});pool(v.x,150)}
 sm(PROPS.smP||0);
 if(T===346){CUT(mid,330,1.05,{yaw:-f*.1,orb:f*.0015});say('ACCOPPALO',420)}
 if(T===430){unhold(KNIFE);endWin(k)}}
// ---------- di tutti: il cuore strappato ----------
function buildHeart(){const G=new THREE.Group(),tex=canvasTex(256,256,b=>{const rr=(a=>()=>(a=(a*16807)%2147483647)/2147483647)(11),g2=b.createLinearGradient(0,0,0,256);g2.addColorStop(0,'#7c1826');g2.addColorStop(.5,'#8e1420');g2.addColorStop(1,'#5a0a12');b.fillStyle=g2;b.fillRect(0,0,256,256);
   b.strokeStyle='rgba(226,190,110,.8)';b.lineWidth=12;b.lineCap='round';b.beginPath();b.moveTo(0,84);for(let x=0;x<=256;x+=16)b.lineTo(x,84+Math.sin(x*.07)*7);b.stroke();b.lineWidth=7;b.beginPath();b.moveTo(120,84);b.quadraticCurveTo(140,160,118,250);b.stroke();
   const ves=(x,y,a,l,w,c)=>{b.strokeStyle=c;b.lineWidth=w;b.beginPath();b.moveTo(x,y);for(let i=0;i<6;i++){a+=(rr()-.5)*.9;x+=Math.cos(a)*l/6;y+=Math.sin(a)*l/6;b.lineTo(x,y)}b.stroke();if(w>1.4)for(let q=0;q<2;q++)ves(x,y,a+(q?-.7:.7),l*.6,w*.6,c)};
   for(let i=0;i<9;i++)ves(rr()*256,84,1.57+(rr()-.5)*.8,150,3.2,i%2?'#3a1830':'#b0202c');
   for(let i=0;i<500;i++){b.fillStyle=`rgba(${rr()<.5?'40,0,8':'255,170,160'},${rr()*.12})`;b.fillRect(rr()*256,rr()*256,2+rr()*5,1+rr()*3)}});
 const m=new THREE.MeshStandardMaterial({map:tex,roughness:.2,metalness:.05,emissive:0x3a0208,emissiveIntensity:.3}),g=new THREE.SphereGeometry(1,36,28),Pp=g.attributes.position;
 for(let i=0;i<Pp.count;i++){let x=Pp.getX(i),y=Pp.getY(i),z=Pp.getZ(i);const t=Math.max(0,-y),w=1-.62*Math.pow(t,1.5);x*=w;z*=w*.86;x-=.22*t;
  if(y>0){const u=y;x*=1+.1*u;z*=.9;y=y*.78+.16*Math.exp(-Math.pow((x-.45)/.35,2))*u+.12*Math.exp(-Math.pow((x+.5)/.3,2))*u}Pp.setXYZ(i,x,y*1.18,z)}
 g.computeVertexNormals();const body=new THREE.Mesh(g,m);body.castShadow=true;G.add(body);
 const vm=mat(0xc8a09a,{roughness:.3}),vb=mat(0x7a1626,{roughness:.3}),vbl=mat(0x4a2a5a,{roughness:.3}),dk=new THREE.MeshBasicMaterial({color:0x1a0004,side:THREE.DoubleSide});
 const tube=(pts,r,mt)=>{const V=pts.map(p=>new THREE.Vector3(p[0],p[1],p[2])),o=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(V),14,r,10,false),mt);o.castShadow=true;G.add(o);const e=V[V.length-1],d=e.clone().sub(V[V.length-2]).normalize(),cap=new THREE.Mesh(new THREE.CircleGeometry(r*.8,10),dk);cap.position.copy(e).addScaledVector(d,.01);cap.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),d);G.add(cap)};
 tube([[.05,.7,.05],[.1,1.25,0],[-.15,1.6,-.1],[-.55,1.65,-.2]],.24,vm);tube([[-.3,.75,.3],[-.5,1.15,.3],[-.8,1.3,.15]],.2,vbl);tube([[.55,.7,-.1],[.62,1.2,-.15],[.6,1.5,-.15]],.17,vbl);tube([[.3,.6,-.5],[.7,.75,-.7]],.11,vb);tube([[-.35,.6,-.5],[-.75,.8,-.65]],.11,vb);
 G.userData={body,ao:new THREE.Vector3(-.55,1.65,-.2)};G.visible=false;scene.add(G);return G}
function fHeart2(T,k,v,f){propsInit();pose3D(k);pose3D(v);holdFrame();const sd=nearS(k),mid=(k.x+v.x)/2,I=restInfo(v),U=v.rig.m.userData.u,Hm=PROPS.heart,Cw=()=>I?restW(v,'chest',0,0,0):chestW3(v,k),C=Cw(),
  hole=o=>{if(I&&U.uHole){U.uHole.value.set(I.chest.x,I.chest.y,I.chest.s,o);U.uSmT.value=PROPS.smT||0}};
 if(T===1){PROPS.smT=0;hole(0);PROPS.hOn=0;v.fpose=DAZE();v.fk=.2;k.fpose=P({h:545,t:4,hd:12,tw:-70,x:-20,n:[40,-40],f:[250,-120],nl:[-380,0,0],fl:[290,0,0]});k.fk=.16;CUT(mid,360,1.15,{yaw:-f*.14,dol:.0014})}
 if(T<=24)k.x+=(v.x-f*262-k.x)*.2;
 if(T===12){const h=headW(k);CUT(h.x+f*10,h.y-30,2.4,{yaw:f*.42,fov:28,dol:.0015});sfx('sforzo')}
 if(T===26){CUT(C.x-f*40,C.y,2,{yaw:-f*.36,pitch:.04,fov:30,dol:.002});k.fpose=P({h:525,t:24,hd:14,tw:170,x:56,n:[380,-60],f:[120,-30],nl:[-410,0,0],fl:[310,0,0]});k.fk=.8;sfx('swingH')}
 if(T>=26&&T<70)aimHand(k,sd,C.clone().add(new THREE.Vector3(f*(T<30?-14:10+Math.sin(T*.8)*4),Math.sin(T*.6)*3,0)),T<32?1.6:.8);
 if(T===30){PROPS.hOn=1;stop=9;shake=30;v.flash=7;flash=Math.max(flash,.2);sfx('kickH');sfx('squish');sfx('ossa');gush(G2v(C),60,16,-f);bones(G2v(C),6);sweat(G2v(headW(v))[0],G2v(headW(v))[1],-f,14);
  v.fpose=P({h:640,t:-18,hd:-30,tw:0,x:-8,n:[150,-160],f:[80,-140],nl:[-150,0,0],fl:[120,0,0]});v.fk=.55;jet({src:()=>G2v(Cw()),ang:Math.atan2(-.3,-f),life:36,rate:8,sp:9,r:1.8,spread:.25})}
 if(T>30&&T<70){v.fpose.n=[150+Math.sin(T*1.3)*30,-120+Math.cos(T*1.1)*60];v.fpose.f=[80+Math.cos(T*1.2)*30,-110+Math.sin(T*.9)*60];v.fpose.hd=-30+Math.sin(T*.9)*8;v.x+=Math.sin(T*1.7)*1.2;if(T%9===0){sfx('squish');gush(G2v(C),8,6,-f);shake=Math.max(shake,5)}if(T%20===4)sfx('battito')}
 if(T===44){const h=headW(v);CUT(h.x,h.y-12,2.9,{yaw:-f*.4,fov:26,dol:.0012});sfx('urlo')}
 if(T===62)CUT(C.x-f*30,C.y+4,2.3,{yaw:f*.4,pitch:.05,fov:28});
 // lo strappo: i vasi si tendono, poi cedono
 if(T===70){slowN=2;sfx('rip');stop=6;shake=26;gush(G2v(C),50,14,-f);Hm.scale.setScalar(14);PROPS.hh=hold(Hm,k,sd,{dir:new THREE.Vector3(-f*.12,1,.1),rh:8,gy:-12,len:0,bend:1.3,col:0x8e1420});
  k.fpose=P({h:565,t:4,hd:8,tw:50,x:-14,n:[230,-60],f:[150,-20],nl:[-360,0,0],fl:[280,0,0]});k.fk=.1;
  for(let i=0;i<3;i++){const o=i;ropes.push({a:()=>{const p=Hm.position;return[p.x-f*6,GROUND-p.y-10+o*5,p.z+o*3-3]},b:()=>{const q=Cw();return[q.x,GROUND-q.y+o*5-5,q.z]},l:999})}}
 if(T>70&&T<221&&PROPS.hh){const h=headW(k);aimHand(k,sd,h.add(new THREE.Vector3(f*(T<96?60:84),T<96?-34:-22,12)),T<80?.5:.8)}
 if(T>70&&T<96){k.x-=f*.9;if(T%4===0)gush(G2v(Cw()),4,4,-f)}
 if(T===96){ropes=[];slowN=1;stop=5;shake=18;sfx('squish');sfx('taglio');gush(G2v(Cw()),40,13,-f);jet({src:()=>G2v(Cw()),ang:Math.atan2(-.4,-f),life:120,rate:9,sp:11,r:1.9,spread:.12});pool(v.x-f*40,100);
  v.fpose=P({h:630,t:6,hd:14,tw:0,n:[120,120],f:[80,140],nl:[-150,0,0],fl:[120,0,0]});v.fk=.1;k.fpose=P({h:590,t:-6,hd:-8,tw:30,n:[250,-250],f:[140,30],nl:[-320,0,0],fl:[250,0,0]});k.fk=.1}
 if(T>=96)PROPS.smT=Math.min(2.2,(PROPS.smT||0)+.012);
 if(T===106){const p=Hm.position;CUT(p.x+f*8,p.y+8,3.1,{yaw:f*.4,pitch:-.03,fov:26,dol:.001,rise:.5})}
 if(T===140){const p=Hm.position;CUT(p.x,p.y,3.4,{yaw:f*.25,pitch:.02,fov:24,dol:.0012})}
 // il cuore batte ancora in mano, sempre più piano, e a ogni battito schizza
 if(Hm.visible&&T>=70){const amp=Math.max(0,Math.min(1,1-(T-112)/84)),per=T<130?20:T<170?26:34,ph=(T%per)/per,c=Math.exp(-ph*7)*amp,B2=Hm.userData.body,sq=T>=212?Math.max(.25,1-(T-212)/9):1;B2.scale.set((1-.15*c)*sq,1-.06*c,(1-.15*c)*sq);
  if(T%per===0&&amp>.08){sfx('battito');const ao=()=>{const q=Hm.localToWorld(Hm.userData.ao.clone());return[q.x,GROUND-q.y,q.z]};jet({src:ao,ang:-Math.PI/2-f*.5,life:5,rate:6*amp,sp:9*amp+2,r:1.6,spread:.25})}
  if(T%5===0&&T<212){const p=Hm.position;fx.push({x:p.x+(Math.random()-.5)*14,y:GROUND-p.y+16,z:p.z,vz:0,vx:0,vy:.6,l:70,c:'#a00c18',r:1.3+Math.random()*1.4,g:.3,blood:1,stain:1})}}
 if(T===160){CUT(v.x,330,1.5,{yaw:-f*.3,pitch:.02,fov:32,dol:.0012});v.fpose=P({h:626,t:14,hd:46,tw:0,n:[150,-40],f:[110,60],nl:[-160,0,0],fl:[130,0,0]});v.fk=.08}
 if(T===178){v.fpose=KNEEL();v.fk=.08;sfx('thud')}
 if(T===200){v.fpose=null;start(v,'ko');sfx('thud');pool(v.x,140)}
 if(T===206){const p=Hm.position;CUT(p.x+f*4,p.y+4,3,{yaw:f*.38,pitch:-.02,fov:26})}
 if(T===221){const p=Hm.position,q=[p.x,GROUND-p.y];unhold(Hm);gush(q,110,22,0);bones(q,12);spark(q[0],q[1],0,true);shake=26;stop=8;flash=Math.max(flash,.15);sfx('squish');sfx('ossa');sfx('hitH');k.fpose=P({h:590,t:-4,hd:-6,tw:30,n:[240,-230],f:[140,30],nl:[-320,0,0],fl:[250,0,0]});k.fk=.2}
 if(T===250){CUT(v.x,190,1.45,{yaw:-f*.22,pitch:.28,orb:f*.002})}
 hole(PROPS.hOn||0);
 if(T===276){CUT(mid,330,1.05,{yaw:-f*.1,orb:f*.0015});say('ACCOPPALO',420)}
 if(T===360)endWin(k)}
// ---------- Gabriele: la siringa, poi esplode ----------
// Gabriele: la prima parte va all'82% (in più al rallentamento di tutti gli Accoppalo) (si vede la siringa, la prova del liquido, l'ago che entra, lo stantuffo), poi l'esplosione al tempo di prima
function fSyringe(T,k,v,f){const o=T<=121?Math.max(1,Math.floor(T*.82)):T-22;if(T===1||PROPS.syT!==o){PROPS.syT=o;fSyringe0(o,k,v,f)}else{propsInit();pose3D(k);pose3D(v);holdFrame()}}
function fSyringe0(T,k,v,f){propsInit();pose3D(k);pose3D(v);holdFrame();const S=PROPS.syr,U=S.userData,N=neckW(v,k),sd=nearS(k),mid=(k.x+v.x)/2;
 if(T===1){v.fpose=DAZE();v.fk=.2;k.fpose=P({h:575,t:-4,hd:-12,tw:20,n:[150,-250],f:[200,-60]});k.fk=.2;U.liq.scale.y=44;U.liq.position.y=23;U.rod.position.y=-10;U.thumb.position.y=-25;
  PROPS.sh=hold(S,k,sd,{dir:()=>{if((PROPS.syT||0)<34)return new THREE.Vector3(killer.f*.15,1,.1);const h=PROPS.sh,c=h&&h.g?h.g.c:handW(killer);return neckW(victim,killer).sub(c).normalize()},gy:16,len:77,rh:4.9,rev:1,bend:.9});const h=headW(k);CUT(h.x+f*30,h.y+70,2.2,{yaw:f*.45,fov:28,rise:.3,dol:.0006});sfx('click')}
 if(T<=26)k.x+=(v.x-f*250-k.x)*.3;
 if(T===14||T===24)sfx('click');if(T===20){const t=PROPS.sh.tip;for(let i=0;i<5;i++)fx.push({x:t.x,y:GROUND-t.y,z:t.z,vx:f*.4+(Math.random()-.5),vy:-2.5-Math.random()*2,l:26,c:'#4cff6a',r:2+Math.random()*1.5,g:.18,glow:1})}
 if(T===34){k.fpose=P({h:570,t:10,hd:8,tw:50,n:[200,0],f:[300,-90],nl:[-360,0,0],fl:[270,0,0]});k.fk=.4;CUT(mid,410,1.55,{yaw:-f*.3,dol:.002})}
 const pre=N.clone().add(new THREE.Vector3(-f*100,10,0)),inn=N.clone().add(new THREE.Vector3(f*8,-2,0)),H=PROPS.sh;
 if(T>34&&T<52){aimHold(k,H,pre,.8);k.fk=.5}if(T===52)sfx('swingH');if(T>=52&&T<58){aimHold(k,H,inn,1.4);k.fk=.9}
 if(T===56){stop=7;shake=12;v.flash=5;sfx('taglio');sfx('urlo');gush(G2v(N),5,4,-f);v.fpose=Object.assign(DAZE(),{t:-14,hd:-26,x:-8,n:[90,-60],f:[30,300]});v.fk=.45;CUT(N.x-f*14,N.y+6,3.2,{yaw:f*.4,pitch:.08,fov:24,dol:.0008})}
 if(T>=58&&T<98){aimHold(k,H,inn,1);const u=Math.min(1,(T-58)/30);U.liq.scale.y=44*(1-u)+.01;U.liq.position.y=23-22*u;U.rod.position.y=-10+28*u;U.thumb.position.y=-25+28*u;v.glow=u*.035;for(const m of v.rig.mats||[v.rig.m])m.emissive&&m.emissive.set(0x1f6a28);if(T%6===0)sfx('scossa')}
 if(T===80){const h=headW(v);CUT(h.x,h.y-10,2.8,{yaw:-f*.35,fov:26,dol:.001})}
 if(T===98){sfx('swing');unhold(S);k.fpose=P({h:575,t:-6,hd:4,tw:20,n:[150,-160],f:[180,-80]});k.fk=.2}
 if(T>=100){k.noCast=true;fBoom(T-90,k,v,f);if(T===101){k.fpose=P({h:572,t:-6,hd:6,tw:30,n:[170,40],f:[150,30],nl:[-330,0,0],fl:[250,0,0]});k.fk=.12}
  if(T===102)CUT(v.x,330,1.5,{yaw:f*.25,orb:-f*.003,dol:.0012});if(T===114)CUT(v.x,330,1.5,{yaw:f*.22,orb:-f*.003,dol:.0012});if(T===150){const h=headW(k);CUT(h.x,h.y-8,2.6,{yaw:f*.4,fov:28,dol:.001})}if(T===172)CUT(v.x,360,2,{yaw:-f*.3,pitch:.05,dol:.003});
  if(T>130&&T<200&&T%10===0)sfx('ossa');if(T===200)CUT(v.x,330,.95,{yaw:f*.12,pitch:.04});if(T===262)CUT(k.x,400,1.7,{yaw:f*.35,dol:.001});if(T===310)CUT(mid,330,1,{orb:f*.0015})}}
// ---------- Difo: pistola con le dita, colpo in testa ----------
function fGun(T,k,v,f){propsInit();pose3D(k);pose3D(v);holdFrame();const Gp=PROPS.gun,U=Gp.userData,Hd=headW(v),sd=nearS(k),mid=(k.x+v.x)/2;
 if(T===1){v.fpose=DAZE();v.fk=.2;k.fpose=P({h:572,t:4,hd:10,tw:20,n:[200,40],f:[180,30]});k.fk=.2;CUT(mid,380,1.15,{yaw:-f*.12,dol:.0012});U.th.rotation.z=1.25}
 if(T<=26)k.x+=(v.x-f*300-k.x)*.16;
 if(T===22){const gr=k.rig.model.grip,ow=ROSTER.find(e=>e&&e.id===k.rig.model.id)||{};U.paint(new THREE.Color(ow.guanti||(gr&&gr[sd]?gr[sd].col:0x1c1a1a)).getHex(),new THREE.Color(ow.pelle||(gr&&gr[sd]?gr[sd].col:0xc39a7c)).getHex());PROPS.gh=hold(Gp,k,sd,{dir:()=>headW(victim).sub(handW(killer)).normalize(),phi:Math.PI/2,hint:new THREE.Vector3(0,-1,0),mano:1});
  k.fpose=P({h:580,t:2,hd:10,tw:110,x:10,n:[300,-200],f:[180,20],nl:[-330,0,0],fl:[260,0,0]});k.fk=.25;sfx('click')}
 const H=PROPS.gh;if(H&&T>24&&T<120)aimHold(k,H,Hd.clone().add(new THREE.Vector3(-f*74,4,0)),.6);
 if(T===30){const h=handW(k);CUT(h.x+f*20,h.y,3,{yaw:f*.55,pitch:.03,fov:24,pan:f*.3,dol:.001})}
 U.th.rotation.z=T>=62&&T<72?.3:1.25;
 if(T===46){CUT(Hd.x+f*6,Hd.y-8,3.1,{yaw:-f*.5,fov:24,dol:.0025});slowN=3;sfx('rombo')}
 if(T===60)CUT(mid+f*40,Hd.y-20,1.7,{yaw:-f*.12,pitch:.02});
 if(T===62&&H){const tipP=H.tip;slowN=2;sfx('sparo');flash=Math.max(flash,.6);shake=30;stop=6;PROPS.gunL.position.copy(tipP);PROPS.gunL.intensity=6;segMesh(PROPS.tracer,tipP,Hd,1.4);
  for(let i=0;i<14;i++){const a=Math.atan2(0,f)+(Math.random()-.5)*.9,s=4+Math.random()*7;fx.push({x:tipP.x,y:GROUND-tipP.y,z:tipP.z,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:8+Math.random()*6,c:'#ffe7a0',r:2+Math.random()*4,g:0,glow:1})}fx.push({x:tipP.x,y:GROUND-tipP.y,z:tipP.z,ring:1,l:7,L:7})}
 if(T>62)PROPS.gunL.intensity*=.7;if(T===66)PROPS.tracer.visible=false;
 if(T===64){const q=G2v(Hd);v.noHead=true;sfx('ossa');sfx('squish');gush(q,120,26,f*2);bones(q,26);spark(q[0],q[1],f,true);sweat(q[0],q[1],f,24);v.flash=8;
  jet({src:()=>G2v(V3(bonePos(v,v.rig.B.neck?'neck':'spine')).add(new THREE.Vector3(0,14,0))),ang:()=>-Math.PI/2+f*.25+Math.sin(tick*.2)*.15,life:200,rate:10,sp:13,r:2,spread:.12});
  jet({src:()=>q,ang:Math.atan2(-.15,f),life:14,rate:16,sp:16,r:2.2,spread:.4});v.fpose=P({h:640,t:-16,hd:-30,tw:0,x:-10,n:[110,250],f:[40,300],nl:[-150,0,0],fl:[120,0,0]});v.fk=.5;pool(v.x+f*60,90)}
 if(T===76){slowN=1;CUT(v.x,340,1.6,{yaw:f*.3,pitch:-.01,orb:-f*.004,fov:32})}
 if(T>64&&T<118){v.fpose.n=[100+Math.sin(T*.9)*40,240+Math.cos(T*1.1)*50];v.fpose.f=[30+Math.cos(T*.8)*40,290];v.x+=f*.3}
 if(T===118){v.fpose=null;start(v,'ko');sfx('thud');CUT(v.x,200,1.4,{yaw:f*.2,pitch:.28})}
 if(T===140){k.fpose=P({h:575,t:-2,hd:-4,tw:60,n:[60,-330],f:[180,20]});k.fk=.18}
 if(H&&T>=150&&T<205){H.dir=new THREE.Vector3(0,1,.15);const Kh=headW(k).add(new THREE.Vector3(k.f*26,-32,14));aimHold(k,H,Kh,.7);if(T>165&&T%3===0)smoke3(H.tip.x,H.tip.y,H.tip.z,6,40,70);if(T===176)sfx('swing')}
 if(T===156){const h=headW(k);CUT(h.x+f*16,h.y-22,2.9,{yaw:f*.4,fov:26,dol:.001})}
 if(T===205){unhold(Gp);k.fpose=P({h:575,t:4,hd:6,tw:30,n:[200,40],f:[180,30]});k.fk=.15;CUT(mid,320,1.1,{yaw:-f*.1,orb:f*.0015})}
 if(T===230)say('ACCOPPALO',420);
 if(T===320)endWin(k)}
// ---------- Simba: l'alpenstock dai pantaloni ----------
// Lo sfila dalla cintura con una sola tirata fin sopra la testa, lo fa scorrere nel pugno, lo rotea, affonda a due mani, solleva l'avversario e lo pianta a terra.
function fAlpen(T,k,v,f){propsInit();fire3Init();pose3D(k);pose3D(v);holdFrame();const A=PROPS.alp,L=A.userData.L,LP=380,hp=V3(bonePos(k,'hips')),C=chestW3(v,k),sd=nearS(k),os=sd==='R'?'L':'R',mid=(k.x+v.x)/2,ez=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)},
  Wb=hp.clone().add(new THREE.Vector3(f*22,16,16)),sh=V3(bonePos(k,'u'+sd)),Ti=96,Tp=182;let H=PROPS.ah;
 if(T===1){PROPS.ah=H=null;PROPS.ah2=null;PROPS.alpD=new THREE.Vector3(f*.05,1,.04).normalize();v.fpose=DAZE();v.fk=.2;k.fpose=P({h:565,t:8,hd:22,tw:0,n:[60,150],f:[60,60],nl:[-300,0,0],fl:[230,0,0]});k.fk=.25;CUT(k.x+f*14,hp.y+30,2.3,{yaw:f*.42,pitch:.05,fov:28,dol:-.001});sfx('stoffa')}
 if(T<=26)k.x+=(v.x-f*470-k.x)*.16;
 if(T<12)aimHand(k,sd,Wb,1.3);
 // la tirata: la mano afferra la punta alla cintura e sale; sotto la cintura il bastone non si vede (piano di taglio)
 if(T===12){PROPS.clip.constant=-(hp.y+10);for(const m of PROPS.alpMats)m.clippingPlanes=[PROPS.clip];PROPS.alpWb=Wb.clone();PROPS.ah=H=hold(A,k,sd,{dir:()=>PROPS.alpD,gy:LP-10,len:L,rh:4.6,bend:1.3});sfx('lama');CUT(k.x+f*30,hp.y+90,1.55,{yaw:f*.3,pitch:-.02,fov:32,rise:3.2,dol:-.004})}
 if(H&&T>=12&&T<48){const u=ez((T-13)/30),W0=PROPS.alpWb,tg=new THREE.Vector3(W0.x+f*8*u,W0.y+4+(LP+16)*u,W0.z+10*u);aimGrip(k,H,tg,1.5);k.fk=.8;k.fpose.h=565+26*u;k.fpose.t=8-14*u;k.fpose.hd=22-34*u;if(T%6===0)sfx('legno');if(T===44){sfx('swingH');shake=6}}
 // lo lascia scorrere nel pugno fino a un terzo, poi lo rotea
 if(H&&T>=48&&T<58){if(T===48){for(const m of PROPS.alpMats)m.clippingPlanes=null;sfx('swing')}H.gy=LP-10-(LP*.68-10)*ez((T-48)/9)}
 if(T===56)CUT(k.x+f*40,400,1.25,{yaw:-f*.22,pitch:-.02,fov:34,dol:.001});
 if(H&&T>=58&&T<88){const u=ez((T-58)/27),th=u*(Math.PI*2.5);PROPS.alpD.set(f*Math.sin(th),Math.cos(th),.06*Math.cos(th)).normalize();H.bend=4;aimGrip(k,H,sh.clone().add(new THREE.Vector3(f*(50+40*u),-30-50*u,30)),1.1);k.fk=.7;if(T===60||T===70||T===79)sfx('swingH');k.fpose.t=-6+14*u;k.fpose.hd=-12+20*u;k.fpose.tw=90*u}
 // presa a due mani e affondo
 if(H&&T===84){PROPS.ah2=hold(PROPS.dummy2||(PROPS.dummy2=new THREE.Object3D()),k,os,{dir:()=>PROPS.alpD,rh:4.6,gy:0,len:0,bend:2.2});
  // la mano dietro stringe davvero il bastone verso il fondo (IK 3D: prima restava staccata)
  ARMIK.length=0;ARMIK.push({k,sd:os,t:()=>{const h=PROPS.ah;return h&&h.g&&state==='fatality'?PROPS.alp.position.clone().addScaledVector(h.g.B,h.gy-88):null},pole:new THREE.Vector3(0,-1,-.3)})}
 const H2=PROPS.ah2;if(H&&H2&&T>=84&&T<Tp+40)aimGrip(k,H2,A.position.clone().addScaledVector(H.g.B,H.gy-88),1.2);
 if(H&&T>=88&&T<Ti){H.bend=1.4;PROPS.alpD.set(f,.02,.1).normalize();if(T===88){k.fpose=P({h:545,t:-4,hd:10,tw:-40,x:-30,n:[120,10],f:[40,30],nl:[-390,0,0],fl:[290,0,0]});k.fk=.5;sfx('sforzo')}aimHold(k,H,C.clone().add(new THREE.Vector3(-f*250,0,0)),.5)}
 if(T===90)CUT(mid,380,1.2,{yaw:-f*.16,dol:.002});
 if(H&&T>=Ti-4&&T<128){if(T===Ti-4){k.fpose=P({h:530,t:22,hd:12,tw:120,x:60,n:[430,10],f:[330,20],nl:[-420,0,0],fl:[320,0,0]});k.fk=.85;sfx('swingH')}if(T<Ti+4)k.x+=f*16;aimHold(k,H,C.clone().add(new THREE.Vector3(f*86,0,0)),T<Ti+4?1.6:.4)}
 if(T===Ti){stop=10;shake=32;flash=Math.max(flash,.25);sfx('kickH');sfx('taglio');sfx('ossa');sfx('urlo');gush(G2v(C),60,14,-f);bones(G2v(C),8);gush(G2v(C.clone().add(new THREE.Vector3(f*50,0,0))),50,10,f);
  jet({src:()=>G2v(chestW3(v,k)),ang:Math.atan2(.2,-f),life:110,rate:6,sp:7,r:1.9,spread:.3});jet({src:()=>{const q=chestW3(v,k);return[q.x+f*45,GROUND-q.y]},ang:Math.atan2(.1,f),life:90,rate:6,sp:8,r:1.8,spread:.3});
  v.fpose=P({h:600,t:22,hd:30,tw:0,x:-6,n:[170,150],f:[140,170],nl:[-140,0,0],fl:[120,0,0]});v.fk=.6;v.flash=7;v.vx=0;slowN=3;CUT(C.x-f*10,C.y+4,2.4,{yaw:f*.42,pitch:.06,fov:28,dol:.0015})}
 if(T>Ti&&T<Ti+5)v.x+=f*5;
 if(T===Ti+20){slowN=1;CUT(mid,420,1.05,{yaw:-f*.2,pitch:-.02,rise:1.2})}
 // lo spinge a terra col bastone ancora dentro: l'avversario cade all'indietro, Simba lo segue tenendolo infilzato
 const Lst=A.userData.L||423,reach=()=>Lst-(H?H.gy:122),down=new THREE.Vector3(f*.05,-1,.03).normalize();
 if(H&&T>=128&&T<158){const c=chestW3(v,k);if(T===128){sfx('sforzo');sfx('urlo');k.fpose=P({h:540,t:20,hd:12,tw:30,x:30,n:[300,40],f:[260,40],nl:[-400,0,0],fl:[300,0,0]});k.fk=.18;v.fpose=P({h:640,rot:-rad(88),drop:505,t:-4,hd:-16,tw:0,x:0,n:[160,240],f:[120,260],nl:[-150,0,10],fl:[150,0,-10]});v.fk=.075;CUT(mid+f*40,320,1.2,{yaw:-f*.24,pitch:.02,dol:.001})}
  if(T<152)v.x+=f*2.4;if(T===150)v.fk=.22;const dir=c.clone().add(new THREE.Vector3(f*14,-6,0)).sub(handW(k,sd)).normalize();PROPS.alpD.lerp(dir,.35).normalize();const hT=c.clone().addScaledVector(PROPS.alpD,-(reach()-26));aimGrip(k,H,hT,1.2);k.fk=.75;k.x+=(hT.x-f*95-k.x)*.18;
  if(T%5===0)gush(G2v(c),3,2,0);if(T===154){sfx('thud');shake=14;stop=4;for(let i=0;i<14;i++)fx.push({x:c.x+(Math.random()-.5)*170,y:GROUND-4,z:26,vx:(Math.random()-.5)*4,vy:-1-Math.random()*2,l:36,c:'#b89a7a',r:3+Math.random()*4,g:.06})}}
 // lo sfila e lo alza sopra di lui, punta in giù
 if(H&&T>=158&&T<170){const c=chestW3(v,k),u=ez((T-158)/11);if(T===158){PROPS.alpC=c.clone();PROPS.alpH0=handW(k,sd);PROPS.alpD0=PROPS.alpD.clone();sfx('taglio');gush(G2v(c),26,9,-f);k.fpose=P({h:580,t:-16,hd:-24,tw:20,n:[250,-320],f:[300,-320],nl:[-330,0,0],fl:[260,0,0]});k.fk=.22;CUT(c.x+f*30,300,1.12,{yaw:f*.5,pitch:-.07,fov:34,dol:.0006})}
  const C0=PROPS.alpC;PROPS.alpD.copy(PROPS.alpD0).lerp(down,u).normalize();const top=C0.clone().add(new THREE.Vector3(-f*8,reach()+80,0));aimGrip(k,H,PROPS.alpH0.clone().lerp(top,u),1.4);k.fk=.8;k.x+=(C0.x-f*92-k.x)*.2}
 // lo pianta a terra attraverso il petto: da qui comanda il bastone (scende dritto, passa il petto e si ferma 75 sotto, nel pavimento),
 // e le mani di Simba lo seguono, una sopra l'altra; lui si piega sulle ginocchia per spingerlo giù
 if(T===170&&PROPS.ah){unhold(A,1);if(PROPS.dummy2)unhold(PROPS.dummy2,1);PROPS.ah=PROPS.ah2=null;H=null;ARMIK.length=0;const so=sd==='R'?'L':'R';const lt=V3(bonePos(k,'u'+sd)).sub(V3(bonePos(k,'u'+so))).setY(0).normalize();ARMIK.push({k,sd,t:()=>PROPS.g1||null,pole:lt.clone().add(new THREE.Vector3(0,-.8,0))},{k,sd:so,t:()=>PROPS.g2||null,pole:lt.clone().negate().add(new THREE.Vector3(0,-.8,0))})}
 if(T>=170&&T<Tp+40){if(T<=Tp){const cc=chestW3(v,k);PROPS.alpC.x+=(cc.x-PROPS.alpC.x)*.5;PROPS.alpC.y+=(cc.y-PROPS.alpC.y)*.5;PROPS.alpC.z=cc.z}const C0=PROPS.alpC,u=T<Tp?Math.pow((T-170)/(Tp-170),2):1,ty=C0.y+95+(-75-95)*u,tip=new THREE.Vector3(C0.x,ty,C0.z);
  A.visible=true;A.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),down);A.position.copy(tip).addScaledVector(down,-Lst);A.updateMatrixWorld(true);
  const shY=(V3(bonePos(k,'uR')).y+V3(bonePos(k,'uL')).y)/2,gl=Math.max(Lst*.05,Math.min(Lst*.8,(A.position.y-(shY-45))/Math.max(.2,-down.y))),g1=A.position.clone().addScaledVector(down,gl),g2=g1.clone().addScaledVector(down,-22),so=sd==='R'?'L':'R';PROPS.g1=g1;PROPS.g2=g2;aimHand(k,sd,g1,1);aimHand(k,so,g2,1);k.fk=.9;k.x+=(C0.x-f*135-k.x)*.25;
  if(T===170){sfx('swingH');k.fpose=P({h:540,t:30,hd:22,tw:0,x:20,n:[200,40],f:[230,40],nl:[-400,0,0],fl:[320,0,0]});k.fk=.3}
  if(T===Tp-4){k.fpose=P({h:470,t:30,hd:24,tw:0,x:24,n:[200,40],f:[230,40],nl:[-470,0,0],fl:[370,0,0]});k.fk=.5}
  if(T>Tp&&T<Tp+40){k.fpose.t=30+3*Math.sin(T*.4);if(T%4===0){gush(G2v(chestW3(v,k)),9,6,0);if(T%8===0)sfx('squish')}}}
 if(T===Tp){stop=9;shake=34;slowN=2;flash=Math.max(flash,.2);sfx('kickH');sfx('thud');sfx('legno');sfx('ossa');const C0=PROPS.alpC,px=C0.x;
  for(let i=0;i<22;i++)fx.push({x:px+(Math.random()-.5)*110,y:GROUND-4,z:26,vx:(Math.random()-.5)*6,vy:-1-Math.random()*3.5,l:42,c:'#b89a7a',r:3+Math.random()*5,g:.06});gush(G2v(C0),140,16,0);gush(G2v(C0),60,9,f);gush(G2v(C0),60,9,-f);bones(G2v(C0),9);jet({src:()=>{const c=chestW3(v,k);return[c.x-f*10,GROUND-c.y-6]},ang:-Math.PI/2+.5,life:120,rate:5,sp:7,r:2,spread:.6});jet({src:()=>{const c=chestW3(v,k);return[c.x+f*10,GROUND-c.y-6]},ang:-Math.PI/2-.5,life:120,rate:5,sp:7,r:2,spread:.6});
  jet({src:()=>{const c=chestW3(v,k);return[c.x,GROUND-c.y]},ang:-Math.PI/2,life:150,rate:4,sp:4,r:1.7,spread:.5});pool(px,240);setTimeout(()=>{try{pool(px,320)}catch(e){}},900);v.flash=6;
  v.fpose=P({h:640,rot:-rad(88),drop:505,t:6,hd:-30,tw:0,x:0,n:[300,150],f:[260,170],nl:[-260,0,14],fl:[230,0,-12]});v.fk=.4;CUT(px+f*40,215,1.45,{yaw:f*.55,pitch:-.05,fov:34,dol:.0004})}
 if(T===Tp+8)slowN=1;
 if(T>Tp&&T<Tp+150&&T%3===0){const c=chestW3(v,k);fx.push({x:c.x+(Math.random()-.5)*14,y:GROUND-c.y-4,z:24,vx:(Math.random()-.5)*2.4,vy:-2-Math.random()*3,l:60,c:Math.random()<.3?'#6d0a12':'#b00c1c',r:1.6+Math.random()*2.6,g:.4,blood:1,stain:1})}if(T>Tp&&T<Tp+70&&T%6===0){v.fpose.hd=-30+8*Math.sin(T*.7);v.fpose.nl=[-260+30*Math.sin(T*.9),0,14];v.fk=.3}
 // lascia il bastone piantato e fa due passi indietro (camminata vera all'indietro)
 if(T===Tp+40){FTWIST.length=0;ARMIK.length=0;PROPS.g1=PROPS.g2=null;unhold(A,1);if(PROPS.dummy2)unhold(PROPS.dummy2,1);PROPS.ah=null;PROPS.ah2=null;H=null;k.fpose=P({h:580,t:-2,hd:-4,tw:30,n:[50,230],f:[35,240],nl:[-330,0,0],fl:[260,0,0]});k.fk=.3;sfx('stoffa')}
 if(T>Tp+40&&T<Tp+76){const s=Math.sin((T-Tp-40)*.35);k.x-=f*.9;k.fpose.nl=[-330+40*s,0,0];k.fpose.fl=[260-40*s,0,0]}
 if(T===Tp+76)k.fclip=null;
 if(T===Tp+80){const h=headW(k);CUT(h.x,h.y-30,2.2,{yaw:f*.4,fov:30,dol:.0006})}
 if(T===Tp+110){CUT((k.x+PROPS.alpC.x)/2,330,1.02,{yaw:-f*.12,pitch:-.02});say('ACCOPPALO',420)}
 if(T===Tp+170){FTWIST.length=0;endWin(k)}}
// ---------- Lorenzo: in ginocchio e fulmine ----------
function boltDraw(a,b,seed){const S=PROPS.bolt.segs;let si=0;const rnd=(()=>{let s=seed*9301+49297;return()=>((s=(s*9301+49297)%233280)/233280)})();
 const path=(p0,p1,n,amp,w)=>{let prev=p0.clone();for(let i=1;i<=n&&si<S.length;i++){const u=i/n,pt=p0.clone().lerp(p1,u);if(i<n){pt.x+=(rnd()-.5)*amp*Math.sin(u*Math.PI);pt.z+=(rnd()-.5)*amp*.4}segMesh(S[si][0],prev,pt,w);segMesh(S[si][1],prev,pt,w*5);si++;
   if(i>2&&i<n-2&&rnd()<.3&&si<S.length-6){const br=pt.clone().add(new THREE.Vector3((rnd()-.5)*380,-120-rnd()*220,0));let q=pt.clone();for(let j=1;j<=4&&si<S.length;j++){const r=q.clone().lerp(br,j/4);r.x+=(rnd()-.5)*50;segMesh(S[si][0],q,r,w*.45);segMesh(S[si][1],q,r,w*2.2);si++;q=r}}prev=pt}};
 path(a,b,18,190,3.6);for(;si<S.length;si++){S[si][0].visible=S[si][1].visible=false}}
// archi elettrici attorno a un lottatore: nastri luminosi rivolti alla telecamera, rifatti ogni pochi fotogrammi (solo grafica)
function arcsInit(){if(PROPS.arcs)return;PROPS.arcs=[];const N=12,mk=(w,c,o)=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array((N+1)*6),3));const ix=[];for(let i=0;i<N;i++){const a=i*2;ix.push(a,a+1,a+2,a+1,a+3,a+2)}g.setIndex(ix);
  const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:o,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));m.frustumCulled=false;m.visible=false;m.userData.w=w;scene.add(m);return m};
 for(let i=0;i<9;i++)PROPS.arcs.push([mk(2,0xffffff,1),mk(8,0x4a7dff,.5)]);PROPS.arcL=new LProxy(0x6f9cff,0,800,1.5);PROPS.embL=new LProxy(0xff7a22,0,1000,1.4);scene.add(PROPS.arcL,PROPS.embL)}
function arcsHide(){if(!PROPS.arcs)return;for(const p of PROPS.arcs)p[0].visible=p[1].visible=false;PROPS.arcL.intensity=0;PROPS.embL.intensity=0}
const _arcT=new THREE.Vector3(),_arcC=new THREE.Vector3();
function arcSet(pair,a,b,jag){const N=12,pts=[];for(let i=0;i<=N;i++){const u=i/N,p=a.clone().lerp(b,u),e=Math.sin(u*Math.PI)*.8+.2;p.x+=(Math.random()-.5)*jag*e;p.y+=(Math.random()-.5)*jag*e;p.z+=(Math.random()-.5)*jag*e*.6;pts.push(p)}
 for(const m of pair){const A=m.geometry.attributes.position,w=m.userData.w;for(let i=0;i<=N;i++){_arcT.copy(pts[Math.min(N,i+1)]).sub(pts[Math.max(0,i-1)]).normalize();_arcC.copy(cam3.position).sub(pts[i]).normalize();_arcT.cross(_arcC).normalize().multiplyScalar(w*(i===0||i===N?.3:1));A.setXYZ(i*2,pts[i].x+_arcT.x,pts[i].y+_arcT.y,pts[i].z+_arcT.z);A.setXYZ(i*2+1,pts[i].x-_arcT.x,pts[i].y-_arcT.y,pts[i].z-_arcT.z)}A.needsUpdate=true;m.visible=true}}
function arcsAround(c,n,T){arcsInit();const ks=['head','spine','hips','lR','lL','uR','uL','sR','sL'].filter(q=>c.rig.B[q]);
 for(let i=0;i<PROPS.arcs.length;i++){const pr=PROPS.arcs[i],ph=(T+i*2)%6;if(i>=n||ph>=4){pr[0].visible=pr[1].visible=false;continue}if(ph!==0&&ph!==2)continue;
  const b=bonePos(c,ks[(Math.random()*ks.length)|0]),a=new THREE.Vector3(b[0],b[1],b[2]),d=new THREE.Vector3(Math.random()-.5,Math.random()-.4,(Math.random()-.5)*.8).normalize(),A=a.clone().addScaledVector(d,26+Math.random()*30),B=A.clone().add(new THREE.Vector3((Math.random()-.5)*150,(Math.random()-.5)*160,(Math.random()-.5)*80));arcSet(pr,A,B,44)}
 const h=bonePos(c,'spine');PROPS.arcL.position.set(h[0]+c.f*50,h[1]+50,130);PROPS.arcL.intensity=n?(2+Math.random()*4)*Math.min(1,n/5):0;c.glow=n?(.05+Math.random()*.09)*Math.min(1,n/5):0}
// ---------- Lorenzo: il fulmine (come nel video di riferimento) ----------
// in piedi a distanza, cielo che si chiude; Lorenzo si carica di elettricità; ripresa dal basso alle spalle dell'avversario; il fulmine lo centra;
// il corpo carbonizzato brucia dall'interno, si consuma dall'alto in cenere e scintille; resta un mucchio di braci. Lorenzo, ancora carico, guarda.
function fLightning(T,k,v,f){propsInit();skelLoad();fire3Init();arcsInit();pose3D(k);pose3D(v);const Hd=headW(v),mid=(k.x+v.x)/2,T0=176,J=()=>Math.random()-.5,mats=c=>c.rig.mats||[c.rig.m];
 if(T===1){v.fpose=DAZE();v.fk=.2;k.fpose=P({h:612,t:0,hd:4,tw:10,n:[70,300],f:[-30,300],nl:[-130,0,0],fl:[110,0,0]});k.fk=.1;for(const m of mats(k))m.emissive&&m.emissive.set(0x3c66ff);CUT(mid,330,.92,{yaw:-f*.1,dol:.0007})}
 if(T<=44)k.x+=(v.x-f*480-k.x)*.1;
 stormK=T<330?Math.min(1,stormK+.018):Math.max(0,stormK-.006);
 // 1) si carica: archi sempre più fitti, bagliori lontani
 arcsAround(k,T<46?0:T<T0?Math.min(8,1+((T-46)/11|0)):T<T0+30?3:T>=392?6:0,T);
 if(T>46&&T<T0&&T%8===0)sfx('scossa');
 if(T===60){const h=headW(k);CUT(h.x-f*6,h.y-74,1.85,{yaw:f*.42,pitch:.02,fov:30,dol:.0012})}
 if(T===84||T===112||T===150){flash=Math.max(flash,.2);sfx('rombo');PROPS.boltL.position.set(v.x+f*400,1400,-600);PROPS.boltL.intensity=2}if(T>84&&T<T0-2)PROPS.boltL.intensity*=.8;
 if(T===104){k.fpose=P({h:604,t:-4,hd:-8,tw:0,n:[120,250],f:[10,250],nl:[-150,0,0],fl:[120,0,0]});k.fk=.08}
 if(T===128){v.fpose=P({h:628,t:-4,hd:-22,tw:0,n:[120,290],f:[30,300],nl:[-130,0,0],fl:[110,0,0]});v.fk=.06;CUT(v.x-f*40,430,1.3,{yaw:f*.78,pitch:-.2,fov:42,dol:.0008})}
 if(T===152){k.fpose=P({h:606,t:-10,hd:-22,tw:20,n:[120,-470],f:[60,220],nl:[-150,0,0],fl:[120,0,0]});k.fk=.2}
 if(T===T0-10)CUT(v.x,460,.9,{yaw:-f*.12,pitch:-.03});
 // 2) il fulmine
 if(T>=T0&&T<T0+24){const top=new THREE.Vector3(v.x+(T<T0+8?-f*120:f*60),1750,-80);if(T%2===0)boltDraw(top,Hd,T);PROPS.bolt.core.opacity=T%4<2?1:.55;PROPS.bolt.glow.opacity=T%4<2?.4:.2;PROPS.boltL.position.copy(Hd).add(new THREE.Vector3(0,80,120));PROPS.boltL.intensity=T%4<2?7:3;xray(T%6<3?v:null);
  if(T===T0){flash=1;shake=46;stop=8;sfx('tuono');sfx('hitH');spark(G2v(Hd)[0],G2v(Hd)[1],0,false);decals.push({x:v.x,z:0,r:0,R:190,c:'#120c0a',slow:1});for(const m of mats(v))m.emissive&&m.emissive.set(0x9fc4ff)}
  if(T===T0+8){CUT(v.x,320,1.6,{yaw:f*.28,pitch:.03,orb:-f*.004});slowN=2;sfx('urlolungo')}
  v.fpose=null;v.fclip={c:'scossa',f:18+(T-T0)*1.7,b:3};v.glow=T%4<2?.3:.05;if(T%3===0)sfx('scossa')}
 skelPose(v,T>=T0&&T<T0+24&&XR.v===v);
 if(T===T0+24){xray(null);slowN=1;for(const s of PROPS.bolt.segs){s[0].visible=s[1].visible=false}PROPS.boltL.intensity=0;v.glow=0;for(const m of mats(v))m.emissive&&m.emissive.set(0x6a3a30);sfx('fuoco')}
 // la scarica continua a scuoterlo, poi crolla in ginocchio e cade a faccia in giù (clip vera Electrocuted Fall)
 if(T>T0+24)v.fclip={c:'scossa',f:Math.min(152,59+(T-T0-24)*.55),b:6};if(T===T0+92||T===T0+112)sfx('thud');
 // 3) carbonizzato, brucia dall'interno; poi si consuma dall'alto
 const D0=T0+128,D1=D0+62;
 if(T>=T0){const b=Math.min(1,(T-T0)/22);v.burn=b;burnU(v,b,T<D0?.55+.4*Math.abs(Math.sin(T*.11)):1);
  if(T<D1){bodyFire3(v,T<T0+70?3:2,.55);if(T%3===0){const c=bonePos(v,'spine');smoke3(c[0]+J()*40,c[1]+30,c[2],30,170,110+Math.random()*50)}
   if(T<T0+80)for(let i=0;i<2;i++)flame3(v.x+J()*70,60+Math.random()*380,J()*50,J()*1.5,3+Math.random()*5,J()*1.5,50+Math.random()*40,3,4,{em:1,dr:.985,bu:0})}
  PROPS.embL.position.set(v.x,T<D1?230:40,150);PROPS.embL.intensity=T<D1?5+Math.random()*3:T<D1+90?Math.max(0,3-(T-D1)/30)+Math.random():0}
 if(T===T0+62){const h=headW(v);CUT(h.x,h.y-70,2.1,{yaw:-f*.3,pitch:-.04,fov:30,dol:.0008})}
 if(T===D0-6)CUT(v.x,250,1.25,{yaw:f*.16,pitch:.05,rise:-.25,orb:f*.0015});
 if(T>=D0&&T<D1&&T%3===0){const c=bonePos(v,'spine');smoke3(c[0]+J()*60,c[1]+20,c[2],30,170,110+Math.random()*50)}
 if(T===D1){CUT(v.x,120,1.6,{yaw:f*.22,pitch:.3,dol:.0006})}
 if(T>=D1&&T<D1+110&&T%2===0)flame3(v.x+J()*46,6+Math.random()*10,J()*30,J()*.8,1+Math.random()*3,J()*.8,40+Math.random()*40,3,4,{em:1,dr:.985,bu:0});
 if(T>=D1&&T<D1+60&&T%4===0)flame3(v.x+J()*30,8,J()*20,J(),1.2,J(),18,16,30,{dr:.9,bu:.05,tu:.1});
 // 4) Lorenzo, ancora carico
 if(T===392){const h=headW(k);k.fpose=P({h:612,t:0,hd:6,tw:16,n:[90,290],f:[-20,295],nl:[-130,0,0],fl:[110,0,0]});k.fk=.1;CUT(h.x-f*6,h.y-80,1.7,{yaw:f*.38,pitch:.02,fov:30,dol:.0009});sfx('scossa')}
 if(T>392&&T%10===0)sfx('scossa');
 if(T===418)say('ACCOPPALO',420);
 if(T===500){arcsHide();k.glow=0;for(const m of mats(k))m.emissive&&m.emissive.set(0x6a3a30);endWin(k)}}
// ---------- Giupy: il pugno di fuoco ----------
// il braccio destro prende fuoco, carica e sferra un pugno che scaglia una colonna di fiamme a forma di pugno
function fistFire(P0,dir,sz){const X=dir.clone().normalize(),Yv=new THREE.Vector3(0,1,0),Zv=new THREE.Vector3().crossVectors(X,Yv).normalize(),pt=(a,b,c)=>P0.clone().addScaledVector(X,a*sz).addScaledVector(Yv,b*sz).addScaledVector(Zv,c*sz),em=(p,l,s0,s1,vx)=>flame3(p.x,p.y,p.z,X.x*vx+(Math.random()-.5),X.y*vx+(Math.random()-.5)*1.5+.4,X.z*vx+(Math.random()-.5),l,s0*sz,s1*sz,{dr:.9,bu:.05,tu:.12}),r=()=>Math.random()*2-1;
 for(let i=0;i<16;i++){let a=r(),b=r(),c=r();const n=Math.hypot(a,b,c)||1;a/=n;b/=n;c/=n;em(pt(a*62,b*74,c*60),11+Math.random()*7,30,54,5)}               // dorso e palmo
 for(let kx=0;kx<4;kx++)for(let i=0;i<5;i++){const yk=-54+kx*36;let a=Math.random(),b=r()*.5,c=r()*.5;em(pt(52+a*26,yk+b*18,c*22),10+Math.random()*7,22,40,7)}  // quattro nocche
 for(let i=0;i<8;i++)em(pt(10+r()*26,-78+r()*10,34+r()*12),10+Math.random()*6,22,36,5);                                                                  // pollice
 for(let i=0;i<14;i++){const u=Math.random(),a=Math.random()*6.28,rr=44+Math.random()*10;em(pt(-60-u*150,Math.cos(a)*rr,Math.sin(a)*rr),14+Math.random()*10,30,70,2)}  // polso e scia
 if(Math.random()<.9)flame3(P0.x,P0.y,P0.z,-X.x*3+(Math.random()-.5)*6,2+Math.random()*5,(Math.random()-.5)*6,40+Math.random()*30,3,4,{em:1,dr:.97,bu:0})}
function fAce(T,k,v,f){propsInit();fire3Init();pose3D(k);pose3D(v);if(!fireL){fireL=new LProxy(0xff7a26,0,1700,0);handL=new LProxy(0xffa040,0,800,0);scene.add(fireL,handL)}
 const R=k.rig.B,hand=V3(bonePos(k,'wR')),elb=V3(bonePos(k,'lR')),sho=V3(bonePos(k,'uR')),mid=(k.x+v.x)/2,arm=(base,a)=>armPose(f,base,a);
 if(T===1){v.fpose=DAZE();v.fk=.2;k.fpose=arm({h:560,t:-4,hd:8,tw:-20,x:-8,n:[150,60],f:[150,40],nl:[-330,0,0],fl:[260,0,0]},[150,-60]);k.fk=.14;CUT(hand.x,hand.y+10,2.9,{yaw:f*.5,pitch:.05,fov:24,dol:.0015,rise:.5})}
 if(T<=30)k.x+=(v.x-f*430-k.x)*.14;
 // il braccio destro si avvolge di fiamme
 if(T>6&&T<150){const u=Math.min(1,(T-6)/30),n=Math.round(3+u*7);for(let i=0;i<n;i++){const s=Math.random(),p=s<.5?sho.clone().lerp(elb,s*2):elb.clone().lerp(hand,(s-.5)*2.3),a=Math.random()*6.28,r=6+Math.random()*10;flame3(p.x+Math.cos(a)*r,p.y+Math.sin(a)*r*.6,p.z+Math.sin(a)*r,-Math.sin(a)*1.2,1+Math.random()*1.8,Math.cos(a)*1.2,12+Math.random()*10,7+u*7,20+u*20,{bu:.16,dr:.93,tu:.2})}
  handL.intensity=2.6*u*(.85+.15*Math.random());handL.position.copy(hand).add(new THREE.Vector3(0,10,50));if(T%8===0)sfx('crepita');if(T===8||T===30)sfx('fuoco')}
 if(T===30)CUT(k.x-f*10,400,1.5,{yaw:f*.3,pitch:-.03,fov:36,dol:.0025,orb:-f*.003});
 if(T===34){k.fpose=arm({h:520,t:-10,hd:10,tw:-90,x:-34,n:[120,80],f:[240,-40],nl:[-400,0,0],fl:[300,0,0]},[-110,-40]);k.fk=.1;sfx('sforzo')}        // carica: pugno tirato indietro
 if(T===62){CUT(mid-f*40,360,1.02,{yaw:-f*.12,pitch:.02,pan:f*1.6});slowN=2}
 if(T===64){k.fpose=arm({h:540,t:22,hd:14,tw:170,x:60,n:[200,60],f:[200,40],nl:[-420,0,0],fl:[320,0,0]},[455,-50]);k.fk=.7;sfx('swingH');sfx('fuoco');shake=16;flash=Math.max(flash,.25);PROPS.ff={p:hand.clone().add(new THREE.Vector3(f*60,0,0)),t:0}}
 const FF=PROPS.ff;if(FF&&T>=66){FF.t++;const tg=chestW3(v,k).add(new THREE.Vector3(0,10,0)),d=FF.hit?new THREE.Vector3(f,.03,0):tg.clone().sub(FF.p).setZ(0).normalize(),sz=Math.min(1.5,.55+FF.t*.07);FF.p.addScaledVector(d,20);fistFire(FF.p,d,sz);fireL.intensity=4*(.8+.2*Math.random());fireL.position.copy(FF.p).add(new THREE.Vector3(0,40,160));shake=Math.max(shake,5);if(FF.t%9===1)sfx('fuoco');
  if(!FF.hit&&Math.abs(FF.p.x-v.x)<70){FF.hit=T;stop=8;shake=40;flash=Math.max(flash,.5);sfx('esplosione');sfx('urlolungo');v.burn=.05;v.fpose=P({h:640,t:-30,hd:-34,tw:0,x:-30,n:[-40,-200],f:[-80,-160],nl:[-90,0,0],fl:[200,0,0]});v.fk=.6;CUT(v.x-f*20,350,1.7,{yaw:f*.3,pitch:.02,pan:f*2.2,fov:32})}
  if(FF.p.x<-300||FF.p.x>AW+300||FF.t>70)PROPS.ff=null}
 if(FF&&FF.hit){const a=T-FF.hit;if(a<26)v.x=Math.max(120,Math.min(AW-120,v.x+f*9*Math.exp(-a/10)))}
 if(T===104){slowN=1;k.fpose=arm({h:560,t:8,hd:8,tw:60,n:[220,40],f:[200,40],nl:[-340,0,0],fl:[270,0,0]},[300,60]);k.fk=.1}
 if(v.burn>0&&T<170){v.burn=Math.min(1,v.burn+.012);const s1=Math.sin(T*.47),s2=Math.cos(T*.39),s3=Math.sin(T*.61);if(T>100){v.fpose=P({h:630-v.burn*40,t:-12+s3*10,hd:-22+s1*14,tw:s2*30,x:-8,n:[70+s1*110,280+s2*120],f:[-10+s2*100,300+s3*110],nl:[-130+s1*60,0,0],fl:[110-s1*60,0,0]});v.fk=.35}}
 if(v.burn>0){burnU(v,v.burn,T<190?.75+.25*Math.sin(T*.7)*Math.sin(T*.23):Math.max(.12,1-(T-190)/110)*(.8+.2*Math.sin(T*.5)));bodyFire3(v,T<190?6:T<270?3:T<330?1:0,T<210?1.1:.65);if(T%7===0&&T<310)sfx('crepita');if(!PROPS.ff){fireL.intensity=2*(.7+.3*Math.random())*Math.max(.2,1-(T-140)/230);const c=chestW3(v,k);fireL.position.set(c.x,c.y+40,150)}handL.intensity*=.97;
  if(T>110&&T<330&&T%5===0){const c=chestW3(v,k);smoke3(c.x+(Math.random()-.5)*50,c.y+40,c.z,40,200,120+Math.random()*60)}}
 if(T===122)CUT(v.x,340,1.9,{yaw:-f*.3,pitch:.04,orb:f*.004,fov:30});
 if(T===172){v.fpose=null;v.vx=0;start(v,'ko');sfx('thud');CUT(v.x,200,1.4,{yaw:f*.22,pitch:.26,orb:-f*.002})}
 if(T===214){const h=headW(k);CUT(h.x+f*10,h.y-40,2.1,{yaw:f*.42,fov:30,dol:.001});pool(v.x,70);decals.push({x:v.x,z:0,r:0,R:130,c:'#1a1210',slow:1})}
 if(T===256){CUT(mid,330,1.05,{yaw:-f*.1,orb:f*.0015});say('ACCOPPALO',420)}
 if(T===340)endWin(k)}
// ---------- Peppone: la birra e il rutto che spella ----------
// Apre una lattina, beve, la accartoccia; gonfia il petto e fa un rutto enorme: l'aria si vede (onde d'urto, cono di vento, schizzi),
// la pelle dell'avversario vola via a brandelli e resta il corpo di soli muscoli (modello fornito, riggato), che trema e crolla come col fulmine.
const MUSC={p:null,M:null,R:null};
function muscLoad(){if(!MUSC.p)MUSC.p=loadGLB({id:'muscoli',js:'muscoli.js',nome:'muscoli',pugni:false},'oggetti/').then(M=>{MUSC.M=M;MUSC.R=makeRig(M,0xffffff);MUSC.R.setVis(false);parkRig(MUSC.R)}).catch(e=>console.warn('muscoli non caricati',e));return MUSC.p}
// porta un rig "di servizio" (muscoli, scheletro) all'altezza del lottatore: rapporto tra le altezze della testa a riposo
function fitRigTo(R,R0,v){if(!R||!R0)return;// stessa posa per tutti e due, poi confronto il punto più alto della mesh (testa compresa): il rig di servizio prende l'altezza del lottatore
 const top=rr=>{rr.G.updateMatrixWorld(true);let y=-1e9;rr.G.traverse(o=>{if(o.isSkinnedMesh){const b=new THREE.Box3().setFromObject(o,true);if(isFinite(b.max.y))y=Math.max(y,b.max.y)}});return y-rr.G.position.y};
 for(const ch of R.G.children){const u=ch.userData;if(u.s0==null){u.s0=ch.scale.x;u.p0=ch.position.clone()}ch.scale.setScalar(u.s0);ch.position.copy(u.p0)}
 const a0=v.A,r0=v.rig,fp=v.fpose,fc=v.fclip;v.fpose=P({h:600,t:0,hd:0,tw:0,n:[45,235],f:[35,245],nl:[-330,0,0],fl:[260,0,0]});v.fk=1;v.fclip=null;
 const meas=rr=>{v.rig=rr;v.A=null;for(let i=0;i<12;i++)pose3D(v);return top(rr)};let h0,h1;try{h0=meas(R0);h1=meas(R)}finally{v.rig=r0;v.A=a0;v.fpose=fp;v.fclip=fc}
 const r=h0>0&&h1>0?h0/h1:1;for(const ch of R.G.children){const u=ch.userData;ch.scale.setScalar(u.s0*r);ch.position.copy(u.p0).multiplyScalar(r)}R.fitR=r}
function flay(v){if(!MUSC.R||v.rig0)return false;const R=MUSC.R;fitRigTo(R,v.rig,v);scene.add(R.G);v.rig0=v.rig;v.rig0.setVis(false);v.rig0.G.visible=false;v.rig=R;R.G.visible=true;R.setVis(true);R.G.position.copy(v.rig0.G.position);R.G.rotation.copy(v.rig0.G.rotation);return true}
function unflay(c){if(!c||!c.rig0)return;const R=c.rig;R.setVis(false);parkRig(R);c.rig=c.rig0;c.rig0=null;c.rig.G.visible=true;c.rig.setVis(true)}
const AIR={};
function airInit(){if(AIR.c)return;
 AIR.ringM=new THREE.MeshBasicMaterial({color:0xe8f4d8,transparent:true,opacity:.3,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});AIR.ringG=new THREE.TorusGeometry(1,.05,8,48);AIR.rings=[];
 for(let i=0;i<10;i++){const m=new THREE.Mesh(AIR.ringG,AIR.ringM.clone());m.visible=false;m.frustumCulled=false;scene.add(m);AIR.rings.push({m,a:-1})}
 const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,uniforms:{uT:{value:0},uA:{value:0}},
  vertexShader:'varying vec2 vU;varying vec3 vN,vV;void main(){vU=uv;vec4 w=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-w.xyz);gl_Position=projectionMatrix*w;}',
  fragmentShader:'uniform float uT,uA;varying vec2 vU;varying vec3 vN,vV;float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}void main(){float s=n(vec2(vU.x*18.,vU.y*5.-uT*9.))*.7+n(vec2(vU.x*41.,vU.y*11.-uT*15.))*.5;float st=smoothstep(.55,1.05,s);float fr=pow(1.-abs(dot(vN,vV)),1.6);float e=smoothstep(0.,.12,vU.y)*smoothstep(1.,.75,vU.y);gl_FragColor=vec4(vec3(.9,1.,.82)*(st*.8+fr*.2)*e*uA,1.);}'});
 AIR.c=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,32,1,true),mat);AIR.c.visible=false;AIR.c.frustumCulled=false;scene.add(AIR.c)}
function airHide(){if(!AIR.c)return;AIR.c.visible=false;for(const r of AIR.rings){r.m.visible=false;r.a=-1}}
function airStep(on,from,to,T){airInit();const d=to.clone().sub(from),L=d.length(),dir=d.clone().normalize(),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),dir);
 // cono di vento: dalla bocca (stretto) all'avversario (largo)
 const c=AIR.c;c.visible=on>0;if(on>0){c.position.copy(from).addScaledVector(dir,L*.55);c.quaternion.copy(q);c.scale.set(1,1,1);c.geometry.dispose();c.geometry=new THREE.CylinderGeometry(150*on,2.5,L*1.1,32,1,true);c.material.uniforms.uT.value=T/60;c.material.uniforms.uA.value=.38*on}
 if(on>0&&T%5===0){const r=AIR.rings.find(r=>r.a<0);if(r){r.a=0;r.m.visible=true;r.from=from.clone();r.dir=dir.clone();r.L=L}}
 const qr=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),dir);
 for(const r of AIR.rings){if(r.a<0)continue;r.a++;const u=r.a/26;if(u>1.25){r.a=-1;r.m.visible=false;continue}r.m.position.copy(r.from).addScaledVector(r.dir,r.L*u);r.m.quaternion.copy(qr);const s=12+150*u;r.m.scale.set(s,s,s*.6);r.m.material.opacity=.2*(1-u*.8)}}
// la lattina del GLB ha l'apertura verso il basso: la giro di mezzo giro attorno al suo centro, così l'apertura sta in alto (verso la bocca quando beve)
function canFit(G){fitOgg(G,'birra',{k:1.02,rot:[Math.PI,0,0]})}
function fBurp(T,k,v,f){propsInit();fire3Init();muscLoad();pose3D(k);pose3D(v);holdFrame();drops3Step();if(PROPS.cn&&PROPS.bfT>.6&&PROPS.mo){const top=PROPS.can.localToWorld(new THREE.Vector3(0,58,0)),lips=PROPS.mo.clone().addScaledVector(PROPS.fw,-2),e=lips.sub(top);PROPS.cOff=(PROPS.cOff||new THREE.Vector3()).addScaledVector(e,.5);if(PROPS.cOff.length()>40)PROPS.cOff.setLength(40)}if(T===1)PROPS.cOff=new THREE.Vector3();if(!PROPS.can){const G=new THREE.Group(),b=new THREE.Mesh(new THREE.CylinderGeometry(11,11,58,18),mat(0xc8ccd2,{metalness:.7,roughness:.3}));b.position.y=29;G.add(b);G.visible=false;scene.add(G);PROPS.can=G;if(OGG.birra)canFit(G)}
 const Cn=PROPS.can,sd=nearS(k),mid=(k.x+v.x)/2,J=()=>Math.random()-.5,arm=(base,a)=>armPose(f,base,a),
  hb=V3(bonePos(k,k.rig.B.head?'head':'neck')),fw=new THREE.Vector3().crossVectors(V3(bonePos(k,'uL')).sub(V3(bonePos(k,'uR'))),new THREE.Vector3(0,1,0)).setY(0).normalize(),hB=k.rig.B.head||k.rig.B.neck;if(T===1||T===13||!k._moL){k.rig.G&&k.rig.G.updateMatrixWorld&&k.rig.G.updateMatrixWorld(true);k._moL=hB.worldToLocal(hb.clone().addScaledVector(fw,37).add(new THREE.Vector3(0,-2,0)))}const mouth=hB.localToWorld(k._moL.clone());PROPS.fw=fw;PROPS.mo=mouth;
 const REL=P({h:580,t:-2,hd:4,tw:30,n:[45,235],f:[35,245],nl:[-330,0,0],fl:[260,0,0]});
 if(T===1){v.fpose=DAZE();v.fk=.2;k.fpose=REL;k.fk=.15;CUT(mid,350,1.1,{yaw:-f*.12,dol:.001});PROPS.cn=null;PROPS.bfT=0;v.swell=0;k.swell=0}
 if(T<=24)k.x+=(v.x-f*290-k.x)*.12;
 // 1) la lattina: la apre (psst), beve tre sorsi
 if(T===14){PROPS.cn=hold(Cn,k,sd,{ik:1,dir:()=>{const u=PROPS.bfT||0;return new THREE.Vector3(killer.f*.15,1,.1).lerp(PROPS.fw.clone().multiplyScalar(-.5).add(new THREE.Vector3(0,-.86,0)),u).normalize()},gy:24,len:58,rh:10});const h=headW(k);CUT(h.x+f*28,h.y-70,2.0,{yaw:f*.45,fov:28,dol:.0008});sfx('stoffa')}
 if(T===24){sfx('lattina');const p=Cn.position.clone().add(new THREE.Vector3(0,58,0));for(let i=0;i<26;i++)fx.push({x:p.x+J()*4,y:GROUND-p.y,z:p.z,vx:J()*3,vy:-2-Math.random()*4,l:22+Math.random()*16,c:i%2?'#fffbe8':'#f2e2a0',r:1+Math.random()*1.6,g:.18})}
 if(T===32){const h=headW(k);CUT(h.x+f*6,h.y-55,2.1,{yaw:f*.55,fov:28,dol:.0006});ARMIK.length=0;const lat=V3(bonePos(k,'u'+sd)).sub(V3(bonePos(k,'u'+(sd==='R'?'L':'R')))).setY(0).normalize();ARMIK.push({k,sd,t:()=>{const u=PROPS.bfT||0;if(!u||!PROPS.cn||state!=='fatality')return null;return handW(killer).lerp(PROPS.mo.clone().addScaledVector(PROPS.fw,17).add(new THREE.Vector3(0,28,0)).add(PROPS.cOff||new THREE.Vector3()),Math.min(1,u*1.3))},pole:lat.multiplyScalar(.9).add(new THREE.Vector3(0,-.5,0))})}
 if(T>=32&&T<92){PROPS.bfT=Math.min(1,(T-32)/12)*(T<80?1:Math.max(0,1-(T-80)/10));k.fpose=P({h:580,t:-4,hd:-24*PROPS.bfT,tw:30,n:[45,235],f:[35,245],nl:[-330,0,0],fl:[260,0,0]});k.fk=.25;if(T===46||T===58||T===70)sfx('sorso');k.swell=.02*Math.max(0,(T-44)/40)}
 if(T===92){ARMIK.length=0;PROPS.bfT=0}
 // la accartoccia e la butta
 if(T===96){k.fpose=arm(REL,[160,40]);k.fk=.3}
 if(T===100){Cn.scale.y*=.5;Cn.scale.x*=1.15;Cn.scale.z*=1.15;sfx('lamiera');shake=6;const h=handW(k);CUT(h.x,h.y-30,1.9,{yaw:f*.4,fov:30,dol:.0006})}
 if(T===104){k.fpose=arm(Object.assign({},REL,{t:-10,tw:-40}),[-260,120]);k.fk=.45;CUT(mid-f*60,330,1.2,{yaw:-f*.25,dol:.001})}
 if(T===110){k.fpose=arm(Object.assign({},REL,{t:8,tw:60}),[420,60]);k.fk=.7}
 if(T===113&&PROPS.cn){const p=Cn.position.clone();unhold(Cn,1);PROPS.cn=null;PROPS.cf={p,v:new THREE.Vector3(f*8,13,J()*4+3),r:0};Cn.visible=true;sfx('swingH')}
 if(PROPS.cf){const c=PROPS.cf;c.p.add(c.v);c.v.y-=.7;c.r+=.3;if(c.p.y<8){c.p.y=8;c.v.y*=-.35;c.v.x*=.6;if(Math.abs(c.v.y)>1.5)sfx('metallo')}Cn.position.copy(c.p);Cn.rotation.set(c.r,0,c.r*.6)}
 // 2) gonfia il petto
 if(T===128){const h=headW(k);CUT(h.x+f*40,h.y-110,1.55,{yaw:f*.35,fov:30,dol:-.001});k.fpose=P({h:600,t:-14,hd:-16,tw:20,x:-10,n:[30,240],f:[20,245],nl:[-330,0,0],fl:[260,0,0]});k.fk=.08;sfx('sorso')}
 if(T>=128&&T<140)k.swell=.02+.07*(T-128)/12;
 // 3) il rutto: onde d'aria visibili, vento, schizzi; la pelle vola via
 const B0=140,B1=228,on=T<B0?0:T<B0+8?(T-B0)/8:T<B1?1:Math.max(0,1-(T-B1)/12);
 if(T===B0){sfx('rutto');k.fpose=P({h:590,t:12,hd:18,tw:10,x:12,n:[20,250],f:[10,255],nl:[-380,0,0],fl:[300,0,0]});k.fk=.35;CUT(mid,330,1.25,{yaw:-f*.22,pitch:.02,dol:.0006});flash=Math.max(flash,.15)}
 if(T===B1+14)airHide();if(T>=B0&&T<B1+14){const to=chestW3(v,k).add(new THREE.Vector3(0,40,0));airStep(on,mouth.clone().addScaledVector(fw,2),to,T);if(on>0){shake=Math.max(shake,5*on);k.swell=Math.max(0,.09-(T-B0)*.0012)}
  if(on>.5&&T%2===0){const p=mouth.clone().addScaledVector(fw,3);for(let i=0;i<3;i++)fx.push({x:p.x,y:GROUND-p.y,z:p.z,vx:f*(10+Math.random()*12),vy:J()*3,l:16,c:i?'#f8f4dc':'#e6dcb0',r:1+Math.random()*1.5,g:0})}}
 if(T>=B0+10&&T<B1){const a=T-B0-10;v.fpose=P({h:612-a*.2,t:-22-Math.sin(T*.9)*4,hd:-30+Math.sin(T*1.3)*8,tw:Math.sin(T*.7)*14,x:-24,n:[200+Math.sin(T*1.1)*30,130],f:[190+Math.cos(T*1.2)*30,120],nl:[-200,0,0],fl:[170,0,0]});v.fk=.5;v.x=Math.max(120,Math.min(AW-120,v.x+f*.8));
  // brandelli di pelle e sangue che volano via nel vento
  const c=chestW3(v,k),hh=headW(v),n=a<20?2:5;for(let i=0;i<n;i++){const y=Math.random(),p=new THREE.Vector3(c.x+J()*40,40+y*(hh.y-20),c.z+J()*40);drops3('f',p,new THREE.Vector3(f*(4+Math.random()*9),1+Math.random()*4,J()*6),{r:2+Math.random()*4,w:(Math.random()-.5)*.8});if(i%2)drops3('b',p,new THREE.Vector3(f*(2+Math.random()*6),Math.random()*4,J()*5),{r:1+Math.random()*1.8})}
  if(a===20){sfx('squish');sfx('urlolungo')}}
 if(T===B0+44){if(flay(v)){v.fpose=null;v.flash=8;stop=5;shake=26;sfx('sangue');const c=chestW3(v,k);for(let i=0;i<60;i++)drops3('f',c.clone().add(new THREE.Vector3(J()*60,J()*220,J()*50)),new THREE.Vector3(f*(5+Math.random()*12),2+Math.random()*7,J()*9),{r:2.5+Math.random()*5,w:(Math.random()-.5)*.9});for(let i=0;i<90;i++)drops3('b',c.clone().add(new THREE.Vector3(J()*50,J()*200,J()*40)),new THREE.Vector3(f*(3+Math.random()*9)+J()*4,1+Math.random()*7,J()*8),{r:1+Math.random()*2.4});CUT(v.x,330,1.7,{yaw:f*.4,pitch:.03,fov:30,dol:.0008})}}
 // 4) il corpo di soli muscoli trema e crolla (stessa caduta del fulmine)
 if(v.rig0){const a=T-(B0+44);if(a<34){v.fclip=null;v.fpose=P({h:612-a*.6,t:-22-Math.sin(T*.9)*4,hd:-30+Math.sin(T*1.3)*8,tw:Math.sin(T*.7)*14,x:-24,n:[200+Math.sin(T*1.1)*30,130],f:[190+Math.cos(T*1.2)*30,120],nl:[-200,0,0],fl:[170,0,0]});v.fk=.5}else{v.fpose=null;v.fclip={c:'scossa',f:Math.min(152,62+(a-34)*.55),b:a<36?14:6}}if(a%3===0&&a<200){const p=V3(bonePos(v,a%2?'spine':'neck')).add(new THREE.Vector3(J()*20,J()*20,J()*14));drops3('b',p,new THREE.Vector3(J()*1.2,-.5-Math.random()*1.5,J()*1.2),{r:.9+Math.random()*1.5})}if(a===80||a===122)sfx('thud')}
 if(T===B1+16){k.swell=0;k.fpose=P({h:580,t:-6,hd:-10,tw:30,n:[45,235],f:[35,245],nl:[-330,0,0],fl:[260,0,0]});k.fk=.12;const h=headW(k);CUT(h.x+f*20,h.y-50,2.2,{yaw:f*.45,fov:28,dol:.001})}
 if(T===B1+40){sfx('risata');k.fpose=REL;k.fk=.1}
 if(T===B1+80){CUT(v.x,200,1.3,{yaw:f*.22,pitch:.26,orb:-f*.002});pool(v.x,80)}
 if(T===B1+150){CUT(mid,330,1.05,{yaw:-f*.1,orb:f*.0015});say('ACCOPPALO',420)}
 if(T===B1+230){airHide();endWin(k)}}
// ---------- Mario: il microfono. Lo tira fuori dalla tasca, lo porta alla bocca e urla: il suono si vede (onde dalla bocca), la pelle vola via ----------
function fScream(T,k,v,f){propsInit();fire3Init();muscLoad();pose3D(k);pose3D(v);holdFrame();drops3Step();
 if(!PROPS.mic){const G=new THREE.Group(),h=new THREE.Mesh(new THREE.CylinderGeometry(4.4,3.2,36,14),mat(0x1a1a1e,{metalness:.5,roughness:.4})),b=new THREE.Mesh(new THREE.SphereGeometry(8.5,16,12),mat(0x9aa0a8,{metalness:.8,roughness:.35}));h.position.y=18;b.position.y=42;G.add(h,b);G.visible=false;scene.add(G);PROPS.mic=G;if(OGG.microfono)fitOgg(G,'microfono',{k:1.05})}
 const Mc=PROPS.mic,sd=nearS(k),mid=(k.x+v.x)/2,J=()=>Math.random()-.5,arm=(base,a)=>armPose(f,base,a),
  hb=V3(bonePos(k,k.rig.B.head?'head':'neck')),fw=new THREE.Vector3().crossVectors(V3(bonePos(k,'uL')).sub(V3(bonePos(k,'uR'))),new THREE.Vector3(0,1,0)).setY(0).normalize(),mouth=hb.clone().addScaledVector(fw,42).add(new THREE.Vector3(0,-2.5,0));PROPS.fw=fw;PROPS.mo=mouth;
 const REL=P({h:580,t:-2,hd:4,tw:30,n:[45,235],f:[35,245],nl:[-330,0,0],fl:[260,0,0]});
 if(T===1){v.fpose=DAZE();v.fk=.2;k.fpose=REL;k.fk=.15;CUT(mid,350,1.1,{yaw:-f*.12,dol:.001});PROPS.mh=null;PROPS.mf=null;PROPS.mu=0}
 if(T<=24)k.x+=(v.x-f*300-k.x)*.12;
 // 1) la mano in tasca, esce il microfono
 if(T===18){k.fpose=arm(Object.assign({},REL,{tw:10}),[-60,250]);k.fk=.25;const h=handW(k);CUT(h.x,h.y-20,1.9,{yaw:f*.5,fov:30,dol:.0006})}
 if(T===32){PROPS.mh=hold(Mc,k,sd,{ik:1,dir:()=>{const u=PROPS.mu||0,h=handW(killer);return new THREE.Vector3(killer.f*.2,1,.1).lerp(PROPS.mo.clone().sub(h).normalize(),u).normalize()},gy:4,len:44,rh:5});sfx('stoffa')}
 if(T===40){ARMIK.length=0;const lat=V3(bonePos(k,'u'+sd)).sub(V3(bonePos(k,'u'+(sd==='R'?'L':'R')))).setY(0).normalize();
  ARMIK.push({k,sd,t:()=>{const u=PROPS.mu||0;if(!u||!PROPS.mh||state!=='fatality')return null;return handW(killer).lerp(PROPS.mo.clone().addScaledVector(PROPS.fw,8).add(new THREE.Vector3(0,-30,0)),u)},pole:lat.multiplyScalar(.8).add(new THREE.Vector3(0,-.6,0))});const h=headW(k);CUT(h.x+f*30,h.y-60,1.9,{yaw:f*.5,fov:30,dol:.0008})}
 if(T>=40&&T<200)PROPS.mu=Math.min(1,(T-40)/14);
 if(T===62){sfx('click');sfx('fischio')}
 if(T===70){k.fpose=P({h:575,t:6,hd:4,tw:20,x:4,n:[45,235],f:[35,245],nl:[-330,0,0],fl:[260,0,0]});k.fk=.2}
 // 2) l'urlo: dalla bocca (davanti al microfono) all'avversario
 const B0=84,B1=180,on=T<B0?0:T<B0+6?(T-B0)/6:T<B1?1:Math.max(0,1-(T-B1)/12);
 if(T===B0){sfx('grido');k.fpose=P({h:575,t:14,hd:2,tw:10,x:14,n:[45,235],f:[10,255],nl:[-380,0,0],fl:[300,0,0]});k.fk=.35;CUT(mid,330,1.25,{yaw:-f*.22,pitch:.02,dol:.0006});flash=Math.max(flash,.15)}
 if(T===B0+40)sfx('grido');
 if(T>=B0&&T<B1+14){const to=chestW3(v,k).add(new THREE.Vector3(0,50,0));airStep(on,mouth.clone().addScaledVector(fw,2),to,T);if(on>0)shake=Math.max(shake,6*on);
  if(on>.5&&T%2===0){const p=mouth.clone().addScaledVector(fw,3);for(let i=0;i<3;i++)fx.push({x:p.x,y:GROUND-p.y,z:p.z,vx:f*(10+Math.random()*12),vy:J()*3,l:16,c:i?'#e8f4ff':'#b8d8ff',r:1+Math.random()*1.5,g:0})}}
 if(T===B1+14)airHide();
 if(T>=B0+8&&T<B0+44){const a=T-B0-8;v.fpose=P({h:612-a*.2,t:-22-Math.sin(T*.9)*4,hd:-30+Math.sin(T*1.3)*8,tw:Math.sin(T*.7)*14,x:-24,n:[200+Math.sin(T*1.1)*30,130],f:[190+Math.cos(T*1.2)*30,120],nl:[-200,0,0],fl:[170,0,0]});v.fk=.5;v.x=Math.max(120,Math.min(AW-120,v.x+f*.8));
  const c=chestW3(v,k),hh=headW(v),n=a<16?2:5;for(let i=0;i<n;i++){const y=Math.random(),p=new THREE.Vector3(c.x+J()*40,40+y*(hh.y-20),c.z+J()*40);drops3('f',p,new THREE.Vector3(f*(4+Math.random()*9),1+Math.random()*4,J()*6),{r:2+Math.random()*4,w:(Math.random()-.5)*.8});if(i%2)drops3('b',p,new THREE.Vector3(f*(2+Math.random()*6),Math.random()*4,J()*5),{r:1+Math.random()*1.8})}
  if(a===16){sfx('squish');sfx('urlolungo')}}
 if(T===B0+44){if(flay(v)){v.fpose=null;v.flash=8;stop=5;shake=26;sfx('sangue');const c=chestW3(v,k);for(let i=0;i<60;i++)drops3('f',c.clone().add(new THREE.Vector3(J()*60,J()*220,J()*50)),new THREE.Vector3(f*(5+Math.random()*12),2+Math.random()*7,J()*9),{r:2.5+Math.random()*5,w:(Math.random()-.5)*.9});for(let i=0;i<90;i++)drops3('b',c.clone().add(new THREE.Vector3(J()*50,J()*200,J()*40)),new THREE.Vector3(f*(3+Math.random()*9)+J()*4,1+Math.random()*7,J()*8),{r:1+Math.random()*2.4});CUT(v.x,330,1.7,{yaw:f*.4,pitch:.03,fov:30,dol:.0008})}}
 if(v.rig0){const a=T-(B0+44);if(a<34){v.fclip=null;v.fpose=P({h:612-a*.6,t:-22-Math.sin(T*.9)*4,hd:-30+Math.sin(T*1.3)*8,tw:Math.sin(T*.7)*14,x:-24,n:[200+Math.sin(T*1.1)*30,130],f:[190+Math.cos(T*1.2)*30,120],nl:[-200,0,0],fl:[170,0,0]});v.fk=.5}else{v.fpose=null;v.fclip={c:'scossa',f:Math.min(152,62+(a-34)*.55),b:a<36?14:6}}if(a%3===0&&a<200){const p=V3(bonePos(v,a%2?'spine':'neck')).add(new THREE.Vector3(J()*20,J()*20,J()*14));drops3('b',p,new THREE.Vector3(J()*1.2,-.5-Math.random()*1.5,J()*1.2),{r:.9+Math.random()*1.5})}if(a===80||a===122)sfx('thud')}
 // 3) "mic drop": lo lascia cadere
 if(T===B1+24){k.fpose=REL;k.fk=.15;PROPS.mu=0;ARMIK.length=0;const h=headW(k);CUT(h.x+f*20,h.y-60,2,{yaw:f*.45,fov:28,dol:.001})}
 if(T===B1+40){k.fpose=arm(REL,[200,60]);k.fk=.3}
 if(T===B1+52&&PROPS.mh){const p=Mc.position.clone();unhold(Mc,1);PROPS.mh=null;PROPS.mf={p,v:new THREE.Vector3(0,0,0),r:0};Mc.visible=true;const h=handW(k);CUT(h.x,h.y-120,1.5,{yaw:f*.3,pitch:-.05,fov:30})}
 if(PROPS.mf){const c=PROPS.mf;c.p.add(c.v);c.v.y-=.6;c.r+=.12;if(c.p.y<5){c.p.y=5;if(Math.abs(c.v.y)>2){sfx('metallo');sfx('fischio')}c.v.y*=-.3;c.v.x*=.5}Mc.position.copy(c.p);Mc.rotation.set(0,0,Math.min(Math.PI/2,c.r)*f)}
 if(T===B1+70){k.fpose=REL;k.fk=.12;sfx('risata')}
 if(T===B1+110){CUT(v.x,200,1.3,{yaw:f*.22,pitch:.26,orb:-f*.002});pool(v.x,80)}
 if(T===B1+170){CUT(mid,330,1.05,{yaw:-f*.1,orb:f*.0015});say('ACCOPPALO',420)}
 if(T===B1+250){airHide();endWin(k)}}
// ---------- Zio Massimo: la bottiglia e la sigaretta ----------
// beve un sorso, gli spacca la bottiglia addosso (vetro e whisky), si accende una sigaretta con calma e gliela lancia: il whisky prende fuoco.
// ---------- gocce e schegge in 3D (bottiglia che si rompe): istanze con gravità, le gocce si allungano nel verso del moto e a terra fanno una macchia ----------
const D3={};
function drops3Init(){if(D3.d)return;const N=220,S=70,P=90,mk=(geo,mat,n)=>{const m=new THREE.InstancedMesh(geo,mat,n);m.count=0;m.frustumCulled=false;m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(m);return m};
 D3.d=mk(new THREE.SphereGeometry(1,8,6),new THREE.MeshStandardMaterial({color:0xa8560f,roughness:.05,metalness:.1,transparent:true,opacity:.85,emissive:0x3a1404,emissiveIntensity:.6}),N);
 const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute([0,1.6,0,-.7,-1,.15,.8,-.8,-.1,0,1.6,0,.8,-.8,-.1,-.7,-1,.15],3));sg.computeVertexNormals();
 D3.s=mk(sg,new THREE.MeshStandardMaterial({color:0x5a3410,roughness:.02,metalness:.3,transparent:true,opacity:.7,side:THREE.DoubleSide,emissive:0x22140a}),S);
 D3.p=mk(new THREE.CircleGeometry(1,14).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0x7a3c0c,roughness:.05,metalness:.2,transparent:true,opacity:.8,polygonOffset:true,polygonOffsetFactor:-2}),P);
 D3.b=mk(new THREE.SphereGeometry(1,8,6),new THREE.MeshStandardMaterial({color:0x7a0408,roughness:.15,metalness:.05,emissive:0x2a0002,emissiveIntensity:.5}),N);
 D3.f=mk(new THREE.BoxGeometry(2,.35,1.5),new THREE.MeshStandardMaterial({color:0xd49a7a,roughness:.6,emissive:0x3a0806,emissiveIntensity:.25}),140);
 D3.bp=mk(new THREE.CircleGeometry(1,14).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:0x4a0204,roughness:.1,metalness:.1,polygonOffset:true,polygonOffsetFactor:-2}),P);
 D3.L={d:[],s:[],p:[],b:[],f:[],bp:[]};D3.N={d:N,s:S,p:P,b:N,f:140,bp:P};D3.m=new THREE.Matrix4();D3.q=new THREE.Quaternion();D3.v=new THREE.Vector3();D3.sc=new THREE.Vector3();D3.up=new THREE.Vector3(0,1,0)}
function drops3(k,p,v,o){drops3Init();const L=D3.L[k];if(L.length>=D3.N[k])L.shift();L.push(Object.assign({p:p.clone(),v:v.clone(),r:1,a:0,sp:new THREE.Vector3(Math.random()-.5,Math.random()-.5,Math.random()-.5).normalize(),w:(Math.random()-.5)*.6,rest:0},o||{}))}
function drops3Step(){if(!D3.d)return;const{m,q,v,sc,up}=D3,g=.45;
 for(const k of['d','s','b','f']){const L=D3.L[k];for(let i=L.length-1;i>=0;i--){const e=L[i];e.a++;if(!e.rest){e.p.add(e.v);e.v.y-=g;e.v.multiplyScalar(.992);
   if(e.p.y<e.r*.4){if(k==='d'||k==='b'){if(Math.random()<.55)drops3(k==='d'?'p':'bp',new THREE.Vector3(e.p.x,.4,e.p.z),new THREE.Vector3(),{r:e.r*(1.6+Math.random()*1.8),grow:1});L.splice(i,1);continue}
    e.p.y=e.r*.3;if(Math.abs(e.v.y)>3){e.v.y*=-.25;e.v.x*=.5;e.v.z*=.5}else e.rest=1}}}
  const M=D3[k];M.count=L.length;for(let i=0;i<L.length;i++){const e=L[i];
   if(k==='d'||k==='b'){const s=Math.min(3.2,1+e.v.length()*.14);q.setFromUnitVectors(up,v.copy(e.v).normalize());sc.set(e.r/Math.sqrt(s),e.r*s,e.r/Math.sqrt(s))}
   else{q.setFromAxisAngle(e.sp,e.a*e.w*(e.rest?0:1)+e.w*40);sc.setScalar(e.r)}
   m.compose(e.p,q,sc);M.setMatrixAt(i,m)}M.instanceMatrix.needsUpdate=true}
 for(const k of['p','bp']){const L=D3.L[k],M=D3[k];M.count=L.length;for(let i=0;i<L.length;i++){const e=L[i];e.a++;const r=e.r*Math.min(1,.35+e.a*.08);q.identity();sc.set(r,1,r*(.7+.3*Math.sin(i)));m.compose(e.p,q,sc);M.setMatrixAt(i,m)}M.instanceMatrix.needsUpdate=true}}
function drops3Clear(){if(!D3.d)return;for(const k of['d','s','p','b','f','bp']){D3.L[k].length=0;D3[k].count=0}}
function bottleInit(){if(PROPS.bottle)return;
 {const G=new THREE.Group(),gl=mat(0x6b3a12,{transparent:true,opacity:.85,roughness:.08,metalness:.1}),b=new THREE.Mesh(new THREE.CylinderGeometry(9,9,40,16),gl),sh=new THREE.Mesh(new THREE.CylinderGeometry(3.4,9,9,16),gl),nk=new THREE.Mesh(new THREE.CylinderGeometry(3,3.4,14,12),gl),cap=new THREE.Mesh(new THREE.CylinderGeometry(3.4,3.4,4,12),mat(0x1a1410,{roughness:.4}));
  b.position.y=20;sh.position.y=44.5;nk.position.y=56;cap.position.y=64;G.add(b,sh,nk,cap);G.visible=false;scene.add(G);PROPS.bottle=G}
 {const G=new THREE.Group(),fil=new THREE.Mesh(new THREE.CylinderGeometry(1.15,1.15,5,10),mat(0xc98a3c,{roughness:.6})),pap=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,13,10),mat(0xf2efe8,{roughness:.7})),emb=new THREE.Mesh(new THREE.CylinderGeometry(1.12,1.0,1.6,10),new THREE.MeshBasicMaterial({color:0xff5a10,toneMapped:false}));
  fil.position.y=2.5;pap.position.y=11.5;emb.position.y=18.8;emb.visible=false;G.add(fil,pap,emb);G.userData={emb};G.visible=false;scene.add(G);PROPS.cig=G}
 if(OGG.bottiglia)fitOgg(PROPS.bottle,'bottiglia',{k:1.02})}
function fBottle(T,k,v,f){propsInit();fire3Init();bottleInit();pose3D(k);pose3D(v);holdFrame();drops3Step();if(!fireL){fireL=new LProxy(0xff7a26,0,1700,0);handL=new LProxy(0xffa040,0,800,0);scene.add(fireL,handL)}
 const Bt=PROPS.bottle,Cg=PROPS.cig,sd=nearS(k),so=sd==='R'?'L':'R',mid=(k.x+v.x)/2,J=()=>Math.random()-.5,
  hb=V3(bonePos(k,k.rig.B.head?'head':'neck')),fw=new THREE.Vector3().crossVectors(V3(bonePos(k,'uL')).sub(V3(bonePos(k,'uR'))),new THREE.Vector3(0,1,0)).setY(0).normalize(),mouth=hb.clone().addScaledVector(fw,38).add(new THREE.Vector3(0,-2,0)),arm=(base,a)=>armPose(f,base,a);PROPS.fw=fw;
 if(T===1){v.fpose=DAZE();v.fk=.2;k.fpose=P({h:580,t:2,hd:6,tw:30,n:[45,235],f:[35,245],nl:[-330,0,0],fl:[260,0,0]});k.fk=.15;CUT(mid,350,1.1,{yaw:-f*.12,dol:.001});PROPS.bt=null;PROPS.cg=null;PROPS.inMouth=0;Cg.userData.emb.visible=false}
 if(T<=24)k.x+=(v.x-f*330-k.x)*.12;
 // 1) tira fuori la bottiglia e beve un sorso
 if(T===16){PROPS.bh=hold(Bt,k,sd,{ik:1,dir:()=>{const u=PROPS.bfT||0;return new THREE.Vector3(killer.f*.2,1,.15).lerp((PROPS.fw||new THREE.Vector3(killer.f,0,0)).clone().multiplyScalar(-.72).add(new THREE.Vector3(0,-.6,0)),u).normalize()},gy:20,len:66,rh:8.5});sfx('vetro');const h=headW(k);CUT(h.x+f*30,h.y-60,2.1,{yaw:f*.45,fov:28,dol:.0008})}
 PROPS.mo=mouth;
 // beve: il collo della bottiglia alla bocca, il fondo in alto; la mano va dove serve (IK del braccio)
 if(T===26){ARMIK.length=0;ARMIK.push({k,sd,t:()=>{const u=PROPS.bfT||0;if(!u||!PROPS.bh||state!=='fatality')return null;const B=PROPS.fw.clone().multiplyScalar(-.72).add(new THREE.Vector3(0,-.6,0)).normalize(),m=PROPS.mo.clone().addScaledVector(B,-46),h=handW(killer);return h.lerp(m,Math.min(1,u*1.4))},pole:new THREE.Vector3(0,-1,-.2)})}
 if(T>=26&&T<64){PROPS.bfT=Math.min(1,(T-26)/12)*(T<52?1:Math.max(0,1-(T-52)/10));k.fpose=P({h:580,t:-4,hd:-18*PROPS.bfT,tw:30,n:[45,235],f:[35,245],nl:[-330,0,0],fl:[260,0,0]});k.fk=.25;if(T===40||T===46)sfx('squish')}
 if(T===63)ARMIK.length=0;
 if(T===64){PROPS.bfT=0;sfx('sforzo');k.fpose=arm({h:525,t:-12,hd:10,tw:-90,x:-30,n:[120,80],f:[240,-40],nl:[-400,0,0],fl:[300,0,0]},[-120,40]);k.fk=.14;CUT(mid-f*30,380,1.3,{yaw:-f*.2,pitch:.02,dol:.0018})}
 // 2) la lancia: vola girando e gli si spacca addosso
 if(T===84){k.fpose=arm({h:545,t:20,hd:12,tw:150,x:50,n:[200,60],f:[200,40],nl:[-420,0,0],fl:[320,0,0]},[440,-20]);k.fk=.7;sfx('swingH')}
 if(T===88&&PROPS.bh){const h=PROPS.bh,p=Bt.position.clone();unhold(Bt,1);PROPS.bh=null;const tg=headW(v).add(new THREE.Vector3(0,-30,0)),N=13,g=.55;PROPS.bt={p,v:new THREE.Vector3((tg.x-p.x)/N,(tg.y-p.y)/N+.5*g*N,(tg.z-p.z)/N),g,t:0,N};Bt.visible=true}
 const BT=PROPS.bt;if(BT&&!BT.hit){BT.t++;BT.p.add(BT.v);BT.v.y-=BT.g;Bt.position.copy(BT.p);Bt.rotation.set(0,0,-f*BT.t*.55);
  if(BT.t>=BT.N){BT.hit=T;Bt.visible=false;stop=7;shake=22;flash=Math.max(flash,.3);v.flash=6;sfx('vetro');sfx('hitH');sfx('urlo');const q=BT.p;
   // schegge di vetro e whisky in 3D: partono in avanti (verso dove andava la bottiglia), in alto e intorno alla testa
   for(let i=0;i<46;i++)drops3('s',q.clone().add(new THREE.Vector3(J()*14,J()*14,J()*14)),new THREE.Vector3(f*(2+Math.random()*7)+J()*6,2+Math.random()*9,J()*9),{r:2+Math.random()*4.5});
   for(let i=0;i<150;i++){const a=Math.random()*6.28,s=2+Math.random()*9;drops3('d',q.clone().add(new THREE.Vector3(J()*18,J()*18,J()*18)),new THREE.Vector3(f*(1+Math.random()*6)+Math.cos(a)*s*.6,1+Math.random()*8+Math.sin(a)*s*.3,Math.sin(a)*s*.7),{r:1+Math.random()*2.6})}
   gush(G2v(headW(v)),3,3,-f);v.fpose=P({h:612,t:-20,hd:-36,tw:0,x:-24,n:[160,120],f:[60,260],nl:[-160,0,0],fl:[140,0,0]});v.fk=.55;v.wet=1;CUT(v.x-f*20,400,1.9,{yaw:f*.35,pitch:.03,fov:30,dol:.001})}}
 if(BT&&BT.hit){const a=T-BT.hit;if(a<20)v.x=Math.max(120,Math.min(AW-120,v.x+f*5*Math.exp(-a/8)));if(a===22){v.fpose=Object.assign(DAZE(),{hd:-18,t:-10,n:[90,280],f:[20,300]});v.fk=.08}
  if(a>0&&a<110&&a%2===0){const h=headW(v),c=chestW3(v,k),p=(a%4?h.add(new THREE.Vector3(J()*30,-20-Math.random()*20,J()*20)):c.add(new THREE.Vector3(J()*40,J()*50,14)));drops3('d',p,new THREE.Vector3(J()*.6,-.5-Math.random(),J()*.6),{r:.9+Math.random()*1.4})}}
 // 3) si accende la sigaretta con calma
 // la sigaretta va in bocca (la porta la mano destra), la stessa mano torna su con l'accendino, poi la riprende per lanciarla
 const cdir=fw.clone().add(new THREE.Vector3(0,-.22,0)).normalize(),lips=mouth.clone().addScaledVector(fw,-1);PROPS.cdir=cdir;PROPS.lips=lips;
 if(T===124){const h=headW(k);CUT(h.x+f*20,h.y-50,2.6,{yaw:f*.5,fov:26,dol:.0006});k.fpose=P({h:580,t:-2,hd:4,tw:30,n:[45,235],f:[35,245],nl:[-330,0,0],fl:[260,0,0]});k.fk=.2;PROPS.cu=0;
  PROPS.ch=hold(Cg,k,sd,{ik:1,dir:()=>PROPS.cdir.clone(),gy:6,len:0,rh:5.2});sfx('stoffa');
  ARMIK.length=0;ARMIK.push({k,sd,t:()=>{if(state!=='fatality')return null;const u=PROPS.cu||0;if(u<=0)return null;const m=PROPS.ik||PROPS.lips.clone().addScaledVector(PROPS.cdir,9).add(new THREE.Vector3(0,-6,0));return handW(killer).lerp(m,u)},pole:new THREE.Vector3(0,-1,-.2)})}
 PROPS.ik=null;
 if(T>=126&&T<146)PROPS.cu=Math.min(1,(T-126)/12);
 if(T===146&&PROPS.ch){unhold(Cg,1);PROPS.ch=null;PROPS.inMouth=1}
 if(PROPS.inMouth){Cg.visible=true;_gm1.makeBasis(new THREE.Vector3().crossVectors(cdir,new THREE.Vector3(0,1,0)).normalize(),cdir,new THREE.Vector3().crossVectors(new THREE.Vector3().crossVectors(cdir,new THREE.Vector3(0,1,0)).normalize(),cdir));Cg.quaternion.setFromRotationMatrix(_gm1);Cg.position.copy(lips)}
 // l'accendino: la mano torna sotto la punta
 const tip=lips.clone().addScaledVector(cdir,19);
 if(T>=146&&T<186){const u=T<152?Math.max(0,1-(T-146)/6):T<160?(T-152)/8:T<178?1:Math.max(0,1-(T-178)/8);PROPS.cu=u;PROPS.ik=tip.clone().addScaledVector(fw,10).add(new THREE.Vector3(0,-24,0))}
 if(T>=160&&T<178){const p=tip.clone().add(new THREE.Vector3(0,-5,0));flame3(p.x,p.y,p.z,J()*.2,.5,J()*.2,10+Math.random()*6,2,4,{dr:.9,bu:.05,tu:.1});handL.intensity=1.6*(.8+.2*Math.random());handL.position.copy(p).add(new THREE.Vector3(0,10,40));if(T===160){sfx('click');sfx('fuoco')}if(T===170)Cg.userData.emb.visible=true}
 if(T===178)handL.intensity=0;
 if(T>=186&&T<200)PROPS.cu=0;
 if(T>=180&&T<214&&T%10===0)smoke3(tip.x,tip.y,tip.z,6,26,60);
 // la riprende dalla bocca
 if(T>=200&&T<214){PROPS.cu=Math.min(1,(T-200)/8);PROPS.ik=lips.clone().addScaledVector(cdir,9).add(new THREE.Vector3(0,-6,0))}
 if(T===208){PROPS.inMouth=0;PROPS.ch=hold(Cg,k,sd,{ik:1,dir:()=>PROPS.cdir.clone(),gy:6,len:0,rh:5.2})}
 if(T>=214&&T<229)PROPS.cu=Math.max(0,1-(T-214)/6);
 if(T===194){const p=mouth.clone().addScaledVector(fw,6);for(let i=0;i<5;i++)smoke3(p.x+J()*6,p.y,p.z,10,46+i*10,80+i*10)}
 if(T===200)CUT(mid,360,1.15,{yaw:-f*.15,dol:.0012});
 // 4) la lancia: una scia di scintille, il whisky prende fuoco
 if(T===214){k.fpose=arm({h:575,t:-2,hd:6,tw:40,n:[45,235],f:[35,245],nl:[-330,0,0],fl:[260,0,0]},[240,-60]);k.fk=.2}
 if(T===226){k.fpose=arm({h:575,t:6,hd:6,tw:90,n:[45,235],f:[35,245],nl:[-330,0,0],fl:[260,0,0]},[400,30]);k.fk=.6;sfx('swing')}
 if(T===229&&PROPS.ch){ARMIK.length=0;const p=Cg.position.clone();unhold(Cg,1);PROPS.ch=null;Cg.visible=true;const tg=chestW3(v,k),N=20,g=.35;PROPS.cg={p,v:new THREE.Vector3((tg.x-p.x)/N,(tg.y-p.y)/N+.5*g*N,(tg.z-p.z)/N),g,t:0,N};CUT((k.x+v.x)/2,300,1.35,{yaw:f*.25,pitch:.02,pan:f*1.2});slowN=2}
 const CG=PROPS.cg;if(CG&&!CG.hit){CG.t++;CG.p.add(CG.v);CG.v.y-=CG.g;Cg.position.copy(CG.p);Cg.rotation.set(CG.t*.3,0,-f*CG.t*.7);fx.push({x:CG.p.x,y:GROUND-CG.p.y,z:CG.p.z,vx:J()*.6,vy:J()*.6,l:14,c:'#ffb040',r:1.4,g:.04,glow:1});
  if(CG.t>=CG.N){CG.hit=T;Cg.visible=false;slowN=1;stop=6;shake=34;flash=Math.max(flash,.6);sfx('esplosione');sfx('fuoco');sfx('urlolungo');v.burn=.06;v.fpose=P({h:640,t:-30,hd:-34,tw:0,x:-30,n:[-40,-200],f:[-80,-160],nl:[-90,0,0],fl:[200,0,0]});v.fk=.6;const c=chestW3(v,k);
   for(let i=0;i<40;i++){const a=Math.random()*6.28;flame3(c.x+Math.cos(a)*20,c.y+J()*120,c.z+Math.sin(a)*20,Math.cos(a)*3,1+Math.random()*3,Math.sin(a)*3,22+Math.random()*16,16,40,{dr:.92,bu:.1,tu:.2})}CUT(v.x,360,1.6,{yaw:-f*.3,pitch:.02,orb:f*.004,fov:32})}}
 if(v.burn>0&&T<340){v.burn=Math.min(1,v.burn+.012);const s1=Math.sin(T*.47),s2=Math.cos(T*.39),s3=Math.sin(T*.61);if(T>CG.hit+12){v.fpose=P({h:630-v.burn*40,t:-12+s3*10,hd:-22+s1*14,tw:s2*30,x:-8,n:[70+s1*110,280+s2*120],f:[-10+s2*100,300+s3*110],nl:[-130+s1*60,0,0],fl:[110-s1*60,0,0]});v.fk=.35;v.x=Math.max(120,Math.min(AW-120,v.x+f*.6*Math.sin(T*.05)))}}
 if(v.burn>0){burnU(v,v.burn,T<340?.75+.25*Math.sin(T*.7)*Math.sin(T*.23):Math.max(.12,1-(T-340)/110)*(.8+.2*Math.sin(T*.5)));bodyFire3(v,T<340?6:T<400?3:T<460?1:0,T<350?1.1:.65);if(T%7===0&&T<440)sfx('crepita');fireL.intensity=2.2*(.7+.3*Math.random())*Math.max(.2,1-(T-300)/260);const c=chestW3(v,k);fireL.position.set(c.x,c.y+40,150);
  if(T<460&&T%5===0)smoke3(c.x+J()*50,c.y+40,c.z,40,200,120+Math.random()*60)}
 if(T===300){const h=headW(k);CUT(h.x+f*16,h.y-40,2.2,{yaw:f*.45,fov:28,dol:.001});sfx('risata');k.fpose=P({h:580,t:-8,hd:-14,tw:30,n:[45,235],f:[35,245],nl:[-330,0,0],fl:[260,0,0]});k.fk=.15}
 if(T===340){v.fpose=null;v.vx=0;start(v,'ko');sfx('thud');CUT(v.x,200,1.4,{yaw:f*.22,pitch:.26,orb:-f*.002})}
 if(T===380){pool(v.x,70);decals.push({x:v.x,z:0,r:0,R:130,c:'#1a1210',slow:1});CUT(mid,330,1.05,{yaw:-f*.1,orb:f*.0015});say('ACCOPPALO',420)}
 // le mani libere hanno il palmo girato in fuori con queste pose: avambraccio ruotato di mezzo giro (al prossimo fotogramma, in holdFrame)
 FTWIST.length=0;
 if(T===470){FTWIST.length=0;handL.intensity=0;endWin(k)}}
// ---------- Cholo: la telefonata e il camper dal cielo ----------
// Il camper arriva a tutta velocità, schiaccia l'avversario come una frittella, rimbalza sulle sospensioni e riparte lasciando le strisce di sangue.
function fCamper(T,k,v,f){propsInit();fire3Init();pose3D(k);pose3D(v);holdFrame();const Cm=PROPS.camper,Sh=PROPS.shadow,Ph=PROPS.phone,sd=nearS(k),mid=(k.x+v.x)/2,Hk=headW(k),ez=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)},T0=146,TF=176;
 if(T===1){v.fpose=DAZE();v.fk=.2;v.squash=0;k.fpose=P({h:580,t:2,hd:8,tw:30,n:[120,120],f:[180,40],nl:[-330,0,0],fl:[260,0,0]});k.fk=.2;CUT(mid,350,1.12,{yaw:-f*.12,dol:.0012});PROPS.cs={y:1750,vy:-140,land:0,x:v.x+f*255,roll:0};PROPS.ph=null;Cm.userData.body.position.y=0;Cm.userData.body.scale.y=1}
 if(T<=2)k.x=Math.max(110,Math.min(AW-110,v.x-f*520));
 phoneCall(T,k,f,T0,[[66,'«Pronto? Sì, sono io…»',62],[106,'«Mandamelo giù.»',36]]);
 if(T===T0){k.fpose=P({h:575,t:-6,hd:-18,tw:20,n:[170,60],f:[160,50],nl:[-330,0,0],fl:[260,0,0]});k.fk=.12}
 if(T>T0&&T<T0+50)k.x=Math.max(110,Math.min(AW-110,k.x-f*4));
 // l'ombra si allarga in fretta, il fischio, l'avversario guarda in su
 if(T===T0+6){CUT(v.x,250,1.45,{yaw:f*.25,pitch:.42,fov:32,dol:.002});Sh.visible=true;Sh.position.set(v.x+f*120,1.5,0);sfx('fischio')}
 if(T>=T0+6&&T<TF+17){const u=Math.min(1,(T-T0-6)/26);Sh.scale.set(30+u*u*640,30+u*u*210,1);Sh.material.opacity=.12+.55*u}
 if(T===T0+12){v.fpose=P({h:640,t:-14,hd:-46,tw:0,n:[60,300],f:[0,310],nl:[-160,0,0],fl:[130,0,0]});v.fk=.2;const h=headW(v);CUT(h.x,h.y-16,2.7,{yaw:-f*.35,pitch:-.02,fov:28,dol:.003})}
 if(T===T0+20){v.fpose=P({h:590,t:-22,hd:-52,tw:0,x:-10,n:[120,-330],f:[60,-340],nl:[-180,0,0],fl:[150,0,0]});v.fk=.4;sfx('urlo')}
 const S=PROPS.cs,ry=f>0?0:Math.PI;
 if(T===TF){CUT(v.x+f*120,470,.6,{yaw:-f*.16,pitch:-.03,fov:30});Cm.visible=true;sfx('rombo')}
 if(T>=TF&&S&&!S.land){S.vy-=7;S.y+=S.vy;Cm.position.set(S.x,Math.max(0,S.y),0);Cm.rotation.set(.06*Math.sin(T*.9),ry,-.16*f+.05*Math.sin(T*.7));if(S.y<700)v.fpose.h=590-(700-Math.max(0,S.y))*.2;if(S.y<470)v.squash=Math.max(v.squash||0,Math.min(.92,1-Math.max(0,S.y)/470));
  if(S.y<=0){S.y=0;S.land=T;Sh.visible=false;stop=7;shake=85;flash=Math.max(flash,.38);camKick={t:14,x:v.x,a:.1};sfx('schianto');sfx('esplosione');sfx('ossa');
   // spiaccicato: il corpo resta a terra, piatto, a braccia e gambe larghe
   v.squash=1;v.y=0;v.vy=0;v.fpose=P({h:640,rot:-rad(88),drop:505,t:-4,hd:-8,tw:0,x:0,n:[-200,330],f:[260,300],nl:[-250,0,10],fl:[240,0,-10]});v.fk=1;
   const q=[v.x,GROUND-10];for(const dd of[-1,1]){gush([v.x+dd*70,GROUND-12],120,26,dd*9);gush([S.x+dd*300,GROUND-12],70,18,dd*6)}gush(q,90,34,0);bones(q,50);pool(v.x,330);pool(v.x-200,140,60);pool(v.x+210,150,-50);pool(v.x+40,170,170);pool(v.x-60,150,-150);
   for(const dd of[-1,1])for(let i=0;i<4;i++)jet({src:()=>[v.x+dd*(40+Math.random()*60),GROUND-10],ang:dd>0?-.25-Math.random()*.5:Math.PI+.25+Math.random()*.5,life:16+i*4,rate:9,sp:15+i*3,r:2.2,spread:.3});
   for(let i=0;i<90;i++){const a=Math.random()*Math.PI,s=5+Math.random()*18;fx.push({x:S.x+(Math.random()-.5)*1000,y:GROUND-6,z:(Math.random()-.5)*260,vx:Math.cos(a)*s*1.5,vy:-Math.sin(a)*s*.5-1,l:50+Math.random()*40,c:Math.random()<.5?'#b8a48c':'#8c7a66',r:5+Math.random()*12,g:.03})}
   for(let i=0;i<50;i++){const a=Math.random()*Math.PI,s=6+Math.random()*16;fx.push({x:S.x+(Math.random()-.5)*600,y:GROUND-180-Math.random()*220,z:160,vx:Math.cos(a)*s,vy:-Math.sin(a)*s,l:40+Math.random()*30,c:'#dff3ff',r:1.5+Math.random()*2.5,g:.5,glow:1})}
   for(let i=0;i<30;i++)smoke3(S.x+(Math.random()-.5)*1000,10+Math.random()*60,160*(Math.random()-.3),60,280,90+Math.random()*60);
   try{spawn(v,{c:[v.x-f*40,60,250],part:1,vx:-f*5,vy:14,vz:7,rx:.12,ry:.2,rz:.1}).floor=22}catch(e){}
   CUT(S.x-f*120,230,.72,{yaw:-f*.3,pitch:.03,dol:.0012,orb:f*.002,fov:32})}}
 if(S&&S.land){const a=T-S.land,Bd=Cm.userData.body,e=Math.exp(-a/8),r0=a<30?0:ez((a-30)/80);S.roll=r0*640;
  Bd.position.y=-34*e*Math.cos(a*.5)-(a>30&&a<44?4*Math.sin((a-30)/14*Math.PI):0);Bd.scale.y=1-.1*e*Math.cos(a*.5);Cm.position.set(S.x+f*S.roll,a<10?16*Math.sin(a/10*Math.PI):0,0);Cm.rotation.set(.03*e*Math.cos(a*.6),ry,f*(-.1*e*Math.cos(a*.45)+.012)+(a>30?f*.012*Math.sin(a*.3)*(1-r0):0));
  if(a===6)sfx('vetro');if(a===16)sfx('portiera');if(a===30){sfx('rombo');sfx('lamiera')}
  // strisce di sangue lasciate dalle ruote dietro
  if(a>30&&a<110&&a%2===0){const wx=S.x+f*(S.roll-255),k2=Math.max(.15,1-(S.roll-0)/520);for(const wz of[-153,153])decals.push({x:wx,z:wz,r:0,R:30*k2,c:'#7a0711'})}
  if(a>3&&a<70&&a%5===0)jet({src:()=>[v.x+(Math.random()-.5)*260,GROUND-6],ang:-Math.PI/2+(Math.random()-.5)*2.4,life:8,rate:4,sp:6,r:1.8,spread:.5});
  if(a===14)slowN=1;
  if(a===52)CUT(v.x-f*30,60,1.75,{yaw:-f*.5,pitch:.2,fov:32,dol:.0012,orb:-f*.002});
  if(a===112){const h=headW(k);k.fpose=P({h:575,t:-2,hd:6,tw:40,n:[200,60],f:[160,50]});k.fk=.1;CUT(h.x+f*10,h.y-30,2.4,{yaw:f*.42,fov:28,dol:.001});sottot('«Puntuale.»',60)}
  if(a===172){CUT(v.x+f*200,300,.62,{yaw:-f*.14,pitch:.04,orb:f*.0014});say('ACCOPPALO',420)}
  if(a===262){sottot('',0);endWin(k)}}}
// ---------- Alessio: la provetta. La versa sul viso dell'avversario, che si ustiona e gli si scioglie la faccia ----------
// Lo scioglimento è nello shader del lottatore (uMelt): i vertici del viso colano verso il basso e la pelle diventa carne viva.
function buildTube(){const G=new THREE.Group(),gl=new THREE.MeshPhysicalMaterial({color:0xdff2ff,roughness:.05,metalness:0,transparent:true,opacity:.32,depthWrite:false}),lq=new THREE.MeshBasicMaterial({color:0x7dff3a,toneMapped:false}),
 b=new THREE.Mesh(new THREE.CylinderGeometry(3.6,3.6,30,16,1,true),gl),bt=new THREE.Mesh(new THREE.SphereGeometry(3.6,16,8,0,Math.PI*2,Math.PI/2,Math.PI/2),gl),rim=new THREE.Mesh(new THREE.TorusGeometry(3.7,.45,6,18),mat(0xcfe6f2,{roughness:.1})),
 liq=new THREE.Mesh(new THREE.CylinderGeometry(3,3,1,14),lq),lb=new THREE.Mesh(new THREE.SphereGeometry(3,14,8,0,Math.PI*2,Math.PI/2,Math.PI/2),lq),cork=new THREE.Mesh(new THREE.CylinderGeometry(3.9,3.1,6,12),mat(0x9a6a3c,{roughness:.9}));
 b.position.y=15;rim.rotation.x=Math.PI/2;rim.position.y=30;liq.position.y=11;liq.scale.y=22;cork.position.y=31.5;G.add(lb,liq,bt,b,rim,cork);const L=new LProxy(0x7dff3a,0,420,1.6);L.position.y=12;G.add(L);
 G.scale.setScalar(1.75);G.userData={liq,cork,L,set(u){liq.scale.y=Math.max(.01,22*u);liq.position.y=11*u;liq.visible=lb.visible=u>.02;L.intensity=u>.02?5:0}};G.visible=false;scene.add(G);return G}
function meltSet(v,k,t){const U=v.rig.m.userData.u;if(!U.uMelt)return;if(k>0&&!v.rig.meltOk){const F=v.rig.model.face;if(F){const e=F.eyes,m=F.mouth[F.mouth.length>>1];U.uMelt.value.set((e[0][0]+e[1][0])/2,(e[0][1]+e[1][1]+2*m[1])/4,(e[0][2]+e[1][2])/2-.02,.2*(F.size||1)*.66)}else{const J=v.rig.model.J||{},h=J.head||J.neck||{x:0,y:.72,z:0};U.uMelt.value.set(h.x,h.y+.1,h.z+.08,.17)}v.rig.meltOk=1}U.uMeltK.value=k;U.uMeltT.value=t||0}
function fAcid(T,k,v,f){propsInit();fire3Init();pose3D(k);pose3D(v);holdFrame();const Tb=PROPS.tube,U=Tb.userData,sd=nearS(k),mid=(k.x+v.x)/2,Hv=headW(v),ez=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)},T1=92,T2=128;
 if(T===1){v.fpose=DAZE();v.fk=.2;v.rig.meltOk=0;meltSet(v,0,0);k.fpose=P({h:580,t:2,hd:10,tw:30,n:[100,140],f:[170,40],nl:[-330,0,0],fl:[260,0,0]});k.fk=.2;U.set(1);U.cork.visible=true;PROPS.th=null;CUT(mid,350,1.15,{yaw:-f*.12,dol:.0012})}
 if(T<=70)k.x+=(v.x-f*250-k.x)*.08;else if(T<96)k.x+=(v.x-f*150-k.x)*.12;
 // la tira fuori dal camice e la guarda controluce
 if(T===12){PROPS.th=hold(Tb,k,sd,{dir:()=>{const u=Math.max(0,Math.min(1,(fatT-92)/22)),e=u*u*(3-2*u),w=fatT>170?Math.max(0,1-(fatT-170)/16):1;return new THREE.Vector3(killer.f*(.12+.5*e*w),1-1.78*e*w,.1*(1-e*w)).normalize()},rh:5.6,gy:13,len:54,bend:1.4});sfx('click');const h=handW(k);CUT(h.x+f*8,h.y+26,3,{yaw:f*.5,fov:24,rise:1.4,dol:.0006})}
 const H=PROPS.th;
 if(H&&T>=12&&T<T1){const u=ez((T-14)/26),hip=V3(bonePos(k,'hips')).add(new THREE.Vector3(f*40,60,40)),eye=headW(k).add(new THREE.Vector3(f*70,-8,26));aimGrip(k,H,hip.lerp(eye,u),1.2);k.fk=.6;
  if(T%5===0){const t=H.obj.position;fx.push({x:t.x+(Math.random()-.5)*4,y:GROUND-t.y-8-Math.random()*12,z:t.z,vx:0,vy:-.5-Math.random()*.5,l:14,c:'#c8ff8a',r:1+Math.random(),g:-.01,glow:1})}}
 if(T===44)sottot('«Acido. Fatto in casa.»',44);
 if(T===56){const h=headW(k);CUT(h.x+f*46,h.y-20,2.6,{yaw:f*.38,fov:28,dol:.0008})}
 if(T===78){sfx('tappo');U.cork.visible=false;const t=H.tip;fx.push({x:t.x,y:GROUND-t.y,z:t.z,vx:-f*3,vy:-9,l:50,c:'#9a6a3c',r:3.5,g:.45});k.fpose=P({h:575,t:8,hd:8,tw:50,n:[220,-200],f:[300,-60],nl:[-360,0,0],fl:[270,0,0]});k.fk=.3;CUT(mid+f*30,430,1.6,{yaw:-f*.3,dol:.002})}
 // lo versa: la provetta si inclina sopra la fronte e il getto cade sul viso
 if(H&&T>=82&&T<170){const top=Hv.clone().add(new THREE.Vector3(-f*36,30,0));aimHold(k,H,top,T<T1?.8:1.3);k.fk=.85;k.fpose.t=6;k.fpose.tw=20;k.fpose.h=640;if(T<T1+14){v.fpose=P({h:545,t:-12,hd:-26,tw:0,n:[60,330],f:[-10,335],nl:[-150,0,0],fl:[150,0,0]});v.fk=.2}}
 if(T>=T1+8&&T<T2+14){const u=(T-T1-8)/(T2+6-T1);U.set(Math.max(0,1-u));const t=H.tip;for(let i=0;i<3;i++){const n=7+i,g=.5,tx=Hv.x-f*22+(Math.random()-.5)*14,ty=GROUND-(Hv.y+8-Math.random()*30);fx.push({x:t.x,y:GROUND-t.y,z:t.z,vx:(tx-t.x)/n,vy:(ty-(GROUND-t.y))/n-.5*g*n,l:n+1,c:i?'#7dff3a':'#d6ff9a',r:2.4+Math.random()*2,g,glow:1})}}
 if(T===T1+14){stop=5;shake=10;v.flash=5;sfx('squish');sfx('sfrigolio');sfx('urlolungo');v.fpose=P({h:545,t:-16,hd:-30,tw:0,x:-10,n:[150,-250],f:[110,-240],nl:[-150,0,0],fl:[150,0,0]});v.fk=.35;CUT(Hv.x+f*8,Hv.y-10,3,{yaw:-f*.42,pitch:.03,fov:24,dol:.0009})}
 // il viso sfrigola, fuma, cola
 if(T>T1+14){const K=Math.min(1,(T-T1-14)/170);meltSet(v,K,T*.05);
  if(T%2===0&&K<.95)smoke3(Hv.x+(Math.random()-.5)*40,Hv.y-10+Math.random()*30,20+Math.random()*20,16,90+K*60,50+Math.random()*30);
  if(T%3===0&&K<.9)fx.push({x:Hv.x-f*14+(Math.random()-.5)*36,y:GROUND-Hv.y+10+Math.random()*30,z:26,vx:(Math.random()-.5)*.8,vy:.5,l:40,c:Math.random()<.35?'#9dff4a':'#a3101a',r:1.8+Math.random()*2.2,g:.35,glow:Math.random()<.35?1:0});
  if(T%22===0&&K<.8)sfx('sfrigolio');if(K>.25&&T%9===0&&K<.9)jet({src:()=>{const h=headW(victim);return[h.x+(Math.random()-.5)*30,GROUND-h.y+26]},ang:Math.PI/2+(Math.random()-.5)*.6,life:6,rate:3,sp:3,r:1.7,spread:.3})}
 if(T===T2+20){unhold(Tb);PROPS.th=null;k.fpose=P({h:575,t:-6,hd:-2,tw:20,n:[150,60],f:[160,50],nl:[-330,0,0],fl:[260,0,0]});k.fk=.12}
 if(T>T2+20&&T<T2+60)k.x=Math.max(110,Math.min(AW-110,k.x-f*2.4));
 if(T===T2+26){v.fpose=P({h:590,t:-8,hd:-22,tw:0,x:-14,n:[130,-330],f:[70,-335],nl:[-190,0,0],fl:[150,0,0]});v.fk=.3;CUT(v.x-f*10,400,1.5,{yaw:f*.3,orb:-f*.002,dol:.0012});sfx('urlo')}
 if(T>T2+26&&T<T2+70)v.x+=-f*Math.sin(T*.4)*2.2;
 if(T===T2+72){v.fpose=Object.assign(KNEEL(),{t:6,hd:-26,n:[150,-150],f:[110,-140]});v.fk=.18;sfx('thud')}
 if(T===T2+84){v.fpose=Object.assign(KNEEL(),{t:-4,hd:-34,n:[60,200],f:[20,210]});v.fk=.12;CUT(Hv.x+f*4,Hv.y-70,3.1,{yaw:-f*.2,pitch:-.05,fov:24,dol:.0007,rise:-.5});sfx('urlolungo')}
 if(T===T2+150){v.fpose=P({h:640,rot:-rad(88),drop:505,t:-4,hd:-8,tw:0,x:0,n:[-160,330],f:[200,300],nl:[-250,0,10],fl:[240,0,-10]});v.fk=.16;CUT(v.x,330,1.25,{yaw:f*.25,pitch:.05,dol:.001})}
 if(T===T2+166){sfx('thud');shake=8;pool(v.x+f*250,90);gush([v.x+f*240,GROUND-30],14,5,f)}
 if(T>T2+166&&T<T2+260&&T%4===0){const h=headW(v);smoke3(h.x,h.y+10,20,14,110,70)}
 if(T===T2+190){const h=headW(v);CUT(h.x,h.y+8,2.5,{yaw:f*.1,pitch:.5,fov:26,dol:.0006})}
 if(T===T2+240){const h=headW(k);k.fpose=P({h:575,t:-2,hd:6,tw:40,n:[200,-60],f:[160,50]});k.fk=.1;CUT(h.x+f*10,h.y-30,2.4,{yaw:f*.42,fov:28,dol:.001});sottot('«Esperimento riuscito.»',64)}
 if(T===T2+306){CUT(mid,320,.9,{yaw:-f*.14,pitch:.04,orb:f*.0014});say('ACCOPPALO',420)}
 if(T===T2+396){sottot('',0);endWin(k)}}
// ---------- la telefonata (Cholo, Biagio, Sena): tira fuori il telefono, compone il numero guardandolo, lo porta all'orecchio, annuisce e gesticola, riattacca ----------
function phoneCall(T,k,f,T0,subs){const Ph=PROPS.phone,sd='R',Hk=headW(k);
 // la clip vera (telefonata di Sena, Mixamo): prende il telefono, lo porta all'orecchio, parla gesticolando con l'altra mano, riattacca.
 // Il tempo della clip si adatta alla durata della chiamata di ogni mossa: salita 40 tick, chiamata quanto serve, discesa 24 tick.
 if(T>=8&&T<T0){const u=T-8,L=T0-8,a=40,b=24,cf=u<a?u/a*44:u<L-b?44+(u-a)/Math.max(1,L-a-b)*(186-44):186+(u-(L-b))/b*26,pf=k.fclip&&k.fclip.c==='phone'?k.fclip.f:cf;k.fclip={c:'phone',f:cf,fp:pf,b:T===8?10:6}}
 if(T===T0)k.fclip=null;
 if(T===14){PROPS.ph=hold(Ph,k,sd,{dir:()=>new THREE.Vector3(-killer.f*.25,1,.12).normalize(),hint:()=>new THREE.Vector3(-killer.f*.4,.2,-.9),bend:.35,rh:6.4,gy:-2,len:0,roll:Math.PI/2});sfx('click')}
 if(T===20){const h=handW(k,sd);CUT(h.x+f*6,h.y+16,2.7,{yaw:f*.5,fov:26,rise:1.2,dol:.0006})}
 if(T===25||T===29||T===33)sfx('click');
 if(T===48){CUT(Hk.x+f*16,Hk.y-30,2.5,{yaw:f*.42,fov:28,dol:.0007});sfx('telefono')}
 for(const s of subs)if(T===s[0])sottot(s[1],s[2]);
 if(T===T0-6){sfx('click');unhold(Ph);PROPS.ph=null}
 if(T===T0)sottot('',0)}
function sirena(v){if(typeof ac==='undefined'||!ac||ac.state!=='running')return;try{const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain(),bp=ac.createBiquadFilter();o.type='sawtooth';o.frequency.setValueAtTime(466,t);o.frequency.setValueAtTime(622,t+.5);bp.type='bandpass';bp.frequency.value=950;bp.Q.value=.7;
 g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*.13,t+.03);g.gain.setValueAtTime(v*.13,t+.97);g.gain.linearRampToValueAtTime(0,t+1.01);o.connect(bp);bp.connect(g);g.connect(window.__out||ac.destination);o.start(t);o.stop(t+1.03)}catch(e){}}
// voce del megafono: la sintesi vocale del browser, in italiano (solo audio; se manca resta il sottotitolo)
function voce(t){try{if(window.__test||!window.speechSynthesis)return;const u=new SpeechSynthesisUtterance(t);u.lang='it-IT';u.rate=.9;u.pitch=.55;u.volume=1;const vv=speechSynthesis.getVoices().find(x=>/^it/i.test(x.lang));if(vv)u.voice=vv;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}}

// ---------- Biagio: la telefonata alla Polizia. Tre volanti a sirene spiegate circondano l'avversario: «Sei in arresto!» ----------
// La volante è il modello caricato dall'utente (oggetti/volante.js, caricato solo se serve). Se non arriva, una sagoma semplice.
let VOL=null,VOLP=null;
function loadVolante(){if(VOLP)return VOLP;return VOLP=(async()=>{try{window.__GLB=window.__GLB||{};if(!window.__GLB.volante)await loadScript('oggetti/volante.js');const r=atob(window.__GLB.volante),u=new Uint8Array(r.length);for(let i=0;i<r.length;i++)u[i]=r.charCodeAt(i);delete window.__GLB.volante;const gl=await new Promise((ok,ko)=>gltfLoader().parse(u.buffer,'oggetti/',ok,ko));
  const sc=gl.scene,bb=new THREE.Box3().setFromObject(sc),sz=bb.getSize(new THREE.Vector3()),c=bb.getCenter(new THREE.Vector3()),G=new THREE.Group(),long=sz.x>=sz.z,s=1120/Math.max(sz.x,sz.z);sc.position.set(-c.x,-bb.min.y,-c.z);const W=new THREE.Group();W.add(sc);if(!long)W.rotation.y=Math.PI/2;W.scale.setScalar(s);G.add(W);
  sc.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;if(o.material){o.material.envMap=window.ENVTEX||null;o.material.envMapIntensity=.9}}});G.userData.h=sz.y*s;polScritte(G);VOL=G}catch(e){console.warn('volante non caricata',e);VOL=null}})()}

// scritte POLIZIA dritte: nel modello le lettere della portiera sono storte (sono dipinte nella texture). Ci va sopra una fascia bianca con la
// scritta, fatta di una griglia che segue la carrozzeria (ogni punto proiettato con un raggio sul fianco vero), su tutti e due i lati.
function polScritte(G){try{G.updateMatrixWorld(true);const ms=[];G.traverse(o=>{if(o.isMesh)ms.push(o)});const rc=new THREE.Raycaster(),cv=document.createElement('canvas');cv.width=1024;cv.height=256;const x=cv.getContext('2d');
 const gr=x.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#e9ebee');gr.addColorStop(1,'#d9dce0');x.fillStyle=gr;x.fillRect(0,0,1024,256);x.fillStyle='#0d2a6b';x.fillRect(0,196,1024,26);x.fillStyle='#111317';x.font='900 150px "Arial Black",Impact,"Helvetica Neue",Arial,sans-serif';x.textAlign='center';x.textBaseline='middle';x.save();x.translate(512,104);x.scale(1.08,1);x.fillText('POLIZIA',0,0);x.restore();
 // bordi sfumati, così la fascia non ha uno stacco netto sul bianco della portiera
 const id=x.getImageData(0,0,1024,256),D=id.data;for(let j=0;j<256;j++)for(let i=0;i<1024;i++){const e=Math.min(i,1023-i)/40,f=Math.min(j,255-j)/22,a=Math.max(0,Math.min(1,Math.min(e,f)));D[(j*1024+i)*4+3]=255*a}x.putImageData(id,0,0);
 const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;tx.anisotropy=8;const X0=-200,X1=200,Y0=100,Y1=210,NX=34,NY=8;
 for(const sd of[1,-1]){const pos=[],uv=[],idx=[];for(let j=0;j<=NY;j++)for(let i=0;i<=NX;i++){const px=X0+(X1-X0)*i/NX,py=Y0+(Y1-Y0)*j/NY;rc.set(new THREE.Vector3(px,py,sd*900),new THREE.Vector3(0,0,-sd));const h=rc.intersectObjects(ms,false)[0];const pz=h?h.point.z+sd*1.6:sd*150;pos.push(px,py,pz);uv.push(sd>0?i/NX:1-i/NX,j/NY)}
  for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){const a=j*(NX+1)+i,b=a+1,c=a+NX+1,d=c+1;if(sd>0)idx.push(a,b,c,b,d,c);else idx.push(a,c,b,b,c,d)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:tx,transparent:true,roughness:.35,metalness:.05,envMap:window.ENVTEX||null,envMapIntensity:.6,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));m.receiveShadow=true;G.add(m)}}catch(e){console.warn('scritte polizia',e)}}
function buildVolante(){const G=new THREE.Group(),body=new THREE.Group();G.add(body);
 const L1=new LProxy(0x2a5cff,0,2400,1.2),L2=new LProxy(0x2a5cff,0,2400,1.2),bm=()=>new THREE.MeshBasicMaterial({color:0x06103a,toneMapped:false}),b1=new THREE.Mesh(new THREE.BoxGeometry(46,16,60),bm()),b2=new THREE.Mesh(new THREE.BoxGeometry(46,16,60),bm());
 G.add(L1,L2,b1,b2);G.userData={body,L:[L1,L2],lamp:[b1,b2],ok:0};G.visible=false;scene.add(G);return G}
function volanteReady(G){const U=G.userData;if(U.ok)return;U.ok=1;let h=330;if(VOL){const c=VOL.clone(true);U.body.add(c);h=VOL.userData.h}else{const m=mat(0x2a78c8,{roughness:.35,metalness:.3}),a=new THREE.Mesh(new THREE.BoxGeometry(1100,150,430),m),b=new THREE.Mesh(new THREE.BoxGeometry(560,130,400),mat(0x15171a,{roughness:.2}));a.position.y=130;b.position.y=270;U.body.add(a,b)}
 U.lamp[0].position.set(-10,h+6,-70);U.lamp[1].position.set(-10,h+6,70);U.L[0].position.set(0,h+90,-90);U.L[1].position.set(0,h+90,90);U.lamp[0].visible=U.lamp[1].visible=!VOL}
function volanteFlash(G,T,on){const U=G.userData,a=on&&(T>>2)%4<2,b=on&&(T>>2)%4>=2;U.L[0].intensity=a?26:0;U.L[1].intensity=b?26:0;U.lamp[0].material.color.setHex(a?0x4a7cff:0x06103a);U.lamp[1].material.color.setHex(b?0x4a7cff:0x06103a)}
function fPolice(T,k,v,f){propsInit();fire3Init();pose3D(k);pose3D(v);holdFrame();const mid=(k.x+v.x)/2,T0=132,C=PROPS.pc;
 if(T===1){v.fpose=DAZE();v.fk=.2;k.fpose=P({h:580,t:2,hd:8,tw:30,n:[120,120],f:[180,40],nl:[-330,0,0],fl:[260,0,0]});k.fk=.2;CUT(mid,350,1.12,{yaw:-f*.12,dol:.0012});PROPS.ph=null;
  // dove si fermano: una dietro l'avversario, una di traverso sul fondo, una di sbieco dal lato di chi chiama
  PROPS.ps={sir:0,car:[{x1:v.x+f*640,z1:-150,x0:v.x+f*3300,z0:-260,ry:f>0?Math.PI-.5:.5,t0:T0+16},{x1:v.x-f*60,z1:-640,x0:v.x-f*3400,z0:-640,ry:f>0?.12:Math.PI-.12,t0:T0+34},{x1:v.x-f*700,z1:-380,x0:v.x-f*3300,z0:-900,ry:f>0?-.62:Math.PI+.62,t0:T0+52}]};
  for(const c of C){volanteReady(c);c.visible=false;volanteFlash(c,0,0)}}
 const S=PROPS.ps;
 if(T<=2)k.x=Math.max(110,Math.min(AW-110,v.x-f*600));
 phoneCall(T,k,f,T0,[[62,'«Pronto, Polizia? Mi stanno menando.»',58],[100,'«Sì, è ancora qui. Fate con comodo.»',30]]);
 if(T===T0){k.fpose=P({h:575,t:-6,hd:2,tw:20,n:[170,60],f:[160,50],nl:[-330,0,0],fl:[260,0,0]});k.fk=.12;S.sir=1}
 if(S.sir&&(T-T0)%60===0)sirena(1);
 if(T===T0+8){CUT(v.x-f*60,300,.72,{yaw:-f*.1,pitch:.05,fov:34,dol:.0006});v.fpose=P({h:630,t:-6,hd:-10,tw:-40,n:[110,-100],f:[50,-90],nl:[-170,0,0],fl:[140,0,0]});v.fk=.2}
 // arrivano sgommando una dopo l'altra: frenata, coda che parte, muso che si abbassa
 for(let i=0;i<3;i++){const c=C[i],q=S.car[i],a=T-q.t0,N=34;if(a<0)continue;c.visible=true;const u=Math.min(1,a/N),e=1-Math.pow(1-u,3),sk=a<N?Math.sin(u*Math.PI)*(i===1?.18:.5)*(i===2?-1:1):0,st=a>=N?Math.exp(-(a-N)/7)*Math.cos((a-N)*.55):0;
  c.position.set(q.x0+(q.x1-q.x0)*e,0,q.z0+(q.z1-q.z0)*e);c.rotation.y=q.ry+sk*f;c.userData.body.rotation.z=-(a<N?.03*u:0)-.035*st;c.userData.body.position.y=a>=N?-5*st:0;volanteFlash(c,T+i*3,1);
  if(a===2)sfx('rombo');if(a===N-14)sfx('sgommata');if(a===N){shake=9;sfx('thud')}
  if(a>N-16&&a<N+4&&a%2===0)for(let j=0;j<3;j++)smoke3(c.position.x+(Math.random()-.5)*700,14+Math.random()*30,c.position.z+(Math.random()-.5)*300,40,190,50+Math.random()*30)}
 if(T===T0+30){v.fpose=P({h:630,t:-4,hd:-6,tw:40,n:[120,-120],f:[60,-110],nl:[-170,0,0],fl:[140,0,0]});v.fk=.25}
 if(T===T0+52){const h=headW(v);CUT(h.x,h.y-30,2.2,{yaw:f*.3,fov:28,orb:-f*.004,dol:.0006});v.fpose=P({h:630,t:-6,hd:-12,tw:-30,n:[110,-100],f:[50,-90],nl:[-170,0,0],fl:[140,0,0]});v.fk=.3}
 if(T===T0+92){CUT(v.x-f*40,330,.66,{yaw:-f*.2,pitch:.07,fov:34,orb:f*.0016});sottot('«FERMO! SEI IN ARRESTO!»',84);voce('Fermo! Sei in arresto!');sfx('urlo')}
 if(T===T0+106){v.fpose=P({h:640,t:-8,hd:-14,tw:0,n:[70,-380],f:[20,-385],nl:[-170,0,0],fl:[140,0,0]});v.fk=.3;sfx('whoosh')}
 if(T===T0+150){const h=headW(v);CUT(h.x-f*10,h.y-60,1.9,{yaw:-f*.42,fov:28,dol:.0008,rise:-.5})}
 if(T===T0+164){v.fpose=Object.assign(KNEEL(),{t:4,hd:8,n:[40,-330],f:[0,-335]});v.fk=.14;sfx('thud')}
 if(T===T0+190){v.fpose=Object.assign(KNEEL(),{t:10,hd:22,n:[-30,-300],f:[-60,-300]});v.fk=.12;sfx('manette')}
 if(T===T0+228){S.sir=0;const h=headW(k);k.fpose=P({h:580,t:-4,hd:4,tw:30,n:[150,-330],f:[160,50],nl:[-330,0,0],fl:[260,0,0]});k.fk=.14;CUT(h.x+f*10,h.y-30,2.3,{yaw:f*.42,fov:28,dol:.001});sottot('«Buon soggiorno.»',60)}
 if(T>T0+228&&T<T0+290)k.fpose.n=[150+34*Math.sin(T*.5),-330];
 if(T===T0+294){CUT(v.x-f*60,320,.62,{yaw:-f*.14,pitch:.05,orb:f*.0014,fov:34});say('ACCOPPALO',420)}
 if(T===T0+384){sottot('',0);endWin(k)}}

// ---------- Sena: la telefonata al DJ. Dal cielo cade una palla da discoteca avvolta nel filo spinato e spiaccica l'avversario ----------
function buildDisco(){const G=new THREE.Group(),R=215,spin=new THREE.Group();G.add(spin);
 const ball=new THREE.Mesh(new THREE.SphereGeometry(R,30,20),new THREE.MeshStandardMaterial({color:0xe6ecf6,metalness:.92,roughness:.1,flatShading:true,envMap:window.ENVTEX||null,envMapIntensity:3.2,emissive:0x39414f}));ball.castShadow=true;spin.add(ball);
 const wm=mat(0x3a3d42,{roughness:.45,metalness:.9}),bg=new THREE.ConeGeometry(2.6,26,5);
 for(const[rx,rz]of[[0,0],[1.05,.3],[-1.0,.5],[.35,1.35],[1.57,0]]){const ring=new THREE.Group();for(const dz of[-2.5,2.5]){const t=new THREE.Mesh(new THREE.TorusGeometry(R+5,2.6,6,72),wm);t.position.z=dz;ring.add(t)}
  for(let i=0;i<26;i++){const a=i/26*Math.PI*2+rx,p=new THREE.Group();p.position.set(Math.cos(a)*(R+5),Math.sin(a)*(R+5),0);p.rotation.z=a;for(const[ex,ez]of[[.9,.5],[-.9,.5],[.3,-1],[-.3,1.1]]){const b=new THREE.Mesh(bg,wm);b.rotation.set(ex,0,ez+Math.PI/2);p.add(b)}ring.add(p)}
  ring.rotation.set(rx,0,rz);spin.add(ring)}
 const cap=new THREE.Mesh(new THREE.CylinderGeometry(22,30,34,12),wm);cap.position.y=R+10;const chain=new THREE.Mesh(new THREE.CylinderGeometry(5,5,3200,6),wm);chain.position.y=R+1620;G.add(cap,chain);
 const L=[0xff3ad0,0x35d6ff,0xfff06a].map((c,i)=>{const l=new LProxy(c,0,1700,1.3);l.position.set(Math.cos(i*2.1)*330,60,Math.sin(i*2.1)*330+120);G.add(l);return l});
 G.userData={R,spin,L,chain};G.visible=false;scene.add(G);return G}
function fDisco(T,k,v,f){propsInit();fire3Init();pose3D(k);pose3D(v);holdFrame();const D=PROPS.disco,U=D.userData,R=U.R,Sh=PROPS.shadow,mid=(k.x+v.x)/2,ez=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)},T0=140,TF=168,COL=['#ff3ad0','#35d6ff','#fff06a'];
 if(T===1){v.fpose=DAZE();v.fk=.2;v.squash=0;k.fpose=P({h:580,t:2,hd:8,tw:30,n:[120,120],f:[180,40],nl:[-330,0,0],fl:[260,0,0]});k.fk=.2;CUT(mid,350,1.12,{yaw:-f*.12,dol:.0012});PROPS.ds={y:2100,vy:-120,land:0,x:v.x,rot:0};PROPS.ph=null;U.spin.scale.set(1,1,1)}
 if(T<=2)k.x=Math.max(110,Math.min(AW-110,v.x-f*470));
 phoneCall(T,k,f,T0,[[64,'«Ohi, DJ? Sono Sena.»',52],[104,'«Fai scendere la palla.»',34]]);
 if(T===T0){k.fpose=P({h:575,t:-6,hd:-18,tw:20,n:[170,60],f:[160,50],nl:[-330,0,0],fl:[260,0,0]});k.fk=.12}
 if(T>T0&&T<T0+40)k.x=Math.max(110,Math.min(AW-110,k.x-f*3));
 const S=PROPS.ds,lights=(on)=>{for(let i=0;i<3;i++)U.L[i].intensity=on&&((T>>3)+i)%3!==0?30:0};
 // luci da discoteca sul pavimento, l'ombra tonda che si allarga
 if(T>=T0+4&&T%2===0){const a=T*.21;for(let i=0;i<3;i++){const b=a+i*2.1,r=260+90*Math.sin(T*.07+i);fx.push({x:S.x+Math.cos(b)*r*1.6,y:GROUND-3,z:Math.sin(b)*r*.6,vx:0,vy:0,l:5,c:COL[i],r:13,g:0,glow:1})}}
 if(T===T0+6){CUT(v.x,250,1.45,{yaw:f*.25,pitch:.42,fov:32,dol:.002});Sh.visible=true;Sh.position.set(v.x,1.5,0);sfx('fischio')}
 if(T>=T0+6&&!S.land){const u=Math.min(1,(T-T0-6)/24);Sh.scale.set(30+u*u*(R*1.25),30+u*u*(R*1.25),1);Sh.material.opacity=.12+.55*u}
 if(T===T0+12){v.fpose=P({h:640,t:-14,hd:-46,tw:0,n:[60,300],f:[0,310],nl:[-160,0,0],fl:[130,0,0]});v.fk=.2;const h=headW(v);CUT(h.x,h.y-16,2.7,{yaw:-f*.35,pitch:-.02,fov:28,dol:.003})}
 if(T===T0+20){v.fpose=P({h:590,t:-22,hd:-52,tw:0,x:-10,n:[120,-330],f:[60,-340],nl:[-180,0,0],fl:[150,0,0]});v.fk=.4;sfx('urlo')}
 if(T===TF){CUT(v.x,520,.62,{yaw:-f*.16,pitch:-.05,fov:32});D.visible=true;sfx('rombo')}
 if(T>=TF&&D.visible){S.rot+=S.land?.02+.1*Math.exp(-(T-S.land)/40):.16;U.spin.rotation.y=S.rot;lights(1)}
 if(T>=TF&&!S.land){S.vy-=6;S.y+=S.vy;D.position.set(S.x,Math.max(R,S.y),0);const b=S.y-R;if(b<700)v.fpose.h=590-(700-Math.max(0,b))*.2;if(b<470)v.squash=Math.max(v.squash||0,Math.min(.92,1-Math.max(0,b)/470));
  if(b<=0){S.y=R;S.land=T;Sh.visible=false;stop=7;shake=70;flash=Math.max(flash,.34);camKick={t:14,x:v.x,a:.1};sfx('schianto');sfx('ossa');sfx('vetro');sfx('squish');
   v.squash=1;v.y=0;v.vy=0;v.fpose=P({h:640,rot:-rad(88),drop:505,t:-4,hd:-8,tw:0,x:0,n:[-200,330],f:[260,300],nl:[-250,0,10],fl:[240,0,-10]});v.fk=1;
   const q=[v.x,GROUND-10];for(const dd of[-1,1])gush([v.x+dd*90,GROUND-12],110,24,dd*9);gush(q,80,30,0);bones(q,40);pool(v.x,300);pool(v.x-190,130,60);pool(v.x+200,140,-50);pool(v.x+30,150,160);
   for(const dd of[-1,1])for(let i=0;i<4;i++)jet({src:()=>[v.x+dd*(60+Math.random()*80),GROUND-10],ang:dd>0?-.25-Math.random()*.5:Math.PI+.25+Math.random()*.5,life:16+i*4,rate:9,sp:15+i*3,r:2.2,spread:.3});
   // specchietti che schizzano via
   for(let i=0;i<70;i++){const a=Math.random()*Math.PI,s=7+Math.random()*17;fx.push({x:S.x+(Math.random()-.5)*300,y:GROUND-60-Math.random()*260,z:(Math.random()-.3)*240,vx:Math.cos(a)*s,vy:-Math.sin(a)*s,l:40+Math.random()*30,c:Math.random()<.6?'#eef6ff':COL[i%3],r:1.6+Math.random()*2.6,g:.5,glow:1})}
   for(let i=0;i<16;i++)smoke3(S.x+(Math.random()-.5)*600,10+Math.random()*50,140*(Math.random()-.3),50,230,80+Math.random()*50);
   CUT(S.x-f*90,230,.86,{yaw:-f*.3,pitch:.03,dol:.0012,orb:f*.002,fov:32})}}
 if(S&&S.land){const a=T-S.land,e=Math.exp(-a/9);D.position.set(S.x,R-R*.1*e+46*e*Math.abs(Math.sin(a*.42)),0);U.spin.scale.y=1-.1*e*Math.cos(a*.5);D.rotation.z=.05*e*Math.sin(a*.4);
  if(a>3&&a<80&&a%5===0)jet({src:()=>[v.x+(Math.random()-.5)*300,GROUND-6],ang:-Math.PI/2+(Math.random()-.5)*2.4,life:8,rate:4,sp:6,r:1.8,spread:.5});
  if(a===14)slowN=1;
  if(a===50)CUT(v.x-f*40,70,1.7,{yaw:-f*.5,pitch:.18,fov:32,dol:.0012,orb:-f*.002});
  // Sena balla
  if(a>=100&&a<230&&a%14===0){const s=(a/14)&1;k.fpose=P({h:s?560:590,t:s?6:-6,hd:s?-6:8,tw:s?60:10,n:s?[240,-330]:[200,120],f:s?[120,150]:[160,-300],nl:[-330,0,0],fl:[260,0,0]});k.fk=.3}
  if(a===100){const h=headW(k);CUT(h.x+f*10,h.y-70,1.6,{yaw:f*.38,fov:30,dol:.0008});sottot('«La serata è finita.»',64)}
  if(a===172){CUT(v.x-f*120,330,.66,{yaw:-f*.14,pitch:.04,orb:f*.0014,fov:34});say('ACCOPPALO',420)}
  if(a===262){sottot('',0);endWin(k)}}}

// ---------- Perna: gli prende la testa tra le mani e gli infila i pollici nelle orbite ----------
function eyesGore(v,K,t){const U=v.rig.m.userData.u;if(!U.uMelt)return;if(K>0&&!v.rig.eyeOk){const F=v.rig.model.face;if(F){const e=F.eyes;U.uMelt.value.set((e[0][0]+e[1][0])/2,(e[0][1]+e[1][1])/2,(e[0][2]+e[1][2])/2-.02,.1*(F.size||1))}else{const J=v.rig.model.J||{},h=J.head||J.neck||{x:0,y:.72,z:0};U.uMelt.value.set(h.x,h.y+.13,h.z+.08,.08)}v.rig.eyeOk=1}U.uMeltK.value=K;U.uMeltT.value=t||0}
function fEyes(T,k,v,f){propsInit();fire3Init();pose3D(k);pose3D(v);holdFrame();const mid=(k.x+v.x)/2,Hv=headW(v),E=PROPS.eyeD,ez=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)},TG=46,TI=72,TR=214,
  eye=s=>[Hv.x-f*22,GROUND-(Hv.y-2),s*11];
 if(T===1){v.fpose=DAZE();v.fk=.2;v.rig.eyeOk=0;v.rig.meltOk=0;eyesGore(v,0,0);k.fpose=P({h:580,t:4,hd:8,tw:20,n:[140,60],f:[150,40],nl:[-330,0,0],fl:[260,0,0]});k.fk=.2;PROPS.eh=null;CUT(mid,350,1.15,{yaw:-f*.12,dol:.0012})}
 if(T<=40)k.x+=(v.x-f*118-k.x)*.1;
 if(T===26){k.fpose=P({h:585,t:8,hd:6,tw:4,n:[200,-150],f:[200,-150],nl:[-350,0,0],fl:[270,0,0]});k.fk=.3;PROPS.eh=['R','L'].map((sd,i)=>hold(E[i],k,sd,{dir:new THREE.Vector3(0,1,0),hint:new THREE.Vector3(f,0,0),rh:8.5,gy:0,len:0,bend:1.6}))}
 const H=PROPS.eh;
 if(H&&T>=26&&T<TR){const dn=T>TI+50?ez((T-TI-50)/40):0;for(let i=0;i<2;i++)aimGrip(k,H[i],Hv.clone().add(new THREE.Vector3(-f*30,-26,i?-20:20)),T<TG?.5:1.2);k.fk=.8;k.fpose.h=585-70*dn;k.fpose.t=8+8*dn}
 if(T===TG){stop=3;shake=6;sfx('thud');v.fpose=P({h:625,t:-10,hd:-24,tw:0,n:[150,-60],f:[110,-50],nl:[-170,0,0],fl:[140,0,0]});v.fk=.35;CUT(Hv.x-f*14,Hv.y-10,2.9,{yaw:-f*.5,pitch:.02,fov:24,dol:.0008})}
 if(T===TG+12)sottot('«Guardami bene.»',24);
 // i pollici affondano
 if(T===TI){stop=6;shake=12;v.flash=5;sfx('squish');sfx('ossa');sfx('urlolungo');CUT(Hv.x-f*4,Hv.y-6,3.3,{yaw:-f*.34,pitch:.03,fov:22,dol:.0012,orb:-f*.0012})}
 if(T>TI&&T<TR+60){const K=Math.min(.6,.24+(T-TI)/220);eyesGore(v,K,-1-T*.03)}
 if(T>=TI&&T<TR){if((T-TI)%14===0)for(const s of[-1,1])jet({src:()=>{const h=headW(victim);return[h.x-killer.f*22,GROUND-(h.y-2)]},ang:(f>0?Math.PI-.5:.5)+(Math.random()-.5)*.8,life:10,rate:3,sp:6+Math.random()*4,r:1.3,spread:.35});
  if(T%2===0)for(const s of[-1,1]){const e=eye(s);fx.push({x:e[0],y:e[1],z:e[2]+18,vx:-f*Math.random()*1.2,vy:.6,vz:s*.3,l:46,c:Math.random()<.25?'#6d0a12':'#c8101f',r:1+Math.random()*1.2,g:.4,blood:1,stain:1})}
  // la vittima si dimena, poi le ginocchia cedono
  const w=Math.sin(T*.8),w2=Math.cos(T*.63),dn=T>TI+50?ez((T-TI-50)/40):0;v.fpose=P({h:625-290*dn,t:-10+12*dn,hd:-26-6*dn,tw:0,x:-4*dn,n:[150+90*w,-120-160*Math.abs(w2)],f:[110-80*w,-140-150*Math.abs(w)],nl:dn>.5?[-40,0,0]:[-170,0,0],fl:dn>.5?[260,0,0]:[140,0,0]});v.fk=.45;v.x+=-f*w*1.2*(1-dn);
  if(T===TI+40){sfx('urlo');CUT(Hv.x+f*40,Hv.y-30,2.2,{yaw:f*.46,fov:28,dol:.001})}
  if(T===TI+58)sfx('thud');
  if(T===TI+96){sfx('urlolungo');sfx('squish');shake=8;CUT(Hv.x-f*6,Hv.y-4,3.2,{yaw:-f*.2,pitch:-.08,fov:22,dol:.001})}
  if(T>TI+96&&T%3===0)gush([Hv.x-f*22,GROUND-(Hv.y-4)],2,3,-f)}
 // lo lascia: cade all'indietro
 if(T===TR){for(const d of E)unhold(d);PROPS.eh=null;sfx('squish');stop=3;k.fpose=P({h:580,t:-4,hd:6,tw:30,n:[170,40],f:[160,30],nl:[-330,0,0],fl:[260,0,0]});k.fk=.14;v.fpose=P({h:640,rot:-rad(88),drop:505,t:-4,hd:-8,tw:0,x:0,n:[-160,330],f:[200,300],nl:[-250,0,10],fl:[240,0,-10]});v.fk=.14;CUT(v.x,330,1.2,{yaw:f*.25,pitch:.05,dol:.001})}
 if(T===TR+18){sfx('thud');shake=8;pool(v.x+f*250,100);gush([v.x+f*240,GROUND-30],18,5,f)}
 if(T>TR&&T<TR+60)k.x=Math.max(110,Math.min(AW-110,k.x-f*1.6));
 if(T===TR+44){const h=headW(v);CUT(h.x,h.y+8,2.5,{yaw:f*.1,pitch:.5,fov:26,dol:.0006})}
 if(T===TR+84){const h=headW(k);k.fpose=P({h:575,t:-2,hd:6,tw:40,n:[210,-40],f:[230,-20],nl:[-330,0,0],fl:[260,0,0]});k.fk=.1;CUT(h.x+f*10,h.y-30,2.4,{yaw:f*.42,fov:28,dol:.001});sottot('«Occhio.»',56)}
 if(T>TR+84&&T<TR+140){k.fpose.n=[210+18*Math.sin(T*.9),-40];k.fpose.f=[230-18*Math.sin(T*.9),-20]}
 if(T===TR+146){CUT(mid,320,.9,{yaw:-f*.14,pitch:.04,orb:f*.0014});say('ACCOPPALO',420)}
 if(T===TR+236){sottot('',0);endWin(k)}}
// ---------- Mattia: la pellicola. Tira fuori una bobina, tende la pellicola tra le mani, la passa attorno al collo e stringe ----------
// La pellicola è un nastro costruito in Three.js e ricalcolato a ogni tick tra le mani vere del lottatore e il collo della vittima.
const FILMN=110;
function filmInit(){if(PROPS.film)return;const cv=document.createElement('canvas');cv.width=256;cv.height=64;const x=cv.getContext('2d');x.fillStyle='#0c0a09';x.fillRect(0,0,256,64);
 for(let i=0;i<4;i++){const gr=x.createLinearGradient(i*64,0,i*64+64,0);gr.addColorStop(0,'#5a3b1c');gr.addColorStop(.5,'#b9844a');gr.addColorStop(1,'#4a2f18');x.fillStyle=gr;x.fillRect(i*64+5,15,54,34);x.fillStyle='rgba(20,12,6,.55)';x.fillRect(i*64+12,30,40,19);x.beginPath();x.arc(i*64+24,26,5,0,7);x.fill()}
 x.fillStyle='#d8d2c4';for(let i=0;i<16;i++){x.fillRect(i*16+4,3,8,7);x.fillRect(i*16+4,54,8,7)}
 const tx=new THREE.CanvasTexture(cv);tx.wrapS=THREE.RepeatWrapping;tx.colorSpace=THREE.SRGBColorSpace;tx.anisotropy=4;
 const g=new THREE.BufferGeometry(),pos=new Float32Array(FILMN*6),uv=new Float32Array(FILMN*4),idx=[];for(let i=0;i<FILMN;i++){uv[i*4]=uv[i*4+2]=i*.16;uv[i*4+1]=0;uv[i*4+3]=1;if(i<FILMN-1){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}}
 g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));g.setIndex(idx);
 const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:tx,side:THREE.DoubleSide,roughness:.28,metalness:.15,emissive:0x2a1c10,emissiveMap:tx}));m.frustumCulled=false;m.castShadow=true;m.visible=false;scene.add(m);PROPS.film=m;
 const R=new THREE.Group(),dk=mat(0x26262a,{roughness:.4,metalness:.7}),a=new THREE.Mesh(new THREE.CylinderGeometry(19,19,1.6,28),dk),b=a.clone(),c=new THREE.Mesh(new THREE.CylinderGeometry(12,12,7,24),mat(0x0c0a09,{roughness:.3})),h=new THREE.Mesh(new THREE.CylinderGeometry(3,3,10,12),mat(0x9a9aa2,{metalness:.9,roughness:.3}));a.position.y=4.2;b.position.y=-4.2;R.add(a,b,c,h);R.traverse(o=>{if(o.isMesh)o.castShadow=true});R.visible=false;scene.add(R);PROPS.reel=R}
// pts: [punto, direzione della larghezza]; ricampiona a passo costante lungo il percorso
function filmSet(pts,W){const m=PROPS.film,P=m.geometry.attributes.position.array,L=[0];for(let i=1;i<pts.length;i++)L.push(L[i-1]+pts[i][0].distanceTo(pts[i-1][0]));const tot=L[L.length-1]||1;let j=0;const p=new THREE.Vector3(),w=new THREE.Vector3();
 for(let i=0;i<FILMN;i++){const s=tot*i/(FILMN-1);while(j<pts.length-2&&L[j+1]<s)j++;const u=Math.max(0,Math.min(1,(s-L[j])/Math.max(1e-4,L[j+1]-L[j])));p.copy(pts[j][0]).lerp(pts[j+1][0],u);w.copy(pts[j][1]).lerp(pts[j+1][1],u).normalize().multiplyScalar(W);
  P[i*6]=p.x-w.x;P[i*6+1]=p.y-w.y;P[i*6+2]=p.z-w.z;P[i*6+3]=p.x+w.x;P[i*6+4]=p.y+w.y;P[i*6+5]=p.z+w.z}
 m.geometry.attributes.position.needsUpdate=true;m.geometry.computeVertexNormals();m.material.map.repeat.x=Math.max(1,tot/260)/(FILMN*.16)*FILMN*.16/Math.max(1,tot/260)*1;m.visible=true}
function filmRing(v,k,r,turns){const N=V3(bonePos(v,v.rig.B.neck?'neck':'spine')),H=V3(bonePos(v,v.rig.B.head?'head':'neck')),A=H.clone().sub(N);if(A.lengthSq()<1)A.set(0,1,0);A.normalize();const C=N.clone().addScaledVector(A,11),U=new THREE.Vector3(Math.sign(k.x-v.x)||1,0,0);U.addScaledVector(A,-U.dot(A)).normalize();const Wv=A.clone().cross(U),out=[],n=Math.round(turns*20);
 for(let i=0;i<=n;i++){const th=turns*2*Math.PI*i/n;out.push([C.clone().addScaledVector(U,r*Math.cos(th)).addScaledVector(Wv,r*Math.sin(th)).addScaledVector(A,(i/n-.5)*11),A])}return out}
function fFilm(T,k,v,f){propsInit();filmInit();pose3D(k);pose3D(v);holdFrame();const mid=(k.x+v.x)/2,Hv=headW(v),ez=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)},TG=58,TR=250,sn=nearS(k),sf=sn==='R'?'L':'R',up=new THREE.Vector3(0,1,0),
  fA=()=>PROPS.fhA&&PROPS.fhA.g?PROPS.fhA.g.c.clone():handW(k,sn),fB=()=>PROPS.fhB&&PROPS.fhB.g?PROPS.fhB.g.c.clone():handW(k,sf),Nk=V3(bonePos(v,v.rig.B.neck?'neck':'spine'));
 if(T===1){v.fpose=DAZE();v.fk=.2;k.fpose=P({h:580,t:4,hd:8,tw:20,n:[150,40],f:[150,60],nl:[-330,0,0],fl:[260,0,0]});k.fk=.2;CUT(mid,350,1.15,{yaw:-f*.12,dol:.0012})}
 // tira fuori la bobina e svolge la pellicola
 if(T===8){PROPS.fvA=new THREE.Vector3(0,0,-1);PROPS.fvB=new THREE.Vector3(0,0,1);PROPS.fhA=hold(PROPS.fdA||(PROPS.fdA=new THREE.Object3D()),k,sn,{dir:()=>PROPS.fvA,rh:2.3,len:0,gy:0,bend:.6});PROPS.fhB=hold(PROPS.fdB||(PROPS.fdB=new THREE.Object3D()),k,sf,{dir:()=>PROPS.fvB,rh:2.3,len:0,gy:0,bend:.6});const h=headW(k);CUT(h.x+f*30,h.y-70,2.3,{yaw:f*.4,fov:28,dol:.0009});k.fpose=P({h:585,t:2,hd:10,tw:10,n:[210,-40],f:[120,10],nl:[-330,0,0],fl:[260,0,0]});k.fk=.25;sfx('stoffa')}
 if(T>=8&&T<TG){const u=ez((T-8)/22),c=V3(bonePos(k,'spine')).add(new THREE.Vector3(f*40,6,0));aimHand(k,sn,c.clone().add(new THREE.Vector3(f*8,8,34*u)),.6);aimHand(k,sf,c.clone().add(new THREE.Vector3(f*2,-4,-34*u)),.6);k.fk=.7;
  const a=fA(),b=fB(),m=a.clone().lerp(b,.5);PROPS.fvA.copy(b).sub(a).normalize();PROPS.fvB.copy(PROPS.fvA).negate();m.y-=10*(1-u)+2;filmSet([[a,up],[m,up],[b,up],[b.clone().add(new THREE.Vector3(0,-6,0)),up]],7.5);PROPS.reel.visible=true;PROPS.reel.position.copy(b).add(new THREE.Vector3(0,-14,0));PROPS.reel.rotation.set(Math.PI/2,0,T*.5*(1-u))}
 if(T===24)sottot('«Azione!»',26);
 if(T===30){sfx('aria');CUT(mid,380,1.35,{yaw:-f*.2,dol:.0015})}
 if(T>30&&T<=TG){const dx=(v.x-f*112-k.x)*.14;k.x+=dx;if(Math.abs(dx)>.6)k.fclip={c:'walkF',f:((T-30)*.6)%29,b:8};else k.fclip=null}if(T===TG)k.fclip=null;
 // la passa attorno al collo
 if(T===TG){stop=4;shake=8;sfx('aria');sfx('thud');v.flash=4;PROPS.reel.visible=false;v.fpose=P({h:625,t:-8,hd:-20,tw:0,n:[80,-170],f:[70,-170],nl:[-170,0,0],fl:[140,0,0]});v.fk=.4;k.fpose=P({h:575,t:-6,hd:4,tw:0,n:[260,-150],f:[260,-150],nl:[-350,0,0],fl:[280,0,0]});k.fk=.4;CUT(Hv.x-f*10,Hv.y-26,2.9,{yaw:-f*.5,pitch:.03,fov:24,dol:.0008})}
 if(T>=TG&&T<TR){const q=ez((T-TG)/70),dn=T>TG+110?ez((T-TG-110)/50):0,pull=1+.25*Math.sin(T*.55);
  // chi stringe: tira indietro e in fuori, a strattoni
  aimHand(k,sn,Nk.clone().add(new THREE.Vector3(-f*(56+10*q),6-40*dn,36)),.9);aimHand(k,sf,Nk.clone().add(new THREE.Vector3(-f*(56+10*q),6-40*dn,-36)),.9);k.fk=.75;k.fpose.t=-6-8*q*pull;k.fpose.h=575-60*dn;
  // la vittima porta le mani al collo, scalcia, poi cede
  const w=Math.sin(T*.9),w2=Math.cos(T*.7),limp=T>TR-46?ez((T-TR+46)/30):0;v.fpose=P({h:625-285*dn,t:-8+10*dn,hd:-22+30*limp,tw:0,x:-4*dn,n:limp>.5?[40,300]:[80+26*w*(1-limp),-170-24*Math.abs(w2)],f:limp>.5?[-10,310]:[70-26*w*(1-limp),-170-24*Math.abs(w)],nl:dn>.5?[-40,0,0]:[-170+50*w*(1-dn),0,0],fl:dn>.5?[260,0,0]:[140-40*w*(1-dn),0,0]});v.fk=.45;v.x+=-f*w*1.1*(1-dn)*(1-limp);
  const ring=filmRing(v,k,24-5*q,2),a=fA(),b=fB();PROPS.fvA.copy(ring[0][0]).sub(a).normalize();PROPS.fvB.copy(ring[ring.length-1][0]).sub(b).normalize();filmSet([[a,up],...ring,[b,up]],7.5);
  if(T===TG+14)sottot('«Questa è la tua ultima scena.»',44);
  if((T-TG)%34===8){sfx('stoffa');shake=4}
  if(T===TG+60){sfx('ahi');CUT(Hv.x+f*46,Hv.y-34,2.1,{yaw:f*.5,fov:28,dol:.001})}
  if(T===TG+112){sfx('thud');CUT(mid-f*10,300,1.5,{yaw:-f*.3,pitch:.06,dol:.0012})}
  if(T===TR-46){sfx('ossa');stop=5;shake=10;const h=headW(v);CUT(h.x-f*6,h.y-8,3.1,{yaw:-f*.24,pitch:-.06,fov:22,dol:.001})}}
 // lo lascia: cade, con la pellicola ancora al collo
 if(T===TR){if(PROPS.fdA)unhold(PROPS.fdA);if(PROPS.fdB)unhold(PROPS.fdB);PROPS.fhA=PROPS.fhB=null;sfx('stoffa');k.fpose=P({h:580,t:-4,hd:6,tw:30,n:[170,40],f:[160,30],nl:[-330,0,0],fl:[260,0,0]});k.fk=.14;v.fpose=P({h:640,rot:-rad(88),drop:505,t:-4,hd:-8,tw:0,x:0,n:[-160,330],f:[200,300],nl:[-250,0,10],fl:[240,0,-10]});v.fk=.14;CUT(v.x,330,1.2,{yaw:f*.25,pitch:.05,dol:.001})}
 if(T>=TR){const ring=filmRing(v,k,19,2),a0=ring[0][0],b0=ring[ring.length-1][0],dr=Math.min(1,(T-TR)/26),gy=10;const tail=(p,s)=>{const e=p.clone();e.x+=-f*30*dr*s;e.y=Math.max(gy,p.y-70*dr);e.z+=24*s;const e2=e.clone();e2.x+=-f*40*dr;e2.y=gy;return[e,e2]};const ta=tail(a0,1),tb=tail(b0,-1);filmSet([[ta[1],up],[ta[0],up],...ring,[tb[0],up],[tb[1],up]],7.5)}
 if(T===TR+18){sfx('thud');shake=8}
 if(T>TR&&T<TR+50)k.x=Math.max(110,Math.min(AW-110,k.x-f*1.4));
 if(T===TR+44){const h=headW(v);CUT(h.x,h.y+8,2.4,{yaw:f*.1,pitch:.5,fov:26,dol:.0006})}
 if(T===TR+84){const h=headW(k);k.fpose=P({h:575,t:-2,hd:6,tw:40,n:[230,-60],f:[230,10],nl:[-330,0,0],fl:[260,0,0]});k.fk=.12;CUT(h.x+f*10,h.y-30,2.4,{yaw:f*.42,fov:28,dol:.001})}
 if(T===TR+100){k.fpose.n=[230,-10];k.fk=.6;sfx('parata');sottot('«Taglia!»',50)}
 if(T===TR+150){CUT(mid,320,.9,{yaw:-f*.14,pitch:.04,orb:f*.0014});say('ACCOPPALO',420)}
 if(T===TR+215){sottot('',0);endWin(k)}}
// ---------- Perna: lo afferra per le spalle, lo solleva e lo apre in due a mani nude. Le due metà sono copie del lottatore tagliate a metà
// (lato destro e sinistro, piano di taglio nello spazio del corpo), tenute dalle sue mani; in mezzo pendono gli organi (oggetti/intestino.js). ----------
function fSplit(T,k,v,f){propsInit();pose3D(k);pose3D(v);holdFrame();const ez=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)},TS=78,TF=132,ry=v.rig.G.rotation.y,Lv=new THREE.Vector3(Math.cos(ry),0,-Math.sin(ry)),Fv=new THREE.Vector3(Math.sin(ry),0,Math.cos(ry)),S=PROPS.sp||(PROPS.sp={});
 const shW=(c,n)=>V3(bonePos(c,n)),camY=0;
 if(T===1){Object.keys(S).forEach(x=>delete S[x]);v.fpose=DAZE();v.fk=.2;k.x=Math.max(110,Math.min(AW-110,v.x-f*285));k.fpose=P({h:575,t:4,hd:10,tw:20,n:[160,20],f:[160,0],nl:[-330,0,0],fl:[260,0,0]});k.fk=.2;CUT((k.x+v.x)/2,350,1.15,{yaw:-f*.14,dol:.001})}
 // gli gira attorno e gli si mette alle spalle (camminata vera)
 if(T>1&&T<=30){const dx=(v.x-f*6-k.x)*.1;k.x+=dx;k.fclip=Math.abs(dx)>.5?{c:'walkF',f:((T-1)*.6)%29,b:8}:null}
 if(T===30){k.fclip=null;k.fpose=P({h:560,t:6,hd:6,tw:0,n:[260,-60],f:[260,-60],nl:[-330,0,0],fl:[260,0,0]});k.fk=.25;sfx('stoffa');const h=headW(v);CUT(h.x+f*20,h.y-50,1.8,{yaw:f*.55,pitch:.08,fov:30,dol:.0008})}
 // le mani sulle spalle; lo solleva da terra, lui si dimena
 if(T>=30&&T<TS){// da dietro: mano sinistra sulla spalla sinistra (la metà A, che va a destra dello schermo), destra sulla destra
  S.hA='L';S.sA='uL';S.hB='R';S.sB='uR';k.fk=.6;
  if(T>=42){const u=ez((T-42)/22);v.y=-28*u;k.fpose.t=4-16*u;k.fpose.h=560-20*u;const w=Math.sin(T*.8);v.fpose=P({h:640,t:8,hd:-10,tw:0,n:[120+40*w,-120],f:[110-40*w,-130],nl:[-190+60*w,0,0],fl:[150-60*w,0,0]});v.fk=.35}
  if(T===42){sfx('sforzo');sfx('urlo')}if(T===58){sfx('urlo');CUT(v.x,360,1.25,{yaw:f*.45,pitch:.14,fov:30,dol:.0006})}if(T>58&&T%4===0)shake=Math.max(shake,4)}
 // la vittima si gira verso la telecamera e Perna le va alle spalle: così le due metà si aprono verso chi guarda
 if(T===2){v.yawO=0;k.yawO=0;k.zO=-78}
 if(T===TF+20){k.yawO=null;k.zO=0}
 // mani incollate alle spalle: IK 3D sulle due braccia, gomiti in basso e in fuori
 if(T===31){ARMIK.length=0;const sp=(which)=>()=>{const s=PROPS.sp;if(!s||!s.sA||state!=='fatality')return null;const nm=which==='A'?s.sA:s.sB,P0=which==='A'?s.A:s.B;let p;if(P0){p=P0.it.r.bones[nm==='uL'?s.iL:s.iR].getWorldPosition(new THREE.Vector3())}else p=V3(bonePos(victim,nm));return p.add(new THREE.Vector3(0,11,3))};
  ARMIK.push({k,sd:PROPS.sp.hA||nearS(k),t:sp('A'),pole:new THREE.Vector3(.5,-1,-.5)},{k,sd:PROPS.sp.hB||(nearS(k)==='R'?'L':'R'),t:sp('B'),pole:new THREE.Vector3(-.5,-1,-.5)})}
 if(T===TF)ARMIK.length=0;
 // resta dritto dietro di lui
 if(T>=30&&T<TF)k.x+=(v.x-k.x)*.2;
 // lo apre in due: due copie tagliate a metà, tenute ognuna da una mano
 if(T===TS){const c=[v.x,0,0];v.gone=true;S.A=spawn(v,{c,cut:[1,0,0,0]});S.B=spawn(v,{c,cut:[-1,0,0,0]});S.A.held=S.B.held=true;S.y0=-v.y;
  S.iL=v.rig.bones.indexOf(v.rig.B.uL);S.iR=v.rig.bones.indexOf(v.rig.B.uR);S.iS=v.rig.bones.indexOf(v.rig.B.spine);
  stop=9;shake=34;flash=Math.max(flash,.3);slowN=2;sfx('rip');sfx('taglio');sfx('ossa');sfx('sangue');const c3=chestW3(v,k);gush(G2v(c3),70,13,0);bones(G2v(c3),8);
  const o=OGG.intestino;if(o){const G=S.gut||(S.gut=new THREE.Group());G.clear();const m=o.clone();m.traverse(x=>{if(x.isMesh&&x.material&&!x.userData.wet){x.material=x.material.clone();x.material.color.multiplyScalar(.78);x.material.roughness=.28;x.material.emissive=new THREE.Color(0x2a0306);x.userData.wet=1}});G.add(m);const b=new THREE.Box3().setFromObject(m),sz=b.getSize(new THREE.Vector3()),hh=shW(v,'neck').y-shW(v,'hips').y,s=hh*.95/sz.y;m.scale.setScalar(s);m.position.copy(b.getCenter(new THREE.Vector3()).multiplyScalar(-s));G.position.set(v.x,(shW(v,'neck').y+shW(v,'hips').y)/2,0).addScaledVector(Fv,4);G.rotation.set(0,ry,0);G.visible=true;if(!G.parent)scene.add(G);S.gv=0}
  for(const P0 of[S.A,S.B]){const sg=P0===S.A?1:-1;jet({src:()=>{const q=P0.it.r.bones[S.iS].getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,60,0)).addScaledVector(Lv,-sg*14);return G2v(q)},ang:()=>-Math.PI/2-sg*.5,life:110,rate:8,sp:11,r:1.9,spread:.25})}
  CUT(v.x,330,1.25,{yaw:camY,pitch:.03,fov:30,dol:.0006})}
 if(T===TS+10)slowN=1;
 if(S.A&&T>=TS&&T<TF){const u=ez((T-TS)/40),sep=30*u,ang=.07*u,y=S.y0*(1-ez((T-TS-30)/20));for(const[P0,sg]of[[S.A,1],[S.B,-1]]){const Pp=P0.it.P;Pp.position.set(v.x,y,0).addScaledVector(Lv,sg*sep);Pp.quaternion.setFromAxisAngle(Fv,-sg*ang)}
  // le mani restano sulle spalle delle due metà
  const bA=S.A.it.r.bones[S.sA==='uL'?S.iL:S.iR],bB=S.B.it.r.bones[S.sB==='uL'?S.iL:S.iR],pA=bA.getWorldPosition(new THREE.Vector3()),pB=bB.getWorldPosition(new THREE.Vector3());aimHand(k,S.hA,pA.add(new THREE.Vector3(-f*4,6,0)),.8);aimHand(k,S.hB,pB.add(new THREE.Vector3(-f*4,6,0)),.8);k.fk=.75;k.fpose.t=-6+10*u;k.fpose.tw=0;
  if(T%3===0)fx.push({x:v.x+(Math.random()-.5)*20,y:GROUND-140-Math.random()*200,z:24,vx:(Math.random()-.5)*2,vy:Math.random()*2,l:70,c:'#9e0b18',r:1.6+Math.random()*2.4,g:.32,blood:1,stain:1});if(T===TS+16||T===TS+30)sfx('squish')}
 // gli organi pendono tra le due metà, poi cadono
 if(S.gut&&S.gut.visible&&T>TS){const G=S.gut;if(T<TF-6){G.position.y+=((shW(k,'hips').y*.0+S.y0*.4+150)-G.position.y)*.03;G.rotation.z=.08*Math.sin(T*.13)}else{S.gv=(S.gv||0)+.9;G.position.y=Math.max(32,G.position.y-S.gv);G.rotation.x+=(1.35-G.rotation.x)*.12;if(G.position.y<=32&&!S.gl){S.gl=1;sfx('squish');pool(v.x,140)}}}
 // le lascia cadere ai lati
 if(S.A&&T>=TF){const u=ez((T-TF)/22),sep=30+80*u,ang=.07+1.43*u;for(const[P0,sg]of[[S.A,1],[S.B,-1]]){const Pp=P0.it.P;Pp.position.set(v.x,0,0).addScaledVector(Lv,sg*sep);Pp.quaternion.setFromAxisAngle(Fv,-sg*ang)}
  if(T===TF){k.fpose=P({h:575,t:-8,hd:-6,tw:0,n:[230,-60],f:[230,-60],nl:[-330,0,0],fl:[260,0,0]});k.fk=.12;sfx('stoffa')}
  if(T===TF+22){stop=5;shake=20;sfx('thud');sfx('tonfo');for(const sg of[1,-1]){const q=new THREE.Vector3(v.x,0,0).addScaledVector(Lv,sg*230);for(let i=0;i<10;i++)fx.push({x:q.x+(Math.random()-.5)*120,y:GROUND-4,z:24,vx:(Math.random()-.5)*4,vy:-1-Math.random()*2,l:36,c:'#b89a7a',r:3+Math.random()*4,g:.06});pool(q.x,110)}CUT(v.x,300,1.05,{yaw:camY*.5,pitch:.06,dol:.0005})}}
 if(T>TF&&T<TF+40)k.x=Math.max(110,Math.min(AW-110,k.x-f*1.2));
 if(T===TF+70){const h=headW(k);CUT(h.x+f*10,h.y-30,2.4,{yaw:f*.42,fov:28,dol:.0008});k.fpose=P({h:575,t:-4,hd:4,tw:40,n:[200,-40],f:[160,-60],nl:[-330,0,0],fl:[260,0,0]});k.fk=.1}
 if(T===TF+82)sottot('«Beddru me, accussì si fa.»',60);
 if(T===TF+120){sottot('',0);CUT(v.x-f*60,320,1,{yaw:-f*.12,pitch:.03});say('ACCOPPALO',420)}
 if(T===TF+190)endWin(k)}
// ---------- Tano: «Tutti devoti» ----------
// giunge le mani in preghiera (polsi vicini, non incrociati), china la testa; campana e coro, un raggio di luce dal cielo
// e la statua della santa (GLB fornito, oggetti/statua.glb) cade in piedi, dritta, sull'avversario che resta schiacciato sotto. Alla fine: «SEMU TUTTI DEVOTI TUTTI».
const PRAYK={h:10,fw:34,lat:15,pl:-.15,pb:-.5,tw:10,yaw:.75};// mani giunte: altezza fra vita e collo, distanza davanti al petto, mezza distanza fra i polsi
// pozze di sangue che escono da sotto la statua (dischi rossi lucidi che si allargano)
function bpoolStart(x){const G=PROPS.bpool||(PROPS.bpool=(()=>{const g=new THREE.Group(),m=new THREE.MeshStandardMaterial({color:0x5e0008,roughness:.18,metalness:.1,polygonOffset:true,polygonOffsetFactor:-2});for(let i=0;i<7;i++){const c=new THREE.Mesh(new THREE.CircleGeometry(1,28),m);c.rotation.x=-Math.PI/2;c.receiveShadow=true;g.add(c)}g.visible=false;scene.add(g);return g})());
 const P=[[0,175,95],[-235,40,80],[232,-20,70],[-120,160,60],[140,170,55],[-60,-160,60],[90,-150,50]];G.children.forEach((c,i)=>{const q=P[i];c.position.set(x+q[0],.6+i*.05,q[1]);c.userData.R=q[2]*(.9+Math.random()*.3);c.scale.setScalar(.01)});G.visible=true;PROPS.bpT=0}
function bpoolStep(){const G=PROPS.bpool;if(!G||!G.visible)return;PROPS.bpT++;for(const c of G.children){const R=c.userData.R,s=c.scale.x;c.scale.setScalar(s+(R-s)*.035)}}
function prayInit(){if(typeof PROPS==='undefined')return;if(!PROPS.bpool){bpoolStart(0);PROPS.bpool.visible=false}
 if(!PROPS.statua){const G=new THREE.Group(),b=new THREE.Mesh(new THREE.BoxGeometry(448,560,275),mat(0xc9b48a,{roughness:.6,metalness:.3}));b.position.y=280;b.castShadow=true;G.add(b);G.visible=false;scene.add(G);PROPS.statua=G;if(OGG.statua)fitOgg(G,'statua',{k:1})}
 if(!PROPS.raggio){const m=new THREE.MeshBasicMaterial({color:0xffe2a0,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}),c=new THREE.Mesh(new THREE.CylinderGeometry(70,120,2400,24,1,true),m);c.position.y=1200;c.visible=false;scene.add(c);PROPS.raggio=c}
}
function fPray(T,k,v,f){propsInit();pose3D(k);pose3D(v);holdFrame();drops3Step();
 prayInit();
 const St=PROPS.statua,Rg=PROPS.raggio,mid=(k.x+v.x)/2,J=()=>Math.random()-.5,H0=Math.max(150,headW(v).y);
 const STAND=P({h:590,t:-2,hd:6,tw:24,n:[45,235],f:[35,245],nl:[-330,0,0],fl:[260,0,0]}),PRAY=P({h:592,t:4,hd:34,tw:PRAYK.tw,n:[45,235],f:[35,245],nl:[-330,0,0],fl:[260,0,0]});
 if(T===1){v.fpose=DAZE();v.fk=.2;k.fpose=STAND;k.fk=.15;CUT(mid,330,1.1,{yaw:-f*.12,dol:.001});St.visible=false;St.scale.setScalar(1);PROPS.sf=null;PROPS.ooze=0;Rg.visible=false;Rg.material.opacity=0;PROPS.pray=0}
 if(T<=26)k.x+=(v.x-f*330-k.x)*.12;
 // 1) mani giunte davanti allo sterno: i polsi restano ognuno dalla sua parte (a 5 unità dal centro), i gomiti in basso e in fuori
 if(T===24){k.fpose=PRAY;k.fk=.12;k.yawO=PRAYK.yaw*f;ARMIK.length=0;const lat=V3(bonePos(k,'uR')).sub(V3(bonePos(k,'uL'))).setY(0).normalize();PROPS.plat=lat;
  for(const sd of'RL'){const sg=sd==='R'?1:-1;ARMIK.push({k,sd,t:()=>{const u=PROPS.pray||0;if(!u||state!=='fatality')return null;const K=killer,lt=V3(bonePos(K,'uR')).sub(V3(bonePos(K,'uL'))).setY(0).normalize(),fw=new THREE.Vector3(0,1,0).cross(lt).normalize(),c=V3(bonePos(K,'spine')).add(new THREE.Vector3(0,-PRAYK.h,0)).addScaledVector(fw,PRAYK.fw).addScaledVector(lt,sg*PRAYK.lat);const p=handW(K,sd).lerp(c,u);if(u<1)p.addScaledVector(fw,Math.sin(Math.PI*u)*24);return p},pole:lat.clone().multiplyScalar(sg*PRAYK.pl).add(new THREE.Vector3(-killer.f*PRAYK.pb,-1,0))})}
  const h=headW(k);CUT(h.x+f*10,h.y-60,1.85,{yaw:f*.5,fov:30,dol:.0006});sfx('stoffa')}
 if(T>=24)PROPS.pray=Math.min(1,(T-24)/16);
 if(T===38)sfx('coro');
 if(T===70){sfx('campana');const h=headW(k);CUT(h.x+f*14,h.y-40,2.3,{yaw:f*.62,fov:26,dol:.0005})}
 // 2) il raggio dal cielo sull'avversario, che alza la testa
 if(T===100){Rg.position.set(v.x,1200,0);Rg.visible=true;sfx('campana');CUT(v.x,430,.85,{yaw:-f*.18,pitch:-.1,dol:.0008});v.fpose=P({h:610,t:-14,hd:-38,tw:0,x:-8,n:[150,200],f:[140,210],nl:[-220,0,0],fl:[190,0,0]});v.fk=.15}
 if(Rg.visible){Rg.material.opacity=Math.min(.33,Rg.material.opacity+.012)*(T>200?.9:1);Rg.rotation.y+=.004;if(Rg.material.opacity<.01&&T>200)Rg.visible=false}
 // 3) la statua cade dritta (in piedi) e atterra sull'avversario
 const T0=128,G0=1.15;if(T===T0){St.visible=true;St.rotation.set(0,0,0);PROPS.sf={y:1900,vy:-6};St.position.set(v.x,1900,0);sfx('rombo')}
 if(PROPS.sf&&T>T0){const s=PROPS.sf;s.vy-=G0;s.y+=s.vy;
  if(s.y<=0&&!s.hit){s.hit=1;s.y=0;s.vy=Math.abs(s.vy)*.06;PROPS.sq=.01;stop=6;shake=34;flash=Math.max(flash,.3);sfx('schianto');sfx('ossa');sfx('sangue');sfx('campana');v.fpose=null;v.fclip=null;
   const c=new THREE.Vector3(v.x,20,0);for(let i=0;i<120;i++)drops3('b',c.clone().add(new THREE.Vector3(J()*120,Math.random()*30,J()*70)),new THREE.Vector3(J()*16,2+Math.random()*9,J()*12),{r:1.2+Math.random()*2.6});for(let i=0;i<26;i++)drops3('f',c.clone().add(new THREE.Vector3(J()*90,Math.random()*20,J()*60)),new THREE.Vector3(J()*12,3+Math.random()*7,J()*10),{r:2+Math.random()*4,w:(Math.random()-.5)*.9});
   for(let i=0;i<22;i++){const a=Math.random()*6.28;fx.push({x:v.x+Math.cos(a)*150,y:GROUND-6,z:Math.sin(a)*90,vx:Math.cos(a)*(3+Math.random()*5),vy:-1-Math.random()*2,l:26+Math.random()*20,c:i%2?'#7d705c':'#665a48',r:3+Math.random()*5,g:-.02})}
   pool(v.x,260,150);PROPS.ooze=90;bpoolStart(v.x);
   for(let i=0;i<160;i++){const sg=Math.random()<.5?-1:1,p=new THREE.Vector3(v.x+sg*(200+Math.random()*30),4+Math.random()*16,J()*120);drops3('b',p,new THREE.Vector3(sg*(8+Math.random()*18),3+Math.random()*10,J()*10+4),{r:2.2+Math.random()*4})}
   for(let i=0;i<50;i++){const p=new THREE.Vector3(v.x+J()*380,8,(Math.random()<.5?-1:1)*(125+Math.random()*20));drops3('b',p,new THREE.Vector3(J()*6,1+Math.random()*5,Math.sign(p.z)*(4+Math.random()*9)),{r:1.4+Math.random()*2.6})}
   CUT(v.x,260,1.05,{yaw:f*.3,pitch:.04,dol:.0008})}
  if(s.hit){s.vy-=G0*.6;s.y+=s.vy;if(s.y<=0){s.y=0;s.vy=0}}
  St.position.y=Math.max(0,s.y)}
 bpoolStep();if(PROPS.ooze>0){PROPS.ooze--;if(PROPS.ooze%3===0){const sg=Math.random()<.5?-1:1,p=new THREE.Vector3(v.x+sg*(205+Math.random()*10),3,J()*200);drops3('b',p,new THREE.Vector3(sg*(1+Math.random()*3),.5+Math.random()*1.5,J()*2),{r:1.2+Math.random()*1.8})}}
 // l'avversario resta schiacciato sotto la statua
 if(PROPS.sq){PROPS.sq=Math.min(1,PROPS.sq+.34);v.squash=PROPS.sq}
 // 4) Tano prega ancora, poi la scritta
 if(T===T0+70){CUT((k.x+v.x)/2+f*60,230,.9,{yaw:-f*.2,pitch:.14,orb:f*.0012});sfx('coro')}
 if(T===T0+90)sottot('«SEMU TUTTI DEVOTI TUTTI»',200);
 if(T===T0+120)sfx('campana');
 if(T===T0+230){say('ACCOPPALO',420);PROPS.pray=0;ARMIK.length=0;k.fpose=STAND;k.fk=.1}
 if(T===T0+310)endWin(k)}
const FATF_EXTRA={pray:fPray,scream:fScream,burp:fBurp,bottle:fBottle,half:fSplit,film:fFilm,acid:fAcid,police:fPolice,disco:fDisco,eyes:fEyes,heart:fHeart2,belly:fBelly,syringe:fSyringe,gun:fGun,alpen:fAlpen,lightning:fLightning,fire:fAce,camper:fCamper};
const FAT_INFO={lightning:["Lorenzo","Aiuto dall'alto"],belly:["Matteo","Smile"],film:["Mattia","Ciak! Si gira"],camper:["Cholo","Trap phone"],disco:["Sena","La festa è finita"],gun:["Difo","La mano de Difos"],bottle:["Zio Massimo","Dieta del campione"],syringe:["Gabriele","Trattamento speciale"],police:["Biagio","Il cantante"],alpen:["Simba","Lungo e duro"],scream:["Mario","Il mio canto libero"],burp:["Peppone","Mi sto solo scaldando"],acid:["Alessio","Piccolo chimico"],head:["Mastro","Testa sulle spalle"],half:["Perna","Et voilà"],fire:["Giupy","Asso nella manica"],pray:["Tano","Tutti devoti"]};
