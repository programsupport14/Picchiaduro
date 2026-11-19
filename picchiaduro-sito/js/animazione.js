// KA: regolazioni gambe (punta del ginocchio, parata: bacino indietro/giù, coscia, stinco)
const KA={kmax:18,toe:.3,bz:.09,by:.025,bt:.15,bs:.2};
// animazione.js: strato visivo sopra la logica 2D. Sceglie per ogni lottatore tra motion capture (CMU), pose procedurali
// e ragdoll, con dissolvenze, poi aggiunge le reazioni ai colpi. Non cambia la simulazione: l'online resta deterministico.
let MOCAP=null;const AK=['hips','spine','neck','head','uR','lR','tR','sR','fR','uL','lL','tL','sL','fL'];
async function loadMocap(){try{const d=await getJSON('mocap/clip.json');for(const k in d.clip){const c=d.clip[k];for(const j in c.q)c.q[j]=Float32Array.from(c.q[j]);c.root=Float32Array.from(c.root)}MOCAP=d.clip;try{const P=newPose(),r=new THREE.Vector3(),v=new THREE.Vector3(),w=new THREE.Vector3();for(const k of['jab','cross','special']){const cl=MOCAP[k],mc=MOVECLIP[k];if(!cl||!mc)continue;sampleClip(cl,cl.peak||0,P,r);const e=s=>v.copy(DIRS['u'+s]).applyQuaternion(P['u'+s]).z+w.copy(DIRS['l'+s]).applyQuaternion(P['l'+s]).z;mc.side=e('R')>e('L')?1:-1}}catch(e){}}catch(e){console.warn('motion capture non caricato',e);MOCAP=null}}
const anQ1=new THREE.Quaternion(),anQ2=new THREE.Quaternion(),anV=new THREE.Vector3(),anV2=new THREE.Vector3(),anM=new THREE.Matrix4();
const newPose=()=>Object.fromEntries(AK.map(k=>[k,new THREE.Quaternion()]));
// clip -> rotazioni astratte (fotogramma frazionario, interpolato) e bacino in unità canoniche
function sampleClip(cl,f,out,root){const n=cl.n;let i0,i1;if(cl.loop){f=((f%n)+n)%n;i0=Math.floor(f);i1=(i0+1)%n}else{f=Math.max(0,Math.min(n-1,f));i0=Math.floor(f);i1=Math.min(n-1,i0+1)}const u=f-i0;
 for(const k of AK){anQ1.fromArray(cl.q[k],i0*4);anQ2.fromArray(cl.q[k],i1*4);out[k].copy(anQ1).slerp(anQ2,u)}
 const r=cl.root;root.set(r[i0*3]+(r[i1*3]-r[i0*3])*u,r[i0*3+1]+(r[i1*3+1]-r[i0*3+1])*u,r[i0*3+2]+(r[i1*3+2]-r[i0*3+2])*u)}
// mosse col motion capture: il picco della clip cade nel fotogramma logico in cui il colpo va a segno
const MOVECLIP={flykick:{c:'flykick',lin:1},combo:{c:'combo',lin:1},jab:{c:'jab',hit:5},cross:{c:'cross',hit:11},special:{c:'special',hit:13},kick:{c:'kick',hit:12}};
const moveLen=id=>MOVES[id].keys.reduce((a,k)=>a+k[0],0);
const herm=(p0,p1,m0,m1,L,x)=>{const u=x/L,u2=u*u,u3=u2*u;return(2*u3-3*u2+1)*p0+(u3-2*u2+u)*L*m0+(-2*u3+3*u2)*p1+(u3-u2)*L*m1};
function warpT(t,T,hit,cl){const pk=cl.peak,e=cl.n-1,L2=Math.max(1,T-hit),s0=pk/hit,s2=(e-pk)/L2,dh=s0+s2>0?2*s0*s2/(s0+s2):0;if(t<=0)return 0;if(t<=hit)return herm(0,pk,s0*.4,dh,hit,t);if(t>=T)return e;return herm(pk,e,dh,s2*.5,L2,t-hit)}
// ---------- ragdoll per il K.O. (Verlet: punti e vincoli di lunghezza, busto rigido) ----------
const RAGP=[['H','hips',.1],['C','spine',.14],['N','head',.12],['SR','uR',.07],['ER','lR',.05],['WR','wR',.05],['SL','uL',.07],['EL','lL',.05],['WL','wL',.05],['TR','tR',.08],['KR','sR',.06],['AR','fR',.05],['TL','tL',.08],['KL','sL',.06],['AL','fL',.05]];
const RAGI=Object.fromEntries(RAGP.map((p,i)=>[p[0],i]));
function ragInit(c,R){const B=R.B;if(!B.wR||!B.wL||!(B.head||B.neck))return null;const n=RAGP.length,p=new Float32Array(n*3),o=new Float32Array(n*3),rad=[];
 RAGP.forEach(([nm,b,r],i)=>{const bone=b==='head'?(B.head||B.neck):B[b];bone.getWorldPosition(anV);R.G.worldToLocal(anV);p.set([anV.x,anV.y,anV.z],i*3);rad.push(r)});
 const I=RAGI,cons=[],tor=['H','C','SR','SL','TR','TL'],d=(a,b)=>Math.hypot(p[I[a]*3]-p[I[b]*3],p[I[a]*3+1]-p[I[b]*3+1],p[I[a]*3+2]-p[I[b]*3+2]);
 for(let i=0;i<tor.length;i++)for(let j=i+1;j<tor.length;j++)cons.push([I[tor[i]],I[tor[j]],d(tor[i],tor[j]),0]);
 cons.push([I.N,I.C,d('N','C'),0]);for(const sh of['SR','SL'])cons.push([I.N,I[sh],d('N',sh)*.82,1]);// la testa ciondola ma non entra nelle spalle
 for(const[a,b]of[['SR','ER'],['ER','WR'],['SL','EL'],['EL','WL'],['TR','KR'],['KR','AR'],['TL','KL'],['KL','AL']])cons.push([I[a],I[b],d(a,b),0]);
 for(const[a,b,k]of[['SR','WR',.45],['SL','WL',.45],['TR','AR',.55],['TL','AL',.55],['H','KR',.6],['H','KL',.6]])cons.push([I[a],I[b],d(a,b)*k,1]);// non si ripiegano del tutto
 for(const kn of['KR','KL'])cons.push([I.C,I[kn],d('C',kn)*1.03,2]);// e l'anca non si piega all'indietro
 o.set(p);
 // direzioni nel riferimento del corpo: "indietro" = lontano da chi ha colpito; le ginocchia cedono in avanti
 const opp=c===p1?p2:p1,H=new THREE.Vector3(p[I.H*3],0,p[I.H*3+2]);let bk=new THREE.Vector3(0,0,1);
 if(opp&&opp.rig&&opp.rig.G){R.G.updateMatrixWorld(true);const q=R.G.worldToLocal(opp.rig.G.getWorldPosition(new THREE.Vector3()));q.y=0;bk=H.clone().sub(q);if(bk.lengthSq()<1e-6)bk.set(0,0,1);bk.normalize()}
 const fw=bk.clone().negate(),lat=new THREE.Vector3(-bk.z,0,bk.x),rx=c.rx&&tick-c.rx.tick<40?c.rx:null,s=rx?rx.mag:.8,zn=rx?rx.zone:1,rs=Math.random()<.5?1:-1,kr=1+.3*rs,kl=1-.3*rs;
 const v=(nm,dir,k,dn=0)=>{const i=I[nm]*3;o[i]-=dir.x*k;o[i+2]-=dir.z*k;o[i+1]+=dn};
 if(zn===0){// testa: colpo di frusta indietro, le gambe si spengono e il corpo crolla all'indietro
  v('N',bk,.06*s);v('C',bk,.045*s);v('SR',bk,.04*s);v('SL',bk,.04*s);v('N',lat,.012*rs);v('H',bk,.012*s,.008);
  v('KR',fw,.016*kr,.012);v('KL',fw,.016*kl,.012);v('AR',fw,.004);v('AL',fw,.004)}
 else if(zn===1){// busto: si piega in due, cade sulle ginocchia e poi in avanti o di lato
  v('N',fw,.022,.012);v('C',fw,.012,.012);v('SR',fw,.01,.01);v('SL',fw,.01,.01);v('N',lat,.01*rs);v('H',bk,.016*s,.012);
  v('KR',fw,.026*kr,.016);v('KL',fw,.026*kl,.016)}
 else{// gambe: i piedi partono in avanti, il busto cade indietro
  v('AR',fw,.034*s*kr);v('AL',fw,.034*s*kl);v('KR',fw,.012,.006);v('KL',fw,.012,.006);v('H',fw,.006,.014);v('N',bk,.03);v('C',bk,.024);v('SR',bk,.02);v('SL',bk,.02);v('N',lat,.008*rs)}
 for(const sd of'RL'){const g=sd==='R'?1:-1;v('E'+sd,lat,.012*g*rs,-.008);v('W'+sd,lat,.018*g*rs,-.012);v('W'+sd,bk,.012)}
 return{p,o,rad,cons,still:0,t:0,fw,hit:0}}
