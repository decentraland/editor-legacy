# Decentraland Parcel Editor

Edit a scene in real time with other users.

* WebRTC Connections are created between users to sync any changes on the same scene
* Audio and text chat is available for all concurrent users
* The save button in the top-left corner uploads the scene to IPFS to continue working on it later

Next steps:

* Uploading a parcel definition to the testnet [LAND](https://github.com/decentraland/land) contract

This is based on A-Frame's visual inspector tool for scenes. To preview the scene in first person, press
`<ctrl> + <alt> + i`. Make sure to check out A-Frame's [inspector repository](https://github.com/a-frame/inspector)

[VIEW DEMO](https://editor.decentraland.org)

## Local Development

```bash
git clone git@github.com:decentraland/editor.git
cd editor
git submodule init
git submodule update
docker-compose up
npm install
npm run build
```
