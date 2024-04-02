const _deploy_contracts = require("../migrations/2_deploy_contracts");
const truffleAssert = require("truffle-assertions"); // npm install truffle-assertions
const BigNumber = require("bignumber.js"); // npm install bignumber.js
//const {time, expectRevert} = require('@openzeppelin/test-helpers'); // npm install @openzeppelin/test-helpers
//const Web3 = require('web3'); // npm install web3
var assert = require("assert");

var PCToken = artifacts.require("../contracts/PCToken.sol");
var Manufacturer = artifacts.require("../contracts/Manufacturer.sol");
var Wholesaler = artifacts.require("../contracts/Wholesaler.sol");
var Retailer = artifacts.require("../contracts/Retailer.sol");
var Product = artifacts.require("../contracts/Product.sol");

const oneEth = new BigNumber(1000000000000000000); // 1 eth

contract("Product", function (accounts) {
    
    // resets the contracts after each test case
    beforeEach(async () => {
        // create contract instances
        PCTokenInstance = await PCToken.new();
        ManufacturerInstance = await Manufacturer.new();
        WholesalerInstance = await Wholesaler.new();
        RetailerInstance = await Retailer.new();
        ProductInstance = await Product.new(ManufacturerInstance.address, WholesalerInstance.address, RetailerInstance.address, PCToken.address);
    });

    console.log("Testing Product contract");

    it("Register as Manufacturer", async() => {
        // register a Manufacturer
        await ManufacturerInstance.registerAsManufacturer({from: accounts[1], value: oneEth});
        // test that the Manufacturer exists
        assert.strictEqual(await ManufacturerInstance.manufacturerExists(accounts[1]), true, "Manufacturer is not successfully registered");
        // test that the Manufacturer id is 0
        assert.strictEqual(await ManufacturerInstance.checkManufacturer(0), accounts[1], "Manufacturer is not successfully registered");
    });

    it("Register as Manufacturer with Insufficient Ether", async() => {
        // attempt to register a Manufacturer with insufficient amount of Ether sent
        await truffleAssert.reverts(ManufacturerInstance.registerAsManufacturer({from: accounts[1], value: 100}), "You should commit at least 1 ether to register as a wholesaler");
    });

    it("Add Product", async() => {
        // register a Manufacturer
        await ManufacturerInstance.registerAsManufacturer({from: accounts[1], value: oneEth});
        // add Product from Manufacturer 0
        let result = await ProductInstance.addProduct(0, 1, {from: accounts[1]});
        let emittedEvent = result.logs[0];
        // test that the Manufacturer id of Product 0 is 0
        assert.equal(emittedEvent.args['0']['manufacturerId'], 0, "Product is not successfully added");
        // test that the Product is of Manufactured status
        assert.equal(emittedEvent.args['0']['status'], Product.Status.Manufactured, "Product is not successfully added");
    });

    it("Add Product from invalid Manufacturer", async() => {
        // register a Manufacturer
        await ManufacturerInstance.registerAsManufacturer({from: accounts[1], value: oneEth});
        // attempt to add a Product from non-existent Manufacturer
        await truffleAssert.reverts(ProductInstance.addProduct(1, 1, {from: accounts[2]}), "Please provide a valid manufacturer ID");
        // attempt to add a Product on other's behalf
        await truffleAssert.reverts(ProductInstance.addProduct(0, 1, {from: accounts[2]}), "Please provide a valid manufacturer ID");
    });

    it("Add Wholesaler", async() => {
        // register a Manufacturer
        await ManufacturerInstance.registerAsManufacturer({from: accounts[1], value: oneEth});
        // register a Wholesaler
        await WholesalerInstance.registerAsWholesaler({from: accounts[2], value: oneEth});
        // add Product from Manufacturer 0
        await ProductInstance.addProduct(0, 1, {from: accounts[1]});
        // add Wholesaler from Manufacturer 0
        let result = await ProductInstance.addWholesaler(0, 0, {from: accounts[1]});
        let emittedEvent = result.logs[0];
        // test that the Wholesaler id of Product 0 is 0
        assert.equal(emittedEvent.args['0']['wholesalerId'], 0, "Wholesaler is not successfully added");
    });

    it("Add Wholesaler from invalid Manufacturer", async() => {
        // register a Manufacturer
        await ManufacturerInstance.registerAsManufacturer({from: accounts[1], value: oneEth});
        // register a second Manufacturer
        await ManufacturerInstance.registerAsManufacturer({from: accounts[2], value: oneEth});
        // register a Wholesaler
        await WholesalerInstance.registerAsWholesaler({from: accounts[2], value: oneEth});
        // add Product from Manufacturer 0
        await ProductInstance.addProduct(0, 1, {from: accounts[1]});
        // add Wholesaler from Manufacturer 1
        await truffleAssert.reverts(ProductInstance.addWholesaler(0, 0, {from: accounts[2]}), "You are not the manufacturer of this product");
    });

    it("Add Wholesaler at Invalid Status", async() => {
    });

    // Unit test to check whether retailer can be successfully registered
    it("Add Retailer", async() => {
        // register a Retailer
        let retailer_id = await RetailerInstance.registerRetailer("retailer1", "PGPR #17-01, Singapore",{from: accounts[1]});
        // add product 
        let id = await ProductInstance.addProduct(0, 1, {from: accounts[1]});
        // add Wholesaler from Manufacturer 0
        await ProductInstance.addRetailer(id, retailer_id, {from: accounts[1]});
        let status = await ProductInstance.product_status(id);
        assert.equal(status, ProductInstance.Status.Retailed, "Retailer is not added successfully.");
    });

    // Check if we can successfully extract retailer information
    it("Get Retailer Details", async() => {
        let retailer_id = await RetailerInstance.registerRetailer("retailer2", "PGPR #18-01, Singapore",{from: accounts[1]});
        let name, location = await RetailerInstance.getRetailerDetails(retailer_id)
        assert.equal(name, "retailer2", "Retailer Info cannot be extracted.");
        assert.equal(location, "PGPR #18-01, Singapore", "Retailer Info cannot be extracted.");
    });

    // test retailerExists with unregistered retailer 
    it("Should return false if retailer does not exist", async () => {
        let retailerExists = await RetailerInstance.retailerExists(accounts[6]);
        assert.equal(retailerExists, false, "Retailer should not exist");
      });

    // test retailerExists with registered retailer 
    it("Should return true if retailer exists", async () => {
        let retailerExists = await RetailerInstance.retailerExists(accounts[1]);
        assert.equal(retailerExists, true, "Retailer should exist!");
      });

    // Check retailer address
    it("Check retailer address", async () => {
        let retailer_id = await RetailerInstance.registerRetailer("retailer3", "PGPR #28-01, Singapore",{from: accounts[1]});
        let address = await RetailerInstance.checkRetailer(retailer_id);
        assert.equal(address, accounts[1], "Retailer address is not recorded!");
      });

    //check pay by token
    it("Check pay by token", async () => {
        await PCTokenInstance.getCredit({from: accounts[3], value: oneEth});
        await ProductInstance.purchase_by_token(0, {from: accounts[1]});
        assert.equal(ProductInstance.is_sold(0), true, "Status is still not sold");
    });

});