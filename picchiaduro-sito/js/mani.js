// mani.js: mani "scolpite" per gli Accoppalo. I modelli non hanno le ossa delle dita, quindi quando una mano stringe un oggetto (o fa la pistola)
// viene sostituita da una mano costruita qui: un'unica superficie continua (palmo, nocche, dita, pieghe tra le dita) ricavata da un campo di distanza
// e trasformata in triangoli con il metodo "surface nets". Niente salsicciotti incollati: le dita nascono dal palmo e si toccano con un solco.
// Solo grafica. Coordinate della mano destra: polso all'origine, +Y verso le nocche, +Z dorso, pollice a -X.
const _smin=(a,b,k)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return[Math.min(a,b)-h*h*k*.25,h*h*k*.25]};
function sdfPrim(p,x,y,z){
 if(p.t==='c'){const ax=p.b[0]-p.a[0],ay=p.b[1]-p.a[1],az=p.b[2]-p.a[2],px=x-p.a[0],py=y-p.a[1],pz=z-p.a[2],l2=ax*ax+ay*ay+az*az||1e-9;let t=(px*ax+py*ay+pz*az)/l2;t=t<0?0:t>1?1:t;
  const dx=px-ax*t,dy=py-ay*t,dz=pz-az*t,fl=p.fl||1;return Math.sqrt(dx*dx+dy*dy+dz*dz*fl*fl)-(p.ra+(p.rb-p.ra)*t)}
 if(p.t==='e'){const dx=(x-p.c[0])/p.r[0],dy=(y-p.c[1])/p.r[1],dz=(z-p.c[2])/p.r[2];return(Math.sqrt(dx*dx+dy*dy+dz*dz)-1)*Math.min(p.r[0],p.r[1],p.r[2])}
 const qx=Math.abs(x-p.c[0])-p.h[0],qy=Math.abs(y-p.c[1])-p.h[1],qz=Math.abs(z-p.c[2])-p.h[2],ox=Math.max(qx,0),oy=Math.max(qy,0),oz=Math.max(qz,0);return Math.sqrt(ox*ox+oy*oy+oz*oz)+Math.min(Math.max(qx,qy,qz),0)-p.rr}
// gruppi: 0 = palmo e polso; 1.. = un dito ciascuno. Dentro un dito l'unione è morbida, tra dita vicine resta il solco, tra dita e palmo si fonde la pelle.
function sdfHand(G,x,y,z,out){let dp=1e9,cr=0,dGl=1e9,dSk=1e9;const P=G[0];for(let i=0;i<P.length;i++){const d=sdfPrim(P[i],x,y,z);if(P[i].sk){if(d<dSk)dSk=d}else if(d<dGl)dGl=d;if(dp>1e8)dp=d;else{const s=_smin(dp,d,2.2);dp=s[0]}}
 let F=1e9;for(let g=1;g<G.length;g++){let dg=1e9;const L=G[g];for(let i=0;i<L.length;i++){const d=sdfPrim(L[i],x,y,z);if(L[i].sk){if(d<dSk)dSk=d}else if(d<dGl)dGl=d;if(dg>1e8)dg=d;else dg=_smin(dg,d,.7)[0]}
  if(F>1e8)F=dg;else{const s=_smin(F,dg,.55);F=s[0];cr+=s[1]*3.2}}
 let d=dp;if(F<1e8){const s=_smin(dp,F,G.kp||1.9);d=s[0];cr+=s[1]*.45}out[0]=d;out[1]=cr;out[2]=dGl-dSk;return d}
