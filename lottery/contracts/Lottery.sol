pragma solidity ^0.4.17;

contract Lottery {
    address public manager;
    address[] public players;

// *** msg is a global variable that Solidity provides.
// msg.sender is the address of the account that is making a call to the Smart Contract's function
    function Lottery() public {
        manager = msg.sender;
    }

// *** require() is a GLOBAL function that is available to us to do validation
// If the expression inside it returns true then execution drops to the next line 
// If it evaluates to false then the function exits immediately and nothing is changed in the contract
    function enter() public payable {
        require(msg.value > .01 ether);

        players.push(msg.sender);
    }

// There is no easy way in Solidity to generate true Random Numbers
// So the author is using a hashing algorithm, keccak256, which is like SHA256 and
// sending it 3 values ... which are not truly random... but I guess good enough for a demo
    function random() private view returns (uint) {
        // block is another global variable that we have access to
        // now is a global utility method we have access to
        // we are in the end converting the hash output to an unint (unsigned int)
        // uint is the same as uint256 ... so it can store REALLY LARGE NUMBERS
        // and the hash is a pretty long hex string ..so that is why we need a unint256
        return uint(keccak256(block.difficulty, now, players));
    }

// The address type in solidity has methods hanging off it such as .transfer()
// This is very convenient for sending money to an address ...
    function pickWinner() public restricted {
        uint index = random() % players.length;
        players[index].transfer(this.balance);
        players = new address[](0);
    }

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    function getPlayers() public view returns (address[]) {
        return players;
    }
}
