// lottatori.js: elenco dei lottatori, caricamento dei modelli (vecchio formato Hy3D oppure GLB di Meshy) e rig.
// Il gioco calcola per ogni fotogramma rotazioni "astratte" delle ossa (ABS: hips, spine, neck, head, uR, lR, ...),
// riferite allo scheletro canonico del primo lottatore (braccia in giù). Ogni rig le applica al proprio scheletro:
// rotazione nel modello = ABS[osso] * pre[osso] * riposo[osso]. "pre" porta un osso in posa a T sulla direzione canonica.
const LEG0=.8094,MODELS={},CJ={hips:[0,-.08,0],spine:[0,.12,0],neck:[0,.68,-.02],uR:[-.25,.54,-.01],lR:[-.325,.22,0],wR:[-.35,0,.01],uL:[.25,.54,-.01],lL:[.31,.22,0],wL:[.34,0,.01],tR:[-.125,-.08,0],sR:[-.225,-.5,-.04],fR:[-.29,-.87,-.05],tL:[.125,-.08,0],sL:[.205,-.5,-.04],fL:[.26,-.87,-.05]};
const DIRS={};{const r=(a,b)=>new THREE.Vector3(CJ[b][0]-CJ[a][0],CJ[b][1]-CJ[a][1],CJ[b][2]-CJ[a][2]).normalize();for(const s of'RL'){DIRS['u'+s]=r('u'+s,'l'+s);DIRS['l'+s]=r('l'+s,'w'+s);DIRS['t'+s]=r('t'+s,'s'+s);DIRS['s'+s]=r('s'+s,'f'+s)}}
let ROSTER=[],capMat=null;
const getJSON=u=>fetch(u).then(r=>{if(!r.ok)throw new Error('Non trovo '+u+' ('+r.status+')');return r.json()});
async function loadRoster(){const m=window.__roster||await getJSON('lottatori/lottatori.json');ROSTER=m.lottatori;return ROSTER}
const rosterEntry=id=>ROSTER.find(e=>e&&e.id===id);
const available=()=>ROSTER.filter(e=>e&&e.id&&!e.bloccato);
async function loadModel(id,prog){if(MODELS[id])return MODELS[id];const e=rosterEntry(id);if(!e)throw new Error('Lottatore sconosciuto: '+id);const dir=(window.__lottDir||'lottatori/')+e.cartella+'/';
 const M=e.tipo==='glb'?await loadGLB(e,dir,prog):await loadLegacy(e,dir,prog);M.id=id;M.e=e;MODELS[id]=M;return M}

// ---------- materiale comune: tinta, tagli, pezzi, parti nascoste ----------
// aRP = posizione a riposo nello spazio del modello (piedi a y=-1, centro in x=0); aPart = 0 busto, 1 braccio destro, 2 sinistro, 3 gamba destra, 4 sinistra, 5 testa.
const MODE_DISCARD=`if(uHide>-.5&&abs(vPart-uHide)<.5)discard;if(uMode>.5){if(uMode<1.5){if(uMode<1.25&&dot(vRP,uCut.xyz)<uCut.w)discard;}else{if(abs(floor(vPart+.5)-uPart)>.5)discard;}}`;
const MODE_COLOR=`if(uMode>.5){bool bdy=abs(vRP.x)<.2||vRP.y<-.15;float bnd=uMode<1.5?smoothstep(.02,.004,abs(dot(vRP,uCut.xyz)-uCut.w)):0.;if(!gl_FrontFacing&&bdy)diffuseColor.rgb=vec3(.42,.015,.03);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.55,.02,.04),bnd);}if(uHide>-.5&&!gl_FrontFacing)diffuseColor.rgb=vec3(.42,.015,.03);`;
function newU(tint){return{uTint:{value:new THREE.Color(tint)},uMode:{value:0},uPart:{value:0},uCut:{value:new THREE.Vector4(1,0,0,0)},uHide:{value:-1}}}
function hookMat(m,U,extraV,extraF,body){m.userData.u=U;m.emissive=new THREE.Color(0x6a3a30);m.emissiveIntensity=0;m.side=THREE.DoubleSide;
 m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U,body?body.uni:{});
  sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec3 aRP;attribute float aPart;varying vec3 vRP;varying float vPart;'+extraV[0]).replace('#include <begin_vertex>','#include <begin_vertex>\nvRP=aRP;vPart=aPart;'+extraV[1]);
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec3 uTint;uniform float uMode,uPart,uHide;uniform vec4 uCut;varying vec3 vRP;varying float vPart;'+extraF[0]).replace('#include <map_fragment>',MODE_DISCARD+(body?body.frag:'\n#include <map_fragment>\ndiffuseColor.rgb*=uTint;\n')+MODE_COLOR)};
 m.customProgramCacheKey=()=>body?'legacy':'glb';m.needsUpdate=true;return m}

