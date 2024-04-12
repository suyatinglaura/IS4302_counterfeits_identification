pragma solidity ^0.5.0;
import "./PCToken.sol";

contract Retailer {
    mapping (address => bool) retailerList; // keep track of the existence of each retailer
    mapping (uint256 => address) retailers;
    event returnRetailer(uint256);

    uint256 public numRetailers = 0;
    
    // commitment fee should be above 1 ether (an arbitrary value)
    modifier minFee(uint256 fee) {
        require(fee >= 1 ether, "You should commit at least 1 ether to register as a retailer");
        _;
    }

    // function that allows user to register as a retailer
    function registerAsRetailer() public payable minFee(msg.value) returns(uint256) {        
        uint256 newRetailerId = ++numRetailers;
        retailers[newRetailerId] = msg.sender;
        retailerList[msg.sender] = true;
        return newRetailerId; 
    }

    // Checks retailer information
    function checkRetailer(uint256 retailerId) public view returns(address) {
        return retailers[retailerId];   
    }

    // function that checks wholesaler existence
    function retailerExists(address retailer) public view returns(bool) {
        return retailerList[retailer];
    }
}
