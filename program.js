// Program configuration is separate from journal storage. Imports never replace history.
export const OVERRIDE_STORAGE='three-program-override-v1';
export const MAX_PROGRAM_BYTES=1000000;
const object=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const text=(v,max,empty=false)=>typeof v==='string'&&v.length<=max&&(empty||v.trim().length>0);
const safeId=(v,max)=>typeof v==='string'&&new RegExp(`^[-a-zA-Z0-9_]{1,${max}}$`).test(v)&&!Object.hasOwn(Object.prototype,v);
export function validatePlan(plan){
 if(!object(plan)||plan.version!==1)throw Error('Program version must be 1. Export the current program for a template.');
 if(!Array.isArray(plan.sessions)||plan.sessions.length<1||plan.sessions.length>7)throw Error('A program must contain 1–7 workout days in sessions.');
 if(plan.name!==undefined&&!text(plan.name,120,true))throw Error('Program name must be text, at most 120 characters.');
 if(plan.goal!==undefined&&!text(plan.goal,1000,true))throw Error('Program goal must be text, at most 1,000 characters.');
 const days=new Set(),ids=new Set();
 for(const [i,p] of plan.sessions.entries()){
  if(!object(p)||!safeId(p.id,30)||days.has(p.id)||!text(p.name,200)||!text(p.time,100)||!Array.isArray(p.exercises)||!p.exercises.length||p.exercises.length>30)throw Error(`Day ${i+1}: require a unique safe id, name, time, and 1–30 exercises.`);
  days.add(p.id);
  for(const [j,e] of p.exercises.entries()){
   if(!object(e)||!safeId(e.id,60)||ids.has(e.id)||!text(e.name,200)||!Number.isInteger(e.sets)||e.sets<1||e.sets>30||!Number.isInteger(e.min)||e.min<1||!Number.isInteger(e.max)||e.max<e.min||e.max>100||!Number.isInteger(e.rest)||e.rest<15||e.rest>600||!['load','body'].includes(e.kind)||!text(e.group,100,true)||!text(e.cue,2000,true)||!Array.isArray(e.alt)||e.alt.length>20||!e.alt.every(n=>text(n,200))||!Array.isArray(e.muscles)||!e.muscles.length||e.muscles.length>20||!e.muscles.every(n=>text(n,100)&&!Object.hasOwn(Object.prototype,n))||!Number.isInteger(e.targetRir)||e.targetRir<1||e.targetRir>4||!object(e.increment)||!['lb','kg'].every(u=>Number.isFinite(e.increment[u])&&e.increment[u]>0&&e.increment[u]<=2000))throw Error(`Day ${i+1}, exercise ${j+1}: invalid or missing exercise fields, duplicate id, or values outside supported ranges.`);
   ids.add(e.id);
  }
 }
 return plan;
}
export function normalizePlan(value,override=true){
 validatePlan(value);
 // Only recognized data is retained; exported files are reusable program templates.
 return {version:1,name:value.name?.trim()||`${value.sessions.length}-day ${override?'override':'program'}`,goal:value.goal||'',sessions:value.sessions.map(p=>({id:p.id,name:p.name,time:p.time,exercises:p.exercises.map(e=>({id:e.id,name:e.name,sets:e.sets,min:e.min,max:e.max,rest:e.rest,group:e.group,cue:e.cue,alt:[...e.alt],kind:e.kind,muscles:[...e.muscles],targetRir:e.targetRir,increment:{lb:e.increment.lb,kg:e.increment.kg}}))}))};
}
export function parseProgram(source){
 if(new TextEncoder().encode(source).length>MAX_PROGRAM_BYTES)throw Error('Program files must be smaller than 1 MB.');
 let value;try{value=JSON.parse(source.replace(/^\uFEFF/,''))}catch{throw Error('This file is not valid JSON. Export a program for a template.')}
 return normalizePlan(value);
}
export function programId(value){
 // Stable content identity separates drafts and weekly completion across plans.
 const data=JSON.stringify(normalizePlan(value));let a=2166136261,b=5381;
 for(let i=0;i<data.length;i++){a=Math.imul(a^data.charCodeAt(i),16777619);b=Math.imul(b,33)^data.charCodeAt(i)}
 return `override-${(a>>>0).toString(16)}-${(b>>>0).toString(16)}`;
}
export function loadProgramOverride(storage){
 try{const saved=storage.getItem(OVERRIDE_STORAGE);return saved?{plan:parseProgram(saved),error:''}:{plan:null,error:''}}
 catch{return {plan:null,error:'Your saved program could not be loaded. The included program is active; your journal has not been reset.'}}
}
const raw=typeof window==='undefined'?JSON.parse(await (await import('node:fs/promises')).readFile(new URL('./program.json',import.meta.url),'utf8')):await fetch(new URL('./program.json',import.meta.url),{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Unable to load program.json');return r.json()});
export const defaultPlan=normalizePlan(raw,false);
let loaded={plan:null,error:''};
if(typeof window!=='undefined'){try{loaded=loadProgramOverride(window.localStorage)}catch{loaded={plan:null,error:'Program storage unavailable. Using the included program.'}}}
export let isOverride=!!loaded.plan;
export let plan=loaded.plan||defaultPlan;
export let program=plan.sessions;
export const overrideLoadError=loaded.error;
let currentPlanId=isOverride?programId(plan):'default';
export const activePlanId=()=>currentPlanId;
export const draftKey=day=>isOverride?`${activePlanId()}:${day}`:day;
export function installOverride(value,storage=window.localStorage){
 const next=normalizePlan(value);const serialized=JSON.stringify(next);
 if(new TextEncoder().encode(serialized).length>MAX_PROGRAM_BYTES)throw Error('Program files must be smaller than 1 MB.');
 storage.setItem(OVERRIDE_STORAGE,serialized); // Activate only after durable storage succeeds.
 plan=next;program=plan.sessions;isOverride=true;currentPlanId=programId(plan);return plan;
}
export function resetOverride(storage=window.localStorage){storage.removeItem(OVERRIDE_STORAGE);plan=defaultPlan;program=plan.sessions;isOverride=false;currentPlanId='default'}
export function weeklyVolume(){const counts={};for(const p of program)for(const e of p.exercises)for(const m of e.muscles)counts[m]=(counts[m]||0)+e.sets;return counts}
export const kg=(value,unit)=>Number(value)*(unit==='lb'?0.45359237:1);
export const displayWeight=(value,unit)=>Math.round(Number(value)/(unit==='lb'?0.45359237:1)*100)/100;
export const keyFor=(e,name=e.name)=>`${e.id}:${name}`;
// Display-only comparison: the same named movement can occur under different day IDs.
export function lastPerformance(name,history){
 const normalized=value=>String(value??'').trim().replace(/\s+/g,' ').toLowerCase();
 const target=normalized(name);let latest=null,latestTime=-Infinity;
 for(const session of history){
  const time=Date.parse(session.date);if(!Number.isFinite(time)||time<latestTime)continue;
  for(const exercise of session.exercises){
   if(normalized(exercise.name)!==target)continue;
   const sets=exercise.sets.filter(s=>s.done);
   if(!sets.length)continue; // Warm-up-only visits do not replace the last work session.
   latest={date:session.date,deload:session.deload,sets};latestTime=time;
  }
 }
 return latest;
}
export function previousSetText(set,kind,unit){
 if(!set)return 'Last: —';
 return `Last: ${kind==='body'?'BW':`${displayWeight(set.weight,unit)} ${unit}`} × ${set.reps} reps`;
}
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