// ---------- vecchio lottatore Hy3D (mesh fatta a mano, texture proiettate, testa piatta) ----------
async function loadLegacy(e,dir,prog){const D=await getJSON(dir+'modello.json');prog&&prog(.6);const L=new THREE.TextureLoader(),tex={};
 for(const k of['fronte','lato','retro']){tex[k]=await L.loadAsync(dir+k+'.jpg');tex[k].anisotropy=8}const head=await L.loadAsync(dir+'testa.webp');head.colorSpace=THREE.SRGBColorSpace;head.anisotropy=8;prog&&prog(1);
 const g0=new THREE.BufferGeometry(),P=b2(D.pos,Float32Array),SI=b2(D.si,Uint16Array),part=new Float32Array(P.length/3);
 for(let i=0;i<part.length;i++){const b=SI[i*4];part[i]=b<3.5?0:b<5.5?1:b<7.5?2:b<10.5?3:4}
 g0.setAttribute('position',new THREE.BufferAttribute(P,3));g0.setAttribute('aRP',new THREE.BufferAttribute(P,3));g0.setAttribute('aPart',new THREE.BufferAttribute(part,1));g0.setAttribute('normal',new THREE.BufferAttribute(b2(D.nor,Float32Array),3));g0.setAttribute('skinIndex',new THREE.BufferAttribute(SI,4));g0.setAttribute('skinWeight',new THREE.BufferAttribute(b2(D.sw,Float32Array),4));g0.setAttribute('aV',new THREE.BufferAttribute(b2(D.v,Float32Array),3));g0.setAttribute('aC',new THREE.BufferAttribute(b2(D.c,Float32Array),3));g0.setIndex(new THREE.BufferAttribute(b2(D.idx,Uint32Array),1));
 const cg=new THREE.BufferGeometry(),C0=D.cap;cg.setAttribute('position',new THREE.BufferAttribute(b2(C0.pos,Float32Array),3));cg.setAttribute('uv',new THREE.BufferAttribute(b2(C0.uv,Float32Array),2));cg.setAttribute('skinIndex',new THREE.BufferAttribute(b2(C0.si,Uint16Array),4));cg.setAttribute('skinWeight',new THREE.BufferAttribute(b2(C0.sw,Float32Array),4));cg.setIndex(new THREE.BufferAttribute(b2(C0.idx,Uint32Array),1));cg.computeVertexNormals();
 const PZ=P,fz=(x,y)=>{let z=-9;for(let i=0;i<PZ.length;i+=3){if(Math.abs(PZ[i]-x)<.022&&Math.abs(PZ[i+1]-y)<.022&&PZ[i+2]>z)z=PZ[i+2]}return z};
 const eyes=[[-.07,.4],[.07,.4]].map(([x,y])=>[x,y,fz(x,y)+.004]),mouth=[];for(let i=0;i<=16;i++){const x=-.11+i*.01375,y=.17+.055*Math.pow(x/.1,2);mouth.push([x,y,fz(x,y)+.004])}
 return{kind:'legacy',D,GEO:g0,tex,headTex:head,capGeo:cg,legR:1,ankH:ANK,head3D:false,face:{eyes,mouth},pruned:false}}
