pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2; // add to enable struct returning
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

    struct productObj {
        Status status; // default value will be Manufactured
        uint256 manufacturerId;
        uint256 wholesalerId;
        uint256 retailerId;
        address customer;
        uint256 price; // in terms of # of PCTokens 
        uint256 id;
    }

    mapping (uint256 => productObj) products;

    event returnProduct(productObj);

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

    // check the id and address of the provided manufacturer match
    modifier validManufacturer(uint256 manufacturerId, address manufacturer) {
        require(manufacturerContract.checkManufacturer(manufacturerId) == manufacturer, "Please provide a valid manufacturer ID");
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
    
    // checkOwner
    modifier ownerOnly(uint256 productId) {
        require(products[productId].customer == msg.sender);
        _;
    }

    // check valid id
     modifier validProductId(uint256 productId) {
        require((productId >0)&&(productId <= numProducts), "Please provide a valid product ID");
        _;
    }

    // check product information
    function checkProduct(uint256 productId) view public returns (productObj memory) {
        return products[productId];
    }

    // function that adds new product (run by manufacturer)
    function addProduct(uint256 _manufacturerId) public validManufacturer(_manufacturerId, msg.sender) returns (uint256) {
        // create a new product object with default values
        productObj memory newProduct;
        // update product information
        uint256 newProductId = ++numProducts;
        newProduct.status = Status.Manufactured;
        newProduct.manufacturerId = _manufacturerId;
        newProduct.id = newProductId;
        // add the product to the mapping
        products[newProductId] = newProduct;
        emit returnProduct(newProduct);
        return newProductId;
    }

    // function that authorizes wholesaler (run by manufacturer)
    function addWholesaler(uint256 productId, uint256 wholesalerId) public validProductId(productId) isManufacturer(msg.sender) validWholesaler(wholesalerId) validStatus(productId, Status.Manufactured) {
        require(manufacturerContract.checkManufacturer(products[productId].manufacturerId)==msg.sender, "You are not the manufacturer of this product");
        products[productId].wholesalerId = wholesalerId; // update wholesaler id
        emit returnProduct(products[productId]);
    }

    // function that is called after wholesaler receive the product (run by wholesaler)
     function receivedByWholesaler(uint256 productId) public validProductId(productId) isWholesaler(msg.sender) validStatus(productId, Status.Manufactured) {
        require(wholesalerContract.checkWholesaler(products[productId].wholesalerId)==msg.sender, "You are not the wholesaler of this product");
        products[productId].status = Status.Wholesaled; // update product status
        emit returnProduct(products[productId]);
    }

    // function that adds authorize retailer (run by wholesaler)
    function addRetailer(uint256 productId, uint256 retailerId) public validProductId(productId) isWholesaler(msg.sender) validRetailer(retailerId) validStatus(productId, Status.Wholesaled) {
        require(wholesalerContract.checkWholesaler(products[productId].wholesalerId)==msg.sender, "You are not the wholesaler of this product");
        products[productId].retailerId = retailerId; // update retailer id
        emit returnProduct(products[productId]);
    }

    // function that is called after retailer receive the product (run by retailer)
    function receivedByRetailer(uint256 productId, uint256 price) public validProductId(productId) isRetailer(msg.sender) validStatus(productId, Status.Wholesaled) {
        require(retailerContract.checkRetailer(products[productId].retailerId)==msg.sender, "You are not the retailer of this product");
        require(price>0, "Price of the product should be greater than 0");
        products[productId].price = price; // update price
        products[productId].status = Status.Retailed; // update product status
        emit returnProduct(products[productId]);
    }

    // function that indicates customer purchase (run by retailer)
    function purchasedByCustomer(uint productId, address customer) public validProductId(productId) isRetailer(msg.sender) validStatus(productId, Status.Retailed) {
        require(retailerContract.checkRetailer(products[productId].retailerId) == msg.sender, "You are not the retailer of this product");
        products[productId].status = Status.Sold; // update product status
        products[productId].customer = customer; // add customer
        emit returnProduct(products[productId]);
    }

    // function for customer to purchase from retailer (run by customer)
    function purchasedByToken(uint productId) public validProductId(productId) validStatus(productId, Status.Retailed) {
        // deduct the token amount from the customer's account
        productTokenContract.transferCredit(retailerContract.checkRetailer(products[productId].retailerId), products[productId].price);
        // update the status of the purchased product to "Sold"
        products[productId].status = Status.Sold;
        products[productId].customer = msg.sender;
        emit returnProduct(products[productId]);
    }
    
    // function to report stolen case
    function reportStolen(uint productId) public validProductId(productId) {
        productObj memory product = products[productId];
        bool validReport = false;
        if ((product.status == Status.Manufactured)&&(manufacturerContract.checkManufacturer(product.manufacturerId) == msg.sender)) {
            validReport = true; // report by manufacturer
        } else if (((product.status == Status.Manufactured)||(product.status == Status.Wholesaled))&&(wholesalerContract.checkWholesaler(product.wholesalerId) == msg.sender)){
            validReport = true; // report by wholesaler
        } else if (((product.status == Status.Wholesaled)||(product.status == Status.Retailed))&&(retailerContract.checkRetailer(product.retailerId) == msg.sender)) {
            validReport = true; // report by retailer
        } else if ((product.status == Status.Sold)&&(product.customer == msg.sender)) {
            validReport = true; // report by customer
        }
        require(validReport, "The report is invalid");
        products[productId].status = Status.Stolen; // update product status
        emit returnProduct(products[productId]);
    }
    
    // function to report counterfeit
    function reportCounterfeit(uint productId) public validStatus(productId, Status.Sold) {
        require(products[productId].customer == msg.sender, "You are not the owner of this product");
        // owner of the prduct needs to transfer some deposit to report a counterfeit case
        productTokenContract.transferCredit(address(this), products[productId].price/2);
        products[productId].status = Status.Counterfeit; // update product status
        emit returnProduct(products[productId]);
    }
}