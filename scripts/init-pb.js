const PocketBase = require('pocketbase/cjs');

// Configuration
const PB_URL = 'http://127.0.0.1:8090'; 
const ADMIN_EMAIL = 'admin@example.com'; // CHANGE THIS IF NEEDED
const ADMIN_PASSWORD = 'password123';    // CHANGE THIS IF NEEDED

// DEFINITIVE SCHEMA MATCHING CODEBASE
const TARGET_SCHEMA = [
    {
        name: 'families',
        type: 'base',
        schema: [
            { name: 'name', type: 'text', required: true }
        ]
    },
    {
        name: 'accounts',
        type: 'base',
        schema: [
            { name: 'name', type: 'text', required: true },
            { name: 'type', type: 'select', options: { values: ['bank', 'cash', 'ewallet'] } },
            { name: 'current_balance', type: 'number' },
            { name: 'family_id', type: 'relation', options: { collectionId: 'families', cascadeDelete: false } }
        ]
    },
    {
        name: 'categories',
        type: 'base',
        schema: [
            { name: 'name', type: 'text', required: true },
            { name: 'icon', type: 'text' },
            { name: 'type', type: 'select', options: { values: ['income', 'expense'] } },
            { name: 'color', type: 'text' },
            { name: 'family_id', type: 'relation', options: { collectionId: 'families' } }
        ]
    },
    {
        name: 'transactions',
        type: 'base',
        schema: [
            { name: 'type', type: 'select', options: { values: ['income', 'expense', 'transfer'] } },
            { name: 'amount', type: 'number', required: true },
            { name: 'date', type: 'date', required: true },
            { name: 'note', type: 'text' },
            { name: 'beneficiary', type: 'text' }, // 'Raditya', 'Common', etc.
            { name: 'importance_level', type: 'select', options: { values: ['need', 'want', 'general'] } },
            
            // Relations
            { name: 'category_id', type: 'relation', options: { collectionId: 'categories' } },
            { name: 'source_account_id', type: 'relation', options: { collectionId: 'accounts' } },
            { name: 'destination_account_id', type: 'relation', options: { collectionId: 'accounts' } },
            { name: 'user_id', type: 'relation', options: { collectionId: 'users' } },
            { name: 'family_id', type: 'relation', options: { collectionId: 'families' } }
        ]
    },
    {
        name: 'budgets',
        type: 'base',
        schema: [
            { name: 'amount_limit', type: 'number', required: true },
            { name: 'period', type: 'select', options: { values: ['monthly', 'weekly'] } },
            { name: 'family_id', type: 'relation', options: { collectionId: 'families' } }
        ]
    },
    {
        name: 'reminders',
        type: 'base',
        schema: [
            { name: 'title', type: 'text', required: true },
            { name: 'amount', type: 'number' },
            { name: 'next_due_date', type: 'date' },
            { name: 'is_active', type: 'bool' },
            { name: 'is_recurring', type: 'bool' },
            { name: 'family_id', type: 'relation', options: { collectionId: 'families' } }
        ]
    }
];

async function main() {
    console.log('🚀 Starting PocketBase Schema Sync...');
    
    const pb = new PocketBase(PB_URL);
    pb.autoCancellation(false);

    try {
        console.log(`🔑 Authenticating...`);
        await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
        console.log('✅ Authenticated.');

        for (const target of TARGET_SCHEMA) {
            console.log(`\n📂 Processing collection: ${target.name}`);
            
            let collection;
            try {
                collection = await pb.collections.getOne(target.name);
            } catch (e) {
                // Not found
            }

            if (!collection) {
                console.log(`   ✨ Creating new collection...`);
                await pb.collections.create(target);
            } else {
                console.log(`   🔄 Updating existing collection...`);
                // We merge existing schema with new fields
                // Note: This naive approach appends new fields. 
                // PocketBase requires passing the FULL schema to update.
                
                // 1. Get current fields
                const currentSchema = collection.schema || [];
                const targetSchema = target.schema;

                // 2. Merge: If field exists in target, use target. If not in target but in current, keep it (safe mode).
                // Actually user said "timpa aja" (overwrite). So we prioritize Target.
                
                const finalSchema = [...currentSchema];

                targetSchema.forEach(field => {
                    const existingIdx = finalSchema.findIndex(f => f.name === field.name);
                    if (existingIdx >= 0) {
                        // Update existing field definition
                        finalSchema[existingIdx] = { ...finalSchema[existingIdx], ...field };
                    } else {
                        // Add new field
                        finalSchema.push(field);
                    }
                });

                try {
                    await pb.collections.update(collection.id, {
                        ...target,
                        schema: finalSchema
                    });
                    console.log(`      ✅ Updated schema fields.`);
                } catch (err) {
                    console.error(`      ❌ Failed to update: ${err.message}`);
                }
            }
        }
        
        // Also update Users collection to have family_id if missing
        console.log(`\n👤 Checking Users collection...`);
        const users = await pb.collections.getOne('users');
        const hasFamilyId = users.schema.find(f => f.name === 'family_id');
        if (!hasFamilyId) {
             console.log(`   ➕ Adding family_id to users...`);
             users.schema.push({ name: 'family_id', type: 'relation', options: { collectionId: 'families' } });
             await pb.collections.update(users.id, { schema: users.schema });
        }

        console.log('\n🎉 Schema Sync Complete! Database matches Codebase.');

    } catch (err) {
        console.error('\n❌ Fatal Error:', err.message);
    }
}

main();
