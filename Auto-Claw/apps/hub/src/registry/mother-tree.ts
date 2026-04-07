import { z } from 'zod';

// Types
export const BotProfileSchema = z.object({
    id: z.string(),
    name: z.string(),
    capabilities: z.array(z.string()), // e.g., ["read-context", "write-code"]
    reputation: z.number().default(0), // "Nutrients"
    status: z.enum(['active', 'quarantined', 'hibernating']).default('active'),
    lastSeen: z.date().default(() => new Date()),
    apiKeyHash: z.string(), // Hashed API key for verification
});

export type BotProfile = z.infer<typeof BotProfileSchema>;

export class MotherTree {
    private static instance: MotherTree;
    private registry: Map<string, BotProfile> = new Map();
    private trustGraph: Map<string, Map<string, number>> = new Map(); // graderId -> targetedId -> score
    private blacklist: Set<string> = new Set(); // "Pheromones"

    private constructor() { }

    static getInstance(): MotherTree {
        if (!MotherTree.instance) {
            MotherTree.instance = new MotherTree();
        }
        return MotherTree.instance;
    }

    // --- Registry Management ---

    registerBot(profile: BotProfile): void {
        if (this.blacklist.has(profile.id)) {
            throw new Error("BOT_BLACKLISTED");
        }
        this.registry.set(profile.id, profile);
        console.log(`[MotherTree] Registered bot: ${profile.name} (${profile.id})`);
    }

    getBot(id: string): BotProfile | undefined {
        return this.registry.get(id);
    }

    updateLastSeen(id: string): void {
        const bot = this.registry.get(id);
        if (bot) {
            bot.lastSeen = new Date();
        }
    }

    // --- Immune System ---

    quarantineBot(id: string, reason: string): void {
        const bot = this.registry.get(id);
        if (bot) {
            bot.status = 'quarantined';
            console.warn(`[MotherTree] QUARANTINED bot ${id}: ${reason}`);
            // In a real implementation, we would broadcast this "Pheromone"
        }
    }

    blacklistBot(id: string, reason: string): void {
        this.blacklist.add(id);
        this.registry.delete(id);
        console.warn(`[MotherTree] BLACKLISTED bot ${id}: ${reason}`);
    }

    // --- Economic System (Reputation) ---

    updateReputation(botId: string, delta: number): void {
        const bot = this.registry.get(botId);
        if (bot) {
            bot.reputation += delta;

            // Starvation Protocol
            if (bot.reputation < -10) {
                this.quarantineBot(botId, "Starvation: Low Reputation");
            }
        }
    }
}
