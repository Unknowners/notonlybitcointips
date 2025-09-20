const { execSync } = require('child_process');

const CANISTER = process.env.CANISTER_ID_USER_CANISTER || 'user_canister';

function call(method, args = '()', opts = {}) {
  const cmd = `dfx canister call ${CANISTER} ${method} '${args}'`;
  try {
    return execSync(cmd, { encoding: 'utf8', ...opts });
  } catch (error) {
    throw new Error(`Canister call failed: ${error.message}`);
  }
}

function extractTextFromReply(reply) {
  const m = reply.match(/\(\s*"([^"]+)"\s*\)/);
  return m ? m[1] : '';
}

describe('ckBTC Integration API Tests', () => {
  beforeAll(async () => {
    // Check if IC replica is running
    try {
      await call('whoami');
    } catch (error) {
      console.warn('⚠️  IC replica not running. Run "npm run test:setup" first.');
    }
  });

  test('create campaign with ckBTC support', async () => {
    const name = `ckBTC Test Campaign ${Date.now()}`;
    const desc = 'Test campaign with ckBTC support';
    const tokens = 'vec { "ckBTC" }';

    const createArgs = `(${JSON.stringify(name)}, ${JSON.stringify(desc)}, ${tokens})`;
    const createRes = await call('createCampaign', createArgs);
    const campaignId = extractTextFromReply(createRes);
    expect(campaignId).toBeTruthy();

    // Verify campaign was created
    const getRes = await call('getCampaign', `(${JSON.stringify(campaignId)})`);
    expect(getRes).toMatch(/record/);
    expect(getRes).toMatch(/ckBTC/);

    // Clean up
    await call('deleteCampaign', `(${JSON.stringify(campaignId)})`);
  });

  test('create campaign with both ICP and ckBTC', async () => {
    const name = `Multi-token Test Campaign ${Date.now()}`;
    const desc = 'Test campaign with ICP and ckBTC support';
    const tokens = 'vec { "ICP"; "ckBTC" }';

    const createArgs = `(${JSON.stringify(name)}, ${JSON.stringify(desc)}, ${tokens})`;
    const createRes = await call('createCampaign', createArgs);
    const campaignId = extractTextFromReply(createRes);
    expect(campaignId).toBeTruthy();

    // Verify campaign supports both tokens
    const getRes = await call('getCampaign', `(${JSON.stringify(campaignId)})`);
    expect(getRes).toMatch(/record/);
    expect(getRes).toMatch(/ICP/);
    expect(getRes).toMatch(/ckBTC/);

    // Clean up
    await call('deleteCampaign', `(${JSON.stringify(campaignId)})`);
  });

  test('getCampaignAccountId returns valid account for ckBTC campaign', async () => {
    const name = `ckBTC Account Test ${Date.now()}`;
    const desc = 'Test account generation for ckBTC';
    const tokens = 'vec { "ckBTC" }';

    const createArgs = `(${JSON.stringify(name)}, ${JSON.stringify(desc)}, ${tokens})`;
    const createRes = await call('createCampaign', createArgs);
    const campaignId = extractTextFromReply(createRes);
    expect(campaignId).toBeTruthy();

    // Get account ID
    const accRes = await call('getCampaignAccountId', `(${JSON.stringify(campaignId)})`);
    expect(accRes).toMatch(/opt\s+/);
    expect(accRes).toMatch(/[0-9a-f]{8,}/i);

    // Clean up
    await call('deleteCampaign', `(${JSON.stringify(campaignId)})`);
  });

  test('withdrawFunds handles ckBTC (smoke test)', async () => {
    const name = `ckBTC Withdraw Test ${Date.now()}`;
    const desc = 'Test ckBTC withdrawal';
    const tokens = 'vec { "ckBTC" }';

    const createArgs = `(${JSON.stringify(name)}, ${JSON.stringify(desc)}, ${tokens})`;
    const createRes = await call('createCampaign', createArgs);
    const campaignId = extractTextFromReply(createRes);
    expect(campaignId).toBeTruthy();

    // Test withdrawal (should fail with no funds, but method should exist)
    try {
      const withdrawRes = await call('withdrawFunds', `(${JSON.stringify(campaignId)}, "ckBTC", "test-address")`);
      // If it succeeds, great. If it fails due to no funds, that's expected
      expect(withdrawRes).toBeDefined();
    } catch (error) {
      // Expected to fail with no funds
      expect(error.message).toMatch(/insufficient|balance|funds/i);
    }

    // Clean up
    await call('deleteCampaign', `(${JSON.stringify(campaignId)})`);
  });
});
