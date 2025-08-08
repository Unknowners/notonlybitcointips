# API Tests (user_canister)

This folder will contain Node-based unit/integration tests for the canister API. Coverage:
- whoami
- createUser, userExists
- createCampaign
- getUserCampaigns, getCampaign, getCampaignAccountId, getCampaignSubaccount
- deleteCampaign
- withdrawFunds (smoke until real ledger integration)

Runner: Node + @dfinity/agent or `dfx canister call` wrappers.

To run (planned): `npm run test:api`.
