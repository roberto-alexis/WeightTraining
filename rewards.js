// Rewards are derived from checked work sets; kg is the canonical load unit.
export const estimated1RM=s=>s.weight>0&&s.reps>=1&&s.reps<=12?s.weight*(1+s.reps/30):null;
export function weekKey(date=new Date()){
 const d=new Date(date);d.setHours(12,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));
 return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
export function recordsFor(e,x,history){
 const old=history.filter(s=>!s.deload).flatMap(s=>s.exercises.filter(v=>v.key===`${e.id}:${x.name}`).flatMap(v=>v.sets)).filter(s=>s.done);
 if(!old.length)return [];
 const records=[];
 for(const [index,s] of x.sets.slice(0,e.sets).entries()){
  if(!s.done||!Number.isInteger(s.reps)||s.reps<1||!Number.isInteger(s.rir)||s.rir<(e.targetRir??2))continue;
  const same=old.filter(p=>e.kind==='body'||Math.abs(p.weight-s.weight)<.05);
  const bestRep=same.reduce((a,b)=>!a||b.reps>a.reps||b.reps===a.reps&&b.rir>a.rir?b:a,null);
  if(bestRep&&s.reps>bestRep.reps&&s.rir>=bestRep.rir)records.push({type:'reps',exercise:x.name,set:index+1,previous:bestRep.reps,value:s.reps,weight:e.kind==='body'?0:s.weight});
  if(e.kind==='body')continue;
  const best=old.filter(p=>estimated1RM(p)!==null).reduce((a,b)=>!a||estimated1RM(b)>estimated1RM(a)?b:a,null),value=estimated1RM(s);
  if(best&&value!==null&&value>estimated1RM(best)*1.01&&s.rir>=best.rir)records.push({type:'e1rm',exercise:x.name,set:index+1,previous:estimated1RM(best),value,weight:s.weight});
 }
 return records;
}
export function evaluateBadges(workout,draft,history){
 if(draft.deload)return [];
 const groups=new Map();
 for(const e of workout.exercises){const m=e.muscles[0]||'Full body';if(!groups.has(m))groups.set(m,[]);groups.get(m).push(e)}
 const badges=[];
 for(const [muscle,exercises] of groups){
  if(!exercises.every(e=>{const x=draft.exercises[e.id];return x&&x.sets.length>=e.sets&&x.sets.slice(0,e.sets).every(s=>s.done)}))continue;
  const records=exercises.flatMap(e=>recordsFor(e,draft.exercises[e.id],history));
  if(records.length)badges.push({muscle,records});
 }
 return badges;
}
export function weekSummary(history,program,key){
 const sessions=history.filter(s=>s.rewards?.week===key),days=new Set(sessions.filter(s=>s.rewards.complete).map(s=>s.day));
 return {complete:program.every(p=>days.has(p.id)),days:program.filter(p=>days.has(p.id)).length,badges:sessions.flatMap(s=>s.rewards.badges)};
}
export function validRewards(r){
 return r===undefined||!!(r&&r.version===1&&typeof r.complete==='boolean'&&/^\d{4}-\d{2}-\d{2}$/.test(r.week)&&Array.isArray(r.badges)&&r.badges.length<=30&&new Set(r.badges.map(b=>b.muscle)).size===r.badges.length&&r.badges.every(b=>b&&typeof b.muscle==='string'&&b.muscle.length<=100&&Array.isArray(b.records)&&b.records.length>0&&b.records.length<=1800&&b.records.every(x=>x&&['reps','e1rm'].includes(x.type)&&typeof x.exercise==='string'&&x.exercise.length<=200&&Number.isInteger(x.set)&&x.set>=1&&x.set<=30&&['previous','value','weight'].every(k=>Number.isFinite(x[k])&&x[k]>=0)&&x.value>x.previous)));
}
