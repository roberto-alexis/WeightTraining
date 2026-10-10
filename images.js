export function validateImages(data){if(!data||data.version!==1||!data.muscles||typeof data.muscles!=='object')throw Error('Invalid image catalog');for(const a of Object.values(data.muscles)){if(!a||typeof a.url!=='string'||!(/^(\.\/|https:\/\/)/.test(a.url))||typeof a.alt!=='string'||!Array.isArray(a.position)||a.position.length!==2||!a.position.every(n=>Number.isFinite(n)&&n>=0&&n<=100)||!Array.isArray(a.size)||a.size.length!==2||!a.size.every(n=>Number.isFinite(n)&&n>=100&&n<=2000))throw Error('Invalid image entry')}if(data.celebrations!==undefined&&(!Array.isArray(data.celebrations)||!data.celebrations.every(a=>a&&typeof a.id==='string'&&(a.category===undefined||['upper','lower','champion'].includes(a.category))&&typeof a.alt==='string'&&typeof a.url==='string'&&/^(\.\/|https:\/\/)/.test(a.url))))throw Error('Invalid celebration catalog');if(data.celebrations&&new Set(data.celebrations.map(a=>a.id)).size!==data.celebrations.length)throw Error('Duplicate celebration IDs');return data}
const raw=typeof window==='undefined'?JSON.parse(await (await import('node:fs/promises')).readFile(new URL('./images.json',import.meta.url),'utf8')):await fetch(new URL('./images.json',import.meta.url),{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Unable to load image catalog');return r.json()});
export const imageCatalog=validateImages(raw);
export function imageFor(exercise){return imageCatalog.muscles[exercise.muscles?.[0]]||imageCatalog.muscles['Full body']}

// Pure selection keeps each category cycling through every eligible portrait.
export function nextCelebration(category,previousId,catalog=imageCatalog){
 const all=catalog.celebrations||[],matches=category==='all'?all:all.filter(a=>(a.category||a.id)===category),pool=matches.length?matches:all;
 if(!pool.length)return undefined;
 return pool[(pool.findIndex(a=>a.id===previousId)+1)%pool.length];
}
