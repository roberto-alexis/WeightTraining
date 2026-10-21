import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function harness({audio=true,reject=false}={}){
  let now=1000,interval;const tones=[],alerts=[],elements=new Map();let resumes=0;
  class AudioContext{
    state='suspended';currentTime=10;destination={};
    resume(){resumes++;if(reject)return Promise.reject(Error('blocked'));this.state='running';return Promise.resolve()}
    createOscillator(){const tone={frequency:{setValueAtTime:f=>tone.hz=f},connect(){},disconnect(){},start:t=>tone.startAt=t,stop:t=>tone.stopAt=t};tones.push(tone);return tone}
    createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}}}
  }
  const source=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
  const timer=source.slice(source.indexOf('function prepareRestAudio'),source.indexOf('function exportBackup'));
  const context={window:audio?{AudioContext}:{},Date:{now:()=>now},navigator:{},toast:s=>alerts.push(s),setInterval:f=>{interval=f;return 1},clearInterval:()=>{interval=null},$:id=>{if(!elements.has(id))elements.set(id,{});return elements.get(id)}};
  vm.runInNewContext('let end=0,timerInterval,restAudio,timerRunning=false;'+timer+';globalThis.api={startTimer,tick,stopTimer};',context);
  return {...context.api,tones,alerts,elements,get resumes(){return resumes},advance:ms=>{now+=ms;interval?.()}};
}
test('rest unlocks audio on start, then chimes exactly once at completion',()=>{
  const h=harness();h.startTimer(2);assert.equal(h.resumes,1);assert.equal(h.tones.length,0);
  h.advance(1999);assert.equal(h.tones.length,0);h.advance(1);
  assert.equal(h.tones.length,3);assert.equal(h.alerts.length,1);
  assert.deepEqual(h.tones.map(t=>t.hz),[659.25,830.61,987.77]);
  assert.ok(h.tones.every(t=>t.stopAt>t.startAt));h.tick();assert.equal(h.tones.length,3);
});
test('stop suppresses the chime, and extending or restarting uses the new deadline',()=>{
  const h=harness();h.startTimer(2);h.stopTimer();h.advance(3000);h.tick();assert.equal(h.tones.length,0);
  h.startTimer(2);h.elements.get('#addTime').onclick();h.advance(2000);assert.equal(h.tones.length,0);
  h.advance(30000);assert.equal(h.tones.length,3);
  h.startTimer(1);h.advance(500);h.startTimer(3);h.advance(500);assert.equal(h.tones.length,3);
  h.advance(2500);assert.equal(h.tones.length,6);assert.equal(h.resumes,1);
});
test('missing or blocked audio preserves timer completion without throwing',async()=>{
  for(const options of [{audio:false},{reject:true}]){
    const h=harness(options);h.startTimer(1);await Promise.resolve();h.advance(1000);
    assert.equal(h.alerts.length,1);assert.equal(h.tones.length,0);
  }
});
