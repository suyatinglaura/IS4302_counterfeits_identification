pragma solidity ^0.5.0;
import "./PCToken.sol";
import "./User.sol";
import "./ProductInterface.sol";

// Wholesaler contract serves as a wholesaler pool, where it stores the wholesaler information
contract Wholesaler is User {
    PCToken productTokenContract; // PCToken attached to it
    ProductInterface productContract; // Product attached to it

    address owner; // owner of the contract
    uint256 numWholesalers = 0;
    uint256 commitmentFee = 100;
    uint256 limit = 2; // the number of total reports should be at most 2 times the number of postive reports
    mapping (uint => address) wholesalers; // keep track of the address of each wholesaler
    mapping(address => bool) wholesalersList; // keep track of the existence of each wholesaler
    mapping (uint256 => uint256) totalReport; // keep track of the total number of reports for each wholesaler
    mapping (uint256 => uint256) posReport; // keep track of the number of positive reports for each wholesaler

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

    // user register as a wholesaler
    function register() public returns(uint256) {
        // one address is allowed to register once
        require(wholesalersList[msg.sender]==false, "You are already a wholesaler");

        // transfer the commitment fee before registering as a wholesaler
        productTokenContract.transferCredit(address(this), commitmentFee);
        // assign an ID to the wholesaler
        uint256 newWholesalerId = ++numWholesalers;
        wholesalers[newWholesalerId] = msg.sender; // update wholesalers
        wholesalersList[msg.sender] = true; // update wholesaler list
        return newWholesalerId;   // return new wholesalerId
    }

    // check wholesaler information
    function checkId(uint256 wholesalerId) public view returns(address) {
        return wholesalers[wholesalerId];   // return wholesaler address
    }

    // check wholesaler existence
    function doesExist(address wholesaler) public view returns(bool) {
        return wholesalersList[wholesaler];
    }

    // receive report from retailers
    function reportAuthenticity(uint256 wholesalerId, bool pos) public {
        // this function can only be called by Product Contract
        require(msg.sender==address(productContract), "Report can only be sent from Product Contract");
        
        // update number of postive reports and total number of reports
        if (pos) {
            posReport[wholesalerId]+=1;
        }
        totalReport[wholesalerId]+=1;
        // force exit when number of negative reports exceeds the limits
        if (totalReport[wholesalerId] > posReport[wholesalerId]*limit) {
            this.forceExit(wholesalerId);
        }
    }

    // wholesaler is forced to exit if they received too many negative reports
    function forceExit(uint256 wholesalerId) public {
        // this function can only be called by the contract
        require(msg.sender==address(this), "You are not allow to execute force exit");
        
        // retrieve the address of the wholesaler
        address wholesalerAdd = wholesalers[wholesalerId];
        // clear records for the provided wholesaler
        wholesalers[wholesalerId] = address(0);
        wholesalersList[wholesalerAdd] = false;
        totalReport[wholesalerId] = 0;
        posReport[wholesalerId] = 0;
    }

    // wholesaler can self exit the market and the commitment fee will the refunded
    function selfExit(uint256 wholesalerId) public {
        // retrieve the address of the wholesaler
        address wholesalerAdd = wholesalers[wholesalerId];
        // this function can only be called by wholesalers themselves
        require(msg.sender==wholesalerAdd, "You are not allowed to execute self exit on other's behalf");
        
        // refund the wholesaler
        if (totalReport[wholesalerId]>0) {
            productTokenContract.transferCreditFrom(address(this), msg.sender, commitmentFee*totalReport[wholesalerId]/posReport[wholesalerId]);
        } else {
            productTokenContract.transferCreditFrom(address(this), msg.sender, commitmentFee);
        }
        // clear records for the provided wholesaler
        wholesalers[wholesalerId] = address(0);
        wholesalersList[wholesalerAdd] = false;
        totalReport[wholesalerId] = 0;
        posReport[wholesalerId] = 0;
    }
}