function ragStep(G){const{p,o,rad,cons}=G,n=p.length/3,g=.0028;let mv=0;
 if(G.t<14&&G.fw)for(const nm of['KR','KL']){const k=RAGI[nm]*3;p[k]+=G.fw.x*.0016;p[k+2]+=G.fw.z*.0016;p[k+1]-=.0008}// i primi istanti: il tono muscolare si spegne e le ginocchia cedono in avanti
 for(let i=0;i<n;i++){const k=i*3;for(let a=0;a<3;a++){const v=(p[k+a]-o[k+a])*.988;o[k+a]=p[k+a];p[k+a]+=v+(a===1?-g:0)}
  const fl=-1+rad[i];if(p[k+1]<fl){const vy=o[k+1]-p[k+1];p[k+1]=fl;o[k]=p[k]-(p[k]-o[k])*.4;o[k+2]=p[k+2]-(p[k+2]-o[k+2])*.4;o[k+1]=fl-vy*.12;
   if(vy>.022&&(i===RAGI.H||i===RAGI.C||i===RAGI.N)&&G.hit<2&&G.t-(G.ht||-99)>10){G.hit++;G.ht=G.t;G.thud=Math.min(1,vy*25)}}}
 for(let it=0;it<10;it++)for(const[a,b,L,min]of cons){const A=a*3,B=b*3,dx=p[B]-p[A],dy=p[B+1]-p[A+1],dz=p[B+2]-p[A+2],d=Math.hypot(dx,dy,dz)||1e-6;if(min===1&&d>=L)continue;if(min===2&&d<=L)continue;const k=(d-L)/d*.5;p[A]+=dx*k;p[A+1]+=dy*k;p[A+2]+=dz*k;p[B]-=dx*k;p[B+1]-=dy*k;p[B+2]-=dz*k}
 for(let i=0;i<p.length;i++)mv=Math.max(mv,Math.abs(p[i]-o[i]));G.still=mv<.0004?G.still+1:0;G.t++}
function basisQ(x,y,out){const X=anV.copy(x),Y=anV2.copy(y).normalize();X.addScaledVector(Y,-X.dot(Y)).normalize();const Z=new THREE.Vector3().crossVectors(X,Y);anM.makeBasis(X,Y,Z);return out.setFromRotationMatrix(anM)}
function ragPose(G,out,hip){const P=nm=>new THREE.Vector3(G.p[RAGI[nm]*3],G.p[RAGI[nm]*3+1],G.p[RAGI[nm]*3+2]),H=P('H'),C=P('C'),N=P('N');
 const TQ=basisQ(P('SL').sub(P('SR')),C.clone().sub(H),new THREE.Quaternion()),HQ=basisQ(P('TL').sub(P('TR')),C.clone().sub(H),new THREE.Quaternion());
 out.hips.copy(HQ);out.spine.copy(TQ);const iT=TQ.clone().invert(),iH=HQ.clone().invert();
 const aimK=(k,a,b,base,ib)=>{const d=P(b).sub(P(a)).normalize().applyQuaternion(ib);out[k].copy(base).multiply(anQ1.setFromUnitVectors(DIRS[k],d))};
 const up=new THREE.Vector3(0,1,0),hd=N.clone().sub(C).normalize().applyQuaternion(iT);out.neck.copy(TQ).multiply(anQ1.setFromUnitVectors(up,hd));out.head.copy(out.neck);
 for(const s of'RL'){aimK('u'+s,'S'+s,'E'+s,TQ,iT);aimK('l'+s,'E'+s,'W'+s,TQ,iT);aimK('t'+s,'T'+s,'K'+s,HQ,iH);aimK('s'+s,'K'+s,'A'+s,HQ,iH);out['f'+s].copy(out['s'+s]).multiply(anQ1.setFromUnitVectors(DIRS['s'+s],new THREE.Vector3(0,-1,0)))}
 hip.copy(H)}
