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
    
    // In the Contract there is a PUBLIC instance variable 
    // mapping(address => bool) public approvers;
    // So, Solidity creates a getter function of the same name as variable ... approvers
    // and because it is a mapping ... so if we send it the key, we will get the value
    const isContributor = await campaign.methods.approvers(accounts[1]).call();
    assert(isContributor);
  });

  it('requires a minimum contribution', async () => {
    try {
      await campaign.methods.contribute()
        .send({ value: '5', from: accounts[1] });
      assert(false);  // If execution comes here, the test fails, because it should not come
                      // here because 5 is less than the mininum contribution
                      // so if it comes here that means that solidity code is NOT doing the 
                      // require()
    } catch (err) {
                      // Execution comes here if the solidity codes exits at the require()
      assert(err);    // and the test fails
    }
  });

  it('allows a manager to create a request for payment to be made to a vendor', async () => {
    await campaign.methods.createRequest('Buy batteries', '100', accounts[1])
      .send({ from: accounts[0], gas: '1000000' });
    
    // The requests is a PUBLIC instance array variable in the contract   
    // Request[] PUBLIC requests;
    // so, a getter is created for it by Solidity of the same name as variable ... requests
    // so, if we send it an index, the value at the index will be returned from the array.
    const request = await campaign.methods.requests(0).call();

    assert.equal('Buy batteries', request.description);
  });

  // ****** This is an End-to-End TEST
  / -----------------------------------
  it('processes requests', async () => {
    
    // This 10 ethers will go into the balance of the contract
    await campaign.methods.contribute()
      .send({ from: accounts[0], value: web3.utils.toWei('10', 'ether') });

    // 5 ethers needs to be sent to a vendor ..accounts[1] .. so a request is being created for it
    await campaign.methods.createRequest('A', web3.utils.toWei('5', 'ether'), accounts[1])
      .send({ from: accounts[0], gas: '1000000' });

    // Request approval
    await campaign.methods.approveRequest(0)
      .send({ from: accounts[0], gas: '1000000' });

    // Request is finalized and so the 5 ethers are being transferred to the vendor
    await campaign.methods.finalizeRequest(0)
      .send({ from: accounts[0], gas: '1000000' });

    // Get the vendor's balance to see if see if his balance is at least 104 ... it was
    // 100 to start with because ganache pre-funds all accounts with 100 ethers ....
    let balance = await web3.eth.getBalance(accounts[1]);
    balance = web3.utils.fromWei(balance, 'ether');
    balance = parseFloat(balance);

    assert(balance > 104);
  });
});
