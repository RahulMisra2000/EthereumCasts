pragma solidity ^0.4.17;

contract CampaignFactory {
    address[] public deployedCampaigns; // address of where the campaigns (contracts) are deployed


    // Call this function to Deploy a Campaign Contract
    function createCampaign(uint minimum) public {
    
    // -------------------------------------------------------------------------------------
    // *** Deploying a contract from inside ANOTHER contract using --- new Contract()
    // ULTRA IMP: The end user on a website (by way of web3.js and a Provider) will call this createCampaign function 
    //            of this CampaignFactory contract -- maybe when he clicks some button called "Create Campaign" on the UI. 
    //            So, inside this function msg.sender will be the end user's account
    //            and if we want the end user to pay for the deployment of the Campaign Contract then  we should 
    //            send that msg.sender to the constructor of the Campaign Contract. 
    //            If we don't then, the msg.sender inside the Campaign Contract will point to the CampaignFactory Contract's address
    //            and the CampaignFactory will be responsible for the deployment costs of all the Campaign Contracts 
    //            when in fact the end user should be paying because he is creating the Campaign for himself. 
    // -------------------------------------------------------------------------------------
    // In the past we had built a deploy.js script and we used web3.js to compile and then deploy contract.
    // We will still have the deploy.js, but we will just deploy the CampaignFactory contract
    // and whenever we want to create a campaign, we can call the createCampaign function and it will deploy it
    // and this way we will just need to record the address of the CampaignFactory contract because from it we can get to the 
    // other contracts by calling the getDeployedCampaigns function below
    
        address newCampaign = new Campaign(minimum, msg.sender);    // ******  Deploying Contract from inside another Contract
        deployedCampaigns.push(newCampaign);
    }

    // Returns a list of all the addresses where the Campaign Contracts have been deployed
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
// The money comes out of this.balance
        request.recipient.transfer(request.value);
        request.complete = true;
    }

    function getSummary() public view returns (
      uint, uint, uint, uint, address
      ) {
        return (
          minimumContribution,
// all payable methods automatically add msg.value to this.balance
// so when a .transfer() is called the money comes out of this.balance
          this.balance,         
          requests.length,
          approversCount,
          manager
        );
    }

    function getRequestsCount() public view returns (uint) {
        return requests.length;
    }
}
