// selezione.js: schermata di scelta dei lottatori (12 caselle). Tastiera e controller PS4 per il giocatore 1, secondo controller per il giocatore 2.
const SEL={open:false,cur:[0,0],pick:[null,null],pad:[{},{}],rep:[0,0]},COLS=6;
const $=id=>document.getElementById(id);
function buildSel(){$('selgo').onclick=()=>{selConfirm(0,true)};$('selback').onclick=()=>{if(p1)closeSel()}}
function fillSel(){const g=$('grid');g.textContent='';for(let i=0;i<12;i++){const e=ROSTER[i],b=document.createElement('button'),ok=e&&e.id&&!e.bloccato;b.className='card'+(ok?'':' lock');b.dataset.i=i;
 const im=document.createElement('div');im.className='por';if(ok&&e.ritratto){const img=new Image();img.alt='';img.loading='lazy';img.src='lottatori/'+e.cartella+'/'+e.ritratto;im.append(img)}else im.textContent=ok?(e.nome||'?')[0]:'?';
 const nm=document.createElement('span');nm.className='nm';nm.textContent=ok?e.nome:(e&&e.nome)||'In arrivo';b.append(im,nm);
 const t1=document.createElement('i');t1.className='tag t1';t1.textContent='G1';const t2=document.createElement('i');t2.className='tag t2';t2.textContent=mode==='cpu'?'CPU':'G2';b.append(t1,t2);
 b.onclick=()=>{const pl=mode==='2p'&&SEL.pick[0]&&!SEL.pick[1]?1:0;SEL.cur[pl]=i;selConfirm(pl)};b.onmouseenter=()=>{if(!SEL.pick[0]){SEL.cur[0]=i;drawSel()}};g.append(b)}drawSel()}
function drawSel(){if(!ROSTER.length)return;document.querySelectorAll('#grid .card').forEach(b=>{const i=+b.dataset.i;b.classList.toggle('c1',SEL.cur[0]===i);b.classList.toggle('c2',mode==='2p'&&SEL.cur[1]===i||!!SEL.pick[1]&&ROSTER[i]&&ROSTER[i].id===SEL.pick[1]);b.classList.toggle('p1',!!SEL.pick[0]&&ROSTER[i]&&ROSTER[i].id===SEL.pick[0]);
  b.querySelector('.t2').textContent=mode==='cpu'?'CPU':'G2'});
 const e=ROSTER[SEL.cur[0]],who=mode==='online'?'Scegli il tuo lottatore per la partita online':mode==='2p'?(SEL.pick[0]?'Giocatore 2: scegli il lottatore (secondo controller)':'Giocatore 1: scegli il lottatore'):'Scegli il tuo lottatore';
 $('seltitle').textContent=who;$('selmsg').textContent=e&&e.id&&!e.bloccato?(e.nome+(e.descrizione?' · '+e.descrizione:'')):'Questo lottatore arriverà presto.';$('selback').hidden=!p1}
function openSel(){if(net)return;SEL.open=true;SEL.pick=[null,null];const a=ROSTER.findIndex(e=>e&&e.id&&!e.bloccato);SEL.cur=[Math.max(0,a),Math.max(0,a)];$('sel').hidden=false;$('selerr').textContent='';drawSel();$('wrap').scrollIntoView({block:'nearest'})}
function closeSel(){SEL.open=false;$('sel').hidden=true}
const selOpen=()=>SEL.open;
function showSelErr(e){$('sel').hidden=false;$('selerr').textContent='Errore: '+(e&&e.message||e)}
function selMove(pl,dx,dy){let i=SEL.cur[pl],c=i%COLS,r=Math.floor(i/COLS);c=(c+dx+COLS)%COLS;r=(r+dy+2)%2;SEL.cur[pl]=r*COLS+c;drawSel()}
function selConfirm(pl,btn){if(!ROSTER.length||loading)return;if(btn&&mode==='2p'&&SEL.pick[0])pl=1;const e=ROSTER[SEL.cur[pl]];if(!e||!e.id||e.bloccato){$('selmsg').textContent='Questo lottatore arriverà presto: scegline un altro.';return}
 SEL.pick[pl]=e.id;wake();
 if(mode==='2p'&&!SEL.pick[1]){SEL.cur[1]=SEL.cur[0];drawSel();if(!btn)return}
 if(mode==='2p'&&!SEL.pick[1])SEL.pick[1]=ROSTER[SEL.cur[1]].id;
 if(mode==='cpu'){const av=available();SEL.pick[1]=av[Math.floor(Math.random()*av.length)].id}
 drawSel();if(mode==='online'){closeSel();setOnline('Lottatore scelto: '+e.nome+'. Crea una partita online o entra con un codice.');return}
 startMatch([SEL.pick[0],SEL.pick[1]],selArena).catch(()=>{})}
function selBack(pl){if(SEL.pick[pl]){SEL.pick[pl]=null;drawSel()}else if(pl===0&&p1)closeSel()}
function selKey(e){if(e.target.tagName==='INPUT')return;const k=e.code,mv={KeyA:[-1,0],ArrowLeft:[-1,0],KeyD:[1,0],ArrowRight:[1,0],KeyW:[0,-1],ArrowUp:[0,-1],KeyS:[0,1],ArrowDown:[0,1]}[k];
 if(mv){e.preventDefault();selMove(0,...mv)}else if(k==='KeyJ'||k==='Enter'||k==='Space'){e.preventDefault();selConfirm(0)}else if(k==='KeyK'||k==='Escape'||k==='Backspace'){e.preventDefault();selBack(0)}}
// controller: croce o levetta per muoversi, X per confermare, Cerchio per tornare indietro
function selPoll(){if(!SEL.open)return;const ps=pads();padStatus(ps);for(let pl=0;pl<2;pl++){const q=ps[pl];if(!q)continue;if(pl===1&&mode!=='2p')continue;const b=n=>!!(q.buttons[n]&&q.buttons[n].pressed),ax=q.axes[0]||0,ay=q.axes[1]||0,o=SEL.pad[pl],
  n={l:b(14)||ax<-.5,r:b(15)||ax>.5,u:b(12)||ay<-.5,d:b(13)||ay>.5,x:b(0),c:b(1),s:b(9)},p=pl===1&&!SEL.pick[0]?-1:pl,dir=n.l?[-1,0]:n.r?[1,0]:n.u?[0,-1]:n.d?[0,1]:null;
  if(p>=0){if(dir){if(!o.dir||--SEL.rep[pl]<=0){selMove(p,...dir);SEL.rep[pl]=o.dir?6:16}}if(n.x&&!o.x)selConfirm(p);if(n.s&&!o.s)selConfirm(p,true);if(n.c&&!o.c)selBack(p)}
  SEL.pad[pl]=Object.assign(n,{dir:!!dir})}}
function showLoad(x){$('load').hidden=false;$('loadbar').style.width=Math.round(x*100)+'%';$('loadtxt').textContent='Carico i lottatori e l\'arena… '+Math.round(x*100)+'%'}
function hideLoad(){$('load').hidden=true}