// ---------- strato principale ----------
function guardArms(T,ph){sampleClip(MOCAP.guard,ph,GRD,anV);for(const k of['uR','lR','uL','lL'])T[k].copy(GRD[k]).premultiply(anQ1.copy(T.spine).multiply(anQ2.copy(GRD.spine).invert()))}
const qLog=(q,o)=>{let w=q.w,x=q.x,y=q.y,z=q.z;if(w<0){w=-w;x=-x;y=-y;z=-z}const s=Math.sqrt(x*x+y*y+z*z);if(s<1e-7)return o.set(0,0,0);const a=2*Math.atan2(s,w)/s;return o.set(x*a,y*a,z*a)};
const qExp=(v,o)=>{const a=v.length();if(a<1e-7)return o.set(0,0,0,1);const s=Math.sin(a/2)/a;return o.set(v.x*s,v.y*s,v.z*s,Math.cos(a/2))};
const TGP=newPose(),pHip=new THREE.Vector3(),inQ=new THREE.Quaternion(),inV=new THREE.Vector3(),inV2=new THREE.Vector3();
const RX=new THREE.Quaternion(),GRD=newPose(),FIN=newPose(),TGT=newPose(),tHip=new THREE.Vector3(),fHip=new THREE.Vector3();
function animLayer(c,R,M,PROC,px,py,pz){
 const A=c.A||(c.A={src:'',out:newPose(),prev:newPose(),hip:new THREE.Vector3(px,py,pz),prevHip:new THREE.Vector3(px,py,pz),ox:Object.fromEntries(AK.map(k=>[k,new THREE.Vector3()])),ov:Object.fromEntries(AK.map(k=>[k,new THREE.Vector3()])),hx:new THREE.Vector3(),hv:new THREE.Vector3(),lt:tick,gph:0,wph:0,air:0,land:-99,rag:null,blend:7,jd:0});
 const dt=Math.max(0,Math.min(6,tick-A.lt));A.lt=tick;let src='proc',clip=null,f=0,fp=null;
 // negli Accoppalo una mossa può far recitare al lottatore una clip vera (c.fclip={c:nome,f:fotogramma,fp:precedente}): telefonata, camminata, parata
 // a fine mossa finale il vincitore balla (clip vera di Mixamo, ciclica)
 const fcl=c.fclip||(c.dance&&MOCAP&&MOCAP[c.dance.c]?(()=>{const n=MOCAP[c.dance.c].n-1,u=(tick-c.dance.t0)*.42;return{c:c.dance.c,f:u%n,fp:Math.max(0,u-.42)%n,b:14}})():null);
 if(MOCAP&&fcl&&MOCAP[fcl.c]&&!c.gone){clip=MOCAP[fcl.c];f=Math.max(0,Math.min(clip.n-1,fcl.f));fp=Math.max(0,Math.min(clip.n-1,fcl.fp==null?f-1:fcl.fp));src='fc_'+fcl.c;A.blend=fcl.b||9}
 else if(MOCAP&&!(state==='fatality'||c.fpose||c.gone)){
  // K.O. di fine round: crollo vero in motion capture (ginocchia, poi a faccia in giù); la spazzata invece fa cadere di schiena col ragdoll
  if(c.m==='ko'&&c.kc&&MOCAP.scossa&&!(c.rx&&c.rx.zone===2&&tick-c.rx.tick<40)){clip=MOCAP.scossa;const u=tick-c.kc;f=Math.min(clip.n-1,94+u*.42);fp=Math.max(94,f-.42);src='kof';A.blend=11}
  else if(c.m==='ko'){if(!A.rag)A.rag=ragInit(c,R);if(A.rag)src='rag'}
  else if(c.m&&MOVECLIP[c.m]){const mc=MOVECLIP[c.m];clip=MOCAP[mc.c];{const L=moveLen(c.m);f=mc.lin?c.t/L*(clip.n-1):warpT(c.t,L,mc.hit,clip);fp=mc.lin?(c.t-1)/L*(clip.n-1):warpT(c.t-1,L,mc.hit,clip)}src=mc.c+'#'+c.mseq;A.blend=5}
  else if(!c.m||c.m==='hurt'){
   if(c.y<0){if(!A.air){A.air=tick;A.jd=Math.abs(c.vx)>1?Math.sign(c.vx*c.f):0}clip=MOCAP.jump;f=Math.min(clip.n-1,(tick-A.air)/40*(clip.n-1));fp=f-(clip.n-1)/40;src='jump'+A.air;A.blend=6}
   else{if(A.air){A.land=tick;A.air=0}if(!(c.block&&!c.m))A.bk=0;
    if(c.block&&!c.m&&MOCAP.block){clip=MOCAP.block;if(!A.bk)A.bk=tick;const H=clip.hold||clip.n-1;f=Math.min(H,(tick-A.bk)*1.5);fp=Math.max(0,Math.min(H,(tick-1-A.bk)*1.5));src='block';A.blend=5}
    else if(tick-A.land<26&&!c.m&&!c.block&&!c.crouch){clip=MOCAP.land;f=(tick-A.land)/2;fp=f-.5;src='land'+A.land;A.blend=6}
    else if(Math.abs(c.vx)>.5&&(!c.m||c.m==='hurt')){const fw=Math.sign(c.vx)*c.f>0;clip=fw?MOCAP.walkF:MOCAP.walkB;const rate=Math.min(c.run||c.m==='hurt'?2.6:1.75,Math.max(.7,Math.abs(c.vx)*60/SCL/Math.abs(clip.vel)));A.wph+=dt*rate/2;f=A.wph;fp=f-rate/2;src=fw?'walkF':'walkB';A.blend=10}
    else{clip=MOCAP.guard;f=A.gph;fp=f;src='guard';A.blend=11}}}}
 if(src!=='rag'&&A.rag&&c.m!=='ko')A.rag=null;
 // obiettivo
 if(src==='rag'){const G=A.rag;R.G.updateMatrixWorld(true);if(!G.W){G.W=R.G.localToWorld(new THREE.Vector3());G.L=new THREE.Vector3()}else{const L=R.G.worldToLocal(G.W.clone()),dx=L.x-G.L.x,dz=L.z-G.L.z;// il corpo resta dov'è nel mondo anche se il punto logico scivola
   if(Math.abs(dx)+Math.abs(dz)>1e-7){for(let i=0;i<G.p.length;i+=3){G.p[i]+=dx;G.o[i]+=dx;G.p[i+2]+=dz;G.o[i+2]+=dz}G.still=0}G.L.copy(L)}
  for(let s=0;s<dt&&G.still<30;s++)ragStep(G);if(G.thud){if(typeof sfx==='function')sfx(G.hit>1?'legno':'thud');if(typeof shake!=='undefined'&&G.hit<2)shake=Math.max(shake,4*G.thud);G.thud=0}ragPose(G,TGT,tHip)}
 else if(clip){sampleClip(clip,f,TGT,tHip);tHip.set(tHip.x*M.legR,-1+tHip.y*M.legR,tHip.z*M.legR);
  if(clip===MOCAP.jump||clip===MOCAP.land)guardArms(TGT,A.gph)}
 else{for(const k of AK)TGT[k].copy(PROC[k]);tHip.set(px,py,pz)}
 // transizione inerziale quando cambia la sorgente: differenza iniziale e velocità relativa smorzate da una molla critica
 if(src!==A.src){if(A.src){let tp=TGT,hp=tHip;if(clip&&fp!=null){sampleClip(clip,fp,TGP,pHip);pHip.set(pHip.x*M.legR,-1+pHip.y*M.legR,pHip.z*M.legR);if(clip===MOCAP.jump||clip===MOCAP.land)guardArms(TGP,A.gph-.5);tp=TGP;hp=pHip}
   for(const k of AK){qLog(inQ.copy(A.out[k]).multiply(anQ1.copy(TGT[k]).invert()),A.ox[k]);qLog(inQ.copy(A.out[k]).multiply(anQ1.copy(A.prev[k]).invert()),inV);qLog(inQ.copy(TGT[k]).multiply(anQ1.copy(tp[k]).invert()),inV2);A.ov[k].copy(inV).sub(inV2)}
   A.hx.copy(A.hip).sub(tHip);A.hv.copy(A.hip).sub(A.prevHip).sub(inV.copy(tHip).sub(hp));if(src.startsWith('land'))A.hv.y-=.03}
  A.src=src;if(src==='rag')A.blend=4}
 for(const k of AK)A.prev[k].copy(A.out[k]);A.prevHip.copy(A.hip);
 if(dt>0){const om=4.6/A.blend,e=Math.exp(-om*dt),spr=(x,v)=>{inV.copy(v).addScaledVector(x,om);x.addScaledVector(inV,dt).multiplyScalar(e);v.addScaledVector(inV,-om*dt).multiplyScalar(e)};for(const k of AK)spr(A.ox[k],A.ov[k]);spr(A.hx,A.hv)}
 for(const k of AK)A.out[k].copy(qExp(A.ox[k],inQ)).multiply(TGT[k]);A.hip.copy(tHip).add(A.hx);
 // ---------- strati sopra la clip (solo grafica): guardia da lottatore, meccanica del colpo, reazioni, salto, parata, spalle ----------
 for(const k of AK)FIN[k].copy(A.out[k]);fHip.copy(A.hip);
 const live=src!=='rag'&&src!=='proc',Tx=c.f*.57,Tz=.82,sm5=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*t*(t*(t*6-15)+10)};
 const isG=src==='guard'||src.startsWith('walk'),mv=live&&c.m&&MOVECLIP[c.m]?c.m:null,punch=mv&&mv!=='kick'&&mv!=='flykick';
 lerpA(A,'gw',live&&!mv&&src!=='block'&&src!=='kof'&&!c.fclip&&!c.dance?(c.m==='hurt'?.45:1):0,src==='block'?.5:.2,dt);lerpA(A,'sw',isG?1:src.startsWith('land')?.8:punch?.6:0,.18,dt);lerpA(A,'pw',punch?1:0,.3,dt);lerpA(A,'kw',mv==='kick'?1:0,.25,dt);
 // estensione di braccia e gambe verso l'avversario, misurata sulla clip: guida la rotazione del tronco
 const ext=(a,b)=>{inV.copy(DIRS[a]).applyQuaternion(FIN[a]);inV2.copy(DIRS[b]).applyQuaternion(FIN[b]);return((inV.x+inV2.x)*Tx+(inV.z+inV2.z)*Tz)/2};
 const eR=sm5(.5,.9,ext('uR','lR')),eL=sm5(.5,.9,ext('uL','lL')),kR=sm5(.25,.7,ext('tR','sR')),kL=sm5(.25,.7,ext('tL','sL')),lead=c.f>0?'L':'R';
 // 1) guardia: mani alte davanti al mento, gomiti stretti; la clip resta sotto (20%) per dare vita
 if(A.gw>.001){const w=A.gw*.82,ph=tick+(c===p1?0:37);for(const sd of'RL'){const sx=sd==='R'?-1:1,ld=sd===lead,b=0,b2=0;
   if(ld){anV.set(sx*.22+b2,-.64,.74);anV2.set(-sx*.14,.72,.66+b)}else{anV.set(sx*.3,-.82,.42);anV2.set(-sx*.3,.86,.3+b)}
   anV.normalize().applyQuaternion(FIN.spine);inQ.setFromUnitVectors(DIRS['u'+sd],anV);FIN['u'+sd].slerp(inQ,w);anV2.normalize().applyQuaternion(FIN.spine);inQ.setFromUnitVectors(DIRS['l'+sd],anV2);FIN['l'+sd].slerp(inQ,w)}}
 {const o=c===p1?p2:p1;if(o){const thr=live&&!mv&&!c.block&&o.m&&MOVECLIP[o.m]&&!o.hitDone&&Math.abs(o.x-c.x)<380&&c.m!=='hurt'?1:0;lerpA(A,'thr',thr,.28,dt);lerpA(A,'lk',live&&!mv?Math.max(-.45,Math.min(.3,(o.y-c.y)/520)):0,.15,dt);
  if(A.thr>.001){const w=A.thr*A.gw;RX.setFromEuler(qe.set(-.13*w,0,0));for(const k of['spine','neck','head','uR','lR','uL','lL'])FIN[k].premultiply(RX);RX.setFromEuler(qe.set(.1*w,0,0));FIN.neck.premultiply(RX);FIN.head.premultiply(RX);fHip.z-=.03*w;for(const sd of'RL')FIN['l'+sd].premultiply(RX.setFromEuler(qe.set(-.16*w,0,0)))}
  if(Math.abs(A.lk)>.002){RX.setFromEuler(qe.set(A.lk*.55,0,0));FIN.neck.premultiply(RX);FIN.head.premultiply(RX);FIN.head.premultiply(RX)}}}
 // 2) meccanica del pugno: il bacino e il tronco ruotano dietro il braccio che colpisce, il peso va avanti; molla poco smorzata = follow-through
 {let th=A.pw*((eR*(lead==='R'?.34:.6))-(eL*(lead==='L'?.34:.6)));const mc=mv&&MOVECLIP[mv];if(punch&&mc.hit&&mc.side&&c.t<mc.hit*.55)th-=mc.side*.2*Math.sin(Math.PI*c.t/(mc.hit*.55));
  th+=A.kw*(kR-kL)*.3;if(A.tw==null){A.tw=0;A.twv=0}for(let s=0;s<dt;s++){A.twv+=(th-A.tw)*.22-A.twv*.5;A.tw+=A.twv}const t=A.tw,m=A.pw*Math.max(eR,eL),kk=A.kw*Math.max(kR,kL);
  if(Math.abs(t)>.002||m>.002||kk>.002){RX.setFromEuler(qe.set(0,t*.45,0));FIN.hips.premultiply(RX);RX.setFromEuler(qe.set(.15*m-.3*kk,t,-t*.12));FIN.spine.premultiply(RX);
   RX.setFromEuler(qe.set(.05*m-.12*kk,t*.25,0));FIN.neck.premultiply(RX);FIN.head.premultiply(RX);
   for(const sd of'RL'){const e=sd==='R'?eR:eL;RX.setFromEuler(qe.set((.15*m-.3*kk)*(1-e),t*(1-e*A.pw),0));FIN['u'+sd].premultiply(RX);FIN['l'+sd].premultiply(RX)}
   fHip.z+=.07*m-.03*kk;fHip.x+=c.f*.045*m;fHip.y-=.025*m}}
 // 3) reazione al colpo, diversa per testa, busto e fianchi, leggera o pesante
 const rx=c.rx;
 if(rx&&src!=='rag'){const a=tick-rx.tick;if(a>=0&&a<70){const bl=rx.blk?.3:1,hv=rx.hv?1.35:1,imp=t=>a/t*Math.exp(1-a/t),e=rx.mag*bl*imp(2.4)*(1+.15*Math.sin(a*.8)*Math.exp(-a/10)),e2=rx.mag*bl*(a>2?(a-2)/4*Math.exp(1-(a-2)/4):0),s=rx.side,UP=['spine','neck','head','uR','lR','uL','lL'];
   if(rx.zone===0){RX.setFromEuler(qe.set(-.62*e*hv,s*.5*e,s*.22*e));FIN.neck.premultiply(RX);FIN.head.premultiply(RX);RX.setFromEuler(qe.set(-.24*e2*hv,s*.3*e2,s*.1*e2));for(const k of UP)FIN[k].premultiply(RX);RX.setFromEuler(qe.set(0,s*.14*e2,0));FIN.hips.premultiply(RX);fHip.z-=.06*e2*hv;fHip.x-=c.f*.02*e2;if(rx.hv&&!rx.blk)for(const sd of'RL'){const sg=sd==='R'?1:-1;RX.setFromEuler(qe.set(-.35*e2,0,sg*.55*e2));FIN['u'+sd].premultiply(RX);FIN['l'+sd].premultiply(RX.setFromEuler(qe.set(.5*e2,0,sg*.2*e2)))}}
   else if(rx.zone===1){RX.setFromEuler(qe.set(.5*e*hv,s*.2*e,-s*.1*e));for(const k of UP)FIN[k].premultiply(RX);RX.setFromEuler(qe.set(.3*e2,0,0));FIN.neck.premultiply(RX);FIN.head.premultiply(RX);fHip.z-=.1*e*hv;fHip.y-=.035*e2*hv;
    for(const sd of'RL'){RX.setFromEuler(qe.set(.25*e2,0,(sd==='R'?1:-1)*.2*e2));FIN['u'+sd].premultiply(RX)}}
   else{RX.setFromEuler(qe.set(.3*e2*hv,-s*.22*e,0));for(const k of UP)FIN[k].premultiply(RX);RX.setFromEuler(qe.set(0,-s*.3*e,0));FIN.hips.premultiply(RX);fHip.z-=.09*e;fHip.y-=.07*e2*hv;const sd=s>0?'R':'L';FIN['t'+sd].premultiply(RX.setFromEuler(qe.set(-.5*e2,0,0)));FIN['s'+sd].premultiply(RX.setFromEuler(qe.set(.6*e2,0,0)))}
   if(rx.hv&&!rx.blk){const g=rx.mag*sm5(0,5,a)*(1-sm5(14,40,a));fHip.y-=.06*g;for(const sd of'RL'){const st=Math.max(0,Math.sin(a*.42+(sd==='R'?0:Math.PI)))*g*(a>5&&src==='guard'?1:0);FIN['t'+sd].premultiply(RX.setFromEuler(qe.set(-.1*g-.28*st,0,0)));FIN['s'+sd].premultiply(RX.setFromEuler(qe.set(.16*g+.45*st,0,0)))}RX.setFromEuler(qe.set(0,0,.07*g*Math.sin(a*.42)));for(const k of['spine','neck','head','uR','lR','uL','lL'])FIN[k].premultiply(RX)}
   if((stop>0||c.hstop>0)&&a<8)fHip.x+=Math.sin(performance.now()*.11)*.012*rx.mag}}
 if(c.rocked&&src!=='rag'){const a=tick-c.rocked;if(a<90){const e=Math.sin(Math.min(1,a/8)*Math.PI/2)*(1-a/90);fHip.y-=.09*e;RX.setFromEuler(qe.set(.18*e,0,.06*e*Math.sin(a*.25)));for(const k of['spine','neck','head','uR','lR','uL','lL'])FIN[k].premultiply(RX);for(const k of['tR','tL'])FIN[k].premultiply(RX.setFromEuler(qe.set(-.35*e,0,0)));for(const k of['sR','sL'])FIN[k].premultiply(RX.setFromEuler(qe.set(.45*e,0,0)))}}
 // 4) salto (ginocchia raccolte, capriola nei salti in diagonale) e atterraggio molleggiato
 if(src.startsWith('jump')){const u=Math.min(1,(tick-A.air)/40),tk=sm5(.04,.3,u)*(1-sm5(.72,.96,u))*(A.jd?1:.75);
  for(const sd of'RL'){const ph=sd==='R'?1:.85;RX.setFromEuler(qe.set(-1.55*tk*ph,0,0));FIN['t'+sd].premultiply(RX);RX.setFromEuler(qe.set(.35*tk*ph,0,0));FIN['s'+sd].premultiply(RX);FIN['f'+sd].premultiply(RX)}
  RX.setFromEuler(qe.set(.35*tk,0,0));for(const k of['spine','neck','head','uR','lR','uL','lL'])FIN[k].premultiply(RX);RX.setFromEuler(qe.set(-.25*tk,0,0));FIN.neck.premultiply(RX);FIN.head.premultiply(RX);
  fHip.y+=.1*tk;
  if(A.jd){RX.setFromEuler(qe.set(A.jd*Math.PI*2*sm5(.1,.86,u),0,0));for(const k of AK)FIN[k].premultiply(RX);fHip.y+=.12*tk}}
 else if(src.startsWith('land')){const a=tick-A.land,e=.9*(a/3)*Math.exp(1-a/3);fHip.y-=.07*e;for(const sd of'RL'){FIN['t'+sd].premultiply(RX.setFromEuler(qe.set(-.42*e,0,0)));FIN['s'+sd].premultiply(RX.setFromEuler(qe.set(.3*e,0,0)));FIN['f'+sd].premultiply(RX)}RX.setFromEuler(qe.set(.2*e,0,0));for(const k of['spine','neck','head','uR','lR','uL','lL'])FIN[k].premultiply(RX)}
 // un solo respiro lento (circa 1 Hz, 2,5 cm): bacino, busto e braccia si muovono in fase; i piedi restano piantati (IK più sotto)
 {lerpA(A,'brw',src==='guard'||src==='block'?1:0,.12,dt);if(A.brw>.001){const br=Math.sin(tick*.1047+(c===p1?0:2.4)),w=A.brw;fHip.y-=.0125*(1+br)*w;RX.setFromEuler(qe.set(.014*br*w,0,0));for(const k of['spine','neck','head','uR','lR','uL','lL'])FIN[k].premultiply(RX);RX.setFromEuler(qe.set(-.008*br*w,0,0));FIN.neck.premultiply(RX);FIN.head.premultiply(RX)}}
 // 5) posizione da lottatore: ginocchia morbide, base larga, busto appena in avanti, mento basso, molleggio sugli avampiedi
 {const w=A.sw*(M.stance==null?1:M.stance);
  if(w>.001){const bo=0,kb=.2,ab=.09;
   for(const sd of'RL'){const sg=sd==='R'?1:-1;FIN['t'+sd].premultiply(RX.setFromEuler(qe.set(-kb*w,0,sg*ab*w)));FIN['s'+sd].premultiply(RX.setFromEuler(qe.set(kb*.95*w,0,sg*ab*.6*w)))}
   const L=.4*(M.legR||1);fHip.y-=w*L*((1-Math.cos(kb))+(1-Math.cos(kb*.95)))+w*.006*bo;
   RX.setFromEuler(qe.set(.12*w,0,0));for(const k of['spine','neck','head','uR','lR','uL','lL'])FIN[k].premultiply(RX);RX.setFromEuler(qe.set(.07*w,0,0));FIN.neck.premultiply(RX);FIN.head.premultiply(RX)}}
 // 5b) corsa (busto in avanti) e scatto indietro (saltello)
 {lerpA(A,'rw',live&&c.run&&Math.abs(c.vx)>6&&c.y===0&&!c.m?1:0,.25,dt);lerpA(A,'dw',live&&c.dash>0?1:0,.45,dt);const UK=['spine','neck','head','uR','lR','uL','lL'];
  if(A.rw>.001){const w=A.rw;RX.setFromEuler(qe.set(.3*w,0,0));for(const k of UK)FIN[k].premultiply(RX);RX.setFromEuler(qe.set(-.18*w,0,0));FIN.neck.premultiply(RX);FIN.head.premultiply(RX);fHip.y-=.03*w;fHip.z+=.05*w}
  if(A.dw>.001){const w=A.dw,hop=Math.sin((c.dash>0?1-c.dash/13:1)*Math.PI);fHip.y+=.08*hop*w;RX.setFromEuler(qe.set(-.14*w,0,0));for(const k of UK)FIN[k].premultiply(RX);for(const sd of'RL'){FIN['t'+sd].premultiply(RX.setFromEuler(qe.set(-.32*hop*w,0,0)));FIN['s'+sd].premultiply(RX.setFromEuler(qe.set(.55*hop*w,0,0)))}}}
 // 6) accovacciata e parata: avambracci verticali davanti al viso, gomiti stretti, sobbalzo quando arriva il colpo
 {lerpA(A,'cw',c.crouch&&!c.m&&c.y===0&&live?1:0,.25,dt);lerpA(A,'bw',c.block&&!c.m&&live?1:0,.35,dt);
  if(A.cw>.001){const w=A.cw;A.cD=.24*w*(M.legR||1);fHip.y-=A.cD;// il bacino scende; le gambe le piega l'IK più sotto, con i piedi fermi dove sono
  RX.setFromEuler(qe.set(.22*w,0,0));for(const k of['spine','neck','head','uR','lR','uL','lL'])FIN[k].premultiply(RX)}
  if(A.bi==null){A.bi=0;A.biv=0;A.bl=0}{const r=c.rx;if(r&&r.blk&&A.bt!==r.tick&&tick-r.tick<3){A.bt=r.tick;A.biv+=.2*r.mag*(r.hv?1.45:1);A.bz=r.zone}lerpA(A,'bl',r&&r.blk&&A.bz===2&&tick-r.tick<28?1:0,.3,dt);for(let s=0;s<dt;s++){A.biv+=-A.bi*.15-A.biv*.3;A.bi+=A.biv}}
  if(A.bw>.001){const w=A.bw,ib=A.bi,lo=A.bl,lsx=lead==='R'?-1:1,UK=['spine','neck','head','uR','lR','uL','lL'],cb=src==='block'?0:1;// con la clip di parata le braccia sono già a posto: restano il sobbalzo e la parata bassa
   // busto di taglio dietro la spalla avanti, mento basso; quando arriva il colpo il busto va indietro e torna (molla)
   RX.setFromEuler(qe.set((.12*cb+.4*(1-cb)-.5*ib)*w,lsx*.2*w*cb,-lsx*.06*ib*w));for(const k of UK)FIN[k].premultiply(RX);// la clip di parata è tutta all'indietro: il busto torna dritto, appena in avanti
   RX.setFromEuler(qe.set((.16*cb+.2*ib)*w,-lsx*.12*w*cb,0));FIN.neck.premultiply(RX);FIN.head.premultiply(RX);
   for(const sd of'RL'){const sx=sd==='R'?-1:1,ld=sd===lead;
    if(ld){anV.set(sx*.1,-.5+.3*lo,.86-ib*.6);anV2.set(-sx*.12-lo*sx*.1,.9-1.05*lo,.42-ib*1.3+.5*lo)}else{anV.set(sx*.22,-.74,.62-ib*.3);anV2.set(-sx*.28,.95,.16-ib*.9)}
    const wa=cb?w:ld?lo*w:0;if(wa>.001){anV.normalize().applyQuaternion(FIN.spine);inQ.setFromUnitVectors(DIRS['u'+sd],anV);FIN['u'+sd].slerp(inQ,wa);anV2.normalize().applyQuaternion(FIN.spine);inQ.setFromUnitVectors(DIRS['l'+sd],anV2);FIN['l'+sd].slerp(inQ,wa)}}
   const kn=Math.max(0,ib)*w;fHip.z-=KA.bz*ib*w;fHip.y-=KA.by*kn;for(const sd of'RL'){FIN['t'+sd].premultiply(RX.setFromEuler(qe.set(-KA.bt*kn,0,0)));FIN['s'+sd].premultiply(RX.setFromEuler(qe.set(KA.bs*kn,0,0)))}}}
 // 6b) ginocchia: la clip di guardia le piega molto (il ginocchio va avanti oltre la punta del piede): in guardia, camminando e in parata la gamba si raddrizza in parte
 if(live&&c.y===0&&!c.crouch&&!c.ko&&(isG||src==='block')){const k=(src==='block'?.7:.65*A.sw);for(const sd of'RL')FIN['s'+sd].slerp(FIN['t'+sd],k)}
 // 7) spalle: clavicole alzate e portate avanti (i modelli in posa ad A le hanno cadenti)
 if(M.clav){const k=src==='rag'?0:live?(.55+.45*Math.max(A.gw,A.bw)):.5;for(const sd of'RL'){const sx=sd==='R'?-1:1,a=(M.clav[sd]||0)*k;(FIN['c'+sd]||(FIN['c'+sd]=new THREE.Quaternion())).copy(FIN.spine).multiply(RX.setFromEuler(qe.set(0,-sx*a*.45,sx*a)))}}
 // piedi a terra: ogni scheletro ha la caviglia a un'altezza diversa; misuro una volta in guardia di quanto il piede sta sotto (o sopra) la sua altezza di riposo e correggo il bacino
 if(live)fHip.y+=M.footFix||0;
 applyPose(R,FIN);R.setHips(fHip.x,fHip.y,fHip.z);
 if(src==='kof'){const k=Math.min(1,(tick-c.kc)/10);for(const sd of'RL')shinDown(R,M,FIN,sd,k)}
 if(A.cw>.001&&A.cD>0&&M.J&&R.B.fR&&R.B.fL){R.G.updateMatrixWorld(true);const sy=R.G.scale.y;for(const sd of'RL'){const p=R.B['f'+sd].getWorldPosition(new THREE.Vector3());p.y+=A.cD*sy;{const hp=R.B['t'+sd].getWorldPosition(new THREE.Vector3()),u=.38*A.cw;p.x+=(hp.x-p.x)*u;p.z+=(hp.z-p.z)*u}legTo(R,FIN,sd,p,new THREE.Vector3(sd==='R'?-.3:.3,.9,1))}applyPose(R,FIN)}
 // dopo un colpo nessun piede deve restare sospeso: se entrambi i piedi sono sopra il pavimento il bacino scende finché il più basso appoggia
 if(live&&c.y===0&&!c.ko&&M.J&&R.B.fR&&R.B.fL&&c.m!=='flykick'&&!(c.m==='jump')){R.G.updateMatrixWorld(true);const sy=R.G.scale.y,ly=sd=>(R.B['f'+sd].getWorldPosition(anV).y-R.G.position.y)/sy-M.J['f'+sd].y,lo=Math.min(ly('R'),ly('L'));if(lo>.004){fHip.y-=Math.min(lo,.18);R.setHips(fHip.x,fHip.y,fHip.z)}}
 if(live&&c.y===0&&!c.crouch&&!c.ko&&!c.fpose&&(isG||src==='block')&&M.J&&R.B.fR&&R.B.fL)kneeAlign(R,FIN,src==='block'?.9:.85*A.sw);
 if(M.footFix!=null)footIK(c,R,M,A,FIN,dt,live&&c.y===0&&!c.ko);
 if(M.footFix==null&&src==='guard'&&c.y===0&&!c.rx&&!c.crouch&&A.sw>.98&&A.hx.lengthSq()<1e-5&&M.J&&R.B.fR&&R.B.fL){R.G.updateMatrixWorld(true);const ly=b=>(b.getWorldPosition(anV).y-R.G.position.y)/R.G.scale.y;M.footFix=Math.max(-.3,Math.min(.3,Math.min(M.J.fR.y,M.J.fL.y)-Math.min(ly(R.B.fR),ly(R.B.fL))+.02))}}
