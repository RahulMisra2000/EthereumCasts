const assert = require('assert');

// Just by doing this we get a complete Ethereum TEST network on our PC
const ganache = require('ganache-cli');
const Web3 = require('web3');

// We are hooking up web3 with the ganache provider so we can connect to ganache ethereum network
// which creates a COMPLETE Ethereum network on our PC. 
// And it gives us 10 unlocked accounts ... meaning.. we don't have to worry about private/public keys.
const web3 = new Web3(ganache.provider());
const { interface, bytecode } = require('../compile');

// we are declaring variables here so that they will be available inside any functions defined in this file
let accounts;
let inbox;  // this allows us to interact with the Smart Contract

// Web3 supports different kinds of networks ... All ETHEREUM related stuff is under  web3.eth.
// It is PROMISE-based so to consume the API we can either do async/await OR .then().catch()

// This runs before every Test (it)
beforeEach(async () => {
  // Get a list of all accounts
  accounts = await web3.eth.getAccounts();

  // Use one of those accounts to deploy the contract by SENDING a TRANSACTION object
  inbox = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({
      data: bytecode,            
      arguments: ['Hi there!']    // The constructor of the Smart Contract expects one string
    })
    .send({ from: accounts[0], gas: '1000000' }); // sending the TRANSACTION OBJECT
  
    // AT THIS POINT, think of inbox as our pointer to the smart contract that has just been DEPLOYED
    // Where it is deployed is in inbox.options.address
    // **** ACTUALLY IF YOU DO console.log(inbox) .. you will see a large object and you can see its contents
});


describe('Inbox', () => {
   // Test that checks if the contract is deployed
  it('deploys a contract', () => {
    // If parameter to assert.ok() is null or undefined then the test FAILS
    // 
    assert.ok(inbox.options.address);
  });

  // Test to check the return value of a method in Smart Contract
  it('has a default message', async () => {
    // Calling a getter method in the SMART CONTRACT. The getters just return something. They don't affect the Blockchain
    // so no Transaction object needs to be created and sent (so no .send() below)
    const message = await inbox.methods.message().call();   
    assert.equal(message, 'Hi there!');
  });

  it('can change the message', async () => {
    // Calling a setter method in the SMART CONTRACT
    // HERE WE HAVE TO SEND A TRANSACTION object (see .send() below) because the setter method affects the Blockchain,
    // and a Blockchain can only be affected by way of a Transaction object
    await inbox.methods.setMessage('bye').send({ from: accounts[0] });
    const message = await inbox.methods.message().call();
    assert.equal(message, 'bye');
  });
});
