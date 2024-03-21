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
    * @param recipient address of the recipient that wants to buy the PCT
    * @param weiAmt uint256 amount indicating the amount of wei that was passed
    * @return A uint256 representing the amount of DT bought by the msg.sender.
    */
    // Currently, 1 PCT = 0.01Eth
    function getCredit(address recipient, uint256 weiAmt)
        public
        returns (uint256)
    {
        uint256 amt = weiAmt / (1000000000000000000/100); 
        erc20Contract.mint(recipient, amt);
        return amt; 
    }
    /**
    * @dev Function to check the amount of PCT the msg.sender has
    * @param ad address of the recipient that wants to check their PCT
    * @return A uint256 representing the amount of PCT owned by the msg.sender.
    */
    function checkCredit(address ad) public view returns (uint256) {
        uint256 credit = erc20Contract.balanceOf(ad);
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


}
