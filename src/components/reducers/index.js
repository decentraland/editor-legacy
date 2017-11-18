import { createSelector } from 'reselect'
import * as types from '../actions/types';

const INITIAL_STATE = {
  ipfs: { loading: true },
  parcelStates: { loading: true },
  ethereum: {}
};

function ipfs(state = INITIAL_STATE.ipfs, action) {
  switch (action.type) {
    case types.loadScene.request:
      return { loading: true };
    case types.loadScene.success:
      return {
        loading: false,
        scene: action.scene,
        metadata: action.metadata,
        hash: action.hash
      };
    case types.loadScene.failed:
      return { loading: false, error: action.error };
    case types.saveScene.request:
      return { loading: true };
    case types.saveScene.success:
      return {
        loading: false,
        sceneName: action.sceneName,
        metadata: action.metadata,
        hash: action.hash
      };
    case types.saveScene.failed:
      return { loading: false, error: action.error };
    default:
      return state;
  }
}

function ethereum(state = {}, action) {
  switch (action.type) {
    case types.connectWeb3.request:
      return { loading: true };
    case types.connectWeb3.success:
      return { loading: false, success: true };
    case types.connectWeb3.failed:
      return { loading: false, error: action.error };
    default:
      return state;
  }
}

function parcelState(state = {}, action) {
  let newState;
  switch (action.type) {
    case types.loadMeta.request:
      return { loading: true };
    case types.loadMeta.success:
      return {
        loading: false,
        metadata: action.metadata
      };
    case types.loadMeta.failed:
      return { loading: false, error: action.error };
    case types.loadParcel.request:
      return { ...state, loading: true };
    case types.loadParcel.requestMany:
      return { ...state, loading: true };
    case types.loadParcel.success:
      newState = { ...state, loading: false };
      newState[`${action.parcel.x},${action.parcel.y}`] = action.parcel;
      return newState;
    case types.loadParcel.many:
      newState = { ...state, loading: false };
      action.parcels.forEach(parcel => {
        newState[`${parcel.x},${parcel.y}`] = parcel;
        if (!newState.metadata) newState.metadata = parcel.metadata;
      });
      return newState;
    case types.loadParcel.failed:
      return { ...state, error: action.error };
    default:
      return state;
  }
}

export const selectors = {
  getIpfsState: state => state.ipfs,
  getParcelState: state => state.parcelState,
  ethereumState: state => state.ethereum
};

export default {
  ipfs,
  //ipns,
  ethereum,
  parcelState
};
