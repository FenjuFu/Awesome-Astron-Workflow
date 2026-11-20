import test from 'node:test';
import assert from 'node:assert/strict';
import {runPlayground} from '../../api/_lib/playground-core.js';
const call=html=>runPlayground({prompt:'Test document'}, {ASTRON_MAAS_API_KEY:'test-only'}, async()=>new Response(JSON.stringify({choices:[{message:{content:html},finish_reason:'stop'}]})));
test('stray tokens between doctype and root do not render into downloaded HTML',async()=>{for(const extra of ['>','<“>','\n>\n>']){const r=await call('<!DOCTYPE html>'+extra+'<html><body><h1>Hello</h1></body></html>');assert.equal(r.status,200);assert.match(r.json.html,/^<!DOCTYPE html>\n<html>/);}});
test('empty shell is rejected instead of reporting a working app',async()=>{const r=await call('<!DOCTYPE html><html><head><style>body{color:red}</style></head><script>let a=1;</script></html>');assert.equal(r.status,422);});
test('broken JavaScript is rejected before preview and download',async()=>{const r=await call('<!DOCTYPE html><html><body><h1>Test</h1><script>function broken( {</script></body></html>');assert.equal(r.status,422);});
test('complete HTML with inline interactions is preserved',async()=>{const html='<!DOCTYPE html><html><body><button onclick="this.textContent=2">1</button></body></html>';const r=await call(html);assert.equal(r.status,200);assert.match(r.json.html,/onclick/);});
test('unclosed style tags cannot hide the application and pass validation',async()=>{const r=await call('<!DOCTYPE html><html><head><style>body{color:red}<button>Hidden</button><script>let a=1;</script></html>');assert.equal(r.status,422);});
test('candy generation preserves explicitly supplied core including initial reset',async()=>{
 const source="const icons=[];\nfunction reset(){document.getElementById('score').textContent='ready';}\nreset();";
 const prompt='Create a beautiful candy-matching game. Keep this game logic unchanged;\n'+source;
 const generated='<!DOCTYPE html><html><body><p id="score"></p><p id="moves"></p><p id="message"></p><div id="board"></div><script>function reset(){}</script></body></html>';
 const r=await runPlayground({prompt},{ASTRON_MAAS_API_KEY:'test-only'},async()=>new Response(JSON.stringify({choices:[{message:{content:generated}}]})));
 assert.equal(r.status,200);assert.ok(r.json.html.includes(source));assert.equal((r.json.html.match(/<script>/g)||[]).length,1);
});
