import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const app=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
function harness({sets=3,deload=false}={}){
  const exercise={id:'press',sets},day='A';
  const data={sets:Array.from({length:sets},()=>({done:false}))};
  const expanded=new Map(),state={day};
  const code=app.slice(app.indexOf('function exerciseProgress('),app.indexOf('function currentBadges()'));
  const context={count:()=>deload?Math.ceil(sets/2):sets,exerciseDraft:()=>data,expanded,state};
  vm.runInNewContext(code+';globalThis.api={exerciseProgress,updateSetDone};',context);
  return {...context.api,exercise,data,expanded};
}

test('checking the last required work set collapses a completed exercise',()=>{
  const h=harness(),[a,b,c]=h.data.sets;
  h.expanded.set('Apress',true);
  h.updateSetDone(h.exercise,a,true,false);
  h.updateSetDone(h.exercise,b,true,false);
  assert.equal(h.exerciseProgress(h.exercise).complete,false);
  assert.equal(h.expanded.get('Apress'),true);
  h.updateSetDone(h.exercise,c,true,false);
  assert.equal(h.exerciseProgress(h.exercise).complete,true);
  assert.equal(h.expanded.get('Apress'),false);
});

test('unchecking or editing a work set restores the unfinished expanded state',()=>{
  const h=harness();
  for(const s of h.data.sets)h.updateSetDone(h.exercise,s,true,false);
  h.updateSetDone(h.exercise,h.data.sets[0],false,false);
  assert.equal(h.exerciseProgress(h.exercise).complete,false);
  assert.equal(h.expanded.get('Apress'),true);
});

test('warm-ups never alter work-set completion or collapse state',()=>{
  const h=harness({sets:2}),warmup={done:false};
  h.expanded.set('Apress',true);
  h.updateSetDone(h.exercise,warmup,true,true);
  assert.equal(warmup.done,true);
  assert.equal(h.exerciseProgress(h.exercise).done,0);
  assert.equal(h.expanded.get('Apress'),true);
});

test('recovery completion counts only its reduced work-set target',()=>{
  const h=harness({sets:5,deload:true});
  for(let i=0;i<3;i++)h.updateSetDone(h.exercise,h.data.sets[i],true,false);
  assert.equal(h.exerciseProgress(h.exercise).total,3);
  assert.equal(h.exerciseProgress(h.exercise).complete,true);
  assert.equal(h.expanded.get('Apress'),false);
});

test('exercise render contains distinct completion statuses and completed styling',()=>{
  assert.match(app,/exercise-status/);
  assert.match(app,/progress\.complete\?'completed':''/);
  assert.match(app,/progress\.complete\?'✓ Completed'/);
  assert.match(app,/expanded\.get\(state\.day\+e\.id\)\?\?\(!progress\.complete&&i===0\)/);
});
