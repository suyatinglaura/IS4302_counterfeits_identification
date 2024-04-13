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
        // test that the Manufacturer id is 1
        assert.strictEqual(await ManufacturerInstance.checkManufacturer(1), accounts[1], "Manufacturer is not successfully registered");
    });

    it("Register as Manufacturer with Insufficient Ether", async() => {
        // attempt to register a Manufacturer with insufficient amount of Ether sent
        await truffleAssert.reverts(ManufacturerInstance.registerAsManufacturer({from: accounts[1], value: 100}), "You should commit at least 1 ether to register as a wholesaler");
    });

    
    it("Register as Wholesaler", async() => {
        // register a Wholesaler
        await WholesalerInstance.registerAsWholesaler({from: accounts[1], value: oneEth});
        // test that the Wholesaler exists
        assert.strictEqual(await WholesalerInstance.wholesalerExists(accounts[1]), true, "Wholesaler is not successfully registered");
        // test that the Wholesaler id is 1
        assert.strictEqual(await WholesalerInstance.checkWholesaler(1), accounts[1], "Wholesaler is not successfully registered");
    });

    it("Register as Wholesaler with Insufficient Ether", async() => {
        // attempt to register a Manufacturer with insufficient amount of Ether sent
        await truffleAssert.reverts(WholesalerInstance.registerAsWholesaler({from: accounts[1], value: 100}), "You should commit at least 1 ether to register as a wholesaler");
    });

    it("Add Product", async() => {
        // register a Manufacturer
        await ManufacturerInstance.registerAsManufacturer({from: accounts[1], value: oneEth});
        // add Product from Manufacturer 1
        let result = await ProductInstance.addProduct(1, {from: accounts[1]});
        let emittedEvent = result.logs[0];
        // test that the Manufacturer id of Product 1 is 1
        assert.equal(emittedEvent.args['0']['manufacturerId'], 1, "Product is not successfully added");
        // test that the Product is of Manufactured status
        assert.equal(emittedEvent.args['0']['status'], Product.Status.Manufactured, "Product is not successfully added");
    });

    it("Add Product from invalid Manufacturer", async() => {
        // register a Manufacturer
        await ManufacturerInstance.registerAsManufacturer({from: accounts[1], value: oneEth});
        // attempt to add a Product from non-existent Manufacturer
        await truffleAssert.reverts(ProductInstance.addProduct(2, {from: accounts[1]}), "Please provide a valid manufacturer ID");
        // attempt to add a Product on other's behalf
        await truffleAssert.reverts(ProductInstance.addProduct(1, {from: accounts[2]}), "Please provide a valid manufacturer ID");
    });

    it("Add Wholesaler", async() => {
        // register a Manufacturer
        await ManufacturerInstance.registerAsManufacturer({from: accounts[1], value: oneEth});
        // register a Wholesaler
        await WholesalerInstance.registerAsWholesaler({from: accounts[2], value: oneEth});
        // add Product from Manufacturer 1
        await ProductInstance.addProduct(1, {from: accounts[1]});
        // add Wholesaler from Manufacturer 1
        let result = await ProductInstance.addWholesaler(1, 1, {from: accounts[1]});
        let emittedEvent = result.logs[0];
        // test that the Wholesaler id of Product 1 is 1
        assert.equal(emittedEvent.args['0']['wholesalerId'], 1, "Wholesaler is not successfully added");
    });

    it("Add Wholesaler from invalid Manufacturer", async() => {
        // register a Manufacturer
        await ManufacturerInstance.registerAsManufacturer({from: accounts[1], value: oneEth});
        // register a second Manufacturer
        await ManufacturerInstance.registerAsManufacturer({from: accounts[2], value: oneEth});
        // register a Wholesaler
        await WholesalerInstance.registerAsWholesaler({from: accounts[2], value: oneEth});
        // add Product from Manufacturer 1
        await ProductInstance.addProduct(1, {from: accounts[1]});
        // add Wholesaler from Manufacturer 2
        await truffleAssert.reverts(ProductInstance.addWholesaler(1, 1, {from: accounts[2]}), "You are not the manufacturer of this product");
    });

    it("Add Wholesaler at Invalid Status", async() => {
    });

    // Unit test to check whether retailer can be successfully registered
    it("Add Retailer", async() => {
        await ManufacturerInstance.registerAsManufacturer({from: accounts[3], value: oneEth});
        await WholesalerInstance.registerAsWholesaler({from: accounts[4], value: oneEth});
        await RetailerInstance.registerAsRetailer({from: accounts[5], value: oneEth});
        await ProductInstance.addProduct(1, {from: accounts[3]});
        await ProductInstance.addWholesaler(1, 1, {from: accounts[3]});
        await ProductInstance.receivedByWholesaler(1, {from: accounts[4]});
        let result = await ProductInstance.addRetailer(1, 1, {from: accounts[4]});
        let emittedEvent = result.logs[0];
        assert.equal(emittedEvent.args['0']['retailerId'], 1, "Retailer is not successfully added");
    });

    it("Check Product by Manufacturer", async() => {
        await ManufacturerInstance.registerAsManufacturer({from: accounts[1], value: oneEth});
        let result = await ProductInstance.addProduct(1, {from: accounts[1]});
        let emittedEvent = result.logs[0];

        let product1 = await ProductInstance.checkProduct(1, {from:accounts[1]});
        assert.equal(product1.id, emittedEvent.args['0']['id'], "Incorrect product ID from Manufacturer address");
    });

    it("Check Product by Wholesaler", async() => {
        await ManufacturerInstance.registerAsManufacturer({from: accounts[1], value: oneEth});
        await WholesalerInstance.registerAsWholesaler({from: accounts[2], value: oneEth});
        await ProductInstance.addProduct(1, {from: accounts[1]});
        await ProductInstance.addWholesaler(1, 1, {from: accounts[1]});
        let result = await ProductInstance.receivedByWholesaler(1, {from: accounts[2]});
        let emittedEvent = result.logs[0];

        let product = await ProductInstance.checkProduct(1, {from:accounts[2]});
        assert.equal(product.id, emittedEvent.args['0']['id'], "Incorrect check product ID from Wholesaler address");
    });

    it("Check Product by Retailer", async() => {
        await ManufacturerInstance.registerAsManufacturer({from: accounts[1], value: oneEth});
        await WholesalerInstance.registerAsWholesaler({from: accounts[2], value: oneEth});
        await RetailerInstance.registerAsRetailer({from: accounts[3], value: oneEth});
        await ProductInstance.addProduct(1, {from: accounts[1]});
        await ProductInstance.addWholesaler(1, 1, {from: accounts[1]});
        await ProductInstance.receivedByWholesaler(1, {from:accounts[2]});
        await ProductInstance.addRetailer(1, 1, {from: accounts[2]});
        let result = await ProductInstance.receivedByRetailer(1, 5, {from: accounts[3]});
        let emittedEvent = result.logs[0];

        let product = await ProductInstance.checkProduct(1, {from:accounts[3]});
        assert.equal(product.id, emittedEvent.args['0']['id'], "Incorrect check product ID from Retailer address");
    });

    it("Check Product by Customer", async () => {
        await ManufacturerInstance.registerAsManufacturer({from: accounts[3], value: oneEth});
        await WholesalerInstance.registerAsWholesaler({from: accounts[4], value: oneEth});
        await RetailerInstance.registerAsRetailer({from: accounts[5], value: oneEth});
        await ProductInstance.addProduct(1, {from: accounts[3]});
        await ProductInstance.addWholesaler(1, 1, {from: accounts[3]});
        await ProductInstance.receivedByWholesaler(1, {from: accounts[4]});
        await ProductInstance.addRetailer(1, 1, {from: accounts[4]});
        await ProductInstance.receivedByRetailer(1, 1, {from: accounts[5]});
        
        let result = await ProductInstance.purchasedByCustomer(1, accounts[6], {from: accounts[5]});
        let emittedEvent = result.logs[0];
        let product = await ProductInstance.checkProduct(1, {from:accounts[6]});

        assert.equal(product.id, emittedEvent.args['0']['id'], "Incorrect check product ID from Customer address");
        // need to check the balance change
    });


    // test retailerExists with unregistered retailer 
    it("Should return false if retailer does not exist", async () => {
        await RetailerInstance.registerRetailer("retailer2", "PGPR #18-01, Singapore",{from: accounts[5], value: oneEth});
        let retailerExists = await RetailerInstance.retailerExists(accounts[6]);
        assert.equal(retailerExists, false, "Retailer should not exist");
      });

    // test retailerExists with registered retailer 
    it("Should return true if retailer exists", async () => {
        await RetailerInstance.registerRetailer("retailer2", "PGPR #18-01, Singapore",{from: accounts[6], value: oneEth});
        let retailerExists = await RetailerInstance.retailerExists(accounts[6]);
        assert.equal(retailerExists, true, "Retailer should exist!");
      });

    // Check retailer address
    it("Check retailer address", async () => {
        await RetailerInstance.registerRetailer("retailer3", "PGPR #28-01, Singapore",{from: accounts[7], value: oneEth});
        let address = await RetailerInstance.checkRetailer(0);
        assert.equal(address, accounts[7], "Retailer address is not recorded!");
      });

    it("Token Purchase and Transfer", async () => {
        await PCTokenInstance.getCredit({from: accounts[6], value: oneEth});
        assert.equal(await PCTokenInstance.checkCredit({from: accounts[6]}), 100, "Tokens are purchased");
        await PCTokenInstance.transferCredit(accounts[5], 1, {from: accounts[6]});
    });

    // check pay by token
    it("Purchased by token", async () => {
        await ManufacturerInstance.registerAsManufacturer({from: accounts[3], value: oneEth});
        await WholesalerInstance.registerAsWholesaler({from: accounts[4], value: oneEth});
        await RetailerInstance.registerAsRetailer({from: accounts[5], value: oneEth});
        await ProductInstance.addProduct(1, {from: accounts[3]});
        await ProductInstance.addWholesaler(1, 1, {from: accounts[3]});
        await ProductInstance.receivedByWholesaler(1, {from: accounts[4]});
        await ProductInstance.addRetailer(1, 1, {from: accounts[4]});
        await ProductInstance.receivedByRetailer(1, 1, {from: accounts[5]});

        await PCTokenInstance.getCredit({from: accounts[6], value: oneEth});
        let result = await ProductInstance.purchasedByToken(1, {from: accounts[6]});
        let emittedEvent = result.logs[0];
        assert.equal(1,2);
        assert.equal(emittedEvent.args['0']['status'], Product.Status.Sold, "Product is not successfully sold");
        assert.equal(emittedEvent.args['0']['customer'], accounts[6], "Product is not successfully sold");
        // need to check the balance change
    });

    // check report counterfeit
    it("Check report counterfeit", async () => {
        await ManufacturerInstance.registerAsManufacturer({from: accounts[3], value: oneEth});
        await WholesalerInstance.registerAsWholesaler({from: accounts[4], value: oneEth});
        await RetailerInstance.registerAsRetailer({from: accounts[5], value: oneEth});
        await ProductInstance.addProduct(1, {from: accounts[3]});
        await ProductInstance.addWholesaler(1, 1, {from: accounts[3]});
        await ProductInstance.receivedByWholesaler(1, {from: accounts[4]});
        await ProductInstance.addRetailer(1, 1, {from: accounts[4]});
        await ProductInstance.receivedByRetailer(1, 1, {from: accounts[5]});
        
        await ProductInstance.purchasedByCustomer(1, accounts[6], {from: accounts[5]});
        await PCTokenInstance.getCredit({from: accounts[6], value: oneEth});
        let result = await ProductInstance.reportCounterfeit(1, {from: accounts[6]});
        let emittedEvent = result.logs[0];
        // test that the Product is of Counterfeit status
        assert.equal(emittedEvent.args['0']['status'], Product.Status.Counterfeit, "Product is not successfully reported counterfeit");
        // need to check the balance change
    });
});