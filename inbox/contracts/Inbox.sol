pragma solidity ^0.4.17;

contract Inbox {
    
    // Anytime you create a public class level variable, Solidity automatically gives you
    // a getter method for that variable. The name of the getter method is the same as the variable name
    
    string public message;

    function Inbox(string initialMessage) public {
        message = initialMessage;
    }
    
    function setMessage(string newMessage) public {
        message = newMessage;
    }
}
