# IS4302_counterfeits_identification
## Use blockchain to prevent counterfeit products in supply chain

# Introduction
Counterfeit products pose a significant threat to the global economy and consumer safety. Our Supply Chain Integrity System leverages blockchain technology to combat this issue by providing a secure and transparent platform for tracking product authenticity throughout the supply chain.

# Project Objectives and Benefits
1. Prevention of Counterfeit Products: Our system aims to prevent the proliferation of counterfeit goods by providing a secure and transparent platform for verifying product authenticity.
2. Enhanced Supply Chain Transparency: Through blockchain technology, we enable stakeholders to track the entire lifecycle of products, promoting transparency and accountability.
3. Economic Stability and Consumer Safety: By mitigating the risks associated with counterfeit products, our system contributes to economic stability and ensures consumer safety.

# System Architecture
Our system architecture is built around a set of smart contracts written in Solidity. These contracts include PCToken, which facilitates economic incentives throughout the supply chain, as well as Manufacturer, Wholesaler, Retailer, and Product contracts that manage the different stages and participants involved in the supply chain process.
codes can be found in :[contracts](IS4302_counterfeits_identification/contracts/)

# Features and Justification
1. PCToken: our native token, conforms to the ERC20 token standard, which serves as a medium of exchange and incentivizes responsible behavior among stakeholders throughout our supply chain ecosystem. The token's pricing mechanism is set at 1 PCT = 0.01 Ether.
2. User Types: We support four user types - Manufacturer, Wholesaler, Retailer, and Customer - each with specific functionalities and registration processes.
3. Product Lifecycle Tracking: Our system enables the tracking of product movements and statuses throughout the supply chain, ensuring transparency and authenticity.
4. Support for On-chain and Off-chain Business: Customers have the flexibility to purchase products using traditional payment methods or our native token, promoting inclusivity and user adoption.

# Testing and Validation
We have implemented comprehensive test cases to validate the functionality of our system, ensuring robustness and reliability.
codes can be found in : [test](IS4302_counterfeits_identification/test/)

