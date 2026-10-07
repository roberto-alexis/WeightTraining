// The JSON file owns exercise order, sets, rep ranges, rest, variations and load increments.
export function validatePlan(plan){
 if(!plan||plan.version!==1||!Array.isArray(plan.sessions)||plan.sessions.length!==3)throw Error('program.json must contain exactly three sessions.');
 const days=new Set(),ids=new Set();
 for(const p of plan.sessions){if(!p||!/^[-a-zA-Z0-9_]{1,30}$/.test(p.id)||days.has(p.id)||typeof p.name!=='string'||typeof p.time!=='string'||!Array.isArray(p.exercises)||!p.exercises.length||p.exercises.length>30)throw Error('Invalid session configuration.');days.add(p.id);
 for(const e of p.exercises){if(!e||!/^[-a-zA-Z0-9_]{1,60}$/.test(e.id)||ids.has(e.id)||typeof e.name!=='string'||!e.name||!Number.isInteger(e.sets)||e.sets<1||e.sets>30||!Number.isInteger(e.min)||e.min<1||!Number.isInteger(e.max)||e.max<e.min||e.max>100||!Number.isInteger(e.rest)||e.rest<15||e.rest>600||!['load','body'].includes(e.kind)||typeof e.group!=='string'||typeof e.cue!=='string'||!Array.isArray(e.alt)||!e.alt.every(n=>typeof n==='string')||!Array.isArray(e.muscles)||!e.muscles.every(n=>typeof n==='string')||!Number.isInteger(e.targetRir)||e.targetRir<1||e.targetRir>4||!e.increment||!['lb','kg'].every(u=>Number.isFinite(e.increment[u])&&e.increment[u]>0))throw Error('Invalid exercise configuration.');ids.add(e.id)}}return plan;
}
const raw=typeof window==='undefined'?JSON.parse(await (await import('node:fs/promises')).readFile(new URL('./program.json',import.meta.url),'utf8')):await fetch(new URL('./program.json',import.meta.url),{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Unable to load program.json');return r.json()});
export const plan=validatePlan(raw);
export const program=plan.sessions;
export function weeklyVolume(){const counts={};for(const p of program)for(const e of p.exercises)for(const m of e.muscles)counts[m]=(counts[m]||0)+e.sets;return counts}
export const kg=(value,unit)=>Number(value)*(unit==='lb'?0.45359237:1);
export const displayWeight=(value,unit)=>Math.round(Number(value)/(unit==='lb'?0.45359237:1)*100)/100;
export const keyFor=(e,name=e.name)=>`${e.id}:${name}`;
export function recommendation(e,name,history,unit){
 const entries=history.filter(s=>!s.deload).map(s=>s.exercises.find(x=>x.key===keyFor(e,name))).filter(x=>x&&x.sets.length).slice(-2);
 const last=entries.at(-1);if(!last)return {weight:null,text:e.kind==='body'?'Start at the lower end; leave 2 good reps in reserve.':'Choose a load for the low end with 2 good reps in reserve.'};
 const sets=last.sets.filter(s=>s.done);if(!sets.length)return {weight:null,text:'Choose a comfortable starting load.'};
 const base=sets[0].weight;
 const success=x=>x.sets.length===e.sets&&x.sets.every(s=>s.done&&s.reps>=e.max&&s.rir>=(e.targetRir??2)&&Math.abs(s.weight-base)<0.01);
 const qualifies=entries.length===2&&entries.every(success);
 if(e.kind==='body')return {weight:0,text:qualifies?'Top range twice. Add a 2-second pause or a longer lever; restart at the low end.':'Add 1 controlled rep to a set when you can keep 2 reps in reserve.'};
 const increment=kg(e.increment?.[unit]??(unit==='lb'?2.5:1),unit);
 const failed=entries.length===2&&entries.every(x=>x.sets.length===e.sets&&x.sets.every(s=>s.done&&Math.abs(s.weight-base)<0.01)&&x.sets.some(s=>s.reps<e.min));
 if(failed)return {weight:base*.925,text:`Below the minimum twice. Reset about 7.5% to ${displayWeight(base*.925,unit)} ${unit}; choose the nearest available load.`};
 return {weight:qualifies?base+increment:base,text:qualifies?`Top range twice with ${e.targetRir??2}+ reps in reserve. Try ${displayWeight(base+increment,unit)} ${unit}, or the smallest available increase; restart at ${e.min} reps.`:`Keep around ${displayWeight(base,unit)} ${unit}; add 1 rep to a set before adding weight.`};
}
