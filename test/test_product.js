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

    beforeEach(async () => {
        // create contract instances
        PCTokenInstance = await PCToken.new();
        ManufacturerInstance = await Manufacturer.new();
        WholesalerInstance = await Wholesaler.new();
        RetailerInstance = await Retailer.new();
        ProductInstance = await Product.new(ManufacturerInstance.address, WholesalerInstance.address, RetailerInstance.address, PCToken.address);
    });

    console.log("Testing Product contract");

    // it("Buy Bank Token", async() => {
    //     await bankInstance.buy({from: accounts[1], value: oneEth});
    //     assert.strictEqual((await bankTokenInstance.checkCredit(accounts[1])).toString(), "1", "Wrong amount of Bank Tokens obtained");
    // });

    // it("Insufficient Eth for Bank Token", async() => {
    //     // attempt to buy a Bank Token with insufficient amount of Ether sent
    //     await truffleAssert.reverts(bankInstance.buy({from: accounts[1], value: 100}),"Insufficient eth sent to exchange for BT");
    // });

    // it("Deposit BTs", async() => {
    //     // buy BTs
    //     await bankInstance.buy({from: accounts[1], value: oneEth});
    //     // move to Depositing stage
    //     await time.increase(time.duration.days(30));
    //     // deposit BTs
    //     await bankInstance.deposit(1, {from: accounts[1]});
    //     // check that balance is updated appropriately
    //     assert.strictEqual((await bankInstance.getDepositedTokens(accounts[1])).toString(), "1", "Deposited BTs and recorded balance do not match");
    //     assert.strictEqual((await bankTokenInstance.checkCredit(bankInstance.address)).toString(), "1", "Deposited BTs not transferred to the Bank contract");

    //     // test insufficient BTs to deposit
    //     await expectRevert.unspecified(bankInstance.deposit(1, {from: accounts[1]}));
    // });

    // it("Test withdraw before Releasing stage", async() => {
    //     // buy BTs
    //     await bankInstance.buy({from: accounts[2], value: oneEth * 10});
    //     // move to Depositing stage
    //     await time.increase(time.duration.days(30));
    //     // deposit BTs
    //     await bankInstance.deposit(10, {from: accounts[2]});
    //     assert.strictEqual((await bankInstance.getDepositedTokens(accounts[2])).toString(), "10");

    //     // withdraw BTs
    //     await bankInstance.withdraw({from: accounts[2]});
    //     // check that BTs were withdrawn successfully
    //     assert.strictEqual((await bankInstance.getDepositedTokens(accounts[2])).toString(), "0", "Withdrawn BTs not subtracted from original owner's balance");
    //     console.log(await bankTokenInstance.ge)
    //     assert.strictEqual((await bankTokenInstance.checkCredit(accounts[2])).toString(), "10", "Withdrawn BTs not transferred back to original owner");
    // });

    // it("Test withdraw during Releasing stage", async() => {
    //     // buy BTs
    //     await bankInstance.buy({from: accounts[3], value: oneEth * 10});
    //     // move to Depositing stage
    //     await time.increase(time.duration.days(30));
    //     // deposit BTs
    //     await bankInstance.deposit(10, {from: accounts[3]});

    //     // move directly to Releasing stage
    //     await time.increase(time.duration.days(60));
    //     // withdraw BTs
    //     await bankInstance.withdraw({from: accounts[3]});
    //     // check that BTs were withdrawn with interest
    //     assert.strictEqual((await bankTokenInstance.checkCredit(accounts[3])).toString(), "11", "Withdrawn BTs not transferred back to original owner with correct amount of interest");
    // });

    // it("Exchange BTs", async() => {
    //     // buy BTs
    //     await bankInstance.buy({from: accounts[4], value: oneEth * 10});
    //     // redeem BTs
    //     let redeemTxn = await bankInstance.exchange({from: accounts[4]});
    //     // check that account no longer holds any BT
    //     assert.strictEqual((await bankTokenInstance.checkCredit(accounts[4])).toString(), "0", "Not all BTs were exchanged");
    //     // check event to verify the correct amount of eth returned
    //     truffleAssert.eventEmitted(redeemTxn, 'BankTokenRedeemed', (ev) => {
    //         return ev.redeemer === accounts[4]
    //             && ev.BTRedeemed == 10
    //             && ev.weiExchanged == oneEth * 9;
    //     }, "BankTokenRedeemed event should be emitted with correct parameters");
    // });

    // /**STUDENTS TO IMPLEMENT ADDITIONAL REQUIRED TEST CASES BELOW*/
    // it("Buy Bank Tokens at Releasing stage", async() => {
    //     // buy BTs
    //     await bankInstance.buy({from: accounts[5], value: oneEth * 10});
    //     // move directly to Releasing stage
    //     await time.increase(time.duration.days(90));
    //     // buy BTs at releasing stage
    //     try {
    //         await bankInstance.buy({from: accounts[5], value: oneEth * 10});
    //         assert.fail("Expected an error to be thrown");
    //     } catch (error) {
    //         assert(error.message.includes("requested service is not available now"), "Unexpected error message");
    //     }
    // });
    
    // it("Excess Eth refunded to sender", async() => {
    //     // buy BTs with 3.5 ether
    //     let intialAccountBal = new BigNumber(await web3.eth.getBalance(accounts[6]));
    //     await bankInstance.buy({from: accounts[6], value: oneEth * 3.5});
    //     let newAccountBal = new BigNumber(await web3.eth.getBalance(accounts[6]));
    //     // check correct amount of tokens is obtained
    //     assert.strictEqual((await bankTokenInstance.checkCredit(accounts[6])).toString(), "3", "Wrong amount of Bank Tokens obtained");
    //     // Check that 3 ether is spent
    //     //await assert(newAccountBal.isEqualTo(intialAccountBal.minus(3 * oneEth)), "Excess Eth is not refunded to sender");
    // });

    // // Hint: If your accounts run out of Ether, you can restart your Ganache session to refresh the account balances

    // // Hint: Use web3.eth.getBalance([address]) to get the amount of wei held by an account

});