function legacyMat(M,U){const D=M.D,b=D.bb,uv=k=>new THREE.Vector4(b[k][0]/b[k][4],1-b[k][3]/b[k][5],(b[k][2]-b[k][0])/b[k][4],(b[k][3]-b[k][1])/b[k][5]);
 const m=new THREE.MeshStandardMaterial({roughness:.72,metalness:.04});
 return hookMat(m,U,['attribute vec3 aV,aC;varying vec3 vRN,vV,vC;','vRN=normal;vV=aV;vC=aC;'],['uniform sampler2D uF,uS,uB;uniform vec4 ubF,ubS,ubB;uniform vec3 umn,usz;varying vec3 vRN,vV,vC;'],
  {uni:{uF:{value:M.tex.fronte},uS:{value:M.tex.lato},uB:{value:M.tex.retro},ubF:{value:uv('fronte')},ubS:{value:uv('lato')},ubB:{value:uv('retro')},umn:{value:v3(...D.mn)},usz:{value:v3(...D.sz)}},
  frag:`vec3 n0=normalize(vRN);vec3 qq=(vRP-umn)/usz;vec3 cF0=texture2D(uF,vec2(ubF.x+qq.x*ubF.z,ubF.y+qq.y*ubF.w)).rgb;vec3 cB0=texture2D(uB,vec2(ubB.x+(1.-qq.x)*ubB.z,ubB.y+qq.y*ubB.w)).rgb;vec3 cL0=texture2D(uS,vec2(ubS.x+qq.z*ubS.z,ubS.y+qq.y*ubS.w)).rgb;vec3 w0=pow(abs(n0),vec3(4.));w0/=w0.x+w0.y+w0.z;float zF=(w0.z+w0.y*.5)*(n0.z>0.?vV.x:vV.y);float xS=(w0.x+w0.y*.5)*vV.z;float T0=zF+xS;vec3 cZ=n0.z>0.?cF0:cB0;vec3 cc=T0>.05?(cZ*zF+cL0*xS)/T0:vC;cc=mix(vC,cc,smoothstep(.02,.14,T0));diffuseColor.rgb=pow(cc,vec3(2.2))*uTint*2.3;`})}
function makeLegacyRig(M,tint,headTint){const j=M.D.J,mk0=p=>{const b=new THREE.Bone();b.position.set(p[0],p[1],p[2]);return b},sub3=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
 const B={root:new THREE.Bone()};B.hips=mk0(j.hips);B.root.add(B.hips);B.spine=mk0(sub3(j.spine,j.hips));B.hips.add(B.spine);B.neck=mk0(sub3(j.neck,j.spine));B.spine.add(B.neck);
 for(const s of'RL'){B['u'+s]=mk0(sub3(j['u'+s],j.spine));B.spine.add(B['u'+s]);B['l'+s]=mk0(sub3(j['l'+s],j['u'+s]));B['u'+s].add(B['l'+s]);B['t'+s]=mk0(sub3(j['t'+s],j.hips));B.hips.add(B['t'+s]);B['s'+s]=mk0(sub3(j['s'+s],j['t'+s]));B['t'+s].add(B['s'+s]);B['f'+s]=mk0(sub3(j['f'+s],j['s'+s]));B['s'+s].add(B['f'+s])}
 const keys=['root','hips','spine','neck','uR','lR','uL','lL','tR','sR','fR','tL','sL','fL'],list=keys.map(k=>B[k]);const U=newU(tint),mat=legacyMat(M,U),m=new THREE.SkinnedMesh(M.GEO,mat);m.castShadow=true;m.frustumCulled=false;const G=new THREE.Group();G.scale.setScalar(SCL);G.add(B.root);G.add(m);B.root.updateMatrixWorld(true);m.bind(new THREE.Skeleton(list));scene.add(G);
 const hm=new THREE.MeshBasicMaterial({map:M.headTex,transparent:true,alphaTest:.04,color:headTint,toneMapped:false}),head=new THREE.Mesh(new THREE.PlaneGeometry(553*.145,700*.145),hm);scene.add(head);
 const I=new THREE.Quaternion(),order=keys.map((k,i)=>({b:list[i],key:k==='root'?null:k,restQ:I,pre:null,pIdx:i===0?-1:keys.indexOf(k==='hips'?'root':k==='spine'?'hips':k==='neck'||k[0]==='u'?'spine':k[0]==='l'?'u'+k[1]:k[0]==='t'?'hips':k[0]==='s'?'t'+k[1]:'s'+k[1]),pQ:I}));
 const R={model:M,B,G,m:mat,mats:[mat],mesh:m,meshes:[m],head,bones:list,order,head3D:false,Q:order.map(()=>new THREE.Quaternion()),
  setHips(x,y,z){B.hips.position.set(x,y,z)},setVis(v){m.visible=v},
  handTip(s){const b=B['l'+s],w=new THREE.Vector3(),q=new THREE.Quaternion();b.getWorldPosition(w);b.getWorldQuaternion(q);const d=DIRS['l'+s].clone().applyQuaternion(q).normalize();return{hand:w.addScaledVector(d,.235*SCL*1.08),d}}};
 return R}

