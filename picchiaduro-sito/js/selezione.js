// selezione.js: schermata di scelta da picchiaduro. Tre passi: il proprio lottatore, l'avversario (CPU o giocatore 2), l'arena; poi la schermata VS mentre si carica.
// Ritratti in griglia con cornici, lottatore selezionato a figura intera ai lati col nome grande. Tastiera, tocco e controller PS4.
const SEL={open:false,vs:false,cur:[0,0,0],pick:[null,null],step:0,pad:[{},{}],rep:[0,0]},COLS=5;let ROWS=3;// le righe crescono coi lottatori
const $=id=>document.getElementById(id);
const fdir=e=>(window.__lottDir||'lottatori/')+e.cartella+'/';
function buildSel(){$('selgo').onclick=()=>selConfirm();$('selback').onclick=()=>selBack()}
function porImg(e,box){if(e.ritratto){const img=new Image();img.alt='';img.loading='lazy';img.src=fdir(e)+e.ritratto;const c=e.ritratto_centro,z=e.ritratto_zoom||1;if(c){img.style.objectPosition=c[0]+'% '+c[1]+'%';img.style.transformOrigin=c[0]+'% '+c[1]+'%'}img.style.transform='skewX(7deg) scale('+(1.18*z)+')';box.append(img)}else box.textContent=(e.nome||'?')[0]}
function fillSel(){ROWS=Math.max(3,Math.ceil(ROSTER.length/COLS));const g=$('grid');g.textContent='';for(let i=0;i<COLS*ROWS;i++){const e=ROSTER[i],b=document.createElement('button'),ok=e&&e.id&&!e.bloccato;b.className='card'+(ok?'':' lock');b.dataset.i=i;
  const im=document.createElement('div');im.className='por';if(ok)porImg(e,im);else im.textContent='?';const nm=document.createElement('span');nm.className='nm';nm.textContent=ok?e.nome:'In arrivo';b.append(im,nm);
  const t1=document.createElement('i');t1.className='tag t1';t1.textContent='G1';const t2=document.createElement('i');t2.className='tag t2';t2.textContent='G2';b.append(t1,t2);
  b.onclick=()=>{if(SEL.step>1)return;SEL.cur[SEL.step]=i;selConfirm()};b.onmouseenter=()=>{if(SEL.step>1||SEL.cur[SEL.step]===i)return;SEL.cur[SEL.step]=i;drawSel()};g.append(b)}
 const a=$('arsel');a.textContent='';ARENE.forEach((A,i)=>{const b=document.createElement('button');b.className='card';b.dataset.i=i;const im=document.createElement('div');im.className='por';const img=new Image();img.alt='';img.loading='lazy';img.src=A.mini||A.img||'';im.append(img);const nm=document.createElement('span');nm.className='nm';nm.textContent=A.nome;b.append(im,nm);b.onclick=()=>{SEL.cur[2]=i;selConfirm()};b.onmouseenter=()=>{if(SEL.cur[2]!==i){SEL.cur[2]=i;drawSel()}};a.append(b)});drawSel()}
