const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');

const provider = new HDWalletProvider(
  
  // Using BIP39, this mnemonic will reveal all the external accounts associated with the mnemonic
  'game saddle oyster laundry equal loop lunch allow cactus endless hover unfair',
  
  // *** The INFURA service gave us this URL of an Ethereum node on the Rinkeby network that the provider can connect to
  'https://rinkeby.infura.io/orDImgKRzwNrVCDrAk5Q'
);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  const result = await new web3.eth.Contract(JSON.parse(interface))
  // anytime you see .deploy() ... it means a smart contract is being deployed
    .deploy({ data: bytecode })
  // anytime you see .send() ... it means that a TRANSACTION is being created and will be sent because a Block needs to be mined 
  // and the transaction info will be placed in it ...so "WORK" (aka Proof of work  aka ****** MINING ***** ) NEEDS TO BE DONE ....
  // and therefore we are specifying gas (remuneration for work) and also who will pay for it (account that will pay for it) ... 
    .send({ gas: '1000000', from: accounts[0] });

  
  // This is where the smart contract will be deployed to.
  // ******** Anyone who wants to interact with the smart contract will need this address ....
  console.log('Contract deployed to', result.options.address);
};
deploy();
