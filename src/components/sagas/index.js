/* globals fetch */
import { call, takeEvery, takeLatest, select, put, take, all } from 'redux-saga/effects'
import * as actions from '../actions';
import * as types from '../actions/action-types';

export function* handleSaveScene (action) {
  const result = yield call(saveScene, action.content)
  if (!result) {
    console.log('Scene couldn\'t be saved', result)
    yield put({
      type: types.Ipfs.SAVE_SCENE_FAILED,
      error: result
    });
  } else {
    console.log('Scene saved!', result)
    yield put({
      type: types.Ipfs.SAVE_SCENE_SUCCEEDED,
      sceneName: action.sceneName,
      hash: result
    });
  }
}

export function* handleBindName (action) {
  try {
    const result = yield call(bindName, action.sceneName, action.hash)
    yield put({ type: types.Ipfs.IPNS_BIND_SUCCEEDED, ipfsHash: action.hash, ipnsAddress: result })
  } catch (error) {
    yield put({ type: types.Ipfs.IPNS_BIND_FAILED, message: error.message })
  }
}

export async function saveScene (content) {
  // return: string, ipfs hash
  return await fetch('/api/ipfs', {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify({ files: [{ data: new Buffer(content).toString('base64'), path: 'parcel.aframe' }] })
  })
    .then(res => res.json())
    .then(res => {
      if (!res.success) {
        throw new Error(res.error)
      }
      return res.url
    })
}

export async function bindName (name, hash) {
  return await fetch(`/api/name/${name}/${hash}`, { method: 'POST' })
    .then(res => res.json())
    .then(res => res.address);
}

function* watchIpfsSaveScene() {
  yield takeLatest(types.Ipfs.SAVE_SCENE_REQUESTED, handleSaveScene)
}

function* watchIpfsBindName() {
  yield takeLatest(types.Ipfs.SAVE_SCENE_SUCCEEDED, handleBindName)
}

export default function* rootSaga() {
  yield all([
    watchIpfsSaveScene(),
    watchIpfsBindName()
  ]);
}
