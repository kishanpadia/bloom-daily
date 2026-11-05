export const dayKey=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export const uid=()=>crypto.randomUUID();
export const pointsFor=effort=>({easy:20,medium:40,hard:60}[effort]||20);
export const earned=s=>s.tasks.filter(t=>t.done).reduce((n,t)=>n+t.points,0);
export const balance=s=>earned(s)-s.claims.reduce((n,c)=>n+c.cost,0);

const exampleTasks=[
 {title:'Take a 10-minute walk',category:'Wellbeing',minutes:10,effort:'easy',reward:'A cup of your favorite tea'},
 {title:'Move one meaningful thing forward',category:'Work',minutes:25,effort:'medium',reward:'15 minutes of guilt-free scrolling'},
 {title:'Read a few pages',category:'Personal',minutes:15,effort:'easy',reward:'An episode of your favorite show'}
];
const exampleRewards=[
 {title:'Your favorite coffee',emoji:'☕',cost:60},
 {title:'An episode, guilt-free',emoji:'🍿',cost:100},
 {title:'A little something for you',emoji:'🎁',cost:200}
];
const same=(value,example)=>Object.entries(example).every(([key,expected])=>value[key]===expected);

export function completeTask(s,id){const t=s.tasks.find(t=>t.id===id);if(!t)throw Error('Task not found.');if(t.done&&balance(s)<t.points)throw Error('These points have already been used for a reward.');t.done=!t.done;t.completedAt=t.done?new Date().toISOString():null;return t;}
export function claimReward(s,id){const r=s.rewards.find(r=>r.id===id);if(!r)throw Error('Reward not found.');if(balance(s)<r.cost)throw Error('A little more progress will unlock this reward.');const c={...r,id:uid(),rewardId:r.id,claimedAt:new Date().toISOString()};s.claims.push(c);return c;}
export function streak(s,today=dayKey()){let d=new Date(`${today}T12:00:00`),n=0;const dates=new Set(s.tasks.filter(t=>t.done).map(t=>dayKey(new Date(t.completedAt))));if(!dates.has(dayKey(d)))d.setDate(d.getDate()-1);while(dates.has(dayKey(d))){n++;d.setDate(d.getDate()-1);}return n;}
export function createState(){return {version:1,tasks:[],rewards:[],claims:[],settings:{name:'',notifications:false,reminderTime:'09:00'},focusSessions:[],starter:false};}

// Remove only the old unused walkthrough content. Completed or edited work remains intact.
export function removeLegacyExampleContent(s){const wasStarter=s.starter===true;const claimedRewardIds=new Set(s.claims.map(c=>c.rewardId));const tasks=s.tasks.filter(t=>t.done||t.reminder||!exampleTasks.some(example=>same(t,example)));const rewards=s.rewards.filter(r=>claimedRewardIds.has(r.id)||!exampleRewards.some(example=>same(r,example)));const changed=wasStarter||tasks.length!==s.tasks.length||rewards.length!==s.rewards.length;s.tasks=tasks;s.rewards=rewards;s.starter=false;return changed;}
export function validateState(s){if(!s||s.version!==1||!Array.isArray(s.tasks)||!Array.isArray(s.rewards)||!Array.isArray(s.claims)||!s.settings||!Array.isArray(s.focusSessions))throw Error('This is not a Bloom backup.');if(new Set(s.tasks.map(t=>t.id)).size!==s.tasks.length)throw Error('This backup has duplicate task IDs.');if(s.tasks.some(t=>!Number.isInteger(t.minutes)||t.minutes<1||t.minutes>480||typeof t.category!=='string'||typeof t.reward!=='string'||typeof t.reminder!=='string'))throw Error('This backup has invalid task details.');if(s.focusSessions.some(f=>!Number.isFinite(f.minutes)||f.minutes<0||f.minutes>480))throw Error('This backup has invalid focus sessions.');if(s.tasks.length>10000||s.tasks.some(t=>typeof t.title!=='string'||typeof t.id!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(t.date)||![20,40,60].includes(t.points)||typeof t.done!=='boolean'||(t.done&&!Number.isFinite(Date.parse(t.completedAt)))))throw Error('This backup has invalid tasks.');if(s.rewards.some(r=>typeof r.title!=='string'||!Number.isInteger(r.cost)||r.cost<1)||s.claims.some(r=>!Number.isInteger(r.cost)||r.cost<1)||balance(s)<0)throw Error('This backup has invalid rewards.');removeLegacyExampleContent(s);return s;}
