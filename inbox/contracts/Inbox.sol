// This specifies which version of the Solidity compiler to use when compiling this Smart Contract
// Notice a smart contract is just like a class in OOP languages
pragma solidity ^0.4.17;

contract Inbox {
    
    // Anytime you create a public class level variable, Solidity automatically gives you
    // a getter method for that variable. The name of the getter method is the same as the variable name
    
    string public message;

    // This is a getter method because it just returns something and does not affect the class level variables
    function Inbox(string initialMessage) public {
        message = initialMessage;
    }
    
    // This is a setter function since it affects the class level variable.
    // The smart transaction code and the class level variables ARE STORED IN A BLOCK in a BLOCKCHAIN
    // So a setter method affects the Blockchain ... and to affect the blockchain one has to SEND a Transaction object
    // so, when calling this method, the caller will also need to send a transaction object along...
    function setMessage(string newMessage) public {
        message = newMessage;
    }
}
