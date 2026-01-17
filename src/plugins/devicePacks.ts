import { DeviceModelMeta } from '../data/deviceCatalog';

export interface DevicePack {
  id: string;
  label: string;
  vendor: DeviceModelMeta['vendor'];
  description: string;
  models: DeviceModelMeta[];
}

const packs: Record<string, DevicePack> = {};

export const registerDevicePack = (pack: DevicePack) => {
  packs[pack.id] = pack;
};

export const getDevicePacks = (): DevicePack[] => Object.values(packs);

export const applyDevicePacks = (models: DeviceModelMeta[]): DeviceModelMeta[] => {
  const map = new Map<string, DeviceModelMeta>(models.map(model => [model.model, model]));
  getDevicePacks().forEach(pack => {
    pack.models.forEach(model => {
      map.set(model.model, { ...model, vendor: pack.vendor });
    });
  });
  return Array.from(map.values());
};

registerDevicePack({
  id: 'dlink',
  label: 'D-Link Device Pack',
  vendor: 'D-Link',
  description: 'Device pack for D-Link EdgeSwitch and DGS models with enhanced QoS hints.',
  models: [
    {
      model: 'D-Link-DGS-1210',
      vendor: 'D-Link',
      displayName: 'D-Link DGS-1210',
      description: 'Managed L2 switch with 24 GE ports and advanced Layer 2 features.',
      category: 'Switch',
      ports: { ge: 24 },
      features: ['ACL', 'QoS'],
      pack: 'dlink-switch'
    },
    {
      model: 'D-Link-DGS-1510',
      vendor: 'D-Link',
      displayName: 'D-Link DGS-1510',
      description: 'L2+ switch with 28 ports (24x GE + 4x 10G SFP+)',
      category: 'Switch',
      ports: { ge: 24, xge: 4 },
      features: ['Smart L2', 'ACL', 'RSTP'],
      pack: 'dlink-switch'
    }
  ]
});

registerDevicePack({
  id: 'aruba',
  label: 'Aruba Device Pack',
  vendor: 'Aruba',
  description: 'Aruba models ready for future plugin-based CLIs.',
  models: [
    {
      model: 'Aruba-2930F',
      vendor: 'Aruba',
      displayName: 'Aruba 2930F',
      description: 'Edge switch with 24 GE and 4 SFP ports.',
      category: 'Switch',
      ports: { ge: 24, xge: 4 },
      features: ['Energy-efficient', 'ACL'],
      pack: 'aruba-switch'
    },
    {
      model: 'Aruba-5400R',
      vendor: 'Aruba',
      displayName: 'Aruba 5400R',
      description: 'Stackable campus switch with 48 GE and 8x 10G ports.',
      category: 'Switch',
      ports: { ge: 48, xge: 8 },
      features: ['Stacking', 'OSPF', 'ACL'],
      pack: 'aruba-core'
    }
  ]
});
