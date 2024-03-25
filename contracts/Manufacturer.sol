pragma solidity ^0.5.0;

contract Manufacturer {

	uint256 numManufacturers = 0;
	mapping (uint256 => address) manufacturers; // keep track of the address of each manufacturer
    mapping (address => bool) manufacturersList; // keep track of the existence of each manufacturer

    // Min 1 ether is required to register as a manufacturer
    modifier minFee(uint256 fee) {
        require(fee >= 1 ether, "You should commit at least 1 ether to register as a wholesaler");
        _;
    }

    // User register as a manufacturer
    function registerAsManufacturer() public payable minFee(msg.value) returns(uint256) {
        uint256 newManufacturerId = numManufacturers++;
        manufacturers[newManufacturerId] = msg.sender;
        manufacturersList[msg.sender] = true;
        return newManufacturerId;   
    }

    // Checks wholesaler information
    function checkManufacturer(uint256 manufacturerId) public view returns(address) {
        return manufacturers[manufacturerId];   
    }

    // function that checks wholesaler existence
    function manufacturerExists(address manufacturer) public view returns(bool) {
        return manufacturersList[manufacturer];
    }
}