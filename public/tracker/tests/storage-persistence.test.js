const assert = require('node:assert/strict');

const { initializeAppStorageState } = require('../js/storage.js');

function createStorageMock() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
    _store: store
  };
}

const storage = createStorageMock();
global.localStorage = storage;
global.candidates = [];
global.clients = [];
global.requirements = [];
global.team = [];
global.vendors = [];
global.interviews = [];
global.invoices = [];
global.deletedEntries = [];
storage.setItem('armsCandidates', JSON.stringify([{ candidateId: 'CAND-1' }]));
storage.setItem('armsClients', JSON.stringify([{ clientId: 'CLI-1' }]));

const result = initializeAppStorageState();

assert.equal(result.didReset, false, 'existing user data should not be wiped');
assert.equal(storage.getItem('armsDataResetDoneV1'), 'true', 'reset marker should still be set once');
assert.deepEqual(JSON.parse(storage.getItem('armsCandidates')), [{ candidateId: 'CAND-1' }]);
assert.deepEqual(JSON.parse(storage.getItem('armsClients')), [{ clientId: 'CLI-1' }]);

(async () => {
  const remoteState = {
    clients: [{ clientId: 'CLI-2', clientName: 'Remote Client' }],
    candidates: [{ candidateId: 'CAND-2', candidateName: 'Remote Candidate' }],
    requirements: [{ requirementId: 'REQ-2', positionTitle: 'Remote Role' }]
  };

  global.fetch = async () => ({
    ok: true,
    json: async () => remoteState
  });

  const { loadTrackerStateFromServer, persistTrackerData } = require('../js/storage.js');
  const loaded = await loadTrackerStateFromServer();
  assert.deepEqual(loaded.clients, remoteState.clients);
  assert.deepEqual(loaded.candidates, remoteState.candidates);
  assert.deepEqual(loaded.requirements, remoteState.requirements);

  const syncData = { clients: [], candidates: [], requirements: [] };
  await persistTrackerData(syncData);
  assert.equal(storage.getItem('armsClients'), JSON.stringify([]));

  console.log('Persistence guard verified');
})();
