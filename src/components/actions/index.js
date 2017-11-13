import * as types from './action-types';

export const ipfsSaveSceneRequest = (sceneName, content, metadata) => ({
  type: types.Ipfs.SAVE_SCENE_REQUESTED,
  sceneName,
  content,
  metadata
});

export const ipfsBindNameRequest = (content) => ({
  type: types.Ipfs.SAVE_SCENE_REQUESTED,
  content
});

export const publishMetaRequest = (meta) => ({
  type: types.Meta.PUBLISH_META_REQUESTED,
  meta
});