function sdfMesh(G,mn,mx,h){const nx=Math.ceil((mx[0]-mn[0])/h)+1,ny=Math.ceil((mx[1]-mn[1])/h)+1,nz=Math.ceil((mx[2]-mn[2])/h)+1,D=new Float32Array(nx*ny*nz),o=[0,0,0],I=(i,j,k)=>i+nx*(j+ny*k);
 for(let k=0;k<nz;k++)for(let j=0;j<ny;j++)for(let i=0;i<nx;i++)D[I(i,j,k)]=sdfHand(G,mn[0]+i*h,mn[1]+j*h,mn[2]+k*h,o);
 const cx=nx-1,cy=ny-1,vid=new Int32Array(cx*cy*(nz-1)).fill(-1),C=(i,j,k)=>i+cx*(j+cy*k),pos=[],E=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]],cv=new Float32Array(8);
 for(let k=0;k<nz-1;k++)for(let j=0;j<cy;j++)for(let i=0;i<cx;i++){let m=0;for(let c=0;c<8;c++){const v=D[I(i+(c&1),j+((c>>1)&1),k+((c>>2)&1))];cv[c]=v;if(v<0)m|=1<<c}if(m===0||m===255)continue;
  let sx=0,sy=0,sz=0,n=0;for(const[a,b]of E){const va=cv[a],vb=cv[b];if((va<0)===(vb<0))continue;const t=va/(va-vb);sx+=(a&1)+((b&1)-(a&1))*t;sy+=((a>>1)&1)+(((b>>1)&1)-((a>>1)&1))*t;sz+=((a>>2)&1)+(((b>>2)&1)-((a>>2)&1))*t;n++}
  vid[C(i,j,k)]=pos.length/3;pos.push(mn[0]+(i+sx/n)*h,mn[1]+(j+sy/n)*h,mn[2]+(k+sz/n)*h)}
 const idx=[],quad=(a,b,c,d)=>{if(a<0||b<0||c<0||d<0)return;idx.push(a,b,c,a,c,d)};
 for(let k=1;k<nz-1;k++)for(let j=1;j<cy;j++)for(let i=0;i<cx;i++)if((D[I(i,j,k)]<0)!==(D[I(i+1,j,k)]<0))quad(vid[C(i,j-1,k-1)],vid[C(i,j,k-1)],vid[C(i,j,k)],vid[C(i,j-1,k)]);
 for(let k=1;k<nz-1;k++)for(let j=0;j<cy;j++)for(let i=1;i<cx;i++)if((D[I(i,j,k)]<0)!==(D[I(i,j+1,k)]<0))quad(vid[C(i-1,j,k-1)],vid[C(i,j,k-1)],vid[C(i,j,k)],vid[C(i-1,j,k)]);
 for(let k=0;k<nz-2;k++)for(let j=1;j<cy;j++)for(let i=1;i<cx;i++)if((D[I(i,j,k)]<0)!==(D[I(i,j,k+1)]<0))quad(vid[C(i-1,j-1,k)],vid[C(i,j-1,k)],vid[C(i,j,k)],vid[C(i-1,j,k)]);
 // i vertici scivolano sulla superficie vera, poi normali dal gradiente del campo; pieghe (cr) e zona pelle/guanto (rg) per il colore
 const n=pos.length/3,nor=new Float32Array(n*3),cr=new Float32Array(n),rg=new Float32Array(n),e=.12,gr=(x,y,z)=>{const gx=sdfHand(G,x+e,y,z,o)-sdfHand(G,x-e,y,z,o),gy=sdfHand(G,x,y+e,z,o)-sdfHand(G,x,y-e,z,o),gz=sdfHand(G,x,y,z+e,o)-sdfHand(G,x,y,z-e,o),l=Math.hypot(gx,gy,gz)||1;return[gx/l,gy/l,gz/l]};
 for(let v=0;v<n;v++){let x=pos[v*3],y=pos[v*3+1],z=pos[v*3+2],g;for(let it=0;it<2;it++){g=gr(x,y,z);const d=Math.max(-h*.35,Math.min(h*.35,sdfHand(G,x,y,z,o)));x-=g[0]*d;y-=g[1]*d;z-=g[2]*d}g=gr(x,y,z);sdfHand(G,x,y,z,o);pos[v*3]=x;pos[v*3+1]=y;pos[v*3+2]=z;nor[v*3]=g[0];nor[v*3+1]=g[1];nor[v*3+2]=g[2];cr[v]=Math.min(1,o[1]/.5);rg[v]=Math.max(0,Math.min(1,.5+o[2]/.9))}
 // verso dei triangoli: sempre concorde con la normale
 for(let t=0;t<idx.length;t+=3){const a=idx[t]*3,b=idx[t+1]*3,c=idx[t+2]*3,ux=pos[b]-pos[a],uy=pos[b+1]-pos[a+1],uz=pos[b+2]-pos[a+2],vx=pos[c]-pos[a],vy=pos[c+1]-pos[a+1],vz=pos[c+2]-pos[a+2];
  if((uy*vz-uz*vy)*nor[a]+(uz*vx-ux*vz)*nor[a+1]+(ux*vy-uy*vx)*nor[a+2]<0){const s=idx[t+1];idx[t+1]=idx[t+2];idx[t+2]=s}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(n*3).fill(1),3));g.setIndex(idx);g.userData={cr,rg};return g}
