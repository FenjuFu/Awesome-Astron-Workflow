import { randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
export const GAME_TITLES = { goat: '羊年趣味问答', riddles: '羊年灯谜会', customs: '新春知识挑战' };
// Fixed, reviewed answers stay on the server. Generated HTML never awards event points.
const BANK = {
  goat: [
    ['2027年春节进入哪个生肖年？',['羊年','马年','猴年'],0,'2027年春节进入丁未羊年。'],
    ['羊主要吃什么？',['草等植物','糖果','石头'],0,'羊是草食性动物。'],
    ['下面哪一项更适合观察动物？',['轻声观察、保持距离','追赶动物','随意投喂糖果'],0,'保持距离，不追赶、不随意投喂。'],
    ['小伙伴没答对题时，怎样回应更友善？',['一起看解析','嘲笑他','不让他再玩'],0,'可以一起学习并鼓励同伴。'],
    ['“亡羊补牢”常用来提醒我们什么？',['发现问题及时补救','永远不改错','只要运气好就行'],0,'出现问题后及时采取补救措施。'],
  ],
  riddles: [
    ['白天躲起来，夜晚亮晶晶，天上数不清。（自然事物）',['星星','白云','太阳'],0,'夜空中点点发光的是星星。'],
    ['一口咬掉牛尾巴。（打一字）',['告','羊','午'],0,'“牛”去掉下端一竖，加上“口”组成“告”。'],
    ['身穿红衣裳，肚里亮堂堂，节日挂门旁。（节日用品）',['灯笼','雨伞','书包'],0,'红灯笼常作为节庆装饰。'],
    ['千条线，万条线，落到水里看不见。（自然现象）',['雨','雪山','彩虹'],0,'雨丝落入水中便与水融为一体。'],
    ['两个小口袋，天天随身带，少了一只，惹人笑坏。（衣物）',['袜子','帽子','围巾'],0,'袜子通常成双穿在脚上。'],
  ],
  customs: [
    ['元宵节是农历哪一天？',['正月十五','正月初一','八月十五'],0,'元宵节在农历正月十五。'],
    ['春节的日期主要依据哪种历法确定？',['农历','每年固定的公历日期','学校课程表'],0,'春节是农历正月初一，公历日期每年会变化。'],
    ['“拜年”主要表达什么？',['新年祝福','比赛名次','天气预报'],0,'拜年是向亲友表达新年问候和祝福。'],
    ['关于年夜饭，哪种说法更恰当？',['各地各家有不同习惯','每家必须吃同一道菜','全国完全相同'],0,'年俗因地区、家庭而异，没有统一菜单。'],
    ['看到陌生地区的年俗时，怎样做更合适？',['尊重并了解由来','嘲笑不同习惯','要求所有人一样'],0,'尊重不同地区和家庭的文化习惯。'],
  ],
};
export function requireFair(ok, message, status = 400) { if (!ok) throw Object.assign(new Error(message), { status }); }
function equal(a,b) { if(typeof a!=='string'||typeof b!=='string')return false;const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y); }
const token = () => randomBytes(24).toString('hex');
export function createFair(body, now = Date.now()) {
  const title = typeof body.title==='string' ? body.title.trim().slice(0,60) : '';
  requireFair(title, '请输入活动名称');
  requireFair(Array.isArray(body.prizes)&&body.prizes.length>=1&&body.prizes.length<=6,'请配置1至6种礼品');
  const prizes=body.prizes.map((p,i)=>{ requireFair(typeof p.name==='string'&&p.name.trim()&&p.name.length<=40&&Number.isInteger(p.cost)&&p.cost>=10&&p.cost<=150&&Number.isInteger(p.stock)&&p.stock>=1&&p.stock<=10000,'礼品名称、积分（10至150）或库存不正确');return {id:String(i),name:p.name.trim(),cost:p.cost,stock:p.stock}; });
  return {_id:String(randomInt(100000,1000000)),title,hostToken:token(),prizes,players:[],revision:0,createdAt:new Date(now),expiresAt:new Date(now+30*86400000)};
}
export function fairView(room, auth) {
  const host=equal(auth,room.hostToken),p=room.players.find(p=>equal(auth,p.token));
  const result={code:room._id,title:room.title,expiresAt:room.expiresAt,prizes:room.prizes,playerCount:room.players.length,isHost:host};
  if(host)result.players=room.players.map(({token,...p})=>({...p,run:undefined}));
  if(p){ const {token,...safe}=p;result.player={...safe,run:undefined}; if(p.run){ const q=BANK[p.run.game][p.run.index];result.question=q ? {game:p.run.game,index:p.run.index,total:BANK[p.run.game].length,text:q[0],options:p.run.order.map(i=>q[1][i])} : null; } }
  return result;
}
export function fairTransition(original,body,now=Date.now()) {
  const room=structuredClone(original);const p=room.players.find(p=>equal(body.token,p.token));
  if(body.action==='join'){
    if(p)return {room,token:p.token};
    requireFair(room.players.length<500,'本场活动已满（500人）',409);
    const name=typeof body.name==='string'?body.name.trim():'';requireFair(name.length>=1&&name.length<=20,'昵称请填写1至20个字');
    const player={id:randomBytes(5).toString('hex').toUpperCase(),token:token(),name,points:0,earned:0,completed:[],answers:[],redemptions:[],run:null};room.players.push(player);room.revision++;return {room,token:player.token};
  }
  if(body.action==='redeem'){
    requireFair(equal(body.token,room.hostToken),'仅本场工作人员可核销',403);
    const player=room.players.find(p=>p.id===body.playerId);const prize=room.prizes.find(p=>p.id===body.prizeId);
    requireFair(player&&prize,'参与编号或礼品不存在',404);requireFair(typeof body.requestId==='string'&&/^[a-zA-Z0-9-]{10,80}$/.test(body.requestId),'核销请求编号不正确');
    if(room.players.some(p=>p.redemptions.some(r=>r.requestId===body.requestId)))return {room};
    requireFair(prize.stock>0,'礼品已兑完',409);requireFair(player.points>=prize.cost,'积分不足',409);
    player.points-=prize.cost;prize.stock--;player.redemptions.push({requestId:body.requestId,name:prize.name,cost:prize.cost,at:new Date(now).toISOString()});room.revision++;return {room};
  }
  requireFair(p,'请先加入本场活动',403);
  if(body.action==='start'){
    requireFair(Object.hasOwn(BANK,body.game),'未知游戏');requireFair(!p.completed.includes(body.game),'本场已完成该游戏，每种游戏只计分一次',409);
    requireFair(!p.run||p.run.game===body.game,'请先完成正在进行的游戏',409);
    if(!p.run)p.run={game:body.game,index:0,order:shuffle()};
  }else if(body.action==='answer'){
    requireFair(p.run&&body.game===p.run.game&&body.index===p.run.index,'题目已更新，请刷新',409);
    const q=BANK[p.run.game][p.run.index];requireFair(Number.isInteger(body.choice)&&body.choice>=0&&body.choice<q[1].length,'请选择有效答案');
    const correct=p.run.order[body.choice]===q[2],points=correct?10:0;
    p.answers.push({game:p.run.game,index:p.run.index,correct,points});p.points+=points;p.earned+=points;
    const feedback={correct,points,answer:q[1][q[2]],explanation:q[3]};
    p.run.index++;if(p.run.index===BANK[p.run.game].length){p.completed.push(p.run.game);p.run=null;}else p.run.order=shuffle();
    room.revision++;return {room,feedback};
  }else requireFair(false,'未知操作');
  room.revision++;return {room};
}
function shuffle(){const order=[0,1,2];for(let i=2;i>0;i--){const j=randomInt(i+1);[order[i],order[j]]=[order[j],order[i]];}return order;}
