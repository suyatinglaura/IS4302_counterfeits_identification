pragma solidity ^0.5.0;
import "./PCToken.sol";
import "./User.sol";
import "./ProductInterface.sol";

// Retailer contract serves as a retailer pool, where it stores the retailer information
contract Retailer is User {
    PCToken productTokenContract; // PCToken attached to it
    ProductInterface productContract; // Product attached to it
    
    address owner; // owner of the contract
    uint256 numRetailers = 0;
    uint256 commitmentFee = 100;
    uint256 limit = 2; // the number of total reports should be at most 2 times the number of postive reports
    mapping (uint256 => address) retailers; // keep track of the address of each retailer
    mapping (address => bool) retailersList; // keep track of the existence of each retailer
    mapping (uint256 => uint256) totalReport; // keep track of the total number of reports for each retailer
    mapping (uint256 => uint256) posReport; // keep track of the number of positive reports for each retailer  

    constructor(PCToken productTokenInstance) public {
        productTokenContract = productTokenInstance;
        owner = msg.sender;
    }

    // set product attached to the contract
    function setProduct(ProductInterface _productContract) public {
        // this function can only be called by the owner
        require(msg.sender==owner, "You are not the owner of this contract");
        // set product contract
        productContract = _productContract;
    }

    // user register as a retailer
    function register() public returns(uint256) {   
        // one address is allowed to register once
        require(retailersList[msg.sender]==false, "You are already a retailer");
        
        // transfer the commitment fee before registering as a retailer
        productTokenContract.transferCredit(address(this), commitmentFee);
        // assign an ID to the retailer
        uint256 newRetailerId = ++numRetailers;
        retailers[newRetailerId] = msg.sender;
        retailersList[msg.sender] = true;
        return newRetailerId; 
    }

    // check retailer information
    function checkId(uint256 retailerId) public view returns(address) {
        return retailers[retailerId];   
    }

    // check retailer existence
    function doesExist(address retailer) public view returns(bool) {
        return retailersList[retailer];
    }

    // receive report from customers
    function reportAuthenticity(uint256 retailerId, bool pos) public {
        // this function can only be called by Product Contract
        require(msg.sender==address(productContract), "Report can only be sent from Product Contract");
        
        // update number of postive reports and total number of reports
        if (pos) {
            posReport[retailerId]+=1;
        }
        totalReport[retailerId]+=1;
        // force exit when number of negative reports exceeds the limits
        if (totalReport[retailerId] > posReport[retailerId]*limit) {
            this.forceExit(retailerId);
        }
    }

    // retailer is forced to exit if they received too many negative reports
    function forceExit(uint256 retailerId) public {
        // this function can only be called by the contract
        require(msg.sender==address(this), "You are not allow to execute force exit");
        
        // retrieve the address of the retailer
        address retailerAdd = retailers[retailerId];
        // clear records for the provided retailer
        retailers[retailerId] = address(0);
        retailersList[retailerAdd] = false;
        totalReport[retailerId] = 0;
        posReport[retailerId] = 0;
    }

    // retailer can self exit the market and the commitment fee will the refunded
    function selfExit(uint256 retailerId) public {
        // retrieve the address of the retailer
        address retailerAdd = retailers[retailerId];
        // this function can only be called by retailers themselves
        require(msg.sender==retailerAdd, "You are not allowed to execute self exit on other's behalf");
        
        // refund the retailer
        if (totalReport[retailerId]>0) {
            productTokenContract.transferCreditFrom(address(this), msg.sender, commitmentFee*posReport[retailerId]/totalReport[retailerId]);
        } else {
            productTokenContract.transferCreditFrom(address(this), msg.sender, commitmentFee);
        }
        // clear records for the provided retailer
        retailers[retailerId] = address(0);
        retailersList[retailerAdd] = false;
        totalReport[retailerId] = 0;
        posReport[retailerId] = 0;
    }
}
