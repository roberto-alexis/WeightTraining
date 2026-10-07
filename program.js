const ex=(id,name,sets,min,max,rest,group,cue,alt=[],kind='load')=>({id,name,sets,min,max,rest,group,cue,alt,kind});
export const program=[
 {id:'A',name:'Squat + horizontal push',time:'70–80 min',exercises:[
 ex('squat','Hack squat',3,6,10,150,'MAIN LIFT','Brace before each rep. Use a comfortable depth; keep your whole foot planted.',['Leg press','Goblet squat']),
 ex('bench','Dumbbell bench press',3,6,10,150,'MAIN LIFT','Keep shoulder blades supported; lower with control. Log the weight of ONE dumbbell.',['Machine chest press']),
 ex('row','Chest-supported row',3,8,12,120,'PULL','Keep your chest on the pad; pull without shrugging.',['Seated cable row']),
 ex('curlleg','Seated leg curl',3,10,15,90,'ACCESSORY','Keep hips down; control the return.',['Lying leg curl']),
 ex('lateral','Cable lateral raise',2,12,20,75,'PAIR 1','Raise in a comfortable plane to shoulder height. Reps per side; weight per handle.',['Dumbbell lateral raise']),
 ex('triceps','Rope triceps pressdown',2,10,15,75,'PAIR 1','Keep elbows still; straighten without snapping the joint.',['Cable bar pressdown']),
 ex('pallof','Pallof press',2,10,15,60,'CORE','Reps per side. Pause 2 seconds with arms extended; resist rotation.',['Band Pallof press'])]},
 {id:'B',name:'Hinge + vertical pull',time:'75–85 min',exercises:[
 ex('rdl','Dumbbell Romanian deadlift',3,6,10,150,'MAIN LIFT','Push hips back with soft knees; stop before your back rounds. Weight of ONE dumbbell.',['Barbell Romanian deadlift','Cable pull-through']),
 ex('pulldown','Neutral-grip lat pulldown',3,8,12,120,'PULL','Pull elbows toward your sides; avoid leaning or jerking.',['Machine pulldown']),
 ex('incline','Incline dumbbell press',3,8,12,120,'PUSH','Use a modest 15–30° incline and a comfortable grip. Weight of ONE dumbbell.',['Incline machine press']),
 ex('split','Supported split squat',3,8,12,120,'LEGS','Reps per leg. Hold support for balance; log total external weight held.',['Single-leg leg press']),
 ex('rear','Reverse pec deck',2,12,20,75,'PAIR 2','Keep neck relaxed; open arms without shrugging.',['Cable rear-delt fly']),
 ex('biceps','Cable curl',2,10,15,75,'PAIR 2','Keep upper arms still; use a grip your elbows tolerate.',['Dumbbell hammer curl']),
 ex('deadbug','Dead bug',2,8,12,60,'CORE','Reps per side. Exhale; extend opposite arm and leg without arching your back.',['Bird dog'],'body')]},
 {id:'C',name:'Leg press + balanced upper body',time:'70–85 min',exercises:[
 ex('legpress','Leg press',3,8,12,150,'MAIN LIFT','Keep pelvis on the pad; stop before the lower back curls. Use the same machine.',['Hack squat']),
 ex('chest','Machine chest press',3,8,12,120,'PUSH','Set handles near mid-chest; use a pain-free range.',['Dumbbell bench press']),
 ex('cableRow','Seated cable row',3,8,12,120,'PULL','Keep trunk still; pull elbows back without shrugging.',['Chest-supported row']),
 ex('hip','Machine hip thrust',3,8,12,120,'HIPS','Finish with glutes; avoid arching your lower back.',['Barbell hip thrust']),
 ex('shoulder','Machine shoulder press',2,8,12,120,'SHOULDERS','Use a comfortable grip and range; do not crane your neck.',['Landmine press']),
 ex('calf','Standing calf raise',2,10,15,75,'PAIR 3','Pause at the bottom and top; avoid bouncing.',['Seated calf raise']),
 ex('crunch','Cable crunch',2,10,15,60,'CORE / PAIR 3','Bring ribs toward pelvis; move through your trunk rather than just your hips.',['Machine abdominal crunch'])]}
];
export const kg=(value,unit)=>Number(value)*(unit==='lb'?0.45359237:1);
export const displayWeight=(value,unit)=>Math.round(Number(value)/(unit==='lb'?0.45359237:1)*100)/100;
export const keyFor=(e,name=e.name)=>`${e.id}:${name}`;
export function recommendation(e,name,history,unit){
 const entries=history.filter(s=>!s.deload).map(s=>s.exercises.find(x=>x.key===keyFor(e,name))).filter(x=>x&&x.sets.length).slice(-2);
 const last=entries.at(-1);if(!last)return {weight:null,text:e.kind==='body'?'Start at the lower end; leave 2 good reps in reserve.':'Choose a load for the low end with 2 good reps in reserve.'};
 const sets=last.sets.filter(s=>s.done);if(!sets.length)return {weight:null,text:'Choose a comfortable starting load.'};
 const base=sets[0].weight;
 const success=x=>x.sets.length===e.sets&&x.sets.every(s=>s.done&&s.reps>=e.max&&s.rir>=2&&Math.abs(s.weight-base)<0.01);
 const qualifies=entries.length===2&&entries.every(success);
 if(e.kind==='body')return {weight:0,text:qualifies?'Top range twice. Add a 2-second pause or a longer lever; restart at the low end.':'Add 1 controlled rep to a set when you can keep 2 reps in reserve.'};
 const increment=kg(['squat','rdl','split','legpress','hip'].includes(e.id)?(unit==='lb'?5:2.5):(unit==='lb'?2.5:1),unit);
 const failed=entries.length===2&&entries.every(x=>x.sets.length===e.sets&&x.sets.every(s=>s.done&&Math.abs(s.weight-base)<0.01)&&x.sets.some(s=>s.reps<e.min));
 if(failed)return {weight:base*.925,text:`Below the minimum twice. Reset about 7.5% to ${displayWeight(base*.925,unit)} ${unit}; choose the nearest available load.`};
 return {weight:qualifies?base+increment:base,text:qualifies?`Top range twice with 2+ reps in reserve. Try ${displayWeight(base+increment,unit)} ${unit}, or the smallest available increase; restart at ${e.min} reps.`:`Keep around ${displayWeight(base,unit)} ${unit}; add 1 rep to a set before adding weight.`};
}
