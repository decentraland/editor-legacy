import * as types from './action-types';

export const ipfsSaveSceneRequest = (sceneName, content) => ({
  type: types.Ipfs.SAVE_SCENE_REQUESTED,
  sceneName,
  content
});

export const ipfsBindNameRequest = (content) => ({
  type: types.Ipfs.SAVE_SCENE_REQUESTED,
  content
});