// ---------- piedi piantati: IK a due ossa sulle gambe (solo grafica). Il piede in appoggio resta fermo nel mondo mentre bacino e busto si muovono:
// non scivola in guardia, camminando o in parata. Quando si stacca da terra torna alla clip in pochi fotogrammi.
const ikH=new THREE.Vector3(),ikK=new THREE.Vector3(),ikF=new THREE.Vector3(),ikT=new THREE.Vector3(),ikD=new THREE.Vector3(),ikP=new THREE.Vector3(),ikN=new THREE.Vector3(),ikA=new THREE.Vector3(),ikB=new THREE.Vector3(),ikQ=new THREE.Quaternion(),ikG=new THREE.Quaternion(),ikGi=new THREE.Quaternion();
function footIK(c,R,M,A,FIN,dt,on){const B=R.B;if(!M.J||!B.tR||!B.sR||!B.fR||!B.tL||!B.sL||!B.fL)return;const I=A.ik||(A.ik={R:{off:new THREE.Vector3(),lock:null},L:{off:new THREE.Vector3(),lock:null},f:c.f});
 if(I.f!==c.f){I.f=c.f;for(const sd of'RL'){I[sd].lock=null;I[sd].off.set(0,0,0)}}
 R.G.updateMatrixWorld(true);R.G.getWorldQuaternion(ikG);ikGi.copy(ikG).invert();const sy=R.G.scale.y,MAX=.42*sy,lim=on&&!c.crouch&&!c.ko&&!c.fpose&&(!c.m||c.m==='block'||c.m==='hurt')?KA.kmax*Math.PI/180:0;let any=false;
 for(const sd of'RL'){const S=I[sd];B['t'+sd].getWorldPosition(ikH);B['s'+sd].getWorldPosition(ikK);B['f'+sd].getWorldPosition(ikF);const gy=R.G.position.y+(M.J['f'+sd].y+.02)*sy,pl=on&&ikF.y<gy+.045*sy;
  if(dt>0){if(pl){if(!S.lock)S.lock=new THREE.Vector3(ikF.x+S.off.x,gy,ikF.z+S.off.z);S.off.set(S.lock.x-ikF.x,S.off.y+(gy-ikF.y-S.off.y)*(1-Math.pow(.5,dt)),S.lock.z-ikF.z);const h=Math.hypot(S.off.x,S.off.z);if(h>MAX){const k=MAX/h;S.off.x*=k;S.off.z*=k;S.lock.x=ikF.x+S.off.x;S.lock.z=ikF.z+S.off.z}}
   else{S.lock=null;S.off.multiplyScalar(Math.pow(.76,dt))}}
  if(S.off.lengthSq()<1e-6)continue;
  ikT.copy(ikF).add(S.off);const a=ikH.distanceTo(ikK),b=ikK.distanceTo(ikF);
  // ginocchio al massimo KA.kmax gradi in guardia/parata: se il piede bloccato costringerebbe a piegarlo di più, il piede scivola un poco in fuori
  if(lim&&S.lock){const dmin=Math.sqrt(a*a+b*b+2*a*b*Math.cos(lim)),dy=ikT.y-ikH.y;ikD.copy(ikT).sub(ikH);if(ikD.length()<dmin){ikB.set(ikD.x,0,ikD.z);const L=Math.sqrt(Math.max(0,dmin*dmin-dy*dy));if(ikB.lengthSq()<1e-8)ikB.set(0,0,1).applyQuaternion(ikG);ikB.normalize();const nx=ikH.x+ikB.x*L,nz=ikH.z+ikB.z*L;S.lock.x+=nx-ikT.x;S.lock.z+=nz-ikT.z;S.off.x+=nx-ikT.x;S.off.z+=nz-ikT.z;ikT.x=nx;ikT.z=nz}}
  ikD.copy(ikT).sub(ikH);let d=ikD.length();if(d<1e-4||a<1e-4||b<1e-4)continue;ikD.multiplyScalar(1/d);d=Math.max(Math.abs(a-b)+.002*sy,Math.min(a+b-.002*sy,d));
  ikP.copy(ikK).sub(ikH);ikP.addScaledVector(ikD,-ikP.dot(ikD));if(ikP.lengthSq()<1e-8*sy*sy){ikP.set(0,0,1).applyQuaternion(ikG);ikP.addScaledVector(ikD,-ikP.dot(ikD))}ikP.normalize();
  const x=(a*a-b*b+d*d)/(2*d),h=Math.sqrt(Math.max(0,a*a-x*x));ikN.copy(ikH).addScaledVector(ikD,x).addScaledVector(ikP,h);ikT.copy(ikH).addScaledVector(ikD,d);
  ikA.copy(ikK).sub(ikH).normalize();ikB.copy(ikN).sub(ikH).normalize();ikQ.setFromUnitVectors(ikA,ikB).premultiply(ikGi).multiply(ikG);FIN['t'+sd].premultiply(ikQ);
  ikA.copy(ikF).sub(ikK).normalize();ikB.copy(ikT).sub(ikN).normalize();ikQ.setFromUnitVectors(ikA,ikB).premultiply(ikGi).multiply(ikG);FIN['s'+sd].premultiply(ikQ);any=true}
 if(any)applyPose(R,FIN)}
