# Donation Hub

Donation Hub is a simple example dApp built for the ICP hackathon. It demonstrates how a Motoko backend can interact with a React + TypeScript + Vite frontend. Users can register and create donation campaigns stored on chain.

## Repository structure

- `frontend/` – React application built with Vite and Tailwind CSS
- `hackaton/` – Motoko canister source (`user_canister.mo`)
- `dfx.json` – project configuration for the DFINITY SDK (`dfx`)

## Requirements

- [DFX](https://internetcomputer.org/docs/current/developer-docs/build/install-upgrade-remove) (the DFINITY SDK)
- Node.js and npm (tested with Node 18)

Ensure `dfx` is available in your `PATH` and that Node/npm are installed.

## Starting the frontend

```bash
cd frontend
npm install
npm run dev
```

The command above installs dependencies and runs the Vite development server.

## Deploying and running the Motoko canister

1. Start the local Internet Computer replica:
   ```bash
   dfx start --background
   ```
2. Deploy the canister:
   ```bash
   dfx deploy
   ```
   After deployment, note the generated `user_canister` ID from `.dfx/local/canister_ids.json` and update `frontend/src/canisters/index.js` with that ID so the frontend can talk to your canister.

## Configuring the canister host

The frontend reads the canister host from the `VITE_CANISTER_HOST` environment
variable. Create an `.env` file inside the `frontend/` directory and specify the
desired host URL, for example:

```bash
VITE_CANISTER_HOST=http://127.0.0.1:4943
```

If this variable is not provided, the app defaults to `http://127.0.0.1:4943`.

You can now call canister methods via `dfx` or through the frontend app.
