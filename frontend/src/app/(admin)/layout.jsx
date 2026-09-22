import { ProductsProvider } from "@/components/ProductsContex";
import AdminRouteGuard from "@/components/AdminRouteGuard";

export default function AdminRootLayout({ children }) {
  return <AdminRouteGuard><ProductsProvider>{children}</ProductsProvider></AdminRouteGuard>;
}