pragma solidity ^0.5.0;
import "./PCToken.sol";

contract Retailer {

    PCToken public productTokenContract;

    constructor(PCToken productTokenAddress) public {
        productTokenContract = productTokenAddress;
    }

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
        return newRetailerId; 
    }

    function getRetailerDetails(uint Id) public view returns (string memory, string memory) {
        return (retailerArr[Id].name, retailerArr[Id].location);
    }

    function initialOwner(string memory _code, uint retailerId, uint _customerId) public payable returns(bool) {
            if (codeArr[_code].retailerId == retailerId) {       // Check if retailer owns the prodct
                if (customerArr[_customerId].isValue) {                       // Check if Customer has an account
                    codeArr[_code].customerIds.push(_customerId);               // Adding customer in code
                    codeArr[_code].status = 1;
                    uint len = customerArr[_customerId].code.length;
                    if(len == 0) {
                        customerArr[_customerId].code.push(_code);
                        customerArr[_customerId].code.push("hack");
                    } else {
                    customerArr[_customerId].code[len-1] = _code;
                    customerArr[_customerId].code.push("hack");
                    }
                    //to do: trasnfer fund
                    //
                    return true;
                }
            }
            return false;
        }





}
