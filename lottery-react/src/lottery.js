import web3 from './web3';

// When deploying the contract, console.log out the address to where it got deployed and then paste it in here
const address = '0x8DDB5D5F062C235A9eF6C65b789A3D3951134F0b';

// When compiling the smart contract, console.log out the interface code and paste it in here .....
const abi = [
  {
    constant: true,
    inputs: [],
    name: 'manager',
    outputs: [{ name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [],
    name: 'pickWinner',
    outputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [],
    name: 'getPlayers',
    outputs: [{ name: '', type: 'address[]' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    constant: false,
    inputs: [],
    name: 'enter',
    outputs: [],
    payable: true,
    stateMutability: 'payable',
    type: 'function'
  },
  {
    constant: true,
    inputs: [{ name: '', type: 'uint256' }],
    name: 'players',
    outputs: [{ name: '', type: 'address' }],
    payable: false,
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'constructor'
  }
];

// This is how you create a local proxy of the contract that is already deployed in the Blockchain....
// We will call methods on this local copy and with the magic of web3 and the Provider the method will be executed on the 
// contract that is in the Blockchain
// NOTE: *** We are NOT creating the Smart Contract here...just a LOCAL PROXY for it ....
// Remember, the real Smart Contract is created by doing a .deploy(compiled code, etc) and then a .send(transaction object)
export default new web3.eth.Contract(abi, address);