const HV=(x,y,z)=>[x,y,z],hAdd=(a,b,s=1)=>[a[0]+b[0]*s,a[1]+b[1]*s,a[2]+b[2]*s],hSub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],hNrm=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l]};
// un dito: tre falangi che si assottigliano, nocche appena più grosse. sk = quali falangi sono pelle nuda (per i guanti senza dita)
function fingerPrims(J,r,sk){const L=[];for(let i=0;i<3;i++){const ra=r*(1-.07*i),rb=r*(1-.07*(i+1))*(i===2?.9:1);L.push({t:'c',a:J[i],b:J[i+1],ra,rb,sk:sk&&sk[i]});L.push({t:'e',c:J[i],r:[ra*1.05,ra*1.05,ra*1.05],sk:sk&&sk[i]})}return L}
function handBox(G){const mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9],ex=(p,r)=>{for(let i=0;i<3;i++){mn[i]=Math.min(mn[i],p[i]-r);mx[i]=Math.max(mx[i],p[i]+r)}};
 for(const L of G)for(const p of L){if(p.t==='c'){ex(p.a,p.ra+1.2);ex(p.b,p.rb+1.2)}else if(p.t==='e')ex(p.c,Math.max(...p.r)+1.2);else ex(p.c,Math.max(...p.h)+p.rr+1.2)}return[mn,mx]}
function handMat(){const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.52,metalness:0});if(window.ENVTEX){m.envMap=ENVTEX;m.envMapIntensity=.35}return m}
const NAILM=()=>new THREE.MeshStandardMaterial({color:0xe9c9bd,roughness:.22,metalness:0});
function nailMesh(tip,dir,out,r,m){const o=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),m),Y=new THREE.Vector3(...hNrm(dir)),Z=new THREE.Vector3(...hNrm(out));Z.addScaledVector(Y,-Z.dot(Y)).normalize();const X=new THREE.Vector3().crossVectors(Y,Z);
 o.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(X,Y,Z));o.scale.set(r*.78,r*.95,r*.3);o.position.set(tip[0],tip[1],tip[2]).addScaledVector(Y,-r*.55).addScaledVector(Z,r*.72);return o}
// colora la mano: col = colore principale (pelle o guanto del modello), skin = pelle nuda delle dita che escono dal guanto. Pieghe più scure, nocche appena arrossate.
function handPaint(G,col,skin){const U=G.userData,key=col+'/'+skin;if(U.key===key)return;U.key=key;const a=new THREE.Color(col),b=new THREE.Color(skin==null?col:skin),lum=c=>.3*c.r+.6*c.g+.1*c.b,c=new THREE.Color();
 for(const m of U.meshes){const g=m.geometry,C=g.attributes.color,cr=g.userData.cr,rg=g.userData.rg,P=g.attributes.position;for(let i=0;i<C.count;i++){c.copy(a).lerp(b,rg[i]);const k=cr[i],sk=lum(c)>.25?1:.4;
   let r=c.r*(1-.5*k),gg=c.g*(1-.66*k*sk-.5*k*(1-sk)),bb=c.b*(1-.68*k*sk-.5*k*(1-sk));const kn=U.kn?U.kn(P.getX(i),P.getY(i),P.getZ(i)):0;r*=1+.1*kn*sk;gg*=1-.12*kn*sk;bb*=1-.14*kn*sk;C.setXYZ(i,r,gg,bb)}C.needsUpdate=true}
 const bare=lum(b)>.25;for(const n of U.nails)n.visible=n.userData.sk?lum(b)>.25:lum(a)>.25&&bare}
