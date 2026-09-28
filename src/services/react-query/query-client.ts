import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // A failed request surfaces straight away instead of after three silent
      // retries — easier to reason about, in the UI and in e2e.
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

export default queryClient;
