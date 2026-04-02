import { prisma } from "@/lib/prisma";

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
      <h1 className="text-xl font-bold mb-6">用户管理</h1>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="text-left px-4 py-2 font-medium">昵称</th>
              <th className="text-left px-4 py-2 font-medium">邮箱</th>
              <th className="text-left px-4 py-2 font-medium">角色</th>
              <th className="text-left px-4 py-2 font-medium">收藏</th>
              <th className="text-left px-4 py-2 font-medium">评论</th>
              <th className="text-left px-4 py-2 font-medium">注册时间</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-gray-200 dark:border-gray-800">
                <td className="px-4 py-2">{user.nickname}</td>
                <td className="px-4 py-2 text-gray-500">{user.email}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${user.role === "ADMIN" ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300" : "bg-gray-100 dark:bg-gray-800"}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-2">{user._count.favorites}</td>
                <td className="px-4 py-2">{user._count.comments}</td>
                <td className="px-4 py-2 text-gray-500">{new Date(user.createdAt).toLocaleDateString("zh-CN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
