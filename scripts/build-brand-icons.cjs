const fs=require('node:fs/promises');
const path=require('node:path');
const {createRequire}=require('node:module');
async function main(){
 let sharp;
 try{sharp=require('sharp');}catch{
  if(!process.env.BLOOM_SHARP_PACKAGE)throw Error('Install sharp or set BLOOM_SHARP_PACKAGE to an existing package.json that provides sharp.');
  sharp=createRequire(path.resolve(process.env.BLOOM_SHARP_PACKAGE))('sharp');
 }
 const directory=path.resolve(__dirname,'../dist');
 const svg=await fs.readFile(path.join(directory,'bloom-mark.svg'));
 for(const [size,names] of [[192,['bloom-icon-192-v3.png','icon-192.png']],[512,['bloom-icon-512-v3.png','icon-512.png']],[180,['bloom-apple-touch-icon-v3.png']]]){
  const png=await sharp(svg).resize(size,size).png().toBuffer();
  for(const name of names)await fs.writeFile(path.join(directory,name),png);
 }
 await fs.copyFile(path.join(directory,'bloom-mark.svg'),path.join(directory,'icon.svg'));
 console.log('Bloom app icons generated at 180, 192, and 512 pixels.');
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
