pragma solidity ^0.5.0;

import "./ERC20.sol";

contract PCToken {
    ERC20 erc20Contract;
    address owner;

    constructor() public {
        ERC20 e = new ERC20();
        erc20Contract = e;
        owner = msg.sender;
    }
    /**
    * @dev Function to give PCT to the recipient for a given wei amount
    * @return A uint256 representing the amount of DT bought by the msg.sender
    */
    // Currently, 1 PCT = 0.01Eth
    function getCredit() public payable returns (uint256) {
        uint256 amt = msg.value / (1000000000000000000/100); 
        erc20Contract.mint(msg.sender, amt);
        return amt; 
    }

    /**
    * @dev Function to check the amount of PCT the msg.sender has
    * @return A uint256 representing the amount of PCT owned by the msg.sender.
    */
    function checkCredit() public view returns (uint256) {
        uint256 credit = erc20Contract.balanceOf(msg.sender);
        return credit; 
    }
    
    /**
    * @dev Function to transfer the credit from the owner to the recipient
    * @param recipient address of the recipient that will gain in PCT
    * @param amt uint256 aount of PCT to transfer
    */
    function transferCredit(address recipient, uint256 amt) public {
        // Transfers from tx.origin to receipient
        erc20Contract.transfer(recipient, amt);
    }
    
    /**
    * @dev Function to transfer the credit from the owner to the recipient
    * @param sender address of the sender that will pay in PCT
    * @param recipient address of the recipient that will gain in PCT
    * @param amt uint256 aount of PCT to transfer
    */
    function transferCreditFrom(address sender, address recipient, uint256 amt) public {
        require(msg.sender==sender, "You are not allowed to transfer credit on other's behalf");
        // Transfers from sender to receipient
        erc20Contract.transferFrom(sender, recipient, amt);
    }
}