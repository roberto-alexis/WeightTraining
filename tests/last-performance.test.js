import test from 'node:test';
import assert from 'node:assert/strict';
import {lastPerformance,previousSetText,kg} from '../program.js';
const set=(weight,reps,done=true)=>({weight:kg(weight,'lb'),reps,rir:2,done});
const session=(date,id,name,sets,extra={})=>({date,day:id,deload:false,exercises:[{key:`${id}:${name}`,name,sets,warmups:[set(10,20)]}],...extra});
test('matches exercise name across different IDs, days and programs, using date not array order',()=>{
 const newer=session('2026-10-15T12:00:00Z','curl-c','Cable curl',[set(40,10),set(40,8)],{programId:'another'});
 const older=session('2026-10-12T12:00:00Z','curl','Cable curl',[set(35,12)]);
 const h=[newer,older,session('2026-10-16','other','Hammer curl',[set(50,6)])];
 const last=lastPerformance(' cable   CURL ',h);assert.equal(last.date,newer.date);assert.equal(last.sets.length,2);assert.equal(previousSetText(last.sets[1],'load','lb'),'Last: 40 lb × 8 reps');assert.equal(previousSetText(last.sets[2],'load','lb'),'Last: —');
});
test('warm-ups and unchecked sets are excluded; recovery sessions remain the last activity',()=>{
 const h=[session('2026-10-12','A','Cable curl',[set(40,10)]),session('2026-10-14','B','Cable curl',[set(30,8),set(30,6,false)],{deload:true}),session('2026-10-15','C','Cable curl',[])];
 const last=lastPerformance('Cable curl',h);assert.equal(last.deload,true);assert.equal(last.sets.length,1);assert.equal(previousSetText(last.sets[0],'load','lb'),'Last: 30 lb × 8 reps');
 assert.equal(lastPerformance('Dumbbell curl',h),null);
});
test('shows selected units and bodyweight without modifying saved history',()=>{
 const h=[session('2026-10-12','A','Lift',[set(100,8)])],before=JSON.stringify(h);const last=lastPerformance('Lift',h);
 assert.equal(previousSetText(last.sets[0],'load','kg'),'Last: 45.36 kg × 8 reps');assert.equal(previousSetText(set(0,12),'body','lb'),'Last: BW × 12 reps');assert.equal(JSON.stringify(h),before);
});
