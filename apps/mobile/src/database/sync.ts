import { synchronize } from '@nozbe/watermelondb/sync';
import { database } from './index';
import { supabase } from '../lib/supabase';
const mapToLocal = (row: any) => {
  const local: any = {
    ...row,
    created_at: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    updated_at: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
    deleted_at: row.deleted_at ? new Date(row.deleted_at).getTime() : null,
  };
  
  if (row.log_date !== undefined) {
    local.log_date = row.log_date ? new Date(row.log_date).getTime() : Date.now();
  }
  
  return local;
};

const mapToRemote = (row: any) => {
  const remote: any = { ...row };
  if (row.created_at) remote.created_at = new Date(row.created_at).toISOString();
  if (row.updated_at) remote.updated_at = new Date(row.updated_at).toISOString();
  remote.deleted_at = row.deleted_at ? new Date(row.deleted_at).toISOString() : null;
  
  if (row.log_date !== undefined) {
    remote.log_date = row.log_date ? new Date(row.log_date).toISOString() : new Date().toISOString();
  }
  
  return remote;
};

export async function syncGroSphere() {
  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt }) => {
      console.log('Sync: Pulling changes since', lastPulledAt);
      
      const tables = ['plants', 'user_gardens', 'plant_guides', 'garden_logs'];
      const lastPulledDate = lastPulledAt ? new Date(lastPulledAt).toISOString() : new Date(0).toISOString();
      
      const pullPromises = tables.map(async (table) => {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .gt('updated_at', lastPulledDate);

        if (error) {
          throw new Error(`Sync error pulling ${table}: ${error.message}`);
        }

        return {
          table,
          changes: {
            created: data.filter(r => !r.deleted_at).map(mapToLocal),
            updated: [],
            deleted: data.filter(r => r.deleted_at).map(r => r.id),
          }
        };
      });

      const results = await Promise.all(pullPromises);
      const changes: any = {};
      results.forEach(res => {
        changes[res.table] = res.changes;
      });

      return { changes, timestamp: Date.now() };
    },
    pushChanges: async ({ changes, lastPulledAt }) => {
      console.log('Sync: Pushing changes since', lastPulledAt);

      for (const table in changes) {
        const { created, updated, deleted } = (changes as any)[table];

        // 1. Handle Created & Updated (Upsert)
        const upserts = [...created, ...updated].map(mapToRemote);
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
