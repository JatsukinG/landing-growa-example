import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const source = readFileSync(new URL('../src/pages/control.astro', import.meta.url), 'utf8').split('<!-- Lógica BLE -->')[1].split('<script is:inline>')[1].split('</script>')[0];
const base = {pump:1,water:1,state:'ON',onSec:60,offSec:120,maxOnSec:900,remainingSec:60,hourUsedSec:1199,hourUsedMs:1199000,hourMaxSec:1200,hourWindowSec:3600,recoveryRemainingSec:0,protectionWaitSec:0,nextWateringSec:null,hourUsageText:'19 min 59 s / 20 min',configPending:false,boot:'POWER_ON',error:null};
const bytes = value => new DataView(new TextEncoder().encode(typeof value === 'string' ? value : JSON.stringify(value)).buffer);
function setup() {
  let now=0, id=0;
  const timers=new Map(), elements=new Map();
  function element() { return {hidden:false,disabled:false,value:'',textContent:'',className:'',dataset:{},style:{},listeners:new Map(),classList:{toggle(){},contains(){return false;}},setAttribute(){},focus(){},addEventListener(n,f){this.listeners.set(n,f);},removeEventListener(n,f){if(this.listeners.get(n)===f)this.listeners.delete(n);}}; }
  const document={hidden:false,listeners:new Map(),addEventListener(n,f){this.listeners.set(n,f);},getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id);}};
  const context=vm.createContext({document,window:{},navigator:{},console:{warn(){}},TextDecoder,TextEncoder,performance:{now:()=>now},setInterval:(f,ms)=>{timers.set(++id,{f,ms});return id;},clearInterval:i=>timers.delete(i),setTimeout:(f,ms)=>{timers.set(++id,{f,ms});return id;},clearTimeout:i=>timers.delete(i)});
  vm.runInContext(source,context);
  return {context,document,timers,el:id=>document.getElementById(id),run:code=>vm.runInContext(code,context),send:raw=>{context.raw=raw;return vm.runInContext('applyStatus(raw)',context);},advance:ms=>{now+=ms;for(const {f,ms:interval} of [...timers.values()])if(interval===1000)f();}};
}
test('ciclo y cuenta monotónica sin deriva; cero requiere confirmación',async()=>{
 const h=setup();h.send(base);assert.equal(h.el('remainingVal').textContent,'1:00');h.advance(2300);assert.equal(h.el('remainingVal').textContent,'0:58');
 h.advance(58000);assert.equal(h.el('stateTitle').textContent,'Datos desactualizados');
 h.send({...base,remainingSec:1});h.advance(1000);assert.equal(h.el('stateTitle').textContent,'Actualizando estado…');assert.equal(h.run('status.state'),'ON');
 h.send({...base,pump:0,state:'OFF',remainingSec:120,nextWateringSec:120});assert.equal(h.el('stateTitle').textContent,'En descanso');assert.equal(h.el('remainingVal').textContent,'2:00');
 h.send(base);assert.equal(h.el('stateTitle').textContent,'Regando');assert.equal(h.el('hourVal').textContent,'19:59 de 20:00');
});
test('JSON grande, truncado, inválido y READ fallido seguido de recuperación',async()=>{
 const h=setup();let fail=false,reads=0;h.context.char={readValue:async()=>{reads++;if(fail)throw Error('radio');return bytes(base);}};h.run('statusChar=char');
 h.context.char.value=bytes(JSON.stringify(base).slice(0,20));h.context.event={target:h.context.char};h.run('handleNotification(event)');await h.run('gattQueue');await Promise.resolve();assert.equal(h.run('status.state'),'ON');assert.equal(reads,1);
 h.advance(2000);fail=true;await h.run('requestStatus()');assert.equal(h.run('diagnostics.readErrors'),1);fail=false;h.advance(2000);await h.run('requestStatus()');assert.equal(h.run('diagnostics.lastMessageBytes'),bytes(base).byteLength);
 h.context.bad=bytes('null');assert.equal(h.run('receive(bad)'),false);h.context.good=bytes({...base,error:'x'.repeat(200)});assert.equal(h.run('receive(good)'),true);
 assert.equal(h.run('diagnostics.parseErrors'),2);
 console.log('Estado representativo:',bytes(base).byteLength,'bytes; con error largo:',h.run('diagnostics.lastMessageBytes'));
});
test('sin agua, protección, recuperación futura y nextWateringSec null',()=>{
 const h=setup();h.send({...base,pump:0,water:0,state:'NO_WATER'});assert.equal(h.el('stateTitle').textContent,'Falta de agua');assert.equal(h.el('phaseBlock').hidden,true);
 h.send({...base,pump:0,water:0,state:'NO_WATER',recoveryRemainingSec:30});assert.match(h.el('stateDetail').textContent,/Espera tras reinicio/);assert.equal(h.el('remainingVal').textContent,'0:30');
 h.send({...base,pump:0,state:'HOUR_LIMIT',protectionWaitSec:180});assert.equal(h.el('remainingVal').textContent,'3:00');assert.match(h.el('stateDetail').textContent,/disponibilidad/);
 h.send({...base,pump:0,state:'OFF',nextWateringSec:null});assert.equal(h.el('phaseBlock').hidden,true);
 h.send(base);assert.doesNotMatch(h.el('stateDetail').textContent,/reinicio/);
});
test('conexión y reconexión limpian listeners, timers y lecturas antiguas',async()=>{
 const h=setup();const listeners=new Set();let reads=0;
 const char={addEventListener:(_n,f)=>listeners.add(f),removeEventListener:(_n,f)=>listeners.delete(f),startNotifications:async()=>{},readValue:async()=>{reads++;return bytes(base);}};
 const device={name:'TorreHidroponica',addEventListener(){},removeEventListener(){},gatt:{connected:true,connect:async()=>({getPrimaryService:async()=>({getCharacteristic:async()=>char})}),disconnect(){this.connected=false;}}};
 h.context.navigator.bluetooth={requestDevice:async()=>device};await h.run('connect()');assert.equal(listeners.size,1);assert.equal(h.timers.size,2);
 h.run('onDisconnected()');assert.equal(listeners.size,0);assert.equal(h.timers.size,0);await h.run('connect()');assert.equal(listeners.size,1);assert.equal(h.timers.size,2);
 h.advance(9000);assert.equal(h.el('stateTitle').textContent,'Datos desactualizados');await h.run('requestStatus()');assert.equal(h.el('stateTitle').textContent,'Regando');
 h.run('onDisconnected()');assert.equal(h.el('stateTitle').textContent,'Sin conexión');
});
test('GATT serializado y lecturas agrupadas',async()=>{
 const h=setup();let release,active=0,max=0;h.context.char={readValue:()=>{active++;max=Math.max(max,active);return new Promise(r=>release=()=>{active--;r(bytes(base));});}};h.run('statusChar=char');
 const a=h.run('requestStatus()');await Promise.resolve();await h.run('requestStatus()');assert.equal(max,1);release();await a;
});
test('configuración: edición preservada, pendiente, aplicada, rechazada y límites',async()=>{
 const h=setup();h.send(base);h.run('configChar = {writeValue:async()=>{}}');h.el('onInput').value='2';h.el('offInput').value='4';h.run('markEdited(onInput);markEdited(offInput)');h.send(base);assert.equal(h.el('onInput').value,'2');
 await h.el('configForm').listeners.get('submit')({preventDefault(){}});assert.match(h.el('formMessage').textContent,/Pendiente/);
 h.send({...base,configPending:true});assert.match(h.el('formMessage').textContent,/Pendiente/);assert.ok(h.run('pendingSave'));
 h.send({...base,onSec:120,offSec:240});assert.match(h.el('formMessage').textContent,/Aplicada/);assert.equal(h.run('pendingSave'),null);
 h.el('onInput').value='3';h.el('offInput').value='6';await h.el('configForm').listeners.get('submit')({preventDefault(){}});h.send({...base,error:'fuera de rango'});assert.match(h.el('formMessage').textContent,/Rechazada: fuera de rango/);
 for(const [on,off] of [['16','32'],['1','1441'],['1','1'],['0.101','2']]){h.el('onInput').value=on;h.el('offInput').value=off;assert.equal(h.run('validate().ok'),false);}
 h.el('onInput').value='15';h.el('offInput').value='1440';assert.equal(h.run('validate().ok'),true);
});
test('READ no fragmenta ni concatena; los eventos de READ no disparan reintentos recursivos',async()=>{
 const h=setup();let calls=0;const char={value:bytes('{"pump":1'),readValue:async()=>{calls++;h.run('handleNotification(event)');return char.value;}};
 h.context.char=char;h.context.event={target:char};h.run('statusChar=char');await h.run('requestStatus()');assert.equal(calls,1);assert.equal(h.run('status'),null);
 h.advance(9000);char.value=bytes(base);await h.run('requestStatus()');assert.equal(h.run('status.state'),'ON');assert.equal(calls,2);
 h.context.event={target:{value:bytes({...base,state:'OFF',pump:0})}};h.run('handleNotification(event)');assert.equal(h.run('status.state'),'ON');
});
test('respuestas de una sesión cerrada no modifican una reconexión',async()=>{
 const h=setup();let release;h.context.old={removeEventListener(){},readValue:()=>new Promise(r=>release=r)};h.run('statusChar=old');const reading=h.run('requestStatus()');await Promise.resolve();h.run('onDisconnected()');h.send({...base,state:'OFF',pump:0,nextWateringSec:120});release(bytes(base));await reading;assert.equal(h.run('status.state'),'OFF');
});
test('volver a la pestaña sincroniza y respeta ediciones nuevas durante una aplicación',async()=>{
 const h=setup();let reads=0,payload;h.context.char={readValue:async()=>{reads++;return bytes(base);},writeValue:async value=>{payload=JSON.parse(new TextDecoder().decode(value));}};
 h.run('statusChar=configChar=char');h.send(base);h.el('onInput').value='2';h.el('offInput').value='4';h.run('markEdited(onInput);markEdited(offInput)');await h.el('configForm').listeners.get('submit')({preventDefault(){}});
 await h.run('gattQueue');await Promise.resolve();
 assert.deepEqual(payload,{onSec:120,offSec:240});h.el('onInput').value='3';h.run('markEdited(onInput)');h.send({...base,onSec:120,offSec:240,configPending:false});h.send({...base,onSec:120,offSec:240});assert.equal(h.el('onInput').value,'3');
 h.advance(9000);h.document.listeners.get('visibilitychange')();await h.run('gattQueue');assert.ok(reads>=2);assert.equal(h.el('stateTitle').textContent,'Regando');
});
test('sin primer estado válido se informa antigüedad aunque GATT siga conectado',async()=>{
 const h=setup();h.run('connectedAt=performance.now();restartTicker()');h.advance(9000);assert.equal(h.el('stateTitle').textContent,'Datos desactualizados');
});