function setFig(n,e){const im=$('fig'+n),src=e&&e.id&&!e.bloccato&&e.figura?fdir(e)+e.figura:'';if(im.dataset.s!==src){im.dataset.s=src;if(src)im.src=src;else im.removeAttribute('src');im.classList.remove('in');void im.offsetWidth;im.classList.add('in')}$('nm'+n).textContent=e&&e.id&&!e.bloccato?e.nome:''}
function drawSel(){if(!ROSTER.length)return;const st=SEL.step,cpu=mode==='cpu'||mode==='train';document.querySelectorAll('#grid .card').forEach(b=>{const i=+b.dataset.i,id=ROSTER[i]&&ROSTER[i].id;
  b.classList.toggle('c1',st===0?SEL.cur[0]===i:!!SEL.pick[0]&&id===SEL.pick[0]);b.classList.toggle('c2',st===1?SEL.cur[1]===i:st===2&&!!SEL.pick[1]&&id===SEL.pick[1]);b.classList.toggle('p1',st>0&&!!SEL.pick[0]&&id===SEL.pick[0]);b.querySelector('.t2').textContent=cpu?'CPU':'G2'});
 document.querySelectorAll('#arsel .card').forEach(b=>b.classList.toggle('c1',+b.dataset.i===SEL.cur[2]));$('grid').hidden=st===2;$('arsel').hidden=st!==2;$('tg2').textContent=cpu?(mode==='train'?'CPU FERMA':'CPU'):'G2';
 const e1=st===0?ROSTER[SEL.cur[0]]:rosterEntry(SEL.pick[0]),e2=st===0?null:st===1?ROSTER[SEL.cur[1]]:rosterEntry(SEL.pick[1]);setFig(1,e1);setFig(2,mode==='online'?null:e2);
 const e=ROSTER[SEL.cur[Math.min(st,1)]],ok=e&&e.id&&!e.bloccato;
 $('seltitle').textContent=st===2?"Scegli l'arena":mode==='online'?'Scegli il tuo lottatore':st===0?(mode==='2p'?'Giocatore 1':'Scegli il tuo lottatore'):(mode==='2p'?'Giocatore 2':"Scegli l'avversario");
 $('selmsg').textContent=st===2?ARENE[SEL.cur[2]].nome+'  ·  Esc o Cerchio per tornare indietro':(ok?(e.descrizione||''):'Questo lottatore arriverà presto.')+(st===1?'  Esc o Cerchio per tornare indietro':'');
 $('selback').hidden=false;$('selback').textContent=st>0?'Indietro':p1&&mode!=='online'?"Torna all'incontro":'Menu';$('selgo').textContent=st===2&&mode!=='online'?'Combatti':'Avanti'}
function openSel(){if(net)return;SEL.open=true;SEL.pick=[null,null];SEL.step=0;const a=ROSTER.findIndex(e=>e&&e.id&&!e.bloccato);SEL.cur=[Math.max(0,a),Math.max(0,a),Math.max(0,ARENE.findIndex(x=>x.id===selArena))];$('sel').hidden=false;$('selerr').textContent='';drawSel();$('wrap').scrollIntoView({block:'nearest'})}
function closeSel(){SEL.open=false;$('sel').hidden=true}
const selOpen=()=>SEL.open||SEL.vs||HOME.open||HOME.cfg||(typeof PAUSE!=='undefined'&&PAUSE.open&&!net);
function showSelErr(e){SEL.vs=false;$('vs').hidden=true;$('sel').hidden=false;$('selerr').textContent='Errore: '+(e&&e.message||e)}
function selMove(pl,dx,dy){if(SEL.step===2){const n=ARENE.length;SEL.cur[2]=(SEL.cur[2]+(dx||dy)+n)%n}else{let i=SEL.cur[pl],c=i%COLS,r=Math.floor(i/COLS);c=(c+dx+COLS)%COLS;r=(r+dy+ROWS)%ROWS;SEL.cur[pl]=r*COLS+c}sfx('ui_muovi');drawSel()}
function showVS(ids){const E=ids.map(rosterEntry);for(let i=0;i<2;i++){const im=$('vf'+(i+1));if(E[i]&&E[i].figura)im.src=fdir(E[i])+E[i].figura;else im.removeAttribute('src');$('vn'+(i+1)).textContent=E[i]?E[i].nome:''}$('vsbar').style.width='0';$('vstxt').textContent='';SEL.vs=true;const v=$('vs');v.hidden=true;void v.offsetWidth;v.hidden=false;sfx('vs')}
function selConfirm(){if(!ROSTER.length||loading||SEL.vs)return;const pl=SEL.step;wake();
 if(pl===2){const A=ARENE[SEL.cur[2]];selArena=A.id;markArena(A.id);sfx('ui_ok');if(mode==='online'){closeSel();openHome('online');setOnline('Lottatore: '+(rosterEntry(SEL.pick[0])||{}).nome+' · Arena: '+A.nome+'. Crea una partita o entra con un codice (si gioca nell\'arena di chi crea la partita).');return}const ids=[SEL.pick[0],SEL.pick[1]],t0=performance.now();$('sel').hidden=true;showVS(ids);
  startMatch(ids,selArena).then(()=>new Promise(r=>setTimeout(r,window.__test?0:Math.max(0,2400-(performance.now()-t0))))).then(()=>{SEL.vs=false;$('vs').hidden=true;reset()}).catch(()=>{});return}
 const e=ROSTER[SEL.cur[pl]];if(!e||!e.id||e.bloccato){$('selmsg').textContent='Questo lottatore arriverà presto: scegline un altro.';sfx('ui_no');return}
 SEL.pick[pl]=e.id;sfx('ui_ok');
 if(pl===0&&mode!=='online'){SEL.step=1;SEL.cur[1]=SEL.cur[0]}else SEL.step=2;drawSel()}
