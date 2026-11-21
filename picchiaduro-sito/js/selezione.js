// selezione.js: schermata di scelta da picchiaduro. Tre passi: il proprio lottatore, l'avversario (CPU o giocatore 2), l'arena; poi la schermata VS mentre si carica.
// Ritratti in griglia con cornici, lottatore selezionato a figura intera ai lati col nome grande. Tastiera, tocco e controller PS4.
const SEL={open:false,vs:false,cur:[0,0,0],pick:[null,null],step:0,pad:{},rep:{},cos:[0,0],pc:[null,null]},_C=0;let COLS=5,ROWS=3;// con tanti lottatori aumentano le colonne (al massimo 4 righe), così la griglia e i tasti Indietro/Avanti restano nello schermo
const $=id=>document.getElementById(id);
const fdir=e=>(window.__lottDir||'lottatori/')+e.cartella+'/';
function buildSel(){$('selgo').onclick=()=>selConfirm();$('selback').onclick=()=>selBack();$('selcos').onclick=()=>selCos(Math.min(1,SEL.step),1)}
// ---------- costumi (segreti): si sbloccano nella schermata iniziale con Quadrato + Triangolo insieme (tastiera: J + I insieme, oppure K due volte; telefono: 5 tocchi sul logo) ----------
// ogni costume ha la sua combinazione (voce "sblocco" nel roster, se manca è quella di Chrollo); gli sblocchi restano salvati nel browser
const SBL={};try{SBL.chrollo=localStorage.getItem('cafCostumi')==='1';SBL.quadrato=localStorage.getItem('cafSbl_quadrato')==='1'}catch(e){}
let COSUN=!!SBL.chrollo;
function toast(t,ms=3200){const d=$('toast');d.textContent=t;d.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>d.hidden=true,ms)}
function unlockCostumes(k='chrollo'){if(SBL[k])return;const L=(typeof ROSTER!=='undefined'?ROSTER:[]).flatMap(e=>e&&e.costumi?e.costumi.filter(c=>(c.sblocco||'chrollo')===k).map(c=>[e,c]):[]);if(!L.length&&k!=='chrollo')return;
 SBL[k]=true;if(k==='chrollo')COSUN=true;try{localStorage.setItem(k==='chrollo'?'cafCostumi':'cafSbl_'+k,'1')}catch(e){}sfx('vs');
 toast(L.length?'Costume sbloccato: '+L.map(([e,c])=>c.nome+' ('+e.nome+')').filter((x,i,a)=>a.indexOf(x)===i).join(', ')+'! Si sceglie nella scelta del lottatore (L1/R1, Q/E o il tasto Costume)':'Costumi sbloccati!')}
