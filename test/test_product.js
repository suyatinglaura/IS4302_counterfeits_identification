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

contract("PCToken", function (accounts) {
    // resets the contracts after each test case
    beforeEach(async () => {
        // create contract instances
        PCTokenInstance = await PCToken.new();
    });

    console.log("Testing PCToken contract");

    it("Get and Check Credit", async () => {
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[1], value: oneEth});
        // check balance using checkCredit function
        assert.equal(await PCTokenInstance.checkCredit({from: accounts[1]}), 100, "Tokens are not received");
    });

    it("Transfer Credit", async () => {
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[1], value: oneEth});
        // transfer 10 tokens from Account 1 to Account 2 with transferCredit function
        await PCTokenInstance.transferCredit(accounts[2], 10, {from: accounts[1]});
        // check balance of Account 1 and Account 2
        assert.equal(await PCTokenInstance.checkCredit({from: accounts[1]}), 90, "Tokens are not successfully transferred");
        assert.equal(await PCTokenInstance.checkCredit({from: accounts[2]}), 10, "Tokens are not successfully transferred");
        // transfer 10 tokens from Account 1 to Account 2 with transferCreditFrom function
        await PCTokenInstance.transferCreditFrom(accounts[1], accounts[2], 10, {from: accounts[1]});
        // check balance of Account 1 and Account 2
        assert.equal(await PCTokenInstance.checkCredit({from: accounts[1]}), 80, "Tokens are not successfully transferred");
        assert.equal(await PCTokenInstance.checkCredit({from: accounts[2]}), 20, "Tokens are not successfully transferred");
    });
});

contract("Manufacturer", function (accounts) {        
    // resets the contracts after each test case
    beforeEach(async () => {
        // create contract instances
        PCTokenInstance = await PCToken.new();
        ManufacturerInstance = await Manufacturer.new(PCTokenInstance.address);
        WholesalerInstance = await Wholesaler.new(PCTokenInstance.address);
        RetailerInstance = await Retailer.new(PCTokenInstance.address);
        ProductInstance = await Product.new(ManufacturerInstance.address, WholesalerInstance.address, RetailerInstance.address, PCTokenInstance.address);
    });

    console.log("Testing Manufacturer contract");

    it("Set Product", async() => {
        // set product from non-owner account
        await truffleAssert.reverts(ManufacturerInstance.setProduct(ProductInstance.address, {from: accounts[3]}), "You are not the owner of this contract");
        await ManufacturerInstance.setProduct(ProductInstance.address, {from: accounts[0]});
    });

    it("Register as Manufacturer", async() => {
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[3], value: oneEth});
        // register a Manufacturer
        await ManufacturerInstance.register({from: accounts[3]});
        // test that the Manufacturer exists
        assert.strictEqual(await ManufacturerInstance.doesExist(accounts[3]), true, "Manufacturer is not successfully registered");
        // test that the Manufacturer id is 1
        assert.strictEqual(await ManufacturerInstance.checkId(1), accounts[3], "Manufacturer is not successfully registered");
    });

    it("Register as Manufacturer with Insufficient PCTokens", async() => {
        // attempt to register a Manufacturer with insufficient PCToken balance
        await truffleAssert.reverts(ManufacturerInstance.register({from: accounts[3]}), "msg.sender doesn't have enough balance");
    });

    it("Self Exit", async() => {
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[3], value: oneEth});
        // register a Manufacturer
        await ManufacturerInstance.register({from: accounts[3]});
        // Manufacturer 1 exits
        await ManufacturerInstance.selfExit(1, {from: accounts[3]});
        // test that the Manufacturer no longer exists
        assert.strictEqual(await ManufacturerInstance.doesExist(accounts[3]), false, "Manufacturer is not successfully removed");
        // test that the Manufacturer id no longer
        assert.equal(await ManufacturerInstance.checkId(1), 0, "Manufacturer is not successfully removed");
        // test that commitment fee is refunded
        assert.equal(await PCTokenInstance.checkCredit({from: accounts[3]}), 100, "Commitment fee is not successfully refunded");
    });

    it("Report Authenticity can only be called by Product Contract", async() => {
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[3], value: oneEth});
        // register a Manufacturer
        await ManufacturerInstance.register({from: accounts[3]});
        // report authenticity from Account 4 is not allowed
        await truffleAssert.reverts(ManufacturerInstance.reportAuthenticity(1, false, {from: accounts[4]}), "Report can only be sent from Product Contract");
    });

});

