import { Client, Account, Databases, Query } from "node-appwrite";
import { APPWRITE_CONFIG } from "@/lib/appwrite/config";

// POST /api/chat
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const incoming = body?.messages || [];

    // parse cookies to find session/JWT
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies: Record<string, string> = {};
    cookieHeader.split(";").forEach((c) => {
      const [k, ...v] = c.split("=");
      if (!k) return;
      cookies[k.trim()] = decodeURIComponent((v || []).join("=").trim());
    });

    const jwt = cookies["appwrite-jwt"];
    const session =
      cookies["appwrite-session"] ||
      cookies[`a_session_${APPWRITE_CONFIG.projectId}`] ||
      cookies[`a_session_${APPWRITE_CONFIG.projectId}_legacy`];

    if (!jwt && !session) {
      return new Response(
        JSON.stringify({
          error: "Không tìm thấy session. Vui lòng đăng nhập.",
        }),
        { status: 401 }
      );
    }

    // verify session with Appwrite
    const client = new Client()
      .setEndpoint(APPWRITE_CONFIG.endpoint)
      .setProject(APPWRITE_CONFIG.projectId);
    if (jwt) client.setJWT(jwt);
    else client.setSession(session as string);

    const account = new Account(client);
    let user;
    try {
      user = await account.get();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Session không hợp lệ" }), {
        status: 401,
      });
    }

    // read profile to check role
    const serverClient = process.env.APPWRITE_API_KEY
      ? new Client()
          .setEndpoint(APPWRITE_CONFIG.endpoint)
          .setProject(APPWRITE_CONFIG.projectId)
          .setKey(process.env.APPWRITE_API_KEY)
      : client;
    const databases = new Databases(serverClient);

    const profileRes = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.profiles,
      [Query.equal("userId", user.$id), Query.limit(1)]
    );
    if (
      !profileRes ||
      !profileRes.documents ||
      profileRes.documents.length === 0
    ) {
      return new Response(JSON.stringify({ error: "Profile không tồn tại" }), {
        status: 403,
      });
    }

    const profile = profileRes.documents[0] as any;
    const allowed = (
      process.env.ALLOWED_AI_ROLES ||
      "member,premium,pham_nhan,chi_cuong_gia,thanh_nhan,chi_ton"
    )
      .split(",")
      .map((s) => s.trim());
    const role = (profile.role || "").toString();
    if (!allowed.includes(role)) {
      return new Response(
        JSON.stringify({ error: "Bạn không có quyền sử dụng AI" }),
        { status: 403 }
      );
    }

    // call Groq (Grok) API
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY)
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY chưa cấu hình" }),
        { status: 500 }
      );

    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
    const systemInstruction =
      process.env.SYSTEM_INSTRUCTION ||
      "Hài hước, ngắn gọn, đanh đá, nhưng chính xác. Trả lời tiếng Việt khi người dùng hỏi tiếng Việt.";

    const messages = [
      { role: "system", content: systemInstruction },
      ...incoming.map((m: any) => ({
        role: m.role || "user",
        content: m.content,
      })),
    ];

    // Use Groq's OpenAI-compatible endpoint
    const groqUrl = `https://api.groq.com/openai/v1/chat/completions`;
    let json: any = null;
    try {
      console.log("Calling Groq API", {
        groqUrl,
        model,
        hasKey: !!GROQ_API_KEY,
      });
      const resp = await fetch(groqUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        // OpenAI-compatible body
        body: JSON.stringify({ model, messages }),
      });

      if (!resp.ok) {
        const txt = await resp.text();
        console.error("Groq API returned non-ok:", resp.status, txt);
        // Return a dev-friendly assistant message so UI shows a reply and we can iterate
        const assistantDev = `Groq API error ${resp.status}: ${txt}`;
        return new Response(
          JSON.stringify({
            message: { role: "assistant", content: assistantDev },
          }),
          { status: 200 }
        );
      }

      json = await resp.json();
    } catch (fetchErr: any) {
      console.error(
        "Failed to call Groq API:",
        fetchErr?.message || fetchErr,
        fetchErr
      );
      // Always return a fallback assistant message (helpful for local testing)
      const assistant = `Lỗi khi gọi Groq API: ${
        fetchErr?.message || String(fetchErr)
      }`;
      return new Response(
        JSON.stringify({ message: { role: "assistant", content: assistant } }),
        { status: 200 }
      );
    }
    // best-effort extraction
    let assistant = "";
    try {
      if (Array.isArray(json.output)) {
        assistant = json.output
          .map((o: any) => {
            if (o.content) {
              if (typeof o.content === "string") return o.content;
              if (Array.isArray(o.content))
                return o.content
                  .map((c: any) => c.text || JSON.stringify(c))
                  .join("\n");
            }
            return JSON.stringify(o);
          })
          .join("\n");
      } else if (json.message?.content) assistant = json.message.content;
      else if (json.choices && json.choices[0]?.message?.content)
        assistant = json.choices[0].message.content;
      else assistant = JSON.stringify(json);
    } catch (e) {
      assistant = JSON.stringify(json);
    }

    return new Response(
      JSON.stringify({ message: { role: "assistant", content: assistant } }),
      { status: 200 }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || String(err) }),
      { status: 500 }
    );
  }
}
