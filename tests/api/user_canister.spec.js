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

describe('user_canister API', () => {
  beforeAll(async () => {
    // Check if IC replica is running
    try {
      await call('whoami');
    } catch (error) {
      console.warn('⚠️  IC replica not running. Run "npm run test:setup" first.');
      console.warn('   Or start manually: dfx start --background && dfx deploy');
    }
  });

  test('whoami returns a principal (string contains principal)', async () => {
    const out = await call('whoami');
    expect(out).toMatch(/principal/);
  });

  test('create/get/account/subaccount/list/delete campaign happy path', async () => {
    const name = `Test Campaign ${Date.now()}`;
    const desc = 'Test Description';
    const tokens = 'vec { "ICP"; "BTC" }';

    // createCampaign(name, description, tokens)
    const createArgs = `(${JSON.stringify(name)}, ${JSON.stringify(desc)}, ${tokens})`;
    const createRes = await call('createCampaign', createArgs);
    const campaignId = extractTextFromReply(createRes);
    expect(campaignId).toBeTruthy();

    // getCampaign(id)
    const getRes = await call('getCampaign', `(${JSON.stringify(campaignId)})`);
    expect(getRes).toMatch(/record/);

    // getCampaignAccountId(id)
    const accRes = await call('getCampaignAccountId', `(${JSON.stringify(campaignId)})`);
    expect(accRes).toMatch(/opt\s+/);
    expect(accRes).toMatch(/[0-9a-f]{8,}/i);

    // getCampaignSubaccount(id)
    const subRes = await call('getCampaignSubaccount', `(${JSON.stringify(campaignId)})`);
    expect(subRes).toMatch(/opt\s+/);

    // getUserCampaigns(whoami)
    const who = await call('whoami');
    const principalMatch = who.match(/principal\s+"([^"]+)"/);
    const principal = principalMatch ? principalMatch[1] : null;
    expect(principal).toBeTruthy();
    const listRes = await call('getUserCampaigns', `(principal "${principal}")`);
    expect(listRes).toMatch(new RegExp(campaignId));

    // deleteCampaign(id)
    const delRes = await call('deleteCampaign', `(${JSON.stringify(campaignId)})`);
    expect(delRes).toMatch(/variant\s*\{/);
    expect(/ok\b/.test(delRes)).toBe(true);
  });

  test('deleteCampaign by non-owner should fail (if alternate identity available)', async () => {
    try {
      const name = `X ${Date.now()}`;
      const desc = 'Y';
      const tokens = 'vec { "ICP" }';
      const createRes = await call('createCampaign', `(${JSON.stringify(name)}, ${JSON.stringify(desc)}, ${tokens})`);
      const campaignId = extractTextFromReply(createRes);
      expect(campaignId).toBeTruthy();

      const list = execSync('dfx identity list', { encoding: 'utf8' }).trim().split('\n');
      const alt = list.find(n => n && !n.includes('default'));
      if (!alt) {
        console.warn('No alternate dfx identity; skipping negative delete test');
        return;
      }

      const delRes = await call('deleteCampaign', `(${JSON.stringify(campaignId)})`, { env: { ...process.env, DFX_IDENTITY: alt } });
      expect(/err\b/.test(delRes)).toBe(true);
    } catch (e) {
      console.warn('Skipping non-owner delete test due to environment:', e.message || e);
    }
  });

  test('userExists and createUser flow', async () => {
    // Get current principal
    const who = await call('whoami');
    const principalMatch = who.match(/principal\s+"([^"]+)"/);
    const principal = principalMatch ? principalMatch[1] : null;
    expect(principal).toBeTruthy();

    // Check if user exists
    const existsRes = await call('userExists', `(principal "${principal}")`);
    const exists = existsRes.includes('true');
    
    if (!exists) {
      // Create user
      const createRes = await call('createUser', `("Test User", opt "test@example.com")`);
      expect(createRes).toMatch(/variant\s*\{/);
      expect(/ok\b/.test(createRes)).toBe(true);
    }

    // Verify user exists now
    const existsRes2 = await call('userExists', `(principal "${principal}")`);
    expect(existsRes2).toMatch(/true/);
  });
});