// pugno chiuso attorno a un manico di raggio Rh che passa lungo X (centro C): le dita lo avvolgono, il pollice si chiude sopra
// mano modellata (GLB fornito da Lorenzo, oggetti/mano.glb, nel riferimento della mano: polso nell'origine, dita +Y, manico lungo X, presa verso -Z, pollice verso -X).
// Nel GLB le dita sono piegate solo alla nocca: qui le chiudo attorno al manico piegando le falangi sulle loro articolazioni (rotazioni rigide: le dita
// non si allungano) finché toccano il manico di raggio Rh. Il polso si allarga (o stringe) fino al raggio dell'avambraccio del lottatore (wr, nelle unità della mano).
const MH={PIP:[23.4,-7.3],DIP:[22.4,-10.4],TIP:[21.2,-12.4],yb:21,zp:-4.5,ft:1.5};
function buildMeshHand(Rh,wr){let src=null;OGG.mano.traverse(o=>{if(o.isMesh&&!src)src=o});const g=src.geometry.clone(),P=g.attributes.position,col=g.attributes.color,n=P.count,cr=new Float32Array(n),rg=new Float32Array(n).fill(1);
 // centro e raggio del moncone del polso: lo porto sull'asse dell'avambraccio
 let cx=0,cz=0,m=0;for(let i=0;i<n;i++)if(P.getY(i)<1.5){cx+=P.getX(i);cz+=P.getZ(i);m++}cx/=m||1;cz/=m||1;let r0=0;for(let i=0;i<n;i++)if(P.getY(i)<1.5)r0+=Math.hypot(P.getX(i)-cx,P.getZ(i)-cz);r0/=m||1;
 const C=[MH.yb-Rh-.3,MH.zp-Rh-.3],Rc=Rh+MH.ft,rot=(p,c,a)=>{const dy=p[0]-c[0],dz=p[1]-c[1],ca=Math.cos(a),sa=Math.sin(a);return[c[0]+dy*ca+dz*sa,c[1]-dy*sa+dz*ca]},
  segD=(A,B)=>{let q=1e9;for(let t=0;t<=1.001;t+=.1)q=Math.min(q,Math.hypot(A[0]+(B[0]-A[0])*t-C[0],A[1]+(B[1]-A[1])*t-C[1]));return q};
 let pa=0;for(;pa<1.75;pa+=.02){const d2=rot(MH.DIP,MH.PIP,pa),t2=rot(MH.TIP,MH.PIP,pa);if(segD(MH.PIP,d2)<=Rc||segD(d2,t2)<=Rc)break}
 const D2=rot(MH.DIP,MH.PIP,pa),T2=rot(MH.TIP,MH.PIP,pa);let da=0;for(;da<1.3;da+=.02){if(segD(D2,rot(T2,D2,da))<=Rc)break}
 const sm=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)},kw=wr?Math.max(.8,Math.min(1.7,wr/r0)):1;
 for(let i=0;i<n;i++){cr[i]=col?Math.min(.6,col.getX(i)):0;let x=P.getX(i),y=P.getY(i),z=P.getZ(i);
  if(y>19&&!(x<-7.5&&y<19.5)){let q=[y,z];const wd=sm((MH.DIP[1]+.9-z)/1.8);if(wd>0)q=rot(q,MH.DIP,da*wd);const wp=sm((MH.PIP[1]+1-z)/2);if(wp>0)q=rot(q,MH.PIP,pa*wp);y=q[0];z=q[1]}
  x-=cx;z-=cz;const ww=1-sm((y-2)/7);if(ww>0&&kw!==1){const f=1+(kw-1)*ww;x*=f;z*=f}P.setXYZ(i,x,y,z)}
 if(!col)g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(n*3),3));g.computeVertexNormals();g.userData.cr=cr;g.userData.rg=rg;
 const G=new THREE.Group(),me=new THREE.Mesh(g,handMat());me.castShadow=true;G.add(me);G.userData={C:new THREE.Vector3(0,C[0],C[1]-cz),Rh,meshes:[me],nails:[],mesh:1};G.visible=false;scene.add(G);return G}
function buildHand(Rh,wr){if(typeof OGG!=='undefined'&&OGG.mano)return buildMeshHand(Rh,wr);const G=new THREE.Group(),pz=-4.1,C=new THREE.Vector3(0,17.2,pz-Rh),rho=Rh+2.3,on=(a,x)=>[x,C.y+rho*Math.cos(a),C.z-rho*Math.sin(a)],PR=[[],[]],nails=[],nm=NAILM(),KN=[];
 PR[0].push({t:'b',c:[0,11.2,-.4],h:[6.4,7.6,1.5],rr:2.5},{t:'e',c:[0,1.2,0],r:[6.3,5.6,4.6]},{t:'e',c:[-5.6,7.6,-3],r:[3.8,6.6,3.2]},{t:'e',c:[5.6,8,-2.2],r:[3,6.4,2.6]});
 [[-6.2,1,2.15],[-2.1,1.06,2.3],[2.1,1,2.15],[5.9,.84,1.9]].forEach(([x,ls,r])=>{const p0=[x,20.3,.5],D=a=>{const q=on(a,x);return Math.hypot(q[1]-p0[1],q[2]-p0[2])};KN.push(p0);
  let am=-1.2,dm=1e9;for(let a=-1.2;a<1.6;a+=.02){const d=D(a);if(d<dm){dm=d;am=a}}let a1=am;while(a1<2.2&&D(a1)<9.6*ls)a1+=.02;
  const a2=a1+2*Math.asin(Math.min(1,6.6*ls/(2*rho))),a3=a2+2*Math.asin(Math.min(1,5.2*ls/(2*rho))),j1=on(a1,x),j2=on(a2,x*.97),j3=on(a3,x*.94);PR.push(fingerPrims([p0,j1,j2,j3],r));
  nails.push(nailMesh(j3,hSub(j3,j2),hSub(j3,[j3[0],C.y,C.z]),r*.86,nm))});
 const tb=[-8.2,6.5,-2.2],t1=[-7.6,C.y-rho*.74,C.z-rho*.6],t2=[-1.6,C.y-rho*.2,C.z-rho*1.03-.6],t3=[2.6,C.y+rho*.12,C.z-rho*1.02-.9];PR.push(fingerPrims([tb,t1,t2,t3],2.75).map(p=>(p.ra*=p.t==='c'?1:1,p)));nails.push(nailMesh(t3,hSub(t3,t2),hSub(t3,[t3[0],C.y,C.z]),2.2,nm));
 const[mn,mx]=handBox(PR),m=new THREE.Mesh(sdfMesh(PR,mn,mx,.58),handMat());m.castShadow=true;G.add(m);for(const n of nails)G.add(n);
 G.userData={C,Rh,meshes:[m],nails,kn:(x,y,z)=>{let k=0;for(const p of KN){const d=Math.hypot(x-p[0],y-p[1],z-p[2]-1.4);k=Math.max(k,1-d/3.2)}return Math.max(0,k)}};G.visible=false;scene.add(G);return G}
