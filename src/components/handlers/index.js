import im from 'immutable'

export const SAVE_SCENE_REQUESTED = createLoadingHandler('ipfs');
export const SAVE_SCENE_FAILED = createFailedHandler('ipfs');
export const SAVE_SCENE_SUCCEEDED = (state, action) =>
  state.set('ipfs', im.Map({
    sceneName: action.sceneName,
    hash: action.hash
  }));


export const IPNS_BIND_REQUESTED = createLoadingHandler('ipns');
export const IPNS_BIND_FAILED = createFailedHandler('ipns');
export const IPNS_BIND_SUCCEEDED = (state, action) =>
state.set('ipns', im.Map({
  ipfsHash: action.ipfsHash,
  ipnsAddress: action.ipnsAddress
}));

// ------------------------------------------
// UTILS

function createNoEffectHandler() {
  return (state) => state
}

function createLoadingHandler(key) {
  return (state, action) => state.set(key, im.Map({ loading: true }));
}

function createSucceededHandler(key) {
  return (state, action) => state.set(key, im.Map({ data: im.fromJS(action[key]) }));
}

function createFailedHandler(key) {
  return (state, action) => state.set(key, im.Map({ error: action.message || 'Unknown' }));
}
