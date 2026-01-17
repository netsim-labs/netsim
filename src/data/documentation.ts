export type DocumentationVendorTag = 'all' | 'huawei' | 'cisco' | 'yunshan' | 'aruba' | 'mikrotik';

export interface DocumentationEntry {
  name: string;
  description: string;
  example?: string;
  meta?: string;
  extra?: string[];
  vendors?: DocumentationVendorTag[];
}

export interface DocumentationSection {
  id: string;
  title: string;
  description: string;
  entries: DocumentationEntry[];
}

export const documentationSections: DocumentationSection[] = [
  {
    id: 'commands',
    title: 'Supported Commands',
    description:
      'Live guide for instructors and students: each command or alias (user/system/interface/pool) is documented with its view, purpose and example.',
    entries: [
      { name: 'user-view: return | quit', description: 'Returns to user view without closing the session or losing context.', meta: 'user-view', example: 'return' },
      { name: 'system-view: commit', description: 'Commits changes from the candidate-configuration to the running-configuration (YunShan only).', meta: 'system-view', example: 'commit', vendors: ['yunshan'] },
      { name: 'system-view: abort', description: 'Discards the current candidate-configuration without applying changes.', meta: 'system-view', example: 'abort', vendors: ['yunshan'] },
      { name: 'system-view: display candidate-configuration', description: 'Shows pending changes to confirm on the CloudEngine device.', meta: 'system-view', example: 'display candidate-configuration', vendors: ['yunshan'] },
      { name: 'system-view: display this', description: 'Shows the configuration of the current context (for CloudEngine, shows the candidate).', meta: 'system-view', example: 'display this', vendors: ['yunshan'] },
      { name: 'user-view: sys | system-view', description: 'Enters global configuration view to modify device settings.', meta: 'user-view', example: 'system-view' },
      { name: 'user-view: display ip interface brief', description: 'Summary of interfaces with IP, VLAN and status.', meta: 'user-view', example: 'display ip interface brief' },
      { name: 'user-view: show ip interface brief', description: 'Cisco summary of interface status and IP addresses (equivalent to display ip interface brief).', meta: 'user-view', example: 'show ip interface brief', vendors: ['cisco'] },
      { name: 'user-view: show vlan brief', description: 'Short list of VLANs and their status for Cisco switches.', meta: 'user-view', example: 'show vlan brief', vendors: ['cisco'] },
      { name: 'user-view: show ip route', description: 'Cisco/Aruba routing table with cost, prefix and next hop.', meta: 'user-view', example: 'show ip route', vendors: ['cisco', 'aruba'] },
      { name: 'user-view: /ip address print', description: 'List of IP interfaces in MikroTik RouterOS style.', meta: 'user-view', example: '/ip address print', vendors: ['mikrotik'] },
      { name: 'user-view: /ip route print', description: 'MikroTik routing table.', meta: 'user-view', example: '/ip route print', vendors: ['mikrotik'] },
      { name: 'user-view: show running-config', description: 'Shows the full running-config (Cisco/Aruba).', meta: 'user-view', example: 'show running-config', vendors: ['cisco', 'aruba'] },
      { name: 'user-view: show version', description: 'Platform version banner (Cisco/Aruba).', meta: 'user-view', example: 'show version', vendors: ['cisco', 'aruba'] },
      { name: 'user-view: show interface status', description: 'Report of status, VLAN and speed of each physical interface (Cisco/Aruba).', meta: 'user-view', example: 'show interface status', vendors: ['cisco', 'aruba'] },
      { name: 'system-view: /ip address add address=<ip/mask} interface=<p>', description: 'Assigns an IP to a port in MikroTik.', meta: 'system-view', example: '/ip address add address=192.168.1.1/24 interface=ether1', vendors: ['mikrotik'] },
      { name: 'system-view: hostname <name>', description: 'Changes the host name in Aruba CX.', meta: 'system-view', example: 'hostname ARUBA-CORE', vendors: ['aruba'] },
      { name: 'system-view: interface range <start>-<end>', description: 'Applies actions over a range of interfaces.', meta: 'system-view', example: 'interface range GigabitEthernet0/0/1 - 0/0/4', vendors: ['cisco'] },
      { name: 'user-view: display interface description', description: 'Shows name, status and description of each connected port.', meta: 'user-view', example: 'display interface description GE0/0/1' },
      { name: 'user-view: display vlan', description: 'Lists defined VLANs and their status.', meta: 'user-view', example: 'display vlan' },
      { name: 'user-view: display ip routing-table', description: 'IP-style known routing table.', meta: 'user-view', example: 'display ip routing-table' },
      { name: 'user-view: display lldp neighbor brief', description: 'Detected LLDP neighbors and local ports.', meta: 'user-view', example: 'display lldp neighbor brief' },
      { name: 'user-view: display eth-trunk', description: 'Status and members of L2 aggregations.', meta: 'user-view', example: 'display eth-trunk' },
      { name: 'user-view: display mac-address | display arp', description: 'Active MAC and ARP tables for diagnostics.', meta: 'user-view', example: 'display mac-address' },
      { name: 'user-view: display loopback-detect', description: 'Ports protected against loops and their configured action.', meta: 'user-view', example: 'display loopback-detect' },
      { name: 'user-view: display alarms', description: 'History and current status of PoE, loop, port-security and DHCP alarms.', meta: 'user-view', example: 'display alarms' },
      { name: 'user-view: display qos', description: 'Summary of limit/shape and active queues.', meta: 'user-view', example: 'display qos' },
      { name: 'user-view: display version', description: 'Simulator version banner.', meta: 'user-view', example: 'display version' },
      { name: 'user-view: display current-configuration', description: 'Shows active configuration exported in running-config.', meta: 'user-view', example: 'display current-configuration' },
      { name: 'user-view: display stp', description: 'STP topology summarized by port.', meta: 'user-view', example: 'display stp' },
      { name: 'user-view: display nat translations', description: 'Lists existing NAT translations (static/dynamic/PAT) for Huawei.', meta: 'user-view', example: 'display nat translations' },
      { name: 'user-view: ping <ip>', description: 'Simulates a ping and documents the path in the telemetry panel.', meta: 'user-view', example: 'ping 10.0.0.1' },
      { name: 'user-view: traceroute <ip>', description: 'Calculates the packet path to a destination.', meta: 'user-view', example: 'traceroute 192.168.0.10' },
      { name: 'user-view: route -n', description: 'Unix-style routing table for quick checks.', meta: 'user-view', example: 'route -n' },
      { name: 'system-view: configure terminal', description: 'Cisco global configuration mode (equivalent to entering system-view).', meta: 'system-view', example: 'configure terminal', vendors: ['cisco'] },
      { name: 'system-view: copy running-config startup-config', description: 'Saves the active configuration to the startup configuration.', meta: 'system-view', example: 'copy running-config startup-config', vendors: ['cisco'] },
      { name: 'system-view: sysname <hostname>', description: 'Renames the device and updates the prompt.', meta: 'system-view', example: 'sysname NSR-A726' },
      { name: 'system-view: vlan batch <ids...>', description: 'Creates multiple VLANs in a single command.', meta: 'system-view', example: 'vlan batch 10 20 30' },
      { name: 'system-view: interface <name>', description: 'Opens the specified interface view (GE, XGE, VLANIF, Eth-Trunk).', meta: 'system-view', example: 'interface GE0/0/1' },
      { name: 'system-view: dhcp enable', description: 'Activates the device DHCP service.', meta: 'system-view', example: 'dhcp enable' },
      { name: 'system-view: ip pool <name>', description: 'Accesses the designated DHCP pool editor.', meta: 'system-view', example: 'ip pool LAB-POOL' },
      { name: 'system-view: ip route-static <dest> <mask> <nexthop>', description: 'Adds static routes with fixed next hop.', meta: 'system-view', example: 'ip route-static 10.0.0.0 24 172.16.0.1' },
      { name: 'system-view: ospf enable', description: 'Enables OSPF protocol for the device.', meta: 'system-view', example: 'ospf enable' },
      { name: 'system-view: ospf timer hello <s> dead <s>', description: 'Adjusts neighbor Hello and Dead timers.', meta: 'system-view', example: 'ospf timer hello 2 dead 6' },
      { name: 'system-view: display ip interface brief', description: 'Duplicated summary in system-view to check VLANIFs.', meta: 'system-view', example: 'display ip interface brief' },
      { name: 'system-view: display version', description: 'Virtual firmware version.', meta: 'system-view', example: 'display version' },
      { name: 'system-view: display loopback-detect', description: 'Loop-detect status on all ports.', meta: 'system-view', example: 'display loopback-detect' },
      { name: 'system-view: display alarms', description: 'Alarm history from global view.', meta: 'system-view', example: 'display alarms' },
      { name: 'system-view: display acl', description: 'ACL diagnostics and counters.', meta: 'system-view', example: 'display acl' },
      { name: 'system-view: display nat', description: 'NAT table (static/dynamic/PAT).', meta: 'system-view', example: 'display nat' },
      { name: 'system-view: display ospf lsdb', description: 'Partial LSDB listing with costs per interface.', meta: 'system-view', example: 'display ospf lsdb' },
      { name: 'system-view: nat rule add <name>', description: 'Adds NAT rule by alias.', meta: 'system-view', example: 'nat rule add out1' },
      { name: 'system-view: nat rule delete <name>', description: 'Deletes an existing NAT rule.', meta: 'system-view', example: 'nat rule delete out1' },
      { name: 'interface-view: description <text>', description: 'Labels a port to identify it in the UI.', meta: 'interface-view', example: 'description Uplink IM8' },
      { name: 'interface-view: shutdown', description: 'Administratively shuts down the port.', meta: 'interface-view', example: 'shutdown' },
      { name: 'interface-view: undo shutdown', description: 'Reactivates the port after a shutdown.', meta: 'interface-view', example: 'undo shutdown' },
      { name: 'interface-view: ip address <ip> <mask>', description: 'Assigns IPv4 address and mask to the port or VLANIF.', meta: 'interface-view', example: 'ip address 192.168.1.2 24' },
      { name: 'interface-view: port link-type access|trunk|hybrid|routed', description: 'Defines L2/L3 port behavior.', meta: 'interface-view', example: 'port link-type trunk' },
      { name: 'interface-view: port default vlan <id>', description: 'Sets the default VLAN in access mode.', meta: 'interface-view', example: 'port default vlan 10' },
      { name: 'interface-view: port trunk allow-pass vlan <list>', description: 'Controls allowed VLANs on a trunk.', meta: 'interface-view', example: 'port trunk allow-pass vlan 10 20 30' },
      { name: 'interface-view: port-security ...', description: 'Configures port security with sticky, max-mac-num and actions.', meta: 'interface-view', example: 'port-security enable' },
      { name: 'interface-view: loopback-detect enable | loopback-detect action <log|shutdown> | undo loopback-detect', description: 'Activates loop protection and defines the action on violation.', meta: 'interface-view', example: 'loopback-detect enable' },
      { name: 'interface-view: eth-trunk <name>', description: 'Creates an aggregation and lists members.', meta: 'interface-view', example: 'eth-trunk ET1' },
      { name: 'interface-view: lacp mode <static|active|passive>', description: 'Adjusts the LACP mode of the active aggregation.', meta: 'interface-view', example: 'lacp mode active' },
      { name: 'interface-view: qos limit <Mbps> | qos shape <pct> | qos queue add/delete', description: 'Policing, shaping and WRR queues with weights/DSCP.', meta: 'interface-view', example: 'qos queue add high weight 10 dscp 46' },
      { name: 'interface-view: display qos', description: 'Summary of applied queues and their counters.', meta: 'interface-view', example: 'display qos' },
      { name: 'interface-view: qinq | undo qinq', description: 'Activates or deactivates Q-in-Q.', meta: 'interface-view', example: 'qinq' },
      { name: 'interface-view: ip helper-address <ip>', description: 'Applies helper address for DHCP relay.', meta: 'interface-view', example: 'ip helper-address 10.0.0.10' },
      { name: 'interface-view: bpdu guard enable|disable', description: 'Protects edge ports from unexpected BPDUs.', meta: 'interface-view', example: 'bpdu guard enable' },
      { name: 'interface-view: bpdu filter enable|disable', description: 'Avoids processing unwanted BPDUs.', meta: 'interface-view', example: 'bpdu filter enable' },
      { name: 'interface-view: portfast enable|disable', description: 'Accelerates forwarding state in edge ports.', meta: 'interface-view', example: 'portfast enable' },
      { name: 'interface-view: loop-guard enable|disable', description: 'Prevents invalid BPDUs from being announced on trunk ports.', meta: 'interface-view', example: 'loop-guard enable' },
      { name: 'pool-view: network <ip> mask <mask>', description: 'Defines the main range of the DHCP pool.', meta: 'pool-view', example: 'network 192.168.200.0 mask 24' },
      { name: 'pool-view: gateway-list <ipv4,ipv4>', description: 'Specifies available gateways for the pool.', meta: 'pool-view', example: 'gateway-list 192.168.200.1' },
      { name: 'pool-view: dns-list <ip>', description: 'Builds the DNS list for the pool.', meta: 'pool-view', example: 'dns-list 8.8.8.8' },
      { name: 'pool-view: excluded-ip <ip>', description: 'Marks excluded IPs to avoid conflicts.', meta: 'pool-view', example: 'excluded-ip 192.168.200.5' },
      { name: 'pool-view: static-bind <mac> <ip>', description: 'Sets a static binding by MAC.', meta: 'pool-view', example: 'static-bind 02:42:ac:11:00:02 192.168.200.10' },
      { name: 'pool-view: lease <seconds>', description: 'Defines the duration of the active lease.', meta: 'pool-view', example: 'lease 86400' },
      { name: 'pool-view: return', description: 'Returns to system-view from the pool editor.', meta: 'pool-view', example: 'return' },
      { name: '? / help', description: 'Lists suggested commands for the active view.', example: '?' }
    ]
  },
  {
    id: 'features',
    title: 'Feature Matrix',
    description: 'Current status of visual and network services that the simulator exposes in the sidebar.',
    entries: [
      { name: 'Live Device Catalog', description: 'Loads packs by vendor from localStorage and groups them in the Devices tab with metadata.', meta: 'Sidebar Devices' },
      { name: 'Command Telemetry', description: 'Status panel summarizes command usage to prioritize features and labs.', meta: 'Sidebar Status' },
      { name: 'VRP-like CLI', description: 'Hierarchical views, abbreviations and Huawei VRP style errors.', meta: 'CLI' },
      { name: 'Alarm Center', description: 'Alarm panel (PoE, loop, port-security, DHCP) with severity filters.', meta: 'Sidebar Status' },
      { name: 'Collaboration', description: 'Optimistic workspace locking with claim/release and owner visibility.', meta: 'Sidebar Status' },
      { name: 'Local Snapshots', description: 'Local snapshots for saving and restoring topology states.', meta: 'Sidebar Status' },
      {
        name: '/docs portal: export + docs sync',
        description: 'Publishes each export (JSON + running-config) in `/docs/export-import.md` to keep the live guide synced with the simulation.',
        meta: 'Portal /docs',
        extra: [
          'We archive exported configurations',
          'Updates src/data/documentation.ts after each change',
          'Use npm run export-config -- --running <path> [--topology <path>]'
        ]
      }
    ]
  },
  {
    id: 'labs',
    title: 'Lab Guides',
    description: 'Reproducible checklist to train VRP concepts in the simulator.',
    entries: [
      {
        name: 'VRRP failover Lab',
        description: 'Configure two routers with VRRP and validate takeover when disconnecting the Master.',
        extra: [
          'Place two routers and connect them to the same switch.',
          'Activate VRRP and define the virtual IP.',
          'Use ping from PC to verify failover.'
        ]
      },
      {
        name: 'Basic QoS Lab',
        description: 'Adjust queues and verify how QoS affects ping.',
        extra: [
          'Create queue with limit 10 Mbps and shape 80%.',
          'Apply ACL that filters specific 5-tuples.',
          'Cross cable and generate traffic to observe the QoS trace.'
        ]
      },
      {
        name: 'ACL + NAT Lab',
        description: 'Merge ACLs and NAT to observe drops and translations.',
        extra: [
          'Define ACL deny on a VLAN.',
          'Add dynamic/PAT NAT rule with alias.',
          'Run ping and check the documentation panel and ACL hit.'
        ]
      },
      {
        name: 'STP loop-detect Lab',
        description: 'Simulate loops and observe how loop-detect triggers alarms.',
        extra: [
          'Connect switches A-B-C with loops in C.',
          'Enable loop-detect on critical interfaces.',
          'Monitor the Alarm Center upon detecting the loop.'
        ]
      }
    ]
  }
];
