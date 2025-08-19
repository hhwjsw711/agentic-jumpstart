import { useQuery } from "@tanstack/react-query";
import { getUserInfoFn } from "~/fn/users";

export function useAuth() {
  const userInfo = useQuery({
    queryKey: ["userInfo"],
    queryFn: () => getUserInfoFn(),
  });

  return userInfo.data?.user;
}
