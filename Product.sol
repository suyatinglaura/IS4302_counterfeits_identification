pragma solidity ^0.5.0;
import "./PCToken.sol";
import "./Manufacturer.sol";
import "./Wholesaler.sol";
import "./Retailer.sol";

// Product contract serves as a product pool, where it stores the product information, and operations related to products
contract Product {
    enum Status {Active, Bought, Stolen} // possible status of a product
    
    Manufacturer manufacturerContract;
    Wholesaler wholesalerContract;
    Retailer retailerContract;
    PCToken productTokenContract; // PCToken attached to it
    address owner; // owner of the contract
    uint256 numProducts = 0; // keep track of number of products in the pool

    constructor(Manufacturer manufacturerAddress, Wholesaler wholesalerAddress, Retailer retailerAddress, PCToken productTokenAddress) public {
        manufacturerContract = manufacturerAddress;
        wholesalerContract = wholesalerAddress;
        retailerContract = retailerAddress;
        productTokenContract = productTokenAddress;
        owner = msg.sender;
    }

    // struct codeObj {
    //     Status status; // Default value will be Active
    //     //uint status;
    //     string brand;
    //     string model;
    //     string description;
    //     string manufactuerName;
    //     string manufactuerLocation;
    //     string manufactuerTimestamp;
    //     string retailer;
    //     // I think can change to address which makes more sense
    //     address[] customers;
    //     // new
    //     uint256 price; // in PCT amount
    // }

    // // A struct which helps create a new customer
    // struct customerObj {
    //     string name;
    //     string phone;
    //     string[] code;
    //     bool isValue;
    // }

    // struct retailerObj {
    //     string name;
    //     string location;
    // }

    struct productObj {
        Status status; // Default value will be Active
        uint256 manufacturerId;
        uint256 wholesalerId;
        uint256 retailerId;
        address customer;
    }

    mapping (uint => productObj) products;
    
    // mapping (string => codeObj) codeArr; //What is the string here ? 
    
    // mapping (address => customerObj) customerArr;

    // check msg.sender is a manufacturer
    modifier isManufacturer(address manufacturer) {
        require(manufacturerContract.manufacturerExists(manufacturer), "You are not a manufacturer");
        _;
    }

    // check msg.sender is a wholesaler
    modifier isWholesaler(address wholesaler) {
        require(wholesalerContract.wholesalerExists(wholesaler), "You are not a wholesaler");
        _;
    }

    // check msg.sender is a retailer
    modifier isRetailer(address retailer) {
        require(retailerContract.retailerExists(retailer), "You are not a retailer");
        _;
    }

    // check the provided wholesaler is valid
    modifier validWholesaler(uint wholesalerId) {
        require(wholesalerContract.checkWholesaler(wholesalerId) != address(0), "Please provide a valid wholesaler ID");
        _;
    }

    // check the provided retailer is valid
    modifier validRetailer(uint retailerId) {
        require(retailerContract.checkRetailer(retailerId) != address(0), "Please provide a valid retailer ID");
        _;
    }

    // function that adds new product (run by manufacturer)
    function addProduct() {

    }

    // function that authorize wholesaler (run by manufacturer)
    function addWholesaler() {

    }

    // function that add authorize retailer (run by wholesaler)
    function addRetailer(uint256 productId, uint256 retailerId) public isWholesaler(msg.sender) validRetailer(retailerId) {
        products[productId].retailerId = retailerId;
    }
    

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
                        codeArr[_code].status = Status.Stolen;  // Changing the status to stolen
                    }
                }
            }
        }
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
        // Update the status of the purchased product to "Bought"
        codeArr[_code].status = Status.Bought;
        return true;
    }

}