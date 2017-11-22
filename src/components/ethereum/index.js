import Web3 from 'web3'

import land from './land-token'
import reverseHash from './preimage-lookup'

class Ethereum {
  async init() {
    const provider = await this.getProvider();
    if (!provider) {
      return false;
    }

    this._web3 = new Web3(provider);
    const address = (await this._web3.eth.getAccounts())[0];
    if (!address) {
      return false;
    }
    this._address = address;

    this.land = new this._web3.eth.Contract(land.abi, land.address);
    this.land.address = land.address;

    const call = (methods, name) => (...args) => methods[name](...args).call();
    const transaction = (methods, name) => (...args) =>
      methods[name](...args).send({
        from: address
      });
    this.methods = {
      ping: transaction(this.land.methods, "ping"),
      balanceOf: call(this.land.methods, "balanceOf"),
      buildTokenId: async (x, y) =>
        (await call(this.land.methods, "buildTokenId")(x, y)).toString("hex"),
      tokenByIndex: call(this.land.methods, "tokenByIndex"),
      landMetadata: call(this.land.methods, "landMetadata"),
      ownerOfLand: call(this.land.methods, "ownerOfLand"),
      updateLandMetadata: transaction(this.land.methods, "updateLandMetadata"),
      updateManyLandMetadata: transaction(this.land.methods, "updateManyLandMetadata")
    };

    return true;
  }

  async getProvider() {
    return window.web3 && window.web3.currentProvider;
  }

  getBalance() {
    return this.methods.balanceOf(this.address);
  }

  get address() {
    return this._address;
  }

  async getTokens() {
    const amount = await this.getBalance();
    const result = [];
    for (let i = 0; i < amount; i++) {
      const hash = await this.methods.tokenByIndex(this.address, i);
      const { x, y } = reverseHash[hash];
      result.push({
        x,
        y,
        owner: this.address,
        hash,
        metadata: await this.methods.landMetadata(x, y)
      });
    }
    return result;
  }

  async getParcelData(x, y) {
    return {
      x,
      y,
      hash: await this.methods.buildTokenId(x, y),
      owner: await this.methods.ownerOfLand(x, y),
      metadata: await this.methods.landMetadata(x, y)
    };
  }

  async getParcelMetadata(x, y) {
    return await this.methods.landMetadata(x, y)
  }

  async getMany(parcels) {
    return Promise.all(
      parcels.map(parcel => this.getParcelData(parcel.x, parcel.y))
    );
  }

  async getOwnedParcels() {
    const amount = await this.getBalance();
    const result = [];
    for (let i = 0; i < amount; i++) {
      result.push(await this.getOwnedParcel(i));
    }
    //console.log("result is", result);
    return result;
  }

  async getOwnedParcel(index) {
    const hash = await this.methods.tokenByIndex(this.address, index);
    //console.log(hash, "hey", reverseHash[hash]);
    const { x, y } = reverseHash[hash];
    //console.log(index, hash, x, y);
    return {
      x,
      y,
      hash,
      owner: this.address,
      metadata: await this.methods.landMetadata(x, y)
    };
  }

  updateParcelMetadata(x, y, ipfsHash) {
    return this.methods.updateLandMetadata(x, y, ipfsHash)
  }

  updateManyParcelsMetadata(parcels, ipfsHash) {
    const coordinatesArray = parcels.split(';').map(coords => coords.split(','))
    const x = coordinatesArray.map(x => Number(x[0])) // [x1, x2, ... , xn] -> type: Array
    const y = coordinatesArray.map(y => Number(y[1])) // [y1, y2, ... , yn] -> type: Array
    return this.methods.updateManyLandMetadata(x, y, ipfsHash)
  }
}

const ethService = new Ethereum();

export default ethService;