// mano "a pistola": indice e medio tesi, anulare e mignolo chiusi nel palmo, pollice alzato che fa da cane (ruota sul suo gruppo)
function buildGunHand(){const G=new THREE.Group(),PR=[[],[]],nails=[],nm=NAILM(),KN=[];
 PR[0].push({t:'b',c:[.4,11.2,-.4],h:[6.5,7.6,1.5],rr:2.5},{t:'e',c:[0,1.2,0],r:[6.3,5.6,4.6]},{t:'e',c:[-5.4,7.4,-2.6],r:[3.6,6.2,3]},{t:'e',c:[5.8,8,-2],r:[3,6.4,2.5]});
 for(const[x,l,r]of[[-3,1,2.15],[1.6,1.07,2.3]]){const p0=[x,20.3,.5],j1=[x*.94,20.3+9.4*l,.7],j2=[x*.9,j1[1]+6.5*l,.5],j3=[x*.87,j2[1]+5.1*l,.1];KN.push(p0);PR.push(fingerPrims([p0,j1,j2,j3],r,[0,1,1]));const n=nailMesh(j3,hSub(j3,j2),[0,0,1],r*.86,nm);n.userData.sk=1;nails.push(n)}
 for(const[x,r]of[[6,2.1],[9.6,1.85]]){const p0=[x,19.6-(x>9?1.9:0),.3],j1=hAdd(p0,[-.3,3.2,-5.6]),j2=hAdd(j1,[-.5,-5.2,-2.2]),j3=hAdd(j2,[-.3,-3.6,2.4]);KN.push(p0);PR.push(fingerPrims([p0,j1,j2,j3],r,[0,1,1]))}
 const[mn,mx]=handBox(PR),m=new THREE.Mesh(sdfMesh(PR,mn,mx,.58),handMat());m.castShadow=true;G.add(m);
 const th=new THREE.Group();th.position.set(-7.4,7.2,.2);th.rotation.z=1.25;const TP=[[],fingerPrims([[0,0,0],[0,7.6,-.5],[0,13.4,-.3],[0,17.6,.1]],2.9,[0,1,1])];TP[0].push({t:'e',c:[0,-.5,0],r:[3.2,3.2,3.2]});const[m2,x2]=handBox(TP),tm=new THREE.Mesh(sdfMesh(TP,m2,x2,.5),handMat());tm.castShadow=true;th.add(tm);const tn=nailMesh([0,17.6,.1],[0,1,0],[0,0,1],2.3,nm);tn.userData.sk=1;th.add(tn);nails.push(tn);G.add(th);for(const n of nails)if(n.parent!==th)G.add(n);
 G.userData={th,len:44,meshes:[m,tm],nails,paint:(gl,sk)=>handPaint(G,gl,sk),kn:(x,y,z)=>{let k=0;for(const p of KN){const d=Math.hypot(x-p[0],y-p[1],z-p[2]-1.4);k=Math.max(k,1-d/3.2)}return Math.max(0,k)}};G.visible=false;scene.add(G);return G}
