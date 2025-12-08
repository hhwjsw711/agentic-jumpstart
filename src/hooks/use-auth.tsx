import { useQuery } from "@tanstack/react-query";
import { getUserInfoFn } from "~/fn/users";

export function useAuth() {
  const userInfo = useQuery({
    queryKey: ["userInfo"],
    queryFn: () => getUserInfoFn(),
  });

  return userInfo.data?.user;
}

export function useAuthWithProfile() {
  const userInfo = useQuery({
    queryKey: ["userInfo"],
    queryFn: () => getUserInfoFn(),
  });

  return {
    user: userInfo.data?.user,
    profile: userInfo.data?.profile,
  };
}
