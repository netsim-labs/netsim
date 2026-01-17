/**
 * HCIE Labs Index
 * 
 * Level: Expert (HCIE/CCIE equivalent)
 * Target Audience: Network professionals pursuing HCIE certification
 * 
 * These labs represent the highest level of complexity in NetSim,
 * featuring multi-area designs, advanced protocols, and enterprise scenarios.
 */

import { Lab01_OSPF_Advanced } from './Lab01_OSPF_Advanced.js';
import { Lab02_BGP_Foundation } from './Lab02_BGP_Foundation.js';

export const HCIE_LABS = [
    Lab01_OSPF_Advanced,
    Lab02_BGP_Foundation,
];

// Re-export individual labs for granular imports
export { Lab01_OSPF_Advanced } from './Lab01_OSPF_Advanced.js';
export { Lab02_BGP_Foundation } from './Lab02_BGP_Foundation.js';