const cosList=e=>[null].concat(e&&e.costumi?e.costumi.filter(c=>SBL[c.sblocco||'chrollo']):[]);
function selCos(pl,d){if(SEL.step>1)return;const e=ROSTER[SEL.cur[pl]],L=cosList(e);if(L.length<2)return;SEL.cos[pl]=(SEL.cos[pl]+d+L.length)%L.length;sfx('ui_muovi');drawSel()}
function porImg(e,box){if(e.ritratto){const img=new Image();img.alt='';img.loading='lazy';img.src=fdir(e)+e.ritratto;const c=e.ritratto_centro,z=e.ritratto_zoom||1;if(c){img.style.objectPosition=c[0]+'% '+c[1]+'%';img.style.transformOrigin=c[0]+'% '+c[1]+'%'}img.style.transform='skewX(7deg) scale('+(1.18*z)+')';box.append(img)}else box.textContent=(e.nome||'?')[0]}
function fillSel(){COLS=Math.max(5,Math.ceil(ROSTER.length/4));ROWS=Math.max(3,Math.ceil(ROSTER.length/COLS));const g=$('grid');g.style.gridTemplateColumns=`repeat(${COLS},1fr)`;g.textContent='';for(let i=0;i<COLS*ROWS;i++){const e=ROSTER[i],b=document.createElement('button'),ok=e&&e.id&&!e.bloccato;b.className='card'+(ok?'':' lock');b.dataset.i=i;
  const im=document.createElement('div');im.className='por';if(ok)porImg(e,im);else im.textContent='?';const nm=document.createElement('span');nm.className='nm';nm.textContent=ok?e.nome:'In arrivo';b.append(im,nm);
  const t1=document.createElement('i');t1.className='tag t1';t1.textContent='G1';const t2=document.createElement('i');t2.className='tag t2';t2.textContent='G2';b.append(t1,t2);
  b.onclick=()=>{if(SEL.step>1)return;if(SEL.cur[SEL.step]!==i)SEL.cos[SEL.step]=0;SEL.cur[SEL.step]=i;selConfirm()};b.onmouseenter=()=>{if(SEL.step>1||SEL.cur[SEL.step]===i)return;SEL.cur[SEL.step]=i;SEL.cos[SEL.step]=0;drawSel()};g.append(b)}
 const a=$('arsel');a.textContent='';ARENE.forEach((A,i)=>{const b=document.createElement('button');b.className='card';b.dataset.i=i;const im=document.createElement('div');im.className='por';const img=new Image();img.alt='';img.loading='lazy';img.src=A.mini||A.img||'';im.append(img);const nm=document.createElement('span');nm.className='nm';nm.textContent=A.nome;b.append(im,nm);b.onclick=()=>{SEL.cur[2]=i;selConfirm()};b.onmouseenter=()=>{if(SEL.cur[2]!==i){SEL.cur[2]=i;drawSel()}};a.append(b)});drawSel()}
function setFig(n,e,c){const im=$('fig'+n),src=e&&e.id&&!e.bloccato&&e.figura?fdir(e)+(c&&c.figura||e.figura):'';if(im.dataset.s!==src){im.dataset.s=src;if(src)im.src=src;else im.removeAttribute('src');im.classList.remove('in');void im.offsetWidth;im.classList.add('in')}$('nm'+n).textContent=e&&e.id&&!e.bloccato?e.nome:''}
function drawSel(){if(!ROSTER.length)return;const st=SEL.step,cpu=mode==='cpu'||mode==='train';document.querySelectorAll('#grid .card').forEach(b=>{const i=+b.dataset.i,id=ROSTER[i]&&ROSTER[i].id;
  b.classList.toggle('c1',st===0?SEL.cur[0]===i:!!SEL.pick[0]&&id===SEL.pick[0]);b.classList.toggle('c2',st===1?SEL.cur[1]===i:st===2&&!!SEL.pick[1]&&id===SEL.pick[1]);b.classList.toggle('p1',st>0&&!!SEL.pick[0]&&id===SEL.pick[0]);b.querySelector('.t2').textContent=st===1?'G2':cpu?'CPU':'G2'});
 document.querySelectorAll('#arsel .card').forEach(b=>b.classList.toggle('c1',+b.dataset.i===SEL.cur[2]));$('grid').hidden=st===2;$('arsel').hidden=st!==2;$('tg2').textContent=st===1?(pads().length>1?'G2 / CPU':'CPU'):cpu?'CPU':'G2';
 const e1=st===0?ROSTER[SEL.cur[0]]:rosterEntry(SEL.pick[0]),e2=st===0?null:st===1?ROSTER[SEL.cur[1]]:rosterEntry(SEL.pick[1]),cf=(pl,e)=>SEL.step===pl?cosList(e)[SEL.cos[pl]]||null:costumeOf(e,SEL.pc[pl]);setFig(1,e1,cf(0,e1));setFig(2,mode==='online'?null:e2,cf(1,e2));
 const e=ROSTER[SEL.cur[Math.min(st,1)]],ok=e&&e.id&&!e.bloccato;
 $('seltitle').textContent=st===2?"Scegli l'arena":mode==='online'?'Scegli il tuo lottatore':st===0?'Scegli il tuo lottatore':"Scegli l'avversario";
 $('selmsg').textContent=st===2?ARENE[SEL.cur[2]].nome+'  ·  Esc o Cerchio per tornare indietro':(ok?(e.descrizione||''):'Questo lottatore arriverà presto.')+(st===1?(pads().length>1?'  ·  Per giocare in due scegli con l\'altro controller.':'')+'  Esc o Cerchio per tornare indietro':'');
 {const pl=Math.min(1,st),L=st<2&&mode!=='online'?cosList(e):[null],c=L[SEL.cos[pl]];$('selcos').hidden=L.length<2;$('selcos').textContent='Costume: '+(c?c.nome:'Normale');if(L.length>1)$('selmsg').textContent+='  ·  Costume: '+(c?c.nome:'Normale')+' (L1/R1 o Q/E)'}$('selback').hidden=false;$('selback').textContent=st>0?'Indietro':p1&&mode!=='online'?"Torna all'incontro":'Menu';$('selgo').textContent=st===2&&mode!=='online'?'Combatti':'Avanti'}
