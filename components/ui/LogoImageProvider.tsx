'use client';

import {createContext, useContext} from 'react';

import type {LogoImageUrls} from '@/lib/server/getLogoImageUrl';

const LogoImageUrlContext = createContext<LogoImageUrls | null>(null);

export function LogoImageProvider({
  value,
  children,
}: {
  value: LogoImageUrls | null;
  children: React.ReactNode;
}) {
  return (
    <LogoImageUrlContext.Provider value={value}>
      {children}
    </LogoImageUrlContext.Provider>
  );
}

export function useLogoImageUrl() {
  return useContext(LogoImageUrlContext);
}
