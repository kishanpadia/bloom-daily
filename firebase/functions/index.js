import {onSchedule} from 'firebase-functions/v2/scheduler';
import {initializeApp} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {getMessaging} from 'firebase-admin/messaging';
initializeApp();
// Deploy to your own Firebase project. The Admin SDK uses the runtime identity.
export const gentleNudges=onSchedule({schedule:'every 5 minutes',timeZone:'UTC',maxInstances:1},async()=>{
 const db=getFirestore(),now=Date.now();
 const due=await db.collectionGroup('reminders').where('dueAt','<=',now).limit(200).get();
 for(const reminder of due.docs){
  const userRef=reminder.ref.parent.parent;
  if(!userRef)continue;
  const snapshot=await db.runTransaction(async tx=>{const fresh=await tx.get(reminder.ref);if(!fresh.exists)return null;const data=fresh.data();if(data.leaseUntil>now)return null;tx.update(reminder.ref,{leaseUntil:now+10*60*1000});return data;});
  if(!snapshot)continue;
  const delivery=userRef.collection('deliveries').doc(`${reminder.id}_${snapshot.dueAt}`);
  try{
   if((await delivery.get()).exists){await reminder.ref.delete();continue;}
   const userData=await userRef.collection('data').doc('bloom').get();
   const state=userData.data()?.state;
   const task=state?.tasks?.find(t=>t.id===snapshot.taskId);
   // Check current intent, including completion and paused notifications.
   if(!state?.settings?.notifications||!task||task.done||now-snapshot.dueAt>24*60*60*1000){await reminder.ref.delete();continue;}
   const devices=await userRef.collection('devices').get();
   const docs=devices.docs.filter(d=>typeof d.data().token==='string');
   if(!docs.length){await reminder.ref.delete();continue;}
   for(let i=0;i<docs.length;i+=500){const group=docs.slice(i,i+500);const result=await getMessaging().sendEachForMulticast({tokens:group.map(d=>d.data().token),data:{title:'A gentle nudge from Bloom 🌱',body:snapshot.title,taskId:snapshot.taskId},webpush:{headers:{TTL:'3600'}}});for(let j=0;j<result.responses.length;j++){const error=result.responses[j].error;if(error&&['messaging/registration-token-not-registered','messaging/invalid-registration-token'].includes(error.code))await group[j].ref.delete();}}
   await delivery.set({sentAt:Date.now()});
   await reminder.ref.delete();
  }catch(error){console.error('Reminder send failed',error.code||'unknown');await reminder.ref.update({leaseUntil:0});}
 }
});
