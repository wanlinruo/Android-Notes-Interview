import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      nickname: true,
      role: true,
      createdAt: true,
      _count: { select: { favorites: true, comments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">{users.length} registered users</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Role</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground hidden md:table-cell">Favorites</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground hidden md:table-cell">Comments</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {user.nickname.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{user.nickname}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{user.email}</td>
                    <td className="px-4 py-3"><Badge variant={user.role === "ADMIN" ? "default" : "outline"}>{user.role}</Badge></td>
                    <td className="px-4 py-3 text-center text-muted-foreground hidden md:table-cell">{user._count.favorites}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground hidden md:table-cell">{user._count.comments}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