contract("Wholesaler", function (accounts) {        
    // resets the contracts after each test case
    beforeEach(async () => {
        // create contract instances
        PCTokenInstance = await PCToken.new();
        ManufacturerInstance = await Manufacturer.new(PCTokenInstance.address);
        WholesalerInstance = await Wholesaler.new(PCTokenInstance.address);
        RetailerInstance = await Retailer.new(PCTokenInstance.address);
        ProductInstance = await Product.new(ManufacturerInstance.address, WholesalerInstance.address, RetailerInstance.address, PCTokenInstance.address);
    });

    console.log("Testing Wholesaler contract");

    it("Set Product", async() => {
        // set product from non-owner account
        await truffleAssert.reverts(WholesalerInstance.setProduct(ProductInstance.address, {from: accounts[4]}), "You are not the owner of this contract");
        await WholesalerInstance.setProduct(ProductInstance.address, {from: accounts[0]});
    });

    it("Register as Wholesaler", async() => {
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[4], value: oneEth});
        // register a Wholesaler
        await WholesalerInstance.register({from: accounts[4]});
        // test that the Wholesaler exists
        assert.strictEqual(await WholesalerInstance.doesExist(accounts[4]), true, "Wholesaler is not successfully registered");
        // test that the Wholesaler id is 1
        assert.strictEqual(await WholesalerInstance.checkId(1), accounts[4], "Wholesaler is not successfully registered");
    });

    it("Register as Wholesaler with Insufficient PCTokens", async() => {
        // attempt to register a Wholesaler with insufficient PCToken balance
        await truffleAssert.reverts(WholesalerInstance.register({from: accounts[4]}), "msg.sender doesn't have enough balance");
    });

    it("Self Exit", async() => {
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[4], value: oneEth});
        // register a Wholesaler
        await WholesalerInstance.register({from: accounts[4]});
        // Wholesaler 1 exits
        await WholesalerInstance.selfExit(1, {from: accounts[4]});
        // test that the Wholesaler no longer exists
        assert.strictEqual(await WholesalerInstance.doesExist(accounts[4]), false, "Wholesaler is not successfully removed");
        // test that the Wholesaler id no longer
        assert.equal(await WholesalerInstance.checkId(1), 0, "Wholesaler is not successfully removed");
        // test that commitment fee is refunded
        assert.equal(await PCTokenInstance.checkCredit({from: accounts[4]}), 100, "Commitment fee is not successfully refunded");
    });

    it("Report Authenticity can only be called by Product Contract", async() => {
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[4], value: oneEth});
        // register a Wholesaler
        await WholesalerInstance.register({from: accounts[4]});
        // report authenticity from Account 5 is not allowed
        await truffleAssert.reverts(WholesalerInstance.reportAuthenticity(1, false, {from: accounts[5]}), "Report can only be sent from Product Contract");
    });

});

