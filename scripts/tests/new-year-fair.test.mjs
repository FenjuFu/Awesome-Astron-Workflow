import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createFair, fairTransition, fairView } from '../../api/_lib/new-year-core.js';
const setup=()=>createFair({title:'Test only',prizes:[{name:'Test sticker',cost:10,stock:1}]});
const join=room=>fairTransition(room,{action:'join',name:'Visitor'});
test('visitors cannot see staff tokens, answers or other visitor details',()=>{
  const room=setup(),joined=join(room),view=fairView(joined.room,joined.token);
  assert.equal(view.isHost,false);assert.equal(view.players,undefined);assert.equal(JSON.stringify(view).includes(joined.token),false);assert.equal(JSON.stringify(view).includes(room.hostToken),false);
  const start=fairTransition(joined.room,{action:'start',game:'goat',token:joined.token});
  assert.equal(fairView(start.room,joined.token).question.options.length,3);assert.equal(fairView(start.room,joined.token).question.correct,undefined);
});
test('server awards each answer once; stale answers and completed game replay are rejected',()=>{
  let {room,token}=join(setup());room=fairTransition(room,{action:'start',game:'goat',token}).room;
  for(let index=0;index<5;index++){
    const choice=room.players[0].run.order.indexOf(0);const body={action:'answer',token,game:'goat',index,choice,points:999999};
    room=fairTransition(room,body).room;assert.throws(()=>fairTransition(room,body));
  }
  assert.equal(room.players[0].points,50);assert.throws(()=>fairTransition(room,{action:'start',game:'goat',token}),/已完成/);
});
test('incorrect answers do not earn points and switching unfinished games is blocked',()=>{
  let {room,token}=join(setup());room=fairTransition(room,{action:'start',game:'riddles',token}).room;
  assert.throws(()=>fairTransition(room,{action:'start',game:'customs',token}),/请先完成/);
  room=fairTransition(room,{action:'answer',token,game:'riddles',index:0,choice:room.players[0].run.order.indexOf(1)}).room;
  assert.equal(room.players[0].points,0);
});
test('only host can redeem; redemption is idempotent and cannot oversell',()=>{
  let {room,token}=join(setup());room.players[0].points=20;const playerId=room.players[0].id;
  const body={action:'redeem',token,playerId,prizeId:'0',requestId:'request-000001'};
  assert.throws(()=>fairTransition(room,body),/仅本场工作人员/);
  body.token=room.hostToken;room=fairTransition(room,body).room;
  assert.equal(room.players[0].points,10);assert.equal(room.prizes[0].stock,0);
  room=fairTransition(room,body).room;assert.equal(room.players[0].points,10);
  assert.throws(()=>fairTransition(room,{...body,requestId:'request-000002'}),/已兑完/);
});
test('invalid configuration and game names are rejected',()=>{
  assert.throws(()=>createFair({title:'Bad',prizes:[{name:'x',cost:-1,stock:1}]}));
  const {room,token}=join(setup());assert.throws(()=>fairTransition(room,{action:'start',game:'__proto__',token}));
});
