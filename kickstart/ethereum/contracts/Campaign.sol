pragma solidity ^0.4.17;

contract CampaignFactory {
    address[] public deployedCampaigns; // address of where the campaigns (contracts) are deployed

    function createCampaign(uint minimum) public {
    
    // *** Creating a contract like how you would create class instance in OOP
        address newCampaign = new Campaign(minimum, msg.sender);
        deployedCampaigns.push(newCampaign);
    }

    function getDeployedCampaigns() public view returns (address[]) {
        return deployedCampaigns;
    }
}

contract Campaign {
// *** struct like class in OOP allows you to CREATE a CUSTOM DATA TYPE
    struct Request {
        string description;
        uint value;
        address recipient;
        bool complete;
        uint approvalCount;
        // *** mapping is just another collection data type in Solidity
        // ADVICE: NOT a good idea to use arrays and then have to LOOP over them IF you expect the array to grow really big
        //         because that will require a lot of work (GAS) and can soon get expensive for whoever will be making the 
        //         function calls into the contract that has the LOOP..... So, it is better to use the mapping data type as you 
        //         will in this document where it is being used ....
        mapping(address => bool) approvals;
    }

// *** Here we are creating a variable that will point to an array which will have instances of Request struct as elements in it
    Request[] public requests;  

    address public manager;
    uint public minimumContribution;
    
    // *** mapping is just another collection data type in Solidity
    mapping(address => bool) public approvers; // Think of these as contributors to the campaign  
    uint public approversCount;

    modifier xyz() {
        require(msg.sender == manager);
        _;
    }

    constructor (uint minimum, address creator) public {
        manager = creator;
        minimumContribution = minimum;
    }

    function contribute() public payable {
        require(msg.value > minimumContribution); 

        approvers[msg.sender] = true;  // *** creating an entry in the mapping collection
        approversCount++;              // this is really how many contributors to campaing are there
    }

    function createRequest(string description, uint value, address recipient) public xyz {
        Request memory x = Request({       // ***** creating an instance of the Struct Request. The variable x points to it
           description: description,
           value: value,         // the money the vendor will get if the request is finalized
           recipient: recipient, // The vendor who will get the money after the request is finalized
           complete: false,     // if this request is done or not. Done meaning value sent to vendor (recipient)
           approvalCount: 0     // how many contributors have approved this request
        });

        requests.push(x);
    }

    function approveRequest(uint index) public {
        Request storage request = requests[index];

// the person calling this method better be a contributor
// the require() is basically like an if-then-else. If what is inside require() is true then the code in the rest of the function 
// executes. If it is false then execution exits from this function immediately.
// approves is an instance of the mapping collection data type.  mapping(address => bool)  -- where address is the key ..and bool the value
// and that is why the author chose it .. because doing  approvers[msg.sender] will return the value of the key, which is boolean
        require(approvers[msg.sender]);  
        
        require(!request.approvals[msg.sender]); // the person better be someone who has not already approved this request before

        request.approvals[msg.sender] = true; // add the person to the collection of those who have approved this request
        request.approvalCount++;
    }

    function finalizeRequest(uint index) public xyz {
        Request storage request = requests[index];

// Majority of campaign contributors must approve the request
// If not then exit this function immediately... that is what the require() function call in Solidity means
        require(request.approvalCount > (approversCount / 2)); 
        require(!request.complete); // Don't allow approval on requests that have already completed

// ***** MONEY TRANSFER to the Vendor *******
// Basically, there is a transfer method on any address
// address.transfer(money); is the syntax  ... the address GETS the money
        request.recipient.transfer(request.value);
        request.complete = true;
    }

    function getSummary() public view returns (
      uint, uint, uint, uint, address
      ) {
        return (
          minimumContribution,
          this.balance,         // amount of money that has been contributed so far
          requests.length,
          approversCount,
          manager
        );
    }

    function getRequestsCount() public view returns (uint) {
        return requests.length;
    }
}
