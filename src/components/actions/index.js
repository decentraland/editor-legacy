import * as types from './types';

export const connectWeb3 = (address) => {
  return {
    type: types.connectWeb3.request,
    address
  };
};

export const loadParcelRequest = (parcel) => ({
  type: types.loadParcel.request,
  parcel
});

export const loadManyParcelRequest = (parcels) => ({
  type: types.loadParcel.requestMany,
  parcels
});

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

export const loadMetaRequest = (x, y) => ({
  type: types.loadMeta.request,
  x,
  y
});

export const updateManyParcelsRequest = (parcels, ipfsHash) => ({
  type: types.saveMetaManyParcels.request,
  parcels,
  ipfsHash
});
