pragma solidity ^0.5.0;
import "./PCToken.sol";

contract Retailer {

    PCToken public productTokenContract;

    // constructor(PCToken productTokenAddress) public {
    //     productTokenContract = productTokenAddress;
    // }

    struct codeObj {
        uint status;
        string brand;
        string model;
        string description;
        string manufacturerName;
        string manufacturerLocation;
        string manufacturerTimestamp;
        uint retailerId;
        uint[] customerIds;
    }

    struct customerObj {
        string name;
        string phone;
        string[] code;
        bool isValue;

    }

    struct retailerObj {
        string name;
        string location;
    }

    mapping (string => codeObj) public codeArr;
    mapping (uint => customerObj) public customerArr;

    mapping(uint256 => retailerObj) public retailerArr; //retailerID to retailerObj
    mapping (address => bool) retailerList; // keep track of the existence of each retailer
    mapping (uint256 => address) retailers;
    event returnRetailer(uint256);


    uint256 public numRetailers = 0;

    function registerRetailer(
        string memory name,
        string memory location
    ) public payable returns(uint256) {
        retailerObj memory newRetailer = retailerObj(
            name,
            location
        );
        
        uint256 newRetailerId = numRetailers++;
        retailerArr[newRetailerId] = newRetailer;
        retailerList[msg.sender] = true;
        retailers[newRetailerId] = msg.sender;

        return newRetailerId; 
    }

    function getRetailerDetails(uint Id) public view returns (string memory, string memory) {
        return (retailerArr[Id].name, retailerArr[Id].location);
    }


    // function that checks wholesaler existence
    function retailerExists(address retailer) public view returns(bool) {
        return retailerList[retailer];
    }

    // Checks retailer information
    function checkRetailer(uint256 retailerId) public view returns(address) {
        return retailers[retailerId];   
    }





}