// due ossa (coscia, stinco): porta la caviglia sul punto p (mondo), il ginocchio resta dalla parte dove già piega
// ginocchia verso la punta del piede: la clip di guardia le porta in dentro (gamba "a X"). Si ruota la coscia attorno all'asse anca-caviglia:
// il piede resta dov'è, cambia solo da che parte guarda il ginocchio (verso la punta del piede, un po' in fuori).
const kaF=new THREE.Quaternion(),kaV=new THREE.Vector3(),kaO=new THREE.Vector3();
function kneeAlign(R,FIN,k){if(k<=.001)return;const B=R.B;R.G.updateMatrixWorld(true);R.G.getWorldQuaternion(ikG);ikGi.copy(ikG).invert();const hc=B.hips.getWorldPosition(kaO).clone();let any=false;
 for(const sd of'RL'){B['t'+sd].getWorldPosition(ikH);B['s'+sd].getWorldPosition(ikK);B['f'+sd].getWorldPosition(ikF);ikD.copy(ikF).sub(ikH);const d=ikD.length();if(d<1e-4)continue;ikD.multiplyScalar(1/d);
  ikA.copy(ikK).sub(ikH);ikA.addScaledVector(ikD,-ikA.dot(ikD));if(ikA.lengthSq()<1e-8)continue;ikA.normalize();
  B['f'+sd].getWorldQuaternion(kaF);kaV.set(0,0,1).applyQuaternion(kaF);kaV.y=0;if(kaV.lengthSq()<1e-6)kaV.set(0,0,1);kaV.normalize();ikB.set(0,0,1).applyQuaternion(ikG);ikB.y=0;ikB.normalize();kaV.multiplyScalar(KA.toe).addScaledVector(ikB,1-KA.toe);// metà punta del piede, metà verso l'avversario
  kaV.addScaledVector(ikD,-kaV.dot(ikD));if(kaV.lengthSq()<1e-8)continue;kaV.normalize();
  let ang=Math.acos(Math.max(-1,Math.min(1,ikA.dot(kaV))));ikN.crossVectors(ikA,kaV);if(ikN.dot(ikD)<0)ang=-ang;ang*=k;if(Math.abs(ang)<.01)continue;
  ikQ.setFromAxisAngle(ikD,ang).premultiply(ikGi).multiply(ikG);FIN['t'+sd].premultiply(ikQ);FIN['s'+sd].premultiply(ikQ);any=true}
 if(any)applyPose(R,FIN)}
