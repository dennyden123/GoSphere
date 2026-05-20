import { synchronize } from '@nozbe/watermelondb/sync';
import { database } from './index';
import { supabase } from '../lib/supabase';

export async function syncGroSphere() {
  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt }) => {
      console.log('Sync: Pulling changes since', lastPulledAt);
      
      const tables = ['plants', 'user_gardens', 'plant_guides', 'garden_logs'];
      const changes: any = {};

      for (const table of tables) {
        const lastPulledDate = lastPulledAt ? new Date(lastPulledAt).toISOString() : new Date(0).toISOString();
        
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .gt('updated_at', lastPulledDate);

        if (error) {
          throw new Error(`Sync error pulling ${table}: ${error.message}`);
        }

        changes[table] = {
          created: data.filter(r => !r.deleted_at), // Simple logic: if deleted_at is null, it's either new or updated
          updated: [], // WatermelonDB can handle both in 'created' if it uses IDs
          deleted: data.filter(r => r.deleted_at).map(r => r.id),
        };
      }

      return { changes, timestamp: Date.now() };
    },
    pushChanges: async ({ changes, lastPulledAt }) => {
      console.log('Sync: Pushing changes since', lastPulledAt);

      for (const table in changes) {
        const { created, updated, deleted } = (changes as any)[table];

        // 1. Handle Created & Updated (Upsert)
        const upserts = [...created, ...updated];
        if (upserts.length > 0) {
          const { error } = await supabase
            .from(table)
            .upsert(upserts);

          if (error) {
            throw new Error(`Sync error pushing (upsert) ${table}: ${error.message}`);
          }
        }

        // 2. Handle Deleted (Soft Delete)
        if (deleted.length > 0) {
          const { error } = await supabase
            .from(table)
            .update({ deleted_at: new Date().toISOString() })
            .in('id', deleted);

          if (error) {
            throw new Error(`Sync error pushing (delete) ${table}: ${error.message}`);
          }
        }
      }
    },
    migrationsEnabledAtVersion: 1,
  });
}