// ---------- lottatore GLB (Meshy, o qualunque GLB umanoide con rigging) ----------
let GLTFL=null;const gltfLoader=()=>{if(!GLTFL){GLTFL=new THREE.GLTFLoader();GLTFL.setMeshoptDecoder(THREE.MeshoptDecoder)}return GLTFL};
const normName=n=>n.replace(/^.*[:|]/,'').replace(/^(mixamorig|armature|bip0?1|def|cc_base)[_\s.-]*/i,'').toLowerCase();
function sideOf(n){if(/left|^l[_.\s-]|[_.\s-]l$|[_.\s-]l[_.\s-]/.test(n))return'L';if(/right|^r[_.\s-]|[_.\s-]r$|[_.\s-]r[_.\s-]/.test(n))return'R';return''}
function typeOf(n){if(/thumb|index|middle|ring|pinky|finger/.test(n))return'finger';if(/toe/.test(n))return'toe';if(/upleg|thigh|upperleg|up_leg/.test(n))return'thigh';if(/forearm|lowerarm|lower_arm|elbow/.test(n))return'forearm';if(/shoulder|clavicle|collar/.test(n))return'clav';if(/hand|wrist|palm/.test(n))return'hand';if(/foot|ankle/.test(n))return'foot';if(/arm/.test(n))return'uarm';if(/leg|calf|shin|knee/.test(n))return'shin';if(/hips|pelvis/.test(n))return'hips';if(/neck/.test(n))return'neck';if(/head/.test(n))return/end|top|front|nub/.test(n)?'headx':'head';if(/spine|chest|torso/.test(n))return'spine';return''}
function mapBones(bones,over){const M={},need={hips:['hips',''],uR:['uarm','R'],lR:['forearm','R'],wR:['hand','R'],uL:['uarm','L'],lL:['forearm','L'],wL:['hand','L'],tR:['thigh','R'],sR:['shin','R'],fR:['foot','R'],tL:['thigh','L'],sL:['shin','L'],fL:['foot','L'],neck:['neck',''],head:['head','']};
 for(const b of bones){const n=normName(b.name),t=typeOf(n),s=sideOf(n);for(const k in need)if(!M[k]&&need[k][0]===t&&(need[k][1]===''||need[k][1]===s))M[k]=b}
 if(over)for(const k in over){const b=bones.find(x=>x.name===over[k]);if(b)M[k]=b}
 if(!M.hips)M.hips=bones.find(b=>!b.parent||!b.parent.isBone);
 for(const s of'RL'){if(!M['u'+s]&&M['l'+s])M['u'+s]=M['l'+s].parent}
 const miss=['hips','uR','lR','wR','uL','lL','wL','tR','sR','fR','tL','sL','fL'].filter(k=>!M[k]);if(miss.length)throw new Error('Scheletro non riconosciuto, mancano: '+miss.join(', ')+'. Nomi trovati: '+bones.map(b=>b.name).slice(0,40).join(', '));return M}
