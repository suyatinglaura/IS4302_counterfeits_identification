pragma solidity ^0.5.0;
import "./PCToken.sol";
import "./Manufacturer.sol";
import "./Wholesaler.sol";
import "./Retailer.sol";

contract Product{

    address owner;

    enum Status {Active, Bought, Stolen, Counterfeit}

    PCToken productTokenContract;
    constructor(PCToken productTokenAddress) public {
        productTokenContract = productTokenAddress;
    }

    struct codeObj {
        Status status; // Default value will be Active
        //uint status;
        string brand;
        string model;
        string description;
        string manufactuerName;
        string manufactuerLocation;
        string manufactuerTimestamp;
        string retailer;
        // I think can change to address which makes more sense
        address[] customers;
        // new
        uint256 price; // in PCT amount
    }

    // A struct which helps create a new customer
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

    mapping (string => codeObj) codeArr; //What is the string here ? 
    

    //to save gas & compare 2 strings
    function compareString(string memory str1, string memory str2) public pure returns (bool) {
        if (bytes(str1).length != bytes(str2).length) {
            return false;
        }
        return keccak256(abi.encodePacked(str1)) == keccak256(abi.encodePacked(str2));
    }

    // Function to report stolen
    function reportStolen(string memory _code, address _customer) public payable {
        uint i;
        // Checking if the customer exists
        if (customerArr[_customer].isValue) {
            // Checking if the customer owns the product
            for (i = 0; i < customerArr[_customer].code.length; i++) {
                if (compareString(customerArr[_customer].code[i], _code)) {
                    if (codeArr[_code].status == Status.Bought){
                        codeArr[_code].status = Status.Counterfeit;  // Changing the status to counterfeit
                    }
                }
                return true;
            }
        }
        return false;
    }

    //report counterfeit
    function reportCounterfeit(string memory _code, address _customer) public payable returns (bool) {
        uint i;
        // Checking if the customer exists
        if (customerArr[_customer].isValue) {
            // Checking if the customer owns the product
            for (i = 0; i < customerArr[_customer].code.length; i++) {
                if (compareString(customerArr[_customer].code[i], _code)) {
                    if (codeArr[_code].status == Status.Bought){
                        codeArr[_code].status = Status.Stolen;  // Changing the status to stolen
                    }
                }
            }
        }
    }

    //verify product
    function verifyProduct(string memory _code) public returns (bool) {
        return (codeArr[_code].status != Status.Counterfeit);

    }

// Function for customer to purchase from retailer
// Question: do we need to use _code of product as param? if no, what can we do ? 
    function purchase_by_token(string memory _code) public payable returns (bool) {

        uint256 amt = productTokenContract.checkCredit(msg.sender);
        require(amt >= codeArr[_code].price, "You don't have enough PCT in your account.");
        Status status = codeArr[_code].status;
        require(status == Status.Active, "Product now available for sale.");
        // Deduct the token amount from the customer's account
        productTokenContract.transferCredit(address(this), codeArr[_code].price);
        // Update the status of the purchased product to "Sold"
        codeArr[_code].status = Status.Sold;
        return true;
    }

}