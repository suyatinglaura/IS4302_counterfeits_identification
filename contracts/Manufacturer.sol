pragma solidity ^0.5.0;
import "./PCToken.sol";
import "./User.sol";
import "./ProductInterface.sol";

contract Manufacturer is User {
    PCToken productTokenContract; // PCToken attached to it
    ProductInterface productContract; // Product attached to it
    
    address owner; // owner of the contract
    uint256 numManufacturers = 0;
    uint256 commitmentFee = 100;
    uint256 limit = 2; // the number of total reports should be at most 2 times the number of postive reports
	mapping (uint256 => address) manufacturers; // keep track of the address of each manufacturer
    mapping (address => bool) manufacturersList; // keep track of the existence of each manufacturer
    mapping (uint256 => uint256) totalReport; // keep track of the total number of reports for each manufacturer
    mapping (uint256 => uint256) posReport; // keep track of the number of positive reports for each manufacturer

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

    // user register as a manufacturer
    function register() public returns(uint256) {
        // one address is allowed to register once
        require(manufacturersList[msg.sender]==false, "You are already a manufacturer");

        // transfer the commitment fee before registering as a manufacturer
        productTokenContract.transferCredit(address(this), commitmentFee);
        // assign an ID to the manufacturer
        uint256 newManufacturerId = ++numManufacturers;
        manufacturers[newManufacturerId] = msg.sender;
        manufacturersList[msg.sender] = true;
        return newManufacturerId;  
    }

    // check manufacturer information
    function checkId(uint256 manufacturerId) public view returns(address) {
        return manufacturers[manufacturerId];   
    }

    // check manufacturer existence
    function doesExist(address manufacturer) public view returns(bool) {
        return manufacturersList[manufacturer];
    }

    // receives report from wholesalers
    function reportAuthenticity(uint256 manufacturerId, bool pos) public {
        // this function can only be called by Product Contract
        require(msg.sender==address(productContract), "Report can only be sent from Product Contract");
        
        // update number of postive reports and total number of reports
        if (pos) {
            posReport[manufacturerId]+=1;
        }
        totalReport[manufacturerId]+=1;
        // force exit when number of negative reports exceeds the limits
        if (totalReport[manufacturerId] > posReport[manufacturerId]*limit) {
            this.forceExit(manufacturerId);
        }
    }

    // manufacturer is forced to exit if they received too many negative reports
    function forceExit(uint256 manufacturerId) public {
        // this function can only be called by the contract
        require(msg.sender==address(this), "You are not allow to execute force exit");
        
        // retrieve the address of the manufacturer
        address manufacturerAdd = manufacturers[manufacturerId];
        // clear records for the provided manufacturer
        manufacturers[manufacturerId] = address(0);
        manufacturersList[manufacturerAdd] = false;
        totalReport[manufacturerId] = 0;
        posReport[manufacturerId] = 0;
    }

    // manufacturer can self exit the market and the commitment fee will the refunded
    function selfExit(uint256 manufacturerId) public {
        // retrieve the address of the manufacturer
        address manufacturerAdd = manufacturers[manufacturerId];
        // this function can only be called by manufacturers themselves
        require(msg.sender==manufacturerAdd, "You are not allowed to execute self exit on other's behalf");
        
        // refund the manufacturer
        if (totalReport[manufacturerId]>0) {
            productTokenContract.transferCreditFrom(address(this), msg.sender, commitmentFee*totalReport[manufacturerId]/posReport[manufacturerId]);
        } else {
            productTokenContract.transferCreditFrom(address(this), msg.sender, commitmentFee);
        }
        // clear records for the provided manufacturer
        manufacturers[manufacturerId] = address(0);
        manufacturersList[manufacturerAdd] = false;
        totalReport[manufacturerId] = 0;
        posReport[manufacturerId] = 0;
    }
}