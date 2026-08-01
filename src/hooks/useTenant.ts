import { useContext } from "react";
import { TenantContext } from "../contexts/tenant-context";

export default function useTenant() {
  return useContext(TenantContext);
}