contract("Retailer", function (accounts) {        
    // resets the contracts after each test case
    beforeEach(async () => {
        // create contract instances
        PCTokenInstance = await PCToken.new();
        ManufacturerInstance = await Manufacturer.new(PCTokenInstance.address);
        WholesalerInstance = await Wholesaler.new(PCTokenInstance.address);
        RetailerInstance = await Retailer.new(PCTokenInstance.address);
        ProductInstance = await Product.new(ManufacturerInstance.address, WholesalerInstance.address, RetailerInstance.address, PCTokenInstance.address);
    });

    console.log("Testing Retailer contract");

    it("Set Product", async() => {
        // set product from non-owner account
        await truffleAssert.reverts(RetailerInstance.setProduct(ProductInstance.address, {from: accounts[5]}), "You are not the owner of this contract");
        await RetailerInstance.setProduct(ProductInstance.address, {from: accounts[0]});
    });

    it("Register as Retailer", async() => {
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[5], value: oneEth});
        // register a Retailer
        await RetailerInstance.register({from: accounts[5]});
        // test that the Retailer exists
        assert.strictEqual(await RetailerInstance.doesExist(accounts[5]), true, "Retailer is not successfully registered");
        // test that the Retailer id is 1
        assert.strictEqual(await RetailerInstance.checkId(1), accounts[5], "Retailer is not successfully registered");
    });

    it("Register as Retailer with Insufficient PCTokens", async() => {
        // attempt to register a Retailer with insufficient PCToken balance
        await truffleAssert.reverts(RetailerInstance.register({from: accounts[5]}), "msg.sender doesn't have enough balance");
    });
});

