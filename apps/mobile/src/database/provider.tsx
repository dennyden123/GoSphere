import React from 'react';
import DatabaseProvider from '@nozbe/watermelondb/DatabaseProvider';
import { database } from './index';

export const GroSphereDatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const Provider = DatabaseProvider as any;
  return (
    <Provider database={database}>
      {children}
    </Provider>
  );
};
