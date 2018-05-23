const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

// This provider gives us a handful of pre-funded (100 ethers each I think) accounts
const web3 = new Web3(ganache.provider());

// This contains the compiled CampaignFactory contract
const compiledFactory = require('../ethereum/build/CampaignFactory.json');
// This contains the compiled Campaign contract
const compiledCampaign = require('../ethereum/build/Campaign.json');

let accounts;           // This will contain the list of pre-funded accounts provided by ganache provider
let factory;            // This will contain the CampaignFactory contract's address where it is deployed
let campaignAddress;    // This will contain the Campaign contract's address where it is deployed
let campaign;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();    // The ganache provider gives us a handful of pre-funded accounts

  // DEPLOY the ContractFactory contract
  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send({ from: accounts[0], gas: '1000000' });

  // Calling createCampaign function of the ContractFactory contract, 
  // that function inside the contract deploys the Campaign contract
  await factory.methods.createCampaign('100')
    .send({ from: accounts[0], gas: '1000000' });
  
  // Get the address of the Campaign contract that was just deployed
  // The syntax below takes the first element from the returned array
  // and assigns it to the variable campaignAddress
  [campaignAddress] = await factory.methods.getDeployedCampaigns().call();
 
  // Now that we have the address of the Campaign contract that was deployed, we can
  // create a local contract proxy which will point to the just created campaign contract
  campaign = await new web3.eth.Contract(
    JSON.parse(compiledCampaign.interface),
    campaignAddress     // campaign contract address
  );
});

// ***** Now that we have the local proxy for the Campaign contract, we can 
// call the methods on the contract and test them ...

describe('Campaigns', () => {
  it('deploys a factory and a campaign', () => {
    assert.ok(factory.options.address);
    assert.ok(campaign.options.address);
  });

  it('marks caller as the campaign manager', async () => {
    const manager = await campaign.methods.manager().call();
    assert.equal(accounts[0], manager);
  });

  it('allows people to contribute money and marks them as approvers', async () => {
    await campaign.methods.contribute()
      .send({ value: '200', from: accounts[1] });
    
    const isContributor = await campaign.methods.approvers(accounts[1]).call();
    assert(isContributor);
  });

  it('requires a minimum contribution', async () => {
    try {
      await campaign.methods.contribute()
        .send({ value: '5', from: accounts[1] });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('allows a manager to create a request for payment to be made to a vendor', async () => {
    await campaign.methods.createRequest('Buy batteries', '100', accounts[1])
      .send({ from: accounts[0], gas: '1000000' });
    
    const request = await campaign.methods.requests(0).call();

    assert.equal('Buy batteries', request.description);
  });

  it('processes requests', async () => {
    await campaign.methods.contribute()
      .send({ from: accounts[0], value: web3.utils.toWei('10', 'ether') });

    await campaign.methods.createRequest('A', web3.utils.toWei('5', 'ether'), accounts[1])
      .send({ from: accounts[0], gas: '1000000' });

    await campaign.methods.approveRequest(0)
      .send({ from: accounts[0], gas: '1000000' });

    await campaign.methods.finalizeRequest(0)
      .send({ from: accounts[0], gas: '1000000' });

    let balance = await web3.eth.getBalance(accounts[1]);
    balance = web3.utils.fromWei(balance, 'ether');
    balance = parseFloat(balance);

    assert(balance > 104);
  });
});
