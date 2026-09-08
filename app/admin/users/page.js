import UsersAdminClient from "./UsersAdminClient";

export const metadata = {
  alternates: {
    canonical: "/admin/users",
  },
  title: "Accès admin — Codex RP",
};

export default function AdminUsersPage() {
  return <UsersAdminClient />;
}