function openSel(){if(net)return;if(mode==='2p'||mode==='train')mode='cpu';SEL.open=true;SEL.pad={};SEL.pick=[null,null];SEL.step=0;SEL.cos=[0,0];SEL.pc=[null,null];const a=ROSTER.findIndex(e=>e&&e.id&&!e.bloccato);SEL.cur=[Math.max(0,a),Math.max(0,a),Math.max(0,ARENE.findIndex(x=>x.id===selArena))];$('sel').hidden=false;$('selerr').textContent='';drawSel();$('wrap').scrollIntoView({block:'nearest'})}
function closeSel(){SEL.open=false;$('sel').hidden=true}
const selOpen=()=>SEL.open||SEL.vs||HOME.open||HOME.cfg||(typeof PAUSE!=='undefined'&&PAUSE.open&&!net);
function showSelErr(e){SEL.vs=false;$('vs').hidden=true;$('sel').hidden=false;$('selerr').textContent='Errore: '+(e&&e.message||e)}
function selMove(pl,dx,dy){if(SEL.step===2){const n=ARENE.length;SEL.cur[2]=(SEL.cur[2]+(dx||dy)+n)%n}else{let i=SEL.cur[pl],c=i%COLS,r=Math.floor(i/COLS);c=(c+dx+COLS)%COLS;r=(r+dy+ROWS)%ROWS;SEL.cur[pl]=r*COLS+c;SEL.cos[pl]=0}sfx('ui_muovi');drawSel()}
function showVS(ids){const E=ids.map(rosterEntry);for(let i=0;i<2;i++){const im=$('vf'+(i+1)),C=costumeOf(E[i],(typeof COSTUME!=='undefined'?COSTUME:[])[i]);if(E[i]&&E[i].figura)im.src=fdir(E[i])+(C&&C.figura||E[i].figura);else im.removeAttribute('src');$('vn'+(i+1)).textContent=E[i]?E[i].nome:''}$('vsbar').style.width='0';$('vstxt').textContent='';SEL.vs=true;const v=$('vs');v.hidden=true;void v.offsetWidth;v.hidden=false;sfx('vs')}
function selConfirm(pk){if(!ROSTER.length||loading||SEL.vs)return;const pl=SEL.step;wake();
 if(pl===2){const A=ARENE[SEL.cur[2]];selArena=A.id;markArena(A.id);sfx('ui_ok');if(mode==='online'){closeSel();openHome('online');setOnline('Lottatore: '+(rosterEntry(SEL.pick[0])||{}).nome+' · Arena: '+A.nome+'. Crea una partita o entra con un codice (si gioca nell\'arena di chi crea la partita).');return}const ids=[SEL.pick[0],SEL.pick[1]],t0=performance.now();COSTUME=[SEL.pc[0],SEL.pc[1]];$('sel').hidden=true;showVS(ids);
  startMatch(ids,selArena).then(()=>new Promise(r=>setTimeout(r,window.__test?0:Math.max(0,2400-(performance.now()-t0))))).then(()=>{SEL.vs=false;$('vs').hidden=true;reset()}).catch(()=>{});return}
 const e=ROSTER[SEL.cur[pl]];if(!e||!e.id||e.bloccato){$('selmsg').textContent='Questo lottatore arriverà presto: scegline un altro.';sfx('ui_no');return}
 SEL.pick[pl]=e.id;{const c=cosList(e)[SEL.cos[pl]];SEL.pc[pl]=c?c.id:null}sfx('ui_ok');if(pl===0)PADS=[pk==null?null:pk,null];else if(pl===1&&mode!=='online'){if(pk!=null&&PADS[0]!=null&&pk!==PADS[0]){mode='2p';PADS[1]=pk}else mode='cpu'}
 if(pl===0&&mode!=='online'){SEL.step=1;SEL.cur[1]=SEL.cur[0];SEL.cos[1]=0}else SEL.step=2;drawSel()}