function legTo(R,FIN,sd,p,pole){const B=R.B;R.G.updateMatrixWorld(true);R.G.getWorldQuaternion(ikG);ikGi.copy(ikG).invert();const sy=R.G.scale.y;B['t'+sd].getWorldPosition(ikH);B['s'+sd].getWorldPosition(ikK);B['f'+sd].getWorldPosition(ikF);
 const a=ikH.distanceTo(ikK),b=ikK.distanceTo(ikF);ikD.copy(p).sub(ikH);let d=ikD.length();if(d<1e-4||a<1e-4||b<1e-4)return;ikD.multiplyScalar(1/d);d=Math.max(Math.abs(a-b)+.002*sy,Math.min(a+b-.002*sy,d));
 if(pole)ikP.copy(pole).applyQuaternion(ikG);else ikP.copy(ikK).sub(ikH);ikP.addScaledVector(ikD,-ikP.dot(ikD));if(ikP.lengthSq()<1e-8){ikP.set(0,0,1).applyQuaternion(ikG);ikP.addScaledVector(ikD,-ikP.dot(ikD))}ikP.normalize();
 const x=(a*a-b*b+d*d)/(2*d),h=Math.sqrt(Math.max(0,a*a-x*x));ikN.copy(ikH).addScaledVector(ikD,x).addScaledVector(ikP,h);ikT.copy(ikH).addScaledVector(ikD,d);
 ikA.copy(ikK).sub(ikH).normalize();ikB.copy(ikN).sub(ikH).normalize();ikQ.setFromUnitVectors(ikA,ikB).premultiply(ikGi).multiply(ikG);FIN['t'+sd].premultiply(ikQ);
 ikA.copy(ikF).sub(ikK).normalize();ikB.copy(ikT).sub(ikN).normalize();ikQ.setFromUnitVectors(ikA,ikB).premultiply(ikGi).multiply(ikG);FIN['s'+sd].premultiply(ikQ);applyPose(R,FIN)}
