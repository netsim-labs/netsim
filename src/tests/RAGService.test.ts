
import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { RAGService } from '../features/ai/rag/RAGService.js';

describe('RAGService', () => {

    it('returns empty string for empty results', async () => {
        const rag = RAGService.getInstance();
        const context = await rag.getContext('zzzzzzzzzzzz', 'huawei');
        assert.strictEqual(context, '', 'Should return empty string for no matches');
    });

    it('retrieves basic commands for Huawei', async () => {
        const rag = RAGService.getInstance();
        const context = await rag.getContext('configure vlan', 'huawei');

        // Should find 'vlan <id>' or 'vlan batch'
        assert.ok(context.includes('DOCUMENTATION FOR Huawei'), 'Should have header');
        assert.ok(context.includes('vlan'), 'Should include relevant command');
    });

    it('prioritizes exact matches', async () => {
        const rag = RAGService.getInstance();
        const context = await rag.getContext('ospf', 'huawei');

        assert.ok(context.includes('ospf enable'), 'Should include ospf enable command');
    });

    it('handles different vendors', async () => {
        const rag = RAGService.getInstance();
        const context = await rag.getContext('interface', 'cisco');

        assert.ok(context.includes('DOCUMENTATION FOR Cisco'), 'Should be Cisco docs');
        assert.ok(context.includes('interface GigabitEthernet0/0'), 'Should have interface command');
    });

    it('returns error message for unknown vendor', async () => {
        const rag = RAGService.getInstance();
        // @ts-ignore testing invalid input
        const context = await rag.getContext('ip', 'unknown-vendor');

        // New behavior returns empty string if no profile found
        assert.ok(context.includes('No documentation found') || context === '', 'Should match no docs found or empty');
    });

});
