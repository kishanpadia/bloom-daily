import test from 'node:test';
import assert from 'node:assert/strict';
import {createState,completeTask,claimReward,balance,streak,dayKey,validateState} from '../dist/model.js';

const task=(id,effort='easy')=>({id,date:dayKey(),done:false,completedAt:null,title:`Task ${id}`,category:'Personal',minutes:15,effort,points:{easy:20,medium:40,hard:60}[effort],reward:'A well-earned pause',reminder:''});
const reward=(id='reward',cost=60)=>({id,title:'A quiet coffee',emoji:'☕',cost});
const stateWithExamples=()=>{const s=createState();s.tasks=[task('one'),task('two','medium'),task('three')];s.rewards=[reward()];return s;};

test('new spaces begin without example tasks or rewards',()=>{const s=createState();assert.deepEqual(s.tasks,[]);assert.deepEqual(s.rewards,[]);assert.equal(s.starter,false);});
test('points are derived from completions, and undo removes them',()=>{const s=stateWithExamples(),t=s.tasks[0];completeTask(s,t.id);assert.equal(balance(s),20);completeTask(s,t.id);assert.equal(balance(s),0);});
test('claiming spends points once and prevents reuse of spent completions',()=>{const s=stateWithExamples();completeTask(s,s.tasks[0].id);completeTask(s,s.tasks[1].id);assert.equal(balance(s),60);claimReward(s,s.rewards[0].id);assert.equal(balance(s),0);assert.throws(()=>claimReward(s,s.rewards[0].id));assert.throws(()=>completeTask(s,s.tasks[1].id));assert.equal(s.tasks[1].done,true);assert.equal(s.claims.length,1);});
test('reward history is preserved after editing the reward',()=>{const s=stateWithExamples();s.tasks.forEach(t=>completeTask(s,t.id));claimReward(s,s.rewards[0].id);s.rewards[0].cost=10;s.rewards[0].title='Edited';assert.equal(s.claims[0].cost,60);assert.equal(balance(s),20);});
test('streak counts today or yesterday and breaks at a missing day',()=>{const s=createState();const base='2026-10-31';for(const d of ['2026-10-30','2026-10-29'])s.tasks.push({...task(d),done:true,completedAt:`${d}T12:00:00`});assert.equal(streak(s,base),2);s.tasks.push({...task('today'),done:true,completedAt:`${base}T12:00:00`});assert.equal(streak(s,base),3);s.tasks.pop();assert.equal(streak(s,'2026-11-01'),0);});
test('the old example content is removed without deleting completed tasks',()=>{const s={...createState(),starter:true,tasks:[{...task('walk'),title:'Take a 10-minute walk',category:'Wellbeing',minutes:10,effort:'easy',points:20,reward:'A cup of your favorite tea'},{...task('kept'),done:true,completedAt:'2026-11-05T12:00:00'}],rewards:[{id:'coffee',title:'Your favorite coffee',emoji:'☕',cost:60}]};assert.equal(validateState(s),s);assert.equal(s.starter,false);assert.equal(s.rewards.length,0);assert.deepEqual(s.tasks.map(t=>t.id),['kept']);});
test('backup validation rejects forged points and duplicate tasks',()=>{const s=stateWithExamples();assert.equal(validateState(s),s);s.tasks[0].points=10000;assert.throws(()=>validateState(s));s.tasks[0].points=20;s.tasks[1].id=s.tasks[0].id;assert.throws(()=>validateState(s));});
test('date keys use local calendar dates',()=>{assert.equal(dayKey(new Date(2026,9,31,23,59)),'2026-10-31');});