function selBack(){if(SEL.vs)return;sfx('ui_no');if(SEL.step===2){SEL.step=mode==='online'?0:1;if(mode==='online')SEL.pick=[null,null];else SEL.pick[1]=null;drawSel()}else if(SEL.step===1){SEL.step=0;SEL.pick=[null,null];drawSel()}else if(p1&&mode!=='online')closeSel();else{closeSel();openHome(mode==='online'?'online':'main')}}
function selKey(e){if(e.target.tagName==='INPUT')return;const k=e.code,mv={KeyA:[-1,0],ArrowLeft:[-1,0],KeyD:[1,0],ArrowRight:[1,0],KeyW:[0,-1],ArrowUp:[0,-1],KeyS:[0,1],ArrowDown:[0,1]}[k];
 if(mv){e.preventDefault();selMove(Math.min(1,SEL.step),...mv)}else if(k==='KeyJ'||k==='Enter'||k==='Space'){e.preventDefault();selConfirm()}else if(k==='KeyK'||k==='Escape'||k==='Backspace'){e.preventDefault();selBack()}else if(k==='KeyQ'||k==='KeyE'){e.preventDefault();selCos(Math.min(1,SEL.step),k==='KeyE'?1:-1)}}
// controller: croce o levetta per muoversi, X per confermare, Cerchio per tornare indietro. Con due controller il secondo sceglie il lottatore 2.
// Ogni controller collegato può muovere il cursore: G1 è il controller che conferma il primo lottatore; l'avversario confermato da un ALTRO controller
// fa giocare in due (G2 = quel controller), confermato da G1 o dalla tastiera fa giocare contro la CPU.
function selPoll(){if(typeof PAUSE!=='undefined'&&PAUSE.open){pausePoll();return}if(homePoll())return;if(!SEL.open||SEL.vs)return;const ps=pads();padStatus(ps);
 for(const q of ps){const b=n=>!!(q.buttons[n]&&q.buttons[n].pressed),ax=q.axes[0]||0,ay=q.axes[1]||0,k=q.index,o=SEL.pad[k]||(SEL.pad[k]={}),
  n={l:b(14)||ax<-.5,r:b(15)||ax>.5,u:b(12)||ay<-.5,d:b(13)||ay>.5,x:b(0),c:b(1),s:b(9),l1:b(4),r1:b(5)},dir=n.l?[-1,0]:n.r?[1,0]:n.u?[0,-1]:n.d?[0,1]:null;
  if(o.x===undefined){SEL.pad[k]=Object.assign(n,{dir:!!dir});continue}// primo fotogramma del controller: niente pressioni fantasma
  if(dir){if(!o.dir||--SEL.rep[k]<=0){selMove(Math.min(1,SEL.step),...dir);SEL.rep[k]=o.dir?6:16}}
  if((n.x&&!o.x)||(n.s&&!o.s))selConfirm(k);if(n.c&&!o.c)selBack();if(n.l1&&!o.l1)selCos(Math.min(1,SEL.step),-1);if(n.r1&&!o.r1)selCos(Math.min(1,SEL.step),1);
  SEL.pad[k]=Object.assign(n,{dir:!!dir})}}
function showLoad(x){const t='Carico i lottatori e l\'arena… '+Math.round(x*100)+'%';if(SEL.vs){$('vsbar').style.width=Math.round(x*100)+'%';$('vstxt').textContent=x<1?t:'';return}$('load').hidden=false;$('loadbar').style.width=Math.round(x*100)+'%';$('loadtxt').textContent=t}
function hideLoad(){$('load').hidden=true}
