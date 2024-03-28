pragma solidity ^0.5.0;
import "./PCToken.sol";
import "./Manufacturer.sol";
import "./Wholesaler.sol";
import "./Retailer.sol";

// Product contract serves as a product pool, where it stores the product information, and operations related to products
contract Product {
    enum Status {Manufactured, Wholesaled, Retailed, Sold, Stolen, Counterfeit} // possible status of a product
    
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
        uint256 price; // in terms of # of PCTokens 
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

    modifier validManufacturer(uint256 manufacturerId) {
        require(manufacturerContract.checkManufacturer(manufacturerId) != address(0), "Please provide a valid manufacturer ID");
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

    // check the product status
    modifier validStatus(uint productId, Status expectedStatus) {
        require(products[productId].status == expectedStatus, "You are not supposed to perform this operation at the current stage");
        _;
    }

    function checkProduct(uint256 productId) returns (productObj) {
        return products[productId];
        
    }

    // function that adds new product (run by manufacturer)
    function addProduct(uint256 _manufacturerId, uint256 price) public isManufacturer(msg.sender) validManufacturer(_manufacturerId)  {
        // Create a new product object with default values
        productObj memory newProduct;
        uint256 newProductId = numProducts++;
        newProduct.status = Status.Manufactured;
        newProduct.manufacturerId = _manufacturerId;
        // add price
        newProduct.price = price;
        // Add the product to the mapping
        products[newProductId] = newProduct;
         
    }

    // function that authorize wholesaler (run by manufacturer)
    function addWholesaler(uint256 productId, uint256 wholesalerId) public isManufacturer(msg.sender) validWholesaler(wholesalerId) validStatus(productId, Status.Manufactured) {
        products[productId].wholesalerId = wholesalerId;
        products[productId].status = Status.Wholesaled;
    }

    // function that add authorize retailer (run by wholesaler)
    function addRetailer(uint256 productId, uint256 retailerId) public isWholesaler(msg.sender) validRetailer(retailerId) validStatus(productId, Status.Wholesaled) {
        require(wholesalerContract.checkWholesaler(products[productId].wholesalerId)==msg.sender, "You are not the wholesaler of this product");
        products[productId].retailerId = retailerId; // update retailer id
        products[productId].status = Status.Retailed; // update product status
    }
    

    //to save gas & compare 2 strings
    function compareString(string memory str1, string memory str2) public pure returns (bool) {
        if (bytes(str1).length != bytes(str2).length) {
            return false;
        }
        return keccak256(abi.encodePacked(str1)) == keccak256(abi.encodePacked(str2));
    }

    // Function to report stolen
    function reportStolen(uint id, address _customer) public payable {
        uint i;
        Status status = products[id].status;
        require(status != Status.Stolen, "Product has been reported as stolen already.");
        require(status == Status.Sold, "Product hasn't been sold yet.");
        // only allow customer himself / herself to report stolen
        require(_customer == msg.sender, "Please ask the customer to report stolen by him/herself.");
        if (products[id].customer == _customer){
            products[id].status = Status.Stolen;
        }
    }

    function reportCounterfeit(uint id, address _customer) public payable {
        uint i;
        Status status = products[id].status;
        require(status != Status.Counterfeit, "Product has been reported as counterfeit already.");
        require(_customer == msg.sender, "Please ask the customer to report counterfeit by themselves.");
        if (products[id].customer == _customer){
            products[id].status = Status.Counterfeit;
        }
    }

// Function for customer to purchase from retailer
// Question: do we need to use _code of product as param? if no, what can we do ? 
    function purchase_by_token(uint id) public payable {

        uint256 amt = productTokenContract.checkCredit(msg.sender);
        require(amt >= products[id].price, "You don't have enough PCT in your account.");
        Status status = products[id].status;
        require(status != Status.Stolen, "Product not available for sale.");
        require(status != Status.Sold, "Product not available for sale.");
        // Deduct the token amount from the customer's account
        productTokenContract.transferCredit(address(this), products[id].price);
        // Update the status of the purchased product to "Sold"
        products[id].status = Status.Sold;
    }

}