contract("Product", function (accounts) {
    // resets the contracts after each test case
    beforeEach(async () => {
        // create contract instances
        PCTokenInstance = await PCToken.new();
        ManufacturerInstance = await Manufacturer.new(PCTokenInstance.address);
        WholesalerInstance = await Wholesaler.new(PCTokenInstance.address);
        RetailerInstance = await Retailer.new(PCTokenInstance.address);
        ProductInstance = await Product.new(ManufacturerInstance.address, WholesalerInstance.address, RetailerInstance.address, PCTokenInstance.address);
    });

    console.log("Testing Product contract");

    it("Add Product", async() => {
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[6], value: oneEth});
        // register a Manufacturer
        await ManufacturerInstance.register({from: accounts[6]});
        // add Product from Manufacturer 1
        await ProductInstance.addProduct(1, {from: accounts[6]});
        let product = await ProductInstance.checkProduct(1, {from: accounts[9]});
        // test that the Manufacturer id of Product 1 is 1
        assert.equal(product.manufacturerId, 1, "Product is not successfully added");
        // test that the Product is of Manufactured status
        assert.equal(product.status, Product.Status.Manufactured, "Product is not successfully added");
    });

    it("Add Product from invalid Manufacturer", async() => {
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[6], value: oneEth});
        // register a Manufacturer
        await ManufacturerInstance.register({from: accounts[6]});
        // attempt to add a Product from non-existent Manufacturer
        await truffleAssert.reverts(ProductInstance.addProduct(2, {from: accounts[6]}), "Please provide a valid manufacturer ID");
        // attempt to add a Product on other's behalf
        await truffleAssert.reverts(ProductInstance.addProduct(1, {from: accounts[7]}), "Please provide a valid manufacturer ID");
    });

    it("Add Wholesaler", async() => {
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[6], value: oneEth});
        // register a Manufacturer
        await ManufacturerInstance.register({from: accounts[6]});
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[7], value: oneEth});
        // register a Wholesaler
        await WholesalerInstance.register({from: accounts[7]});
        // add Product from Manufacturer 1
        await ProductInstance.addProduct(1, {from: accounts[6]});

        // add Wholesaler from Manufacturer 1
        await ProductInstance.addWholesaler(1, 1, {from: accounts[6]});
        let product = await ProductInstance.checkProduct(1, {from: accounts[9]});
        // test that the Wholesaler id of Product 1 is 1
        assert.equal(product.wholesalerId, 1, "Wholesaler is not successfully added");
    });

    it("Add Wholesaler from invalid Manufacturer", async() => {
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[6], value: oneEth});
        // register a Manufacturer
        await ManufacturerInstance.register({from: accounts[6]});
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[7], value: oneEth});
        // register a Wholesaler
        await WholesalerInstance.register({from: accounts[7]});
        // add Product from Manufacturer 1
        await ProductInstance.addProduct(1, {from: accounts[6]});

        // add Wholesaler from Account 7
        await truffleAssert.reverts(ProductInstance.addWholesaler(1, 1, {from: accounts[7]}), "You are not a manufacturer");
        
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[7], value: oneEth});
        // register a Manufacturer
        await ManufacturerInstance.register({from: accounts[7]});
        // add Wholesaler from Manufacturer 2
        await truffleAssert.reverts(ProductInstance.addWholesaler(1, 1, {from: accounts[7]}), "You are not the manufacturer of this product");
    });

    it("Product received by Wholesaler", async() => {
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[6], value: oneEth});
        // register a Manufacturer
        await ManufacturerInstance.register({from: accounts[6]});
        // set product from Manufacturer owner account
        await ManufacturerInstance.setProduct(ProductInstance.address, {from: accounts[0]});
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[7], value: oneEth});
        // register a Wholesaler
        await WholesalerInstance.register({from: accounts[7]});
        // add Product from Manufacturer 1
        await ProductInstance.addProduct(1, {from: accounts[6]});
        // add Wholesaler from Manufacturer 1
        await ProductInstance.addWholesaler(1, 1, {from: accounts[6]});
        
        // product received by Wholesaler 1
        await ProductInstance.receivedByWholesaler(1, true, {from: accounts[7]});
        let product = await ProductInstance.checkProduct(1, {from: accounts[9]});
        assert.equal(product.status, Product.Status.Wholesaled, "Product is not successfully received by Wholesaler");
        assert.equal(await ManufacturerInstance.getTotalReport(1), 1, "Authenticity report is not successfully sent");
        assert.equal(await ManufacturerInstance.getPosReport(1), 1, "Authenticity report is not successfully sent");
    });

    it("Add Retailer", async() => {
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[6], value: oneEth});
        // register a Manufacturer
        await ManufacturerInstance.register({from: accounts[6]});
        // set product from Manufacturer owner account
        await ManufacturerInstance.setProduct(ProductInstance.address, {from: accounts[0]});
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[7], value: oneEth});
        // register a Wholesaler
        await WholesalerInstance.register({from: accounts[7]});
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[8], value: oneEth});
        // register a Retailer
        await RetailerInstance.register({from: accounts[8]});
        // add Product from Manufacturer 1
        await ProductInstance.addProduct(1, {from: accounts[6]});
        // add Wholesaler from Manufacturer 1
        await ProductInstance.addWholesaler(1, 1, {from: accounts[6]});
        // product received by Wholesaler 1
        await ProductInstance.receivedByWholesaler(1, true, {from: accounts[7]});

        // add Retailer from Wholesaler 1
        await ProductInstance.addRetailer(1, 1, {from: accounts[7]});
        let product = await ProductInstance.checkProduct(1, {from: accounts[9]});
        assert.equal(product.retailerId, 1, "Retailer is not successfully added");
    });

    it("Product Received by Retailer", async() => {
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[6], value: oneEth});
        // register a Manufacturer
        await ManufacturerInstance.register({from: accounts[6]});
        // set product from Manufacturer owner account
        await ManufacturerInstance.setProduct(ProductInstance.address, {from: accounts[0]});
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[7], value: oneEth});
        // register a Wholesaler
        await WholesalerInstance.register({from: accounts[7]});
        // set product from Wholesaler owner account
        await WholesalerInstance.setProduct(ProductInstance.address, {from: accounts[0]});
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[8], value: oneEth});
        // register a Retailer
        await RetailerInstance.register({from: accounts[8]});
        // add Product from Manufacturer 1
        await ProductInstance.addProduct(1, {from: accounts[6]});
        // add Wholesaler from Manufacturer 1
        await ProductInstance.addWholesaler(1, 1, {from: accounts[6]});
        // product received by Wholesaler 1
        await ProductInstance.receivedByWholesaler(1, true, {from: accounts[7]});
        // add Retailer from Wholesaler 1
        await ProductInstance.addRetailer(1, 1, {from: accounts[7]});

        // product received by Retailer 1
        await ProductInstance.receivedByRetailer(1, 10, true, {from: accounts[8]});
        let product = await ProductInstance.checkProduct(1, {from: accounts[9]});
        assert.equal(product.status, Product.Status.Retailed, "Product is not successfully received by Retailer");
        assert.equal(product.price, 10, "Price is not successfully updated");
        assert.equal(await WholesalerInstance.getTotalReport(1), 1, "Authenticity report is not successfully sent");
        assert.equal(await WholesalerInstance.getPosReport(1), 1, "Authenticity report is not successfully sent");
    });

    it("Purchased by Customer with Cash", async () => {
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[6], value: oneEth});
        // register a Manufacturer
        await ManufacturerInstance.register({from: accounts[6]});
        // set product from Manufacturer owner account
        await ManufacturerInstance.setProduct(ProductInstance.address, {from: accounts[0]});
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[7], value: oneEth});
        // register a Wholesaler
        await WholesalerInstance.register({from: accounts[7]});
        // set product from Wholesaler owner account
        await WholesalerInstance.setProduct(ProductInstance.address, {from: accounts[0]});
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[8], value: oneEth});
        // register a Retailer
        await RetailerInstance.register({from: accounts[8]});
        // add Product from Manufacturer 1
        await ProductInstance.addProduct(1, {from: accounts[6]});
        // add Wholesaler from Manufacturer 1
        await ProductInstance.addWholesaler(1, 1, {from: accounts[6]});
        // product received by Wholesaler 1
        await ProductInstance.receivedByWholesaler(1, true, {from: accounts[7]});
        // add Retailer from Wholesaler 1
        await ProductInstance.addRetailer(1, 1, {from: accounts[7]});
        // product received by Retailer 1
        await ProductInstance.receivedByRetailer(1, 10, true, {from: accounts[8]});

        // Account 9 purchase the product by cash
        await ProductInstance.purchasedByCustomer(1, accounts[9], {from: accounts[8]});
        let product = await ProductInstance.checkProduct(1, {from: accounts[9]});
        assert.equal(product.status, Product.Status.Sold, "Product is not successfully purchased");
        assert.strictEqual(product.customer, accounts[9], "Product is not successfully purchased");
    });

    it("Purchased by Customer with PCTokens", async () => {
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[6], value: oneEth});
        // register a Manufacturer
        await ManufacturerInstance.register({from: accounts[6]});
        // set product from Manufacturer owner account
        await ManufacturerInstance.setProduct(ProductInstance.address, {from: accounts[0]});
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[7], value: oneEth});
        // register a Wholesaler
        await WholesalerInstance.register({from: accounts[7]});
        // set product from Wholesaler owner account
        await WholesalerInstance.setProduct(ProductInstance.address, {from: accounts[0]});
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[8], value: oneEth});
        // register a Retailer
        await RetailerInstance.register({from: accounts[8]});
        // add Product from Manufacturer 1
        await ProductInstance.addProduct(1, {from: accounts[6]});
        // add Wholesaler from Manufacturer 1
        await ProductInstance.addWholesaler(1, 1, {from: accounts[6]});
        // product received by Wholesaler 1
        await ProductInstance.receivedByWholesaler(1, true, {from: accounts[7]});
        // add Retailer from Wholesaler 1
        await ProductInstance.addRetailer(1, 1, {from: accounts[7]});
        // product received by Retailer 1
        await ProductInstance.receivedByRetailer(1, 10, true, {from: accounts[8]});
        
        // get 10 tokens
        await PCTokenInstance.getCredit({from: accounts[9], value: oneEth/10});
        // Account 9 purchase the product by cash
        await ProductInstance.purchasedByToken(1, {from: accounts[9]});
        let product = await ProductInstance.checkProduct(1, {from: accounts[9]});
        assert.equal(product.status, Product.Status.Sold, "Product is not successfully purchased");
        assert.strictEqual(product.customer, accounts[9], "Product is not successfully purchased");
        //check balance
        assert.equal(await PCTokenInstance.checkCredit({from: accounts[9]}), 0, "Balance is not changed correctly");
    });

    it("Report Counterfeit", async () => {
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[6], value: oneEth});
        // register a Manufacturer
        await ManufacturerInstance.register({from: accounts[6]});
        // set product from Manufacturer owner account
        await ManufacturerInstance.setProduct(ProductInstance.address, {from: accounts[0]});
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[7], value: oneEth});
        // register a Wholesaler
        await WholesalerInstance.register({from: accounts[7]});
        // set product from Wholesaler owner account
        await WholesalerInstance.setProduct(ProductInstance.address, {from: accounts[0]});
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[8], value: oneEth});
        // register a Retailer
        await RetailerInstance.register({from: accounts[8]});
        // set product from Retailer owner account
        await RetailerInstance.setProduct(ProductInstance.address, {from: accounts[0]});
        // add Product from Manufacturer 1
        await ProductInstance.addProduct(1, {from: accounts[6]});
        // add Wholesaler from Manufacturer 1
        await ProductInstance.addWholesaler(1, 1, {from: accounts[6]});
        // product received by Wholesaler 1
        await ProductInstance.receivedByWholesaler(1, true, {from: accounts[7]});
        // add Retailer from Wholesaler 1
        await ProductInstance.addRetailer(1, 1, {from: accounts[7]});
        // product received by Retailer 1
        await ProductInstance.receivedByRetailer(1, 10, true, {from: accounts[8]});
        // Account 9 purchase the product by cash
        await ProductInstance.purchasedByCustomer(1, accounts[9], {from: accounts[8]});
        
        // get 10 tokens
        await PCTokenInstance.getCredit({from: accounts[9], value: oneEth/10});
        // Account 9 reports counterfeit
        await ProductInstance.reportCounterfeit(1, {from: accounts[9]});
        let product = await ProductInstance.checkProduct(1, {from: accounts[9]});
        // test that the Product is of Counterfeit status
        assert.equal(product.status, Product.Status.Counterfeit, "Product is not successfully reported counterfeit");
        //check balance
        assert.equal(await PCTokenInstance.checkCredit({from: accounts[9]}), 5, "Balance is not changed correctly");
    });

    it("Report Stolen by Wholesaler", async () => {
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[6], value: oneEth});
        // register a Manufacturer
        await ManufacturerInstance.register({from: accounts[6]});
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[7], value: oneEth});
        // register a Wholesaler
        await WholesalerInstance.register({from: accounts[7]});
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[8], value: oneEth});
        // register a Retailer
        await RetailerInstance.register({from: accounts[8]});
        // add Product from Manufacturer 1
        await ProductInstance.addProduct(1, {from: accounts[6]});
        // add Wholesaler from Manufacturer 1
        await ProductInstance.addWholesaler(1, 1, {from: accounts[6]});
        
        // Account 9 reports stolen
        await ProductInstance.reportStolen(1, {from: accounts[6]});
        let product = await ProductInstance.checkProduct(1, {from: accounts[9]});
        // test that the Product is of Stolen status
        assert.equal(product.status, Product.Status.Stolen, "Product is not successfully reported stolen");
    });

    it("Report Stolen by Manufacturer", async () => {
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[6], value: oneEth});
        // register a Manufacturer
        await ManufacturerInstance.register({from: accounts[6]});
        // set product from Manufacturer owner account
        await ManufacturerInstance.setProduct(ProductInstance.address, {from: accounts[0]});
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[7], value: oneEth});
        // register a Wholesaler
        await WholesalerInstance.register({from: accounts[7]});
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[8], value: oneEth});
        // register a Retailer
        await RetailerInstance.register({from: accounts[8]});
        // add Product from Manufacturer 1
        await ProductInstance.addProduct(1, {from: accounts[6]});
        // add Wholesaler from Manufacturer 1
        await ProductInstance.addWholesaler(1, 1, {from: accounts[6]});
        // product received by Wholesaler 1
        await ProductInstance.receivedByWholesaler(1, true, {from: accounts[7]});
        
        // Account 9 reports stolen
        await ProductInstance.reportStolen(1, {from: accounts[7]});
        let product = await ProductInstance.checkProduct(1, {from: accounts[9]});
        // test that the Product is of Stolen status
        assert.equal(product.status, Product.Status.Stolen, "Product is not successfully reported stolen");
    });

    it("Report Stolen by Retailer", async () => {
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[6], value: oneEth});
        // register a Manufacturer
        await ManufacturerInstance.register({from: accounts[6]});
        // set product from Manufacturer owner account
        await ManufacturerInstance.setProduct(ProductInstance.address, {from: accounts[0]});
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[7], value: oneEth});
        // register a Wholesaler
        await WholesalerInstance.register({from: accounts[7]});
        // set product from Wholesaler owner account
        await WholesalerInstance.setProduct(ProductInstance.address, {from: accounts[0]});
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[8], value: oneEth});
        // register a Retailer
        await RetailerInstance.register({from: accounts[8]});
        // add Product from Manufacturer 1
        await ProductInstance.addProduct(1, {from: accounts[6]});
        // add Wholesaler from Manufacturer 1
        await ProductInstance.addWholesaler(1, 1, {from: accounts[6]});
        // product received by Wholesaler 1
        await ProductInstance.receivedByWholesaler(1, true, {from: accounts[7]});
        // add Retailer from Wholesaler 1
        await ProductInstance.addRetailer(1, 1, {from: accounts[7]});
        
        // Account 9 reports stolen
        await ProductInstance.reportStolen(1, {from: accounts[8]});
        let product = await ProductInstance.checkProduct(1, {from: accounts[9]});
        // test that the Product is of Stolen status
        assert.equal(product.status, Product.Status.Stolen, "Product is not successfully reported stolen");
    });

    it("Report Stolen by Customer", async () => {
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[6], value: oneEth});
        // register a Manufacturer
        await ManufacturerInstance.register({from: accounts[6]});
        // set product from Manufacturer owner account
        await ManufacturerInstance.setProduct(ProductInstance.address, {from: accounts[0]});
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[7], value: oneEth});
        // register a Wholesaler
        await WholesalerInstance.register({from: accounts[7]});
        // set product from Wholesaler owner account
        await WholesalerInstance.setProduct(ProductInstance.address, {from: accounts[0]});
        // get 100 tokens
        await PCTokenInstance.getCredit({from: accounts[8], value: oneEth});
        // register a Retailer
        await RetailerInstance.register({from: accounts[8]});
        // add Product from Manufacturer 1
        await ProductInstance.addProduct(1, {from: accounts[6]});
        // add Wholesaler from Manufacturer 1
        await ProductInstance.addWholesaler(1, 1, {from: accounts[6]});
        // product received by Wholesaler 1
        await ProductInstance.receivedByWholesaler(1, true, {from: accounts[7]});
        // add Retailer from Wholesaler 1
        await ProductInstance.addRetailer(1, 1, {from: accounts[7]});
        // product received by Retailer 1
        await ProductInstance.receivedByRetailer(1, 10, true, {from: accounts[8]});
        // Account 9 purchase the product by cash
        await ProductInstance.purchasedByCustomer(1, accounts[9], {from: accounts[8]});
        
        // Account 9 reports stolen
        await ProductInstance.reportStolen(1, {from: accounts[9]});
        let product = await ProductInstance.checkProduct(1, {from: accounts[9]});
        // test that the Product is of Stolen status
        assert.equal(product.status, Product.Status.Stolen, "Product is not successfully reported stolen");
    });

    // it("Add Wholesaler at Invalid Status", async() => {
    // });
});