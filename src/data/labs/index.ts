import { lab1 } from './lab1_campus_basic.js';
import { lab2 } from './lab2_stp.js';
import { lab3 } from './lab3_lacp.js';
import { lab4 } from './lab4_static_routing.js';
import { lab5 } from './lab5_dhcp.js';
import { lab6 } from './lab6_ospf.js';
import { lab7 } from './lab7_acls.js';
import { lab8 } from './lab8_nat.js';
import { lab9 } from './lab9_pat.js';
import { lab10 } from './lab10_intervlan_advanced.js';
import { lab11 } from './lab11_ospf_advanced.js';
import { lab12 } from './lab12_rstp_advanced.js';
import { lab13 } from './lab13_vrrp.js';
import { lab14 } from './lab14_acl_advanced.js';
import { lab15 } from './lab15_nat_server.js';
import { lab16 } from './lab16_dhcp_relay.js';
import { lab17 } from './lab17_stp_security.js';
import { lab18 } from './lab18_lacp_tuning.js';
import { lab19 } from './lab19_static_backup.js';
import { lab20 } from './lab20_intermediate_challenge.js';
import { lab21 } from './lab21_ospf_processes.js';
import { lab22 } from './lab22_ospf_redistribution.js';
import { lab23 } from './lab23_ospf_timers.js';
import { lab24 } from './lab24_port_security.js';
import { lab25 } from './lab25_hybrid_ports.js';
import { lab26 } from './lab26_vty_security.js';
import { lab27 } from './lab27_mstp.js';
import { lab28 } from './lab28_qos.js';
import { lab29 } from './lab29_rip.js';
import { lab30 } from './lab30_grand_master.js';
import { lab31 } from './lab31_cloudengine_yunshan.js';
import { lab32 } from './lab32_multi_vendor.js';
import { lab33 } from './lab33_netdevops_intro.js';
import { lab34 } from './lab34_netdevops_datascience.js';

// HCIE Expert-Level Labs
import { Lab01_OSPF_Advanced } from './hcie/Lab01_OSPF_Advanced.js';
import { Lab02_BGP_Foundation } from './hcie/Lab02_BGP_Foundation.js';

// Re-export HCIE labs collection
export { HCIE_LABS } from './hcie/index.js';

export const ALL_LABS = [
    // HCIA/HCIP Level Labs (1-32)
    lab1,
    lab2,
    lab3,
    lab4,
    lab5,
    lab6,
    lab7,
    lab8,
    lab9,
    lab10,
    lab11,
    lab12,
    lab13,
    lab14,
    lab15,
    lab16,
    lab17,
    lab18,
    lab19,
    lab20,
    lab21,
    lab22,
    lab23,
    lab24,
    lab25,
    lab26,
    lab27,
    lab28,
    lab29,
    lab30,
    lab31,
    lab32,
    lab33,  // NetDevOps Intro
    lab34,  // NetDevOps ML (AI Ops)

    // HCIE Expert-Level Labs
    Lab01_OSPF_Advanced,
    Lab02_BGP_Foundation,
];
