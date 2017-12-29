/* globals fetch */
import { delay } from "redux-saga";
import { call, takeEvery, takeLatest, select, put, take, all, fork } from 'redux-saga/effects'

import * as actions from '../actions';
import * as types from '../actions/types';
import { selectors } from '../reducers'
import defaultScene from '../../lib/defaultScene'
import dummyParcelMeta from '../utils/parcel-metadata'
import ethService from "../ethereum";

const EDITOR_URL = process.env.REACT_APP_EDITOR_URL || process.env.EDITOR_URL || 'https://editor.decentraland.org';

export function* connectWeb3() {
  try {
    let retries = 0;
    let connected = yield call(async () => await ethService.init());

    while (!connected && retries < 3) {
      yield delay(1000);
      connected = yield call(async () => await ethService.init());
      retries += 1;
    }
    if (!connected) throw new Error("Could not connect to web3");

    const network = yield call(async () => await ethService.getNetwork());

    yield put({ type: types.connectWeb3.success, web3Connected: true, network });
  } catch (error) {
    yield put({ type: types.connectWeb3.failed, error: error.message });
  }
}

export function* handleSaveScene (action) {
  const result = yield call(saveScene, action.content, action.metadata)
  if (!result) {
    console.log('Scene couldn\'t be saved', result)
    yield put({ type: types.saveScene.failed, error: result });
  } else {
    console.log('Scene saved!', result)
    yield put({
      type: types.saveScene.success,
      sceneName: action.sceneName,
      metadata: action.metadata,
      hash: result
    });
  }
}

export function* handleBindName (action) {
  try {
    const result = yield call(bindName, action.sceneName, action.hash)
    yield put({ type: types.saveScene.success, ipfsHash: action.hash, ipnsAddress: result })
  } catch (error) {
    yield put({ type: types.saveScene.failed, error: error.message })
  }
}

export async function saveScene (html, aframe, metadata) {
  const files = []
  files.push({ data: new Buffer(html).toString('base64'), path: 'parcel.html' })
  files.push({ data: new Buffer(aframe).toString('base64'), path: 'parcel.aframe' })
  // if metadata is available, add it to the files array
  if (metadata) {
    files.push({ data: new Buffer(JSON.stringify(metadata)).toString('base64'), path: 'scene.json' })
  }
  // return: string, ipfs hash
  return await fetch(`${EDITOR_URL}/api/ipfs`, {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify({ files })
  })
    .then(res => res.json())
    .then(res => {
      if (!res.success) {
        throw new Error(res.error)
      }
      console.log('Content uploaded to: ', res.url, res)
      return res.url
    })
}

export async function loadScene (hash) {
  const defaultData = {
    default: true,
    scene: defaultScene,
    metadata: dummyParcelMeta,
    ipfs: hash
  };
  return await fetch(`${EDITOR_URL}/api/data/${hash}`, { method: 'GET' })
    .then(res => res.json())
    .then(objectData => {
      if (objectData.default) {
        return objectData;
      }
      if (!objectData.ok) {
        console.log(objectData.error)
        return defaultData;
      }
      console.log(objectData)
      return { scene: objectData.data, metadata: JSON.parse(objectData.metadata), ipfs: hash}
    })
}

export async function bindName (name, hash) {
  return await fetch(`${EDITOR_URL}/api/name/${name}/${hash}`, { method: 'POST' })
    .then(res => res.json())
    .then(res => res.address);
}

export function* loadMeta (action) {
  try {
    const metadata = yield call(
      async () => await ethService.getParcelMetadata(action.x, action.y)
    );
    yield put({ type: types.loadMeta.success, metadata })
  } catch (error) {
    yield put({ type: types.loadMeta.failed, error: error.toString() })
  }
}

export function* fetchParcel(action) {
  try {
    const parcel = yield call(
      async () => await ethService.getParcelData(action.parcel.x, action.parcel.y)
    );
    yield put({ type: types.loadParcel.success, parcel });
  } catch (error) {
    yield put({ type: types.loadParcel.failed, error: error.toString() });
  }
}

export function* handleSceneFetch(hash) {
  try {
    const result = yield call(loadScene, hash);
    yield put({ type: types.loadScene.success, scene: result.scene, metadata: result.metadata, hash });
  } catch (error) {
    yield put({ type: types.loadScene.failed, error: error.toString() });
  }
}

export function* fetchManyParcels(action) {
  try {
    const parcels = yield call(
      async () => await ethService.getMany(action.parcels)
    );
    yield put({ type: types.loadParcel.many, parcels });
    const parcelState = yield select(selectors.getParcelState)
    // TODO: handle scenes he doesn't own (owner is 0x0000000000000000000000000000000000000000 or another user)...
    if (parcelState.metadata && parcelState.metadata !== '[]') {
      yield call(handleSceneFetch, parcelState.metadata);
    } else {
      yield put({ type: types.loadParcel.createNew, parcels, scene: { default: true, metadata: dummyParcelMeta }, hash: null });
    }
  } catch (error) {
    yield put({ type: types.loadParcel.failed, error: error.toString() });
  }
}

export function* fetchBalance(action) {
  try {
    const amount = yield call(async () => await ethService.getBalance());
    yield put({ type: types.fetchBalance.loadedBalance, amount });
  } catch (error) {
    yield put({
      type: types.fetchBalance.failed,
      error: error.message,
      stack: error.stack
    });
    return;
  }
  try {
    const parcels = yield call(async () => await ethService.getOwnedParcels());
    yield put({ type: types.balanceParcel.success, parcels });
  } catch (error) {
    yield put({
      type: types.balanceParcel.failed,
      error: error.message,
      stack: error.stack
    });
  }
}

export function* updateParcelMetadata(action) {
  try {
    const transaction = yield call(
      async () => await ethService.updateParcelMetadata(action.x, action.y, action.ipfsHash)
    );
    yield put({ type: types.saveMeta.success, transaction });
  } catch (error) {
    yield put({ type: types.saveMeta.failed, error: error.toString() });
  }
}

export function* updateManyParcelsMetadata(action) {
  try {
    console.log(action)

    const transaction = yield call(
      async () => await ethService.updateManyParcelsMetadata(action.parcels, action.ipfsHash)
    );
    yield put({ type: types.saveMetaManyParcels.success, transaction });
  } catch (error) {
    yield put({ type: types.saveMetaManyParcels.failed, error: error.toString() });
  }
}

export default function* rootSaga() {
  yield takeLatest(types.saveScene.request, handleSaveScene);
  yield takeEvery(types.loadMeta.request, loadMeta);
  yield takeEvery(types.loadParcel.request, fetchParcel);
  yield takeEvery(types.loadParcel.requestMany, fetchManyParcels);
  yield takeEvery(types.connectWeb3.request, connectWeb3);
  yield takeEvery(types.connectWeb3.success, fetchBalance);
  yield takeEvery(types.fetchBalance.request, fetchBalance);
  yield takeEvery(types.saveMeta.request, updateParcelMetadata);
  yield takeEvery(types.saveMetaManyParcels.request, updateManyParcelsMetadata);

  yield put({ type: types.connectWeb3.request });
}
