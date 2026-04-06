let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getLarkTenantToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const appId = process.env.LARK_APP_ID;
  const appSecret = process.env.LARK_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error("LARK_APP_ID and LARK_APP_SECRET must be configured");
  }

  const res = await fetch(
    "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
    }
  );

  const data = await res.json();

  if (data.code !== 0) {
    throw new Error(`Lark token error: ${data.msg}`);
  }

  cachedToken = {
    token: data.tenant_access_token,
    expiresAt: Date.now() + data.expire * 1000,
  };

  return cachedToken.token;
}

export async function replyLarkMessage(
  messageId: string,
  text: string
): Promise<void> {
  const token = await getLarkTenantToken();

  const res = await fetch(
    `https://open.feishu.cn/open-apis/im/v1/messages/${messageId}/reply`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: JSON.stringify({ text }),
        msg_type: "text",
      }),
    }
  );

  const data = await res.json();
  if (data.code !== 0) {
    console.error("Lark reply error:", data);
  }
}
