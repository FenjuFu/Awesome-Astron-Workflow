import { getQuizClient } from './_lib/quiz-db.js';
import { createFair, fairView, fairTransition, requireFair } from './_lib/new-year-core.js';
let indexes;
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  try{
    requireFair(req.method==='POST','Method not allowed',405);
    requireFair(req.headers['sec-fetch-site']!=='cross-site','Cross-site requests are not allowed',403);
    const body=req.body||{};requireFair(JSON.stringify(body).length<10000,'请求内容过大',413);
    const client=await getQuizClient();const rooms=client.db('astron_workflow').collection('new_year_fairs');
    indexes||=rooms.createIndex({expiresAt:1},{expireAfterSeconds:0}).catch(e=>{indexes=null;throw e;});await indexes;
    if(body.action==='create'){
      for(let attempt=0;attempt<5;attempt++){const room=createFair(body);try{await rooms.insertOne(room);return res.status(201).json({room:fairView(room,room.hostToken),token:room.hostToken});}catch(e){if(e.code!==11000)throw e;}}
      throw new Error('Room allocation failed');
    }
    requireFair(typeof body.code==='string'&&/^\d{6}$/.test(body.code),'请输入六位活动码');
    for(let attempt=0;attempt<15;attempt++){
      const original=await rooms.findOne({_id:body.code,expiresAt:{$gt:new Date()}});requireFair(original,'活动不存在或已过期（30天）',404);
      if(body.action==='state')return res.status(200).json({room:fairView(original,body.token)});
      const result=fairTransition(original,body);const updated=await rooms.replaceOne({_id:original._id,revision:original.revision},result.room);
      if(updated.matchedCount)return res.status(200).json({room:fairView(result.room,result.token||body.token),...(result.token?{token:result.token}:{}),...(result.feedback?{feedback:result.feedback}:{})});
    }
    return res.status(409).json({error:'活动繁忙，请重试'});
  }catch(e){if(!e.status)console.error('New Year fair error:',e.name);return res.status(e.status||503).json({error:e.status?e.message:'活动服务暂不可用，请稍后重试'});}
}
