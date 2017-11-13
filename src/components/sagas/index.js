/* globals fetch */
import { call, takeEvery, takeLatest, select, put, take, all } from 'redux-saga/effects'
import * as actions from '../actions';
import * as types from '../actions/action-types';

export function* handleSaveScene (action) {
  const result = yield call(saveScene, action.content, action.metadata)
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
      metadata: action.metadata,
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

export async function saveScene (content, metadata) {
  const files = []
  files.push({ data: new Buffer(content).toString('base64'), path: 'parcel.aframe' })
  // if metadata is available, add it to the files array
  if (metadata) {
    files.push({ data: new Buffer(JSON.stringify(metadata)).toString('base64'), path: 'metadata.json' })
  }
  // return: string, ipfs hash
  return await fetch('/api/ipfs', {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify({ files })
  })
    .then(res => res.json())
    .then(res => {
      if (!res.success) {
        throw new Error(res.error)
      }
      console.log('Metadata and/or content uploaded to: ', res.url)
      return res.url
    })
}

export async function bindName (name, hash) {
  return await fetch(`/api/name/${name}/${hash}`, { method: 'POST' })
    .then(res => res.json())
    .then(res => res.address);
}

export async function saveMeta (metadata) {
  // return: string, ipfs hash
  return await fetch('/api/ipfs', {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify({
      files: [
        { data: new Buffer(JSON.stringify(metadata)).toString('base64'), path: 'metadata.json' }
      ]
    })
  })
    .then(res => res.json())
    .then(res => {
      if (!res.success) {
        throw new Error(res.error)
      }
      console.log('Metadata uploaded to: ', res.url)
      return res.url
    })
}

// Not finalized, not used on its own
export async function loadMeta (hash) {
  return await fetch(`/api/ipfs/${hash}/metadata.json`)
    .then(res => (console.log(res), res.json()))
    .then(res => {
      if (!res.success) {
        throw new Error(res.error)
      }
      console.log('Metadata uploaded to: ', res.url)
      return res.url
    })
}

export function* handleLoadMeta (action) {
  try {
    const result = yield call(loadMeta, action.hash)
    yield put({ type: types.Meta.LOAD_META_SUCCEEDED, data: action.meta })
  } catch (error) {
    yield put({ type: types.Meta.LOAD_META_FAILED, message: error.message })
  }
}

export function* handlePublishMeta (action) {
  try {
    const result = yield call(saveMeta, action.meta)
    yield put({ type: types.Meta.PUBLISH_META_SUCCEEDED, data: action.meta })
  } catch (error) {
    yield put({ type: types.Meta.PUBLISH_META_FAILED, message: error.message })
  }
}

function* watchIpfsSaveScene() {
  yield takeLatest(types.Ipfs.SAVE_SCENE_REQUESTED, handleSaveScene)
}

function* watchIpfsBindName() {
  yield takeLatest(types.Ipfs.SAVE_SCENE_SUCCEEDED, handleBindName)
}

function* watchLoadMeta() {
  yield takeLatest(types.Meta.LOAD_META_REQUESTED, handleLoadMeta)
}

function* watchPublishMeta() {
  yield takeLatest(types.Meta.PUBLISH_META_REQUESTED, handlePublishMeta)
}

export default function* rootSaga() {
  yield all([
    watchIpfsSaveScene(),
    watchIpfsBindName(),
    //watchLoadMeta(),
    //watchPublishMeta()
  ]);
}
