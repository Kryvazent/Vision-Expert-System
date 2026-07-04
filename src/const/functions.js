import { useContext } from "react";
import AuthContext from "../auth/AuthContext";

export const normalizeOrderStatus = (status) =>
  String(status ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

export const isOrderStatus = (status, expected) => {
  const normalized = normalizeOrderStatus(status);
  const expectedValues = Array.isArray(expected) ? expected : [expected];

  return expectedValues.some((value) => {
    const candidate = normalizeOrderStatus(value);

    if (candidate === "canceled") {
      return normalized === "canceled" || normalized === "cancelled";
    }

    return normalized === candidate;
  });
};

export const getOrderStatusLabel = (status) => {
  const normalized = normalizeOrderStatus(status);

  switch (normalized) {
    case "pending":
      return "Pending";
    case "active":
      return "Active";
    case "hold":
      return "Hold";
    case "completed":
      return "Completed";
    case "canceled":
    case "cancelled":
      return "Canceled";
    default:
      return status || "Unknown";
  }
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}