const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const { interface, bytecode } = require('../compile');

let lottery;
let accounts;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

 
// The way to read this is, deploying (.deploy()) a contract (.Contract()) and sending (.send()) a Transaction because 
// a Block will need to get mined and transaction details will be placed in it and the block will then be added to the Blockchain
// so for this work money needs to be paid ...
  lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: '1000000' });
});

// If lottery.options.address is truthy that means we can assume that the contract was deployed because that is address where the 
// contract gets deployed
describe('Lottery Contract', () => {
  it('deploys a contract', () => {
    assert.ok(lottery.options.address);
  });
  
// If you look at the contract, you will see that the enter function is a 'payable' function type and so money needs to be sent to it 
// at the time of invoking the enter function.
// This affects the Blockchain and so a transaction needs to be created and sent and that is why .send() is being used
// In it we specify, which account will be making the payment and also how much payment is being made in the unit 'wei'.
// It is easier to use the utility function .toWei to convert ether into wei .... just easier to specify ether units in code that is why)
  it('allows one account to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    });

    
// the getPlayers() function is a getter and so it does not affect the Blockchain and so NO NEED to create and send a Transaction....
// here we are telling which account is doing this .....  so inside the getPlayers() function if we did msg.sender we will get the
// account which is being sent in the from: property
    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });

    
// the first parameter to assert ....  is what value "should be" ... and the second parameter is what value "is"
    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length);
  });

  it('allows multiple accounts to enter', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether')
    });
    await lottery.methods.enter().send({
      from: accounts[1],
      value: web3.utils.toWei('0.02', 'ether')
    });
    await lottery.methods.enter().send({
      from: accounts[2],
      value: web3.utils.toWei('0.02', 'ether')
    });

    const players = await lottery.methods.getPlayers().call({
      from: accounts[0]
    });

    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);
    assert.equal(3, players.length);
  });

  it('requires a minimum amount of ether to enter', async () => {
  
  // REMEMBER, the web3 API is FULLY promise-based.... so we either do ...     .then().catch() kinda syntax to consume the Promise
  // OR we do the async/await syntax to consume the Promise  ... In async/await we have to use try/catch to catch Promise rejects
  // as shown below
    try {
      await lottery.methods.enter().send({
        from: accounts[0],
        value: 0
      });
      assert(false);    // when this executes the test fails
    } catch (err) {
      
      // ******* assert() checks for truthiness of the content. If it is then the test passes. If it is not then it fails
      // DETOUR: assert.ok() checks for the existence of content. If it exists then the test passes otherwise it fails
      assert(err);
    }
  });

  it('only manager can call pickWinner', async () => {
    try {
      await lottery.methods.pickWinner().send({
        from: accounts[1]
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('sends money to the winner and resets the players array', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('2', 'ether')
    });

    const initialBalance = await web3.eth.getBalance(accounts[0]);
    await lottery.methods.pickWinner().send({ from: accounts[0] });
    const finalBalance = await web3.eth.getBalance(accounts[0]);
    const difference = finalBalance - initialBalance;

    assert(difference > web3.utils.toWei('1.8', 'ether'));
  });
});
