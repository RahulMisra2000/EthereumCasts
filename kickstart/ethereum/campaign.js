import web3 from './web3';
import Campaign from './build/Campaign.json';

// Here we are exporting a function that takes an input (address) and returns the result of "new new web3.eth.Contract(..)"
// Basically, creates a proxy object that will point to a contract which is at "address"
export default address => {
  return new web3.eth.Contract(JSON.parse(Campaign.interface), address);
};

// So, whoever wants to create this proxy object will do so like this
// They will first include this .js file so
// import x from 'path../campaign';

// Now x is the above function that was exported and then imported by us
// We need to execute the function.... but it needs an address as input ...
let o = x(some-address);  // Since the function returns something we accept it in "o"
// Now o is the proxy object that points to the Contract at this address  "some-address"

