//const ERC20 = artifacts.require("ERC20");
const PCToken = artifacts.require("PCToken");
const Manufacturer = artifacts.require("Manufacturer");
const Wholesaler = artifacts.require("Wholesaler");
const Retailer = artifacts.require("Retailer");
const Product = artifacts.require("Product");

module.exports = (deployer, network, accounts) => {
  deployer.then(async () => {
    await deployer.deploy(PCToken);
    await deployer.deploy(Manufacturer, PCToken.address);
    await deployer.deploy(Wholesaler, PCToken.address);
    await deployer.deploy(Retailer, PCToken.address);
    await deployer.deploy(Product, Manufacturer.address, Wholesaler.address, Retailer.address, PCToken.address);
  });
};
