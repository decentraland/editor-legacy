import * as types from './types';

export const connectWeb3 = (address) => {
  return {
    type: types.connectWeb3.request,
    address
  };
};

export const ipfsSaveSceneRequest = (sceneName, content, metadata) => ({
  type: types.saveScene.request,
  sceneName,
  content,
  metadata
});

export const ipfsBindNameRequest = (content) => ({
  type: types.bindName.request,
  content
});

export const loadMetaRequest = (meta) => ({
  type: types.loadMeta.request,
  meta
});