const anc=b=>{const a=[];for(let p=b;p&&p.isBone;p=p.parent)a.push(p);return a};
async function loadGLB(e,dir,prog){const gl=await new Promise((ok,ko)=>gltfLoader().load(dir+(e.file||'modello.glb'),ok,x=>{if(prog&&x.total)prog(x.loaded/x.total)},ko));
 const sc=gl.scene,C=new THREE.Group();C.add(sc);if(e.ruota)sc.rotation.y+=rad(e.ruota);
 const bones=[],meshes=[];sc.traverse(o=>{if(o.isBone)bones.push(o);if(o.isSkinnedMesh)meshes.push(o)});if(!meshes.length)throw new Error('Il GLB non contiene una mesh con rigging');
 const map=mapBones(bones,e.ossa),wp=b=>b.getWorldPosition(new THREE.Vector3());C.updateMatrixWorld(true);
 if(wp(map.uR).x>wp(map.uL).x){sc.rotation.y+=Math.PI;C.updateMatrixWorld(true)}// guarda verso -z: lo giro (il destro deve stare a x negativa)
 const v=new THREE.Vector3(),P0=meshes.map(m=>{const n=m.geometry.attributes.position.count,a=new Float32Array(n*3);for(let i=0;i<n;i++){m.getVertexPosition(i,v);v.applyMatrix4(m.matrixWorld);a[i*3]=v.x;a[i*3+1]=v.y;a[i*3+2]=v.z}return a});
 let mnY=1e9,mxY=-1e9;for(const a of P0)for(let i=1;i<a.length;i+=3){if(a[i]<mnY)mnY=a[i];if(a[i]>mxY)mxY=a[i]}
 const h0=wp(map.hips),s=1.96*(e.altezza||1)/(mxY-mnY),off=v3(-h0.x*s,-1-mnY*s,-h0.z*s);C.scale.setScalar(s);C.position.copy(off);C.updateMatrixWorld(true);
 const bi=new Map(bones.map((b,i)=>[b,i])),partB=bones.map(b=>{const A=anc(b);return map.head&&A.includes(map.head)?5:A.includes(map.uR)?1:A.includes(map.uL)?2:A.includes(map.tR)?3:A.includes(map.tL)?4:0});
 let main=0;meshes.forEach((m,i)=>{if(m.geometry.attributes.position.count>meshes[main].geometry.attributes.position.count)main=i});
 const cross=[],head=[];meshes.forEach((m,mi)=>{const g=m.geometry,a=P0[mi],n=a.length/3,rp=new Float32Array(n*3),pt=new Float32Array(n),si=g.attributes.skinIndex,sw=g.attributes.skinWeight;
  for(let i=0;i<n;i++){rp[i*3]=a[i*3]*s+off.x;rp[i*3+1]=a[i*3+1]*s+off.y;rp[i*3+2]=a[i*3+2]*s+off.z;let bw=-1,bj=0;for(let k=0;k<4;k++){const w=sw.getComponent(i,k);if(w>bw){bw=w;bj=si.getComponent(i,k)}}pt[i]=partB[bi.get(m.skeleton.bones[bj])]??0;if(pt[i]===5)head.push(rp[i*3],rp[i*3+1],rp[i*3+2])}
  g.setAttribute('aRP',new THREE.BufferAttribute(rp,3));g.setAttribute('aPart',new THREE.BufferAttribute(pt,1));
  const ix=g.index?g.index.array:null,nt=ix?ix.length/3:n/3,I=t=>ix?ix[t]:t;for(let t=0;t<nt;t++){const q=[I(t*3),I(t*3+1),I(t*3+2)];if(q.some(k=>pt[k]!==0&&pt[k]!==5))continue;for(const[x0,x1]of[[0,1],[1,2],[2,0]]){const p=q[x0],r=q[x1],xp=rp[p*3],xr=rp[r*3];if((xp<0)!==(xr<0)){const u=xp/(xp-xr);cross.push(rp[p*3+1]+(rp[r*3+1]-rp[p*3+1])*u,rp[p*3+2]+(rp[r*3+2]-rp[p*3+2])*u)}}}});
 const J={};for(const k in map)J[k]=wp(map[k]);
 const len=(a,b)=>J[a].distanceTo(J[b]),legR=(len('tR','sR')+len('sR','fR')+len('tL','sL')+len('sL','fL'))/2/LEG0,ankH=(J.fR.y+J.fL.y)/2+1;
 // ordine delle ossa, chiavi astratte, rotazioni a riposo e "pre" (posa a T -> direzione canonica)
 const chestA=anc(map.uR).filter(b=>anc(map.uL).includes(b)),chest=chestA[0]||map.hips,chain=anc(chest).filter(b=>b!==map.hips&&anc(b).includes(map.hips)).reverse();
 const keyOf=new Map([[map.hips,'hips']]);chain.forEach((b,i)=>keyOf.set(b,{blend:(i+1)/chain.length}));if(map.neck)keyOf.set(map.neck,'neck');if(map.head)keyOf.set(map.head,'head');for(const k of['uR','lR','uL','lL','tR','sR','fR','tL','sL','fL'])keyOf.set(map[k],k);
 const childOf={uR:'lR',lR:'wR',uL:'lL',lL:'wL',tR:'sR',sR:'fR',tL:'sL',sL:'fL'};
 const order=bones.map(b=>{const k=keyOf.get(b),q=b.getWorldQuaternion(new THREE.Quaternion()),p=b.parent,pIdx=p&&p.isBone?bi.get(p):-1;let pre=null;
  if(typeof k==='string'&&childOf[k]){const d=J[childOf[k]].clone().sub(J[k]).normalize();pre=new THREE.Quaternion().setFromUnitVectors(d,DIRS[k])}
  return{key:k||null,restQ:q,pre,pIdx,pQ:pIdx<0&&p?p.getWorldQuaternion(new THREE.Quaternion()):new THREE.Quaternion()}});
 // pugni chiusi: piego le dita (se lo scheletro le ha) verso il palmo
 const fist=[];for(const sd of'RL'){const H=map['w'+sd],fing=bones.filter(b=>b!==H&&typeOf(normName(b.name))==='finger'&&anc(b).includes(H));if(!fing.length||e.pugni===false)continue;
  const kids=H.children.filter(c=>c.isBone),hc=kids.reduce((a,c)=>a.add(wp(c)),new THREE.Vector3()).divideScalar(kids.length||1),hd=hc.sub(J['w'+sd]).normalize(),fi=kids.find(c=>/index/.test(normName(c.name))),fp=kids.find(c=>/pinky|little/.test(normName(c.name)));
  let n=v3(0,-1,0);if(fi&&fp){n=new THREE.Vector3().crossVectors(hd,wp(fp).sub(wp(fi))).normalize();if(sd==='L')n.negate()}
  for(const b of fing){const th=/thumb/.test(normName(b.name)),c=b.children.find(x=>x.isBone),d=c?wp(c).sub(wp(b)).normalize():wp(b).sub(wp(b.parent)).normalize(),ax=new THREE.Vector3().crossVectors(d,n);if(ax.lengthSq()<1e-6)continue;ax.normalize();
   const rq=b.getWorldQuaternion(new THREE.Quaternion()),rot=new THREE.Quaternion().setFromAxisAngle(ax,rad(th?22:82));fist.push([bi.get(b),rq.clone().invert().multiply(rot).multiply(rq)])}}
 const hp=map.hips.parent,hipsPInv=hp?hp.matrixWorld.clone().invert():new THREE.Matrix4();
 // faccia: occhi e bocca per il coltello (spazio del modello), si possono correggere con "viso" nel file dei lottatori
 let face=null;if(head.length){let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;for(let i=0;i<head.length;i+=3){x0=Math.min(x0,head[i]);x1=Math.max(x1,head[i]);y0=Math.min(y0,head[i+1]);y1=Math.max(y1,head[i+1])}
  const hw=x1-x0,hh=y1-y0,cx=(x0+x1)/2,V=e.viso||{},ey=y0+hh*(V.occhi??.5),my=y0+hh*(V.bocca??.24),ex=hw*(V.distanza??.17);
  const fz=(x,y)=>{let z=-9,r=hw*.07;for(let i=0;i<head.length;i+=3)if(Math.abs(head[i]-x)<r&&Math.abs(head[i+1]-y)<r&&head[i+2]>z)z=head[i+2];return z};
  const eyes=[[cx-ex,ey],[cx+ex,ey]].map(([x,y])=>[x,y,fz(x,y)+.004]),mouth=[];for(let i=0;i<=16;i++){const x=cx+(-1+i/8)*hw*.3,y=my+hh*.07*Math.pow((x-cx)/(hw*.27),2);mouth.push([x,y,fz(x,y)+.004])}face={eyes,mouth,size:hw/.2}}
 // sezione per il taglio a metà: profilo del corpo sul piano x=0 (come cap.py)
 let capGeo=null;if(cross.length>20){const ys=[],Z=[];let lo=1e9,hi=-1e9;for(let i=0;i<cross.length;i+=2){lo=Math.min(lo,cross[i]);hi=Math.max(hi,cross[i])}
  for(let y=lo;y<=hi;y+=.01){let a=1e9,b=-1e9;for(let i=0;i<cross.length;i+=2)if(Math.abs(cross[i]-y)<.008){a=Math.min(a,cross[i+1]);b=Math.max(b,cross[i+1])}if(b>a){ys.push(y);Z.push([a,b])}}
  for(let r=0;r<2;r++)for(let i=1;i<Z.length-1;i++)Z[i]=[(Z[i-1][0]+Z[i][0]*2+Z[i+1][0])/4,(Z[i-1][1]+Z[i][1]*2+Z[i+1][1])/4];
  if(ys.length>3){const m=meshes[main],g=m.geometry,rp=g.attributes.aRP.array,cand=[];for(let i=0;i<rp.length/3;i++)if(Math.abs(rp[i*3])<.07)cand.push(i);
   const K=14,pos=[],uv=[],si=[],sw=[],inv=m.matrixWorld.clone().invert(),yN=J.neck?J.neck.y:hi,SI=g.attributes.skinIndex,SW=g.attributes.skinWeight;
   ys.forEach((y,i)=>{for(let k=0;k<K;k++){const u=k/(K-1),z=Z[i][0]+(Z[i][1]-Z[i][0])*u;let best=cand[0],bd=1e9;for(const c of cand){const d=(rp[c*3+1]-y)**2+(rp[c*3+2]-z)**2;if(d<bd){bd=d;best=c}}
    const w=new THREE.Vector3(0,y,z).applyMatrix4(inv);pos.push(w.x,w.y,w.z);uv.push(u,(y-lo)/(yN-lo));for(let q=0;q<4;q++){si.push(SI.getComponent(best,q));sw.push(SW.getComponent(best,q))}}});
   const idx=[];for(let i=0;i<ys.length-1;i++)for(let k=0;k<K-1;k++){const a=i*K+k,c=a+K;idx.push(a,c,a+1,a+1,c,c+1)}
   capGeo=new THREE.BufferGeometry();capGeo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));capGeo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));capGeo.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(si,4));capGeo.setAttribute('skinWeight',new THREE.Float32BufferAttribute(sw,4));capGeo.setIndex(idx);capGeo.computeVertexNormals()}}
 const hb=map.head||map.neck||chest,hm=hb.matrixWorld.clone(),hq=hb.getWorldQuaternion(new THREE.Quaternion()),hs=new THREE.Vector3();hm.decompose(new THREE.Vector3(),new THREE.Quaternion(),hs);
 prog&&prog(1);
 return{kind:'glb',altaUrl:e.alta?{c:dir+'alta/colore.webp',n:dir+'alta/normale.webp'}:null,C,bones,meshes,main,map,fist,mapIdx:Object.fromEntries(Object.entries(map).map(([k,b])=>[k,bi.get(b)])),order,hipsPInv,J,legR,ankH,head3D:!!map.head&&head.length>0,face,capGeo,headBone:bi.get(hb),headPos:wp(hb),headQ:hq,headS:hs.x,tris:meshes.reduce((t,m)=>t+(m.geometry.index?m.geometry.index.count:m.geometry.attributes.position.count)/3,0)}}
