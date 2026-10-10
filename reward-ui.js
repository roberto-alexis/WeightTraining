import {imageCatalog,nextCelebration} from './images.js?v=gallery-1';
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shapes={Chest:'M22 27 Q30 22 39 28 L39 39 Q29 43 23 36Z M42 28 Q51 22 59 27 L58 36 Q50 43 42 39Z',Back:'M23 26 L39 29 L39 49 L29 43Z M42 29 L58 26 L52 43 L42 49Z',Core:'M33 40H47V57H33Z',Quads:'M29 57H39L37 77H29Z M42 57H52V77H44Z',Hamstrings:'M29 57H39L37 77H29Z M42 57H52V77H44Z',Glutes:'M28 49Q34 46 40 50Q47 46 53 49L52 61H29Z',Calves:'M29 78H37L36 93H30Z M44 78H52L51 93H45Z',Biceps:'M18 32H25L23 48H16Z M56 32H63L65 48H58Z',Triceps:'M18 32H25L23 48H16Z M56 32H63L65 48H58Z','Side delts':'M19 25Q23 21 29 25L26 34H18Z M52 25Q58 21 62 25L63 34H55Z','Front delts':'M19 25Q23 21 29 25L26 34H18Z M52 25Q58 21 62 25L63 34H55Z','Rear delts':'M19 25Q23 21 29 25L26 34H18Z M52 25Q58 21 62 25L63 34H55Z'};
export function coin(muscle){return `<span class="coin" role="img" aria-label="${esc(muscle)} progress coin"><svg viewBox="0 0 80 110" aria-hidden="true"><circle cx="40" cy="13" r="9"/><path d="M28 24Q40 19 52 24L62 27L69 54L63 57L53 36L51 54L55 76L53 100H43L40 72L37 100H27L25 76L29 54L27 36L17 57L11 54L18 27Z"/><path class="coin-muscle" d="${shapes[muscle]||shapes.Core}"/></svg><span>★</span></span>`}
export function badgeRow(badges){return `<div class="coin-row">${badges.map(b=>`<div class="coin-item">${coin(b.muscle)}<b>${esc(b.muscle)}</b></div>`).join('')}</div>`}
const ROTATION='three-celebration-rotation-v1';let lastArtwork={};
try{const saved=JSON.parse(localStorage.getItem(ROTATION)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))lastArtwork=saved}catch{}
function pickArtwork(category){const art=nextCelebration(category,lastArtwork[category]);if(art){lastArtwork[category]=art.id;try{localStorage.setItem(ROTATION,JSON.stringify(lastArtwork))}catch{}}return art}
let queue=[],active=false,timeout,returnFocus;
export function celebrate(event){queue.push(event);if(!active)next()}
function next(){
 const item=queue.shift();if(!item){active=false;return}active=true;
 const dialog=document.createElement('dialog');dialog.className='celebration';dialog.setAttribute('aria-labelledby','celebration-title');
 const category=item.kind==='muscle'?(['Quads','Hamstrings','Glutes','Calves','Back','Rear delts'].includes(item.badges[0]?.muscle)?'lower':'upper'):'champion';
 const arts=imageCatalog.celebrations||[],art=pickArtwork(item.demo?'all':category);
 const count=item.badges.length,title=item.demo?'A little taste of glory.':item.kind==='muscle'?`${item.badges[0].muscle}, crowned!`:item.kind==='week'?'A whole week of fabulous.':`Day ${item.day}: you showed up!`;
 const sub=item.demo?'Gallery preview — no coin is added to your collection.':item.kind==='muscle'?'New personal best. Take your bow.':`${count} progress ${count===1?'coin':'coins'} ${item.kind==='week'?'this week':'this session'}. ${count?'Strength looks good on you.':'Every session builds the story. Keep glowing.'}`;
 returnFocus=document.activeElement;
 dialog.innerHTML=`<div class="celebration-art">${art?`<img src="${esc(art.url)}" alt="${esc(art.alt)}">`:''}<span class="sparkle" aria-hidden="true">✦ ✧ ✦</span><button class="celebration-close" aria-label="Close celebration">×</button></div><div class="celebration-copy"><p class="eyebrow">${item.demo?'PREVIEW':item.kind==='muscle'?'PERSONAL BEST':item.kind==='week'?'WEEK COMPLETE':'SESSION COMPLETE'} · LIFT PROUD</p><h2 id="celebration-title">${esc(title)}</h2><p>${esc(sub)}</p>${badgeRow(item.badges)}${item.detail?`<p class="record-detail">${esc(item.detail)}</p>`:''}${item.kind==='muscle'&&!item.demo?'<small>Save your session to keep this coin.</small>':''}${item.demo?`<button class="celebration-next">Next guy · ${arts.findIndex(a=>a.id===art?.id)+1}/${arts.length}</button>`:''}<button class="primary celebration-continue">${item.kind==='muscle'?'Keep lifting':'Love that for me'}</button></div>`;
 document.body.append(dialog);dialog.showModal();
 if(item.demo)dialog.querySelector('.celebration-next').onclick=()=>{const a=pickArtwork('all');if(!a)return;const img=dialog.querySelector('.celebration-art img');if(img){img.src=a.url;img.alt=a.alt}dialog.querySelector('.celebration-next').textContent=`Next guy · ${arts.findIndex(x=>x.id===a.id)+1}/${arts.length}`};
 const close=()=>{clearTimeout(timeout);dialog.close()};
 dialog.querySelector('.celebration-close').onclick=close;dialog.querySelector('.celebration-continue').onclick=close;
 dialog.addEventListener('close',()=>{clearTimeout(timeout);dialog.remove();if(returnFocus?.isConnected)returnFocus.focus();next()},{once:true});
 if(item.kind==='muscle'&&!item.demo)timeout=setTimeout(close,8000);
}
