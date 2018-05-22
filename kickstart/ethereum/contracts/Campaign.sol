pragma solidity ^0.4.17;

contract CampaignFactory {
    address[] public deployedCampaigns;

    function createCampaign(uint minimum) public {
        address newCampaign = new Campaign(minimum, msg.sender);
        deployedCampaigns.push(newCampaign);
    }

    function getDeployedCampaigns() public view returns (address[]) {
        return deployedCampaigns;
    }
}

contract Campaign {
// *** struct is just another collection data type in Solidity
    struct Request {
        string description;
        uint value;
        address recipient;
        bool complete;
        uint approvalCount;
        // *** mapping is just another collection data type in Solidity
        mapping(address => bool) approvals;
    }

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

    function Campaign(uint minimum, address creator) public {
        manager = creator;
        minimumContribution = minimum;
    }

    function contribute() public payable {
        require(msg.value > minimumContribution); 

        approvers[msg.sender] = true;  // *** creating an entry in the mapping collection
        approversCount++;              // this is really how many contributors to campaing are there
    }

    function createRequest(string description, uint value, address recipient) public xyz {
        Request memory newRequest = Request({       // creating an instance of the Struct
           description: description,
           value: value,
           recipient: recipient,
           complete: false,     // if this request is done or not. Done meaning value sent to vendor (recipient)
           approvalCount: 0     // how many contributors have approved this request
        });

        requests.push(newRequest);
    }

    function approveRequest(uint index) public {
        Request storage request = requests[index];

        require(approvers[msg.sender]);  // the person calling this method better be a contributor
        require(!request.approvals[msg.sender]); // the person better be someone who has not already approved this request before

        request.approvals[msg.sender] = true; // add the person to the collection of those who have approved this request
        request.approvalCount++;
    }

    function finalizeRequest(uint index) public restricted {
        Request storage request = requests[index];

// Majority of campaign contributors must approve the request
// If not then exit this function immediately... that is what the require() function call in Solidity means
        require(request.approvalCount > (approversCount / 2)); 
        require(!request.complete); // Don't allow approval on requests that have already completed

// ***** MONEY TRANSFER to the Vendor *******
// Basically, there is a transfer method on any address
// address.transfer(money); is the syntax
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
