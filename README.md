# Decentraland Parcel Editor

[https://editor.decentraland.org](https://editor.decentraland.org)

Edit a scene in real time with other users.

* WebRTC Connections are created between users to sync any changes on the same scene
* Audio and text chat is available for all concurrent users
* The save button in the top-left corner uploads the scene to IPFS to continue working on it later

Next steps:

* Uploading a parcel definition to the testnet [LAND](https://github.com/decentraland/land) contract

This is based on A-Frame's visual inspector tool for scenes. To preview the scene in first person, press
`<ctrl> + <alt> + i`. Make sure to check out A-Frame's [inspector repository](https://github.com/aframevr/aframe-inspector)

## Local Development

1.
```bash
git clone git@github.com:decentraland/editor.git
cd editor
git submodule init
git submodule update
```

2.
Create file named `docker-compose.override.yaml`, copy and paste this gist of code into it and save (we do this to override environment variables):
```yaml
version: "2"

services:
  editor:
    environment:
     - NODE_ENV=dev
```

3.
```bash
docker-compose build
docker-compose up
npm install
npm run build
```

Then load the server on `https://localhost:4444/`.

## Deployment

To deploy to `editor.decentraland.org`:

 * `ssh ubuntu@editor.decentraland.org`
 * `cd editor`
 * `git pull`
 * `cd ..`
 * `sudo docker-compose down && sudo docker-compose build && sudo docker-compose up -d`

Branches are auto deployed to `editor.decentraland.today/branch/<branchname>/index.html`