function makeGlbRig(M,tint){const C=THREE.SkeletonUtils.clone(M.C),G=new THREE.Group();G.scale.setScalar(SCL);G.add(C);scene.add(G);
 const bones=[],meshes=[];C.traverse(o=>{if(o.isBone)bones.push(o);if(o.isSkinnedMesh)meshes.push(o)});const U=newU(tint),mats=[];
 for(const m of meshes){const list=(Array.isArray(m.material)?m.material:[m.material]).map(x=>{const n=hookMat(x.clone(),U,['',''],['']);if(n.map)n.map.anisotropy=8;mats.push(n);return n});m.material=Array.isArray(m.material)?list:list[0];m.castShadow=true;m.frustumCulled=false}
 for(const[i,q]of M.fist)bones[i].quaternion.multiply(q);
 const B={};for(const k in M.mapIdx)B[k]=bones[M.mapIdx[k]];B.spine=B.uR.parent&&B.uR.parent.isBone?anc(B.uR).find(b=>anc(B.uL).includes(b)):B.hips;
 const order=M.order.map((o,i)=>Object.assign({b:bones[i]},o)),tmp=new THREE.Vector3(),head=new THREE.Object3D();head.material={color:new THREE.Color()};
 const R={model:M,B,G,C,m:mats[0],mats,mesh:meshes[M.main],meshes,head,bones,order,head3D:M.head3D,Q:order.map(()=>new THREE.Quaternion()),
  setHips(x,y,z){B.hips.position.copy(tmp.set(x,y,z).applyMatrix4(M.hipsPInv))},setVis(v){C.visible=v},
  handTip(s){const h=B['w'+s].getWorldPosition(new THREE.Vector3()),e=B['l'+s].getWorldPosition(new THREE.Vector3()),d=h.clone().sub(e).normalize();return{hand:h.addScaledVector(d,.07*SCL),d}}};
 applyAlta(R);return R}
