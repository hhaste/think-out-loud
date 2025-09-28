"use client";

import { QueryClient as ReactQuery, QueryClientProvider } from "@tanstack/react-query";

export const QueryClient = new ReactQuery();

export default function Providers({ children }) {
    return (
        <QueryClientProvider client={QueryClient}>
            {children}
        </QueryClientProvider>
    );
}