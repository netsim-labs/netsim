# Integration Tests (CLI + Topology)

This directory contains integration tests that validate the interaction between the CLI Slice and Topology Slice, ensuring that when users execute commands, the device state changes correctly.

## Test Structure

Each test follows the pattern:
1. **SETUP**: Create device in store with initial state
2. **EXECUTE**: Run command through store facade
3. **VERIFY**: Inspect resulting state in store

## Current Coverage

### Huawei VRP Scenarios
- [x] VLAN batch creation (`vlan batch 10 20 30`)
- [x] IP address assignment on interface
- [x] OSPF enable/disable
- [x] Interface shutdown/undo shutdown

### Cisco IOS Scenarios
- [x] VLAN configuration (vlan <id>)
- [x] IP address assignment on interface
- [x] OSPF configuration
- [x] Interface shutdown/no shutdown

## Running Tests

```bash
npm run test:logic
# or
npx vitest run src/tests/integration/
```

## Test Categories

### CLI-Topology Integration
- Commands that modify device state
- Multi-command sequences
- Vendor-specific behavior validation
- Error handling and validation

### Cross-Device Interactions
- Commands affecting multiple devices
- Routing protocol interactions
- Link state changes

### State Persistence
- Commands that should persist across sessions
- Schema version compatibility
- Migration validation
