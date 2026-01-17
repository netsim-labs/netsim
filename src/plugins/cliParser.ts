export interface CliStrategy {
  id: string;
  vendor: string;
  describe: (profileId?: string | null) => string;
  handle?: (command: string, profileId?: string | null) => string;
}

const strategies = new Map<string, CliStrategy>();

export const registerCliStrategy = (strategy: CliStrategy) => {
  strategies.set(strategy.id, strategy);
};

export const getCliStrategy = (profileId?: string | null): CliStrategy => {
  const fallback = strategies.get('default');
  if (!profileId) return fallback!;
  return strategies.get(profileId) || fallback!;
};

export const listCliStrategies = () => Array.from(strategies.values());

registerCliStrategy({
  id: 'default',
  vendor: 'NetSim',
  describe: () => 'Base VRP strategy for interfaces and dynamic help.',
  handle: (command) => `Processed with base strategy: ${command}`
});

registerCliStrategy({
  id: 'cisco',
  vendor: 'Cisco',
  describe: () => 'Cisco IOS parser with Cisco tables and prompts.',
  handle: (command) => `Cisco strategy parsed: ${command}`
});

registerCliStrategy({
  id: 'huawei',
  vendor: 'Huawei',
  describe: () => 'Huawei VRP parser with view hierarchy and contextual help.',
  handle: (command) => `Huawei strategy parsed: ${command}`
});
