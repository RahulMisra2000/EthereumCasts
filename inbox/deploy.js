const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');

// The next line parses the contents of compile.js and executes the contents of that file
// In it, you can check that the solidity compiler is called and its output is exported
// module.exports = ....     so that when we do .require('./compile') we are able to access 
// the exported stuff here  ...
const { interface, bytecode } = require('./compile');

// This provider needs to know which Node in the Rinkeby Ethereum Network to connect to 
// and also which account to use for getting ethers out of so the node that does the work can get paid
const provider = new HDWalletProvider(
  'call glow acoustic vintage front ring trade assist shuffle mimic volume reject',
  'https://rinkeby.infura.io/orDImgKRzwNrVCDrAk5Q'
);
const web3 = new Web3(provider);
// Everything with web3 is PROMISE based !
const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode, arguments: ['Hi there!'] })
    .send({ gas: '1000000', from: accounts[0] });

  console.log('Contract deployed to', result.options.address);
};
deploy();