// texture 4K (colore e normal map) scaricate in sottofondo dopo l'inizio dell'incontro e sostituite al volo
function loadAlta(M){if(!M.altaUrl)return Promise.resolve();if(M.altaP)return M.altaP;const L=new THREE.TextureLoader();M.altaP=Promise.all([L.loadAsync(M.altaUrl.c),L.loadAsync(M.altaUrl.n)]).then(([c,n])=>{for(const t of[c,n]){t.flipY=false;t.anisotropy=8}c.colorSpace=THREE.SRGBColorSpace;M.alta={c,n};for(const R of RIG)for(const r of[R,...(R.pool||[]).map(q=>q.r)])if(r.model===M)applyAlta(r)});return M.altaP}
function applyAlta(R){const A=R.model.alta;if(!A)return;for(const m of R.mats){if(m.map)m.map=A.c;if(m.normalMap)m.normalMap=A.n}}
const _qa=new THREE.Quaternion(),_qb=new THREE.Quaternion();
function applyPose(R,ABS){const O=R.order,Q=R.Q;for(let i=0;i<O.length;i++){const o=O[i],pq=o.pIdx<0?o.pQ:Q[o.pIdx];let k=o.key;
 if(k===null){Q[i].copy(pq).multiply(o.b.quaternion);continue}
 if(typeof k==='object'){_qa.copy(ABS.hips).slerp(ABS.spine,k.blend);Q[i].copy(_qa).multiply(o.restQ)}
 else{Q[i].copy(ABS[k]);if(o.pre)Q[i].multiply(o.pre);Q[i].multiply(o.restQ)}
 o.b.quaternion.copy(_qb.copy(pq).invert().multiply(Q[i]))}}
