const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const scope = 'https://example.test/demo/';
const events = {};
const cacheStore = new Map();
let online = true;
let fetchCount = 0;

function normalized(request) {
  return new URL(typeof request === 'string' ? request : request.url, scope).href;
}
function getCache(name) {
  if (!cacheStore.has(name)) cacheStore.set(name, new Map());
  const data = cacheStore.get(name);
  return {
    async addAll(resources) {
      for (const resource of resources) {
        const url = normalized(resource);
        data.set(url, new Response(`precached ${url}`));
      }
    },
    async match(request) { return data.get(normalized(request))?.clone(); },
    async put(request, response) { data.set(normalized(request), response.clone()); },
    async keys() { return [...data.keys()].map(url => ({url})); },
  };
}
const caches = {
  open: async (name) => getCache(name),
  keys: async () => [...cacheStore.keys()],
  delete: async (name) => cacheStore.delete(name),
};
const mockSelf = {
  location: {origin: 'https://example.test'},
  registration: {scope},
  clients: {claim: async () => {}},
  skipWaiting: async () => {},
  addEventListener(type, callback) {events[type] = callback;},
};
const code = fs.readFileSync(path.join(__dirname,'..','service-worker.js'),'utf8');
vm.runInNewContext(code, {
  self: mockSelf,
  caches,
  URL,
  Response,
  fetch: async (request) => {
    fetchCount += 1;
    if (!online) throw new Error('Network is offline');
    return new Response(`network ${normalized(request)}`,{status:200});
  },
});
async function lifecycle(name) {
  const e = {waitUntil(p) { this.promise = p; }};
  events[name](e);
  await e.promise;
}
async function respond(url, mode='same-origin') {
  const request = {method:'GET',url,mode};
  const event = {request,respondWith(p) {this.promise = p;}};
  events.fetch(event);
  return event.promise ? event.promise : null;
}
(async() => {
  await lifecycle('install');
  const shell = cacheStore.get('campus-planner-shell-v3');
  assert.equal(shell.size,9);
  console.log('PASS install pre-caches 9 app shell resources');

  await caches.open('campus-planner-shell-old');
  await lifecycle('activate');
  assert.deepEqual(await caches.keys(),['campus-planner-shell-v3']);
  console.log('PASS activate removes outdated app caches');

  const onlineResponse = await respond(scope,'navigate');
  assert.equal(await onlineResponse.text(), `network ${scope}`);
  assert.equal(fetchCount,1);
  console.log('PASS navigation uses the network when available');

  online = false;
  const offlineResponse = await respond(scope,'navigate');
  assert.match(await offlineResponse.text(),/network|precached/);
  console.log('PASS navigation falls back to cached HTML when offline');

  const css = await respond(scope+'styles.css');
  assert.match(await css.text(),/precached/);
  assert.equal(fetchCount,2); 
  console.log('PASS static asset resolves from cache while offline');

  const outside = await respond('https://example.test/other/styles.css');
  assert.equal(outside,null);
  console.log('PASS requests outside service worker scope are ignored');
})().catch((error) => {console.error(error);process.exitCode=1;});
