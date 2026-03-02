"use client";

import { useQuery } from "@tanstack/react-query";
import { usersService } from "@/services/users.service";

export function useUsers(search?: string) {
  return useQuery({
    queryKey: ["users", search ?? ""],
    queryFn: () => usersService.listUsers({ search: search || undefined, limit: 30 }),
    staleTime: 60 * 1000,
  });
}