function makeRig(M,tint,headTint){return M.kind==='glb'?makeGlbRig(M,tint):makeLegacyRig(M,tint,headTint)}
// pezzi per le fatality: copie nascoste dello stesso lottatore, con la sezione del taglio
function makePool(M,n){const out=[];for(let i=0;i<n;i++){const r=makeRig(M,0xffffff,0xffffff),P=new THREE.Group();scene.remove(r.head);scene.add(P);P.add(r.G);r.meshes.forEach(m=>m.castShadow=false);P.visible=false;
 if(M.capGeo){const host=r.mesh,cap=new THREE.SkinnedMesh(M.capGeo,capMat);cap.frustumCulled=false;cap.visible=false;host.parent.add(cap);cap.position.copy(host.position);cap.quaternion.copy(host.quaternion);cap.scale.copy(host.scale);cap.bind(host.skeleton,host.bindMatrix);r.cap=cap}else r.cap=new THREE.Object3D();
 out.push({r,P})}return out}
function disposeRig(R){scene.remove(R.G);scene.remove(R.head);for(const q of R.pool||[])scene.remove(q.P);R.mats.forEach(m=>m.dispose())}
// ferite del coltello (occhi e bocca), attaccate all'osso della testa (GLB) o del busto (vecchio modello)
function buildWounds(){WOUND=[];const wm=new THREE.MeshStandardMaterial({color:0x2a0105,roughness:.25,metalness:.05,polygonOffset:true,polygonOffsetFactor:-4}),rm=new THREE.MeshStandardMaterial({color:0x8e0d1a,roughness:.3,polygonOffset:true,polygonOffsetFactor:-3});
 for(const r of RIG){const M=r.model,F=M.face||{eyes:[[-.07,.4,0],[.07,.4,0]],mouth:[[-.1,.2,0],[0,.17,0],[.1,.2,0]]};let host,L,sz=1;
  if(M.kind==='glb'){host=new THREE.Group();r.bones[M.headBone].add(host);host.quaternion.copy(M.headQ).invert();host.scale.setScalar(1/M.headS);const hp=M.headPos;L=p=>new THREE.Vector3(p[0]-hp.x,p[1]-hp.y,p[2]-hp.z);sz=Math.min(1.4,Math.max(.6,F.size||1))}
  else{host=r.B.spine;const inv=r.mesh.skeleton.boneInverses[2];L=p=>new THREE.Vector3(...p).applyMatrix4(inv)}
  const set={eyes:[],mouth:null};for(const e of F.eyes){const g=new THREE.Group(),a=new THREE.Mesh(new THREE.CircleGeometry(.03*sz,18),rm),b=new THREE.Mesh(new THREE.CircleGeometry(.018*sz,14),wm);a.scale.set(.75,1.35,1);b.scale.set(.5,1.3,1);b.position.z=.001;g.add(a,b);g.position.copy(L(e));g.visible=false;host.add(g);set.eyes.push(g)}
  const cur=new THREE.CatmullRomCurve3(F.mouth.map(L)),mm=new THREE.Mesh(new THREE.TubeGeometry(cur,48,.014*sz,8,false),rm),mc=new THREE.Mesh(new THREE.TubeGeometry(cur,48,.008*sz,6,false),wm);mm.visible=mc.visible=false;host.add(mm,mc);set.mouth=[mm,mc];WOUND.push(set)}}
