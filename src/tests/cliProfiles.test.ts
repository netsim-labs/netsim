import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import {
  getVendorProfile,
  getVendorCommandSuggestions,
  getVendorBaseSuggestions
} from '../utils/cliProfiles.js';

test('getVendorProfile prefers Cisco vendor metadata', () => {
  const profile = getVendorProfile('Cisco');
  assert.strictEqual(profile.id, 'cisco');
  assert.strictEqual(profile.label.startsWith('Cisco'), true);
});

test('getVendorProfile falls back to Huawei for unknown vendors', () => {
  const profile = getVendorProfile('NetSim');
  assert.strictEqual(profile.id, 'huawei');
  assert.strictEqual(profile.label.startsWith('Huawei'), true);
});

test('getVendorProfile recognizes Cisco by model even when vendor is generic', () => {
  const profile = getVendorProfile('NetSim', 'Cisco-Catalyst-9300');
  assert.strictEqual(profile.id, 'cisco');
});

test('getVendorProfile keeps Huawei profile for other vendors like Aruba or D-Link', () => {
  const arubaProfile = getVendorProfile('Aruba');
  const dlinkProfile = getVendorProfile('D-Link');
  assert.strictEqual(arubaProfile.id, 'huawei');
  assert.strictEqual(dlinkProfile.id, 'huawei');
});

test('getVendorCommandSuggestions matches registry entries and limits results', () => {
  const profile = getVendorProfile('NetSim');
  const suggestions = getVendorCommandSuggestions(profile, 'display ip');
  assert.ok(suggestions.length > 0);
  assert.ok(suggestions.length <= 5);
  assert.ok(suggestions.every(cmd => cmd.toLowerCase().startsWith('display ip')));
});

test('getVendorBaseSuggestions returns view-specific hints', () => {
  const profile = getVendorProfile('Cisco');
  const viewSuggestions = getVendorBaseSuggestions(profile, 'interface-view');
  assert.ok(viewSuggestions.includes('description'));
  assert.ok(viewSuggestions.includes('shutdown'));
});
