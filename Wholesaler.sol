pragma solidity ^0.5.0;

// Wholesaler contract serves as a wholesaler pool, where it stores the wholesaler information
contract Wholesaler {
    uint256 numWholesalers = 0; // keep track of number of wholesalers in the pool
    mapping (uint => address) wholesalers; // keep track of address of each wholesaler
                                            // for now we only keep the address to save cost
    mapping(address => bool) wholesalerList; // keep track of existence of wholesalers
                                            // default value for each key is false

    // commitment fee should be above 1 ether (an arbitrary value)
    modifier minFee(uint256 fee) {
        require(fee >= 1 ether, "You should commit at least 1 ether to register as a wholesaler");
        _;
    }

    // function that allows user to register as a wholesaler
    function registerAsWholesaler() public payable minFee(msg.value) returns(uint256) {
        uint256 newWholesalerId = numWholesalers++;
        wholesalers[newWholesalerId] = msg.sender; // update wholesalers
        wholesalerList[msg.sender] = true; // update wholesaler list
        return newWholesalerId;   // return new wholesalerId
    }

    // function that checks wholesaler information
    function checkWholesaler(uint256 wholesalerId) public view returns(address) {
        return wholesalers[wholesalerId];   // return wholesaler address
    }

    // function that checks wholesaler existence
    function wholesalerExists(address wholesaler) public view returns(bool) {
        return wholesalerList[wholesaler];
    }
}