function selBack(){if(SEL.vs)return;sfx('ui_no');if(SEL.step===2){SEL.step=mode==='online'?0:1;if(mode==='online')SEL.pick=[null,null];else SEL.pick[1]=null;drawSel()}else if(SEL.step===1){SEL.step=0;SEL.pick=[null,null];drawSel()}else if(p1&&mode!=='online')closeSel();else{closeSel();openHome(mode==='online'?'online':'main')}}
function selKey(e){if(e.target.tagName==='INPUT')return;const k=e.code,mv={KeyA:[-1,0],ArrowLeft:[-1,0],KeyD:[1,0],ArrowRight:[1,0],KeyW:[0,-1],ArrowUp:[0,-1],KeyS:[0,1],ArrowDown:[0,1]}[k];
 if(mv){e.preventDefault();selMove(Math.min(1,SEL.step),...mv)}else if(k==='KeyJ'||k==='Enter'||k==='Space'){e.preventDefault();selConfirm()}else if(k==='KeyK'||k==='Escape'||k==='Backspace'){e.preventDefault();selBack()}}
// controller: croce o levetta per muoversi, X per confermare, Cerchio per tornare indietro. Con due controller il secondo sceglie il lottatore 2.
function selPoll(){if(typeof PAUSE!=='undefined'&&PAUSE.open){pausePoll();return}if(homePoll())return;if(!SEL.open||SEL.vs)return;const ps=pads();padStatus(ps);for(let pl=0;pl<2;pl++){const q=ps[pl];if(!q)continue;if(pl===1&&mode!=='2p')continue;const b=n=>!!(q.buttons[n]&&q.buttons[n].pressed),ax=q.axes[0]||0,ay=q.axes[1]||0,o=SEL.pad[pl],
  n={l:b(14)||ax<-.5,r:b(15)||ax>.5,u:b(12)||ay<-.5,d:b(13)||ay>.5,x:b(0),c:b(1),s:b(9)},mine=mode==='2p'?(SEL.step===2?pl===0:pl===SEL.step):pl===0,dir=n.l?[-1,0]:n.r?[1,0]:n.u?[0,-1]:n.d?[0,1]:null;
  if(mine){if(dir){if(!o.dir||--SEL.rep[pl]<=0){selMove(Math.min(1,SEL.step),...dir);SEL.rep[pl]=o.dir?6:16}}if(n.x&&!o.x)selConfirm();if(n.s&&!o.s)selConfirm();if(n.c&&!o.c)selBack()}
  SEL.pad[pl]=Object.assign(n,{dir:!!dir})}}
function showLoad(x){const t='Carico i lottatori e l\'arena… '+Math.round(x*100)+'%';if(SEL.vs){$('vsbar').style.width=Math.round(x*100)+'%';$('vstxt').textContent=x<1?t:'';return}$('load').hidden=false;$('loadbar').style.width=Math.round(x*100)+'%';$('loadtxt').textContent=t}
function hideLoad(){$('load').hidden=true}