// stinco giù: in ginocchio i piedi restano appoggiati a terra invece di sollevarsi dietro (crollo del K.O. in motion capture)
function shinDown(R,M,FIN,sd,k){const B=R.B;if(!B['s'+sd]||!B['f'+sd]||!M.J)return;R.G.updateMatrixWorld(true);R.G.getWorldQuaternion(ikG);ikGi.copy(ikG).invert();const sy=R.G.scale.y,gy=R.G.position.y+(M.J['f'+sd].y)*sy;B['s'+sd].getWorldPosition(ikK);B['f'+sd].getWorldPosition(ikF);
 if(ikF.y<=gy+2)return;ikA.copy(ikF).sub(ikK);const L=ikA.length();ikA.normalize();const hz=Math.hypot(ikA.x,ikA.z)||1e-4,dy=Math.max(-1,Math.min(1,(gy-ikK.y)/L)),hh=Math.sqrt(1-dy*dy);ikB.set(ikA.x/hz*hh,dy,ikA.z/hz*hh);ikB.lerp(ikA,1-k).normalize();
 ikQ.setFromUnitVectors(ikA,ikB).premultiply(ikGi).multiply(ikG);FIN['s'+sd].premultiply(ikQ);applyPose(R,FIN)}
function lerpA(A,k,t,r,dt){if(A[k]==null)A[k]=t;else if(dt>0)A[k]+=(t-A[k])*Math.min(1,r*dt)}
