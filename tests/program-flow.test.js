import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as plans from '../program.js';
import * as rewards from '../rewards.js';
const makePlan=n=>({version:1,sessions:Array.from({length:n},(_,i)=>({id:`D${i+1}`,name:`Workout ${i+1}`,time:'60 min',exercises:[{...structuredClone(plans.defaultPlan.sessions[0].exercises[0]),id:`squat${i}`,sets:1}]}))});
function harness(){
 const values=new Map(),elements=new Map(),events=[],downloads=[];let accepted=true;
 const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
 plans.resetOverride(storage);
 const element=id=>{if(!elements.has(id))elements.set(id,{textContent:'',hidden:false});return elements.get(id)};
 let source=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8').replace(/^import .*\n/gm,'');
 source=source.slice(0,source.lastIndexOf("document.querySelectorAll('[data-view]')"));
 source+='\nrender=()=>{};toast=()=>{};globalThis.api={importProgram,importBackup,exportBackup,valid,exerciseDraft,finish,programControlsHTML,guideHTML,workoutHTML,getState:()=>state,setState:s=>state=s};';
 const context={...rewards,celebrate:e=>events.push(e),badgeRow:()=>'',imageFor:()=>null,localStorage:storage,document:{querySelector:element,createElement:()=>({click(){}})},confirm:()=>accepted,crypto:{randomUUID:()=>`session-${Math.random()}`},window:{scrollTo:()=>{}},setTimeout,clearTimeout,clearInterval,Blob,URL:{createObjectURL:b=>{downloads.push(b);return 'blob:test'},revokeObjectURL:()=>{}}};
 for(const key of Object.keys(plans))Object.defineProperty(context,key,{configurable:true,get:()=>plans[key]});
 Object.defineProperty(context,'installOverride',{value:p=>plans.installOverride(p,storage)});
 Object.defineProperty(context,'resetOverride',{value:()=>plans.resetOverride(storage)});
 vm.runInNewContext(source,context);
 return {...context.api,storage,events,downloads,element,accept:v=>accepted=v,upload:async p=>context.api.importProgram({target:{files:[{size:100,text:async()=>typeof p==='string'?p:JSON.stringify(p)}],value:'program.json'}})};
}
test('program changes preserve journal and drafts; invalid and cancelled imports are inert',async()=>{
 const h=harness(),state=h.getState();state.history=[{id:'old',date:'2026-10-01',day:'A',deload:false,note:'kept',exercises:[]}];
 const draft=h.exerciseDraft(plans.program[0].exercises[0]);draft.sets[0].weight=40;const original=JSON.stringify(state.history);
 await h.upload(makePlan(4));assert.equal(plans.program.length,4);assert.equal(JSON.stringify(state.history),original);assert.equal(state.drafts.A.exercises.squat.sets[0].weight,40);
 h.exerciseDraft(plans.program[0].exercises[0]).sets[0].weight=70;const key=plans.draftKey('D1');assert.ok(h.valid(state));
 await h.upload(makePlan(2));assert.equal(plans.program.length,2);assert.equal(state.drafts[key].exercises.squat0.sets[0].weight,70);
 await h.upload(makePlan(4));assert.equal(h.exerciseDraft(plans.program[0].exercises[0]).sets[0].weight,70);
 const before=JSON.stringify(state);await h.upload('{bad');assert.equal(JSON.stringify(state),before);assert.equal(plans.program.length,4);assert.match(h.element('#programMessage').textContent,/not valid JSON/);
 h.accept(false);await h.upload(makePlan(7));assert.equal(plans.program.length,4);assert.equal(JSON.stringify(state),before);
 plans.resetOverride(h.storage);state.day='A';assert.equal(h.exerciseDraft(plans.program[0].exercises[0]).sets[0].weight,40);assert.equal(JSON.stringify(state.history),original);
});
test('four-day plan advances through every day, wraps, and celebrates only when complete',async()=>{
 const h=harness();await h.upload(makePlan(4));
 for(let i=0;i<4;i++){assert.equal(h.getState().day,`D${i+1}`);const e=plans.program[i].exercises[0];h.exerciseDraft(e).sets[0]={weight:50,reps:6,rir:2,done:true};h.finish()}
 assert.equal(h.getState().day,'D1');assert.deepEqual(h.events.map(e=>e.kind),['day','day','day','day','week']);assert.equal(h.getState().history.length,4);assert.ok(h.valid(h.getState()));assert.ok(h.getState().history.every(s=>s.programName==='4-day override'));
 h.exportBackup();const exported=JSON.parse(await h.downloads[0].text());assert.equal(exported.history.length,4);assert.ok(h.valid(exported));
 plans.resetOverride(h.storage);await h.importBackup({target:{files:[{size:100,text:async()=>JSON.stringify(exported)}]}});assert.equal(h.getState().history.length,4);
});
test('single-day plan wraps safely; seven-day and hostile text render as data',async()=>{
 const h=harness();await h.upload(makePlan(1));const e=plans.program[0].exercises[0];h.exerciseDraft(e).sets[0]={weight:50,reps:6,rir:2,done:true};h.finish();assert.equal(h.getState().day,'D1');assert.deepEqual(h.events.map(e=>e.kind),['day','week']);
 const seven=makePlan(7);seven.name='<img src=x onerror=alert(1)>';seven.sessions[0].name='<script>alert(1)</script>';seven.sessions[0].time='<b>60</b>';await h.upload(seven);
 assert.equal((h.workoutHTML().match(/data-day=/g)||[]).length,7);assert.ok(!h.workoutHTML().includes('<script>'));assert.ok(h.programControlsHTML().includes('&lt;img'));assert.ok(!h.guideHTML().includes('<script>'));
 plans.resetOverride(h.storage);
});
test('work rows display the previous sets by name across IDs, with blanks for added sets',()=>{
 const h=harness(),state=h.getState(),e=plans.program[0].exercises[0];
 state.history.push({id:'past',date:'2026-10-12T12:00:00Z',day:'different-day',deload:false,note:'',exercises:[{key:'different-id:'+e.name,name:e.name,sets:[{weight:plans.kg(100,'lb'),reps:8,rir:2,done:true}],warmups:[{weight:10,reps:20,rir:4,done:true}]}]});
 const html=h.workoutHTML().split('</article>')[0];
 assert.ok(html.includes('Last: 100 lb × 8 reps'));assert.equal((html.match(/Last: —/g)||[]).length,e.sets-1);assert.ok(!html.includes('× 20 reps'));assert.ok(html.includes('Previous work set 1'));
});
