import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultPlan,plan,program,normalizePlan,parseProgram,validatePlan,installOverride,resetOverride,loadProgramOverride,activePlanId,draftKey,OVERRIDE_STORAGE} from '../program.js';
import {weekSummary} from '../rewards.js';
const makePlan=n=>({version:1,sessions:Array.from({length:n},(_,i)=>({...structuredClone(defaultPlan.sessions[0]),id:`day${i}`,exercises:defaultPlan.sessions[0].exercises.map(e=>({...structuredClone(e),id:`d${i}-${e.id}`}))}))});
const memory=()=>{const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)}};
test('1–7 day programs round-trip with generated or custom names',()=>{
 for(let n=1;n<=7;n++){const p=normalizePlan(makePlan(n));assert.equal(p.name,`${n}-day override`);assert.deepEqual(parseProgram(JSON.stringify(p)),p)}
 const p=makePlan(4);p.name='  My four days  ';assert.equal(normalizePlan(p).name,'My four days');p.name=' ';assert.equal(normalizePlan(p).name,'4-day override');
});
test('reject invalid files, unsafe identifiers and malformed prescriptions',()=>{
 assert.throws(()=>parseProgram('{bad'));
 assert.throws(()=>parseProgram(' '.repeat(1000001)),/1 MB/);
 for(const mutate of [p=>p.sessions=[],p=>p.sessions=makePlan(8).sessions,p=>p.name=123,p=>p.sessions[0].id='__proto__',p=>p.sessions[0].exercises[0].id='constructor',p=>p.sessions[0].exercises[0].muscles=[],p=>p.sessions[0].exercises[0].targetRir=0,p=>p.sessions[0].exercises[0].name='x'.repeat(201),p=>p.sessions[1].id=p.sessions[0].id]){const p=makePlan(2);mutate(p);assert.throws(()=>validatePlan(p))}
});
test('override persistence, failure atomicity, fallback and separate draft keys',()=>{
 const storage=memory();const defaultKey=draftKey('A');installOverride(makePlan(4),storage);assert.equal(program.length,4);assert.equal(plan.name,'4-day override');const id=activePlanId();assert.notEqual(draftKey('A'),defaultKey);assert.equal(loadProgramOverride(storage).plan.sessions.length,4);
 assert.throws(()=>installOverride(makePlan(5),{setItem(){throw Error('quota')}}));assert.equal(activePlanId(),id);assert.equal(program.length,4);
 assert.throws(()=>installOverride({},storage));assert.equal(program.length,4);
 resetOverride(storage);assert.equal(program.length,3);assert.equal(draftKey('A'),defaultKey);assert.equal(loadProgramOverride(storage).plan,null);
 storage.setItem(OVERRIDE_STORAGE,'broken');assert.equal(loadProgramOverride(storage).plan,null);assert.ok(loadProgramOverride(storage).error);
 storage.setItem(OVERRIDE_STORAGE,JSON.stringify({version:1,sessions:[]}));assert.equal(loadProgramOverride(storage).plan,null);
 assert.equal(loadProgramOverride({getItem(){throw Error('denied')}}).plan,null);
});
test('weekly completion follows active program while legacy default sessions still count',()=>{
 const week='2026-10-12',days=[{id:'A'},{id:'B'},{id:'C'},{id:'D'}];
 const history=days.map(p=>({day:p.id,rewards:{week,complete:true,badges:[]}}));
 assert.equal(weekSummary(history,days,week,'override-test').days,0);
 assert.equal(weekSummary(history,days,week,'default').complete,true);
 history.push(...days.map(p=>({day:p.id,programId:'override-test',rewards:{week,complete:true,badges:[]}})));
 assert.equal(weekSummary(history,days,week,'override-test').complete,true);
});
