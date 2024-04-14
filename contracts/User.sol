pragma solidity ^0.5.0;

interface User {
    // user registeration
    function register() external returns(uint256);
    // check user information
    function checkId(uint256) external view returns(address) ;
    // check user existence
    function doesExist(address) external view returns(bool);
    // receive authenticity report
    function reportAuthenticity(uint256, bool) external;
    // force the user to exit
    function forceExit(uint256) external;
    // user self exit
    function selfExit(uint256) external;
}