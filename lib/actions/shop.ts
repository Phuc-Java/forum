"use server";

import { Client, Databases, ID, Query, Storage } from "node-appwrite";
import { APPWRITE_CONFIG } from "../appwrite/config";
import { getServerUser } from "../appwrite/server";
import { ROLE_LEVELS, RoleType } from "../roles";

// Shared product type used by UI components
export type Product = {
  $id: string;
  name: string;
  price: number;
  images: string;
  sellerName?: string;
  sellerId?: string;
  category?: string;
  [key: string]: any;
};

const SHOP_BUCKET_ID = "693e37f10029ea7eb785";

function getAdminClient() {
  const client = new Client()
    .setEndpoint(APPWRITE_CONFIG.endpoint)
    .setProject(APPWRITE_CONFIG.projectId);
  if (process.env.APPWRITE_API_KEY) {
    client.setKey(process.env.APPWRITE_API_KEY);
  }
  return client;
}

// --- GET PRODUCT BY ID ---
export async function getProductById(productId: string) {
  try {
    const client = getAdminClient();
    const databases = new Databases(client);

    if (!productId) {
      return { success: false, error: "ID không tồn tại." };
    }

    const product = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      "products",
      productId
    );

    return { success: true, product: product as unknown as any };
  } catch (error: any) {
    console.error(`Shop Error (Detail ${productId}):`, error);
    if (error.code === 404) {
      return { success: false, error: "404: Vật phẩm đã bị thu hồi." };
    }
    return { success: false, error: "Lỗi Server: " + error.message };
  }
}

// --- GET PRODUCTS LIST ---
export async function getProducts(
  category?: string,
  sort: "newest" | "price_asc" | "price_desc" = "newest",
  limit: number = 50
) {
  try {
    const client = getAdminClient();
    const databases = new Databases(client);

    let queries = [Query.equal("status", "active"), Query.limit(limit)];

    if (category && category !== "all") {
      queries.push(Query.equal("category", category));
    }

    if (sort === "price_asc") queries.push(Query.orderAsc("price"));
    else if (sort === "price_desc") queries.push(Query.orderDesc("price"));
    else queries.push(Query.orderDesc("$createdAt"));

    const response = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      "products",
      queries
    );

    return { success: true, products: response.documents as unknown as any[] };
  } catch (error) {
    return { success: false, products: [] };
  }
}

// --- CREATE PRODUCT ---
export async function createProduct(formData: FormData) {
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = Number(formData.get("price"));
  const category = formData.get("category") as string;
  const sellerId = formData.get("sellerId") as string;
  const imageFile = formData.get("imageFile") as File;

  try {
    const client = getAdminClient();
    const databases = new Databases(client);
    const storage = new Storage(client);

    // 1. Check Profile & Role
    const profileRes = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      "profiles",
      [Query.equal("userId", sellerId)]
    );

    if (profileRes.documents.length === 0)
      return { error: "Không tìm thấy hồ sơ gốc." };

    const sellerProfile = profileRes.documents[0];
    const sellerRole = (sellerProfile.role as RoleType) || "pham_nhan";

    const userLevel = ROLE_LEVELS[sellerRole] || 1;

    console.log(
      `User: ${sellerProfile.displayName}, Role: ${sellerRole}, Level: ${userLevel}`
    );

    if (userLevel < 4) {
      return {
        error: `Tu vi chưa đủ. Bạn đang ở cấp ${userLevel}, cần cấp 4 (Thành Nhân).`,
      };
    }

    // 2. Upload Ảnh
    let imageUrls: string[] = [];
    if (imageFile && imageFile.size > 0) {
      const upload = await storage.createFile(
        SHOP_BUCKET_ID,
        ID.unique(),
        imageFile
      );
      const url = `${APPWRITE_CONFIG.endpoint}/storage/buckets/${SHOP_BUCKET_ID}/files/${upload.$id}/view?project=${APPWRITE_CONFIG.projectId}`;
      imageUrls.push(url);
    } else {
      imageUrls.push(
        "https://placehold.co/600x400/000000/10b981?text=No+Image"
      );
    }

    // 3. Tạo Product
    const product = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      "products",
      ID.unique(),
      {
        name,
        description,
        price,
        originalPrice: Math.round(price * 1.2),
        images: JSON.stringify(imageUrls),
        category,
        sellerId,
        sellerName: sellerProfile.displayName,
        status: "active",
        tags: "new",
      }
    );

    return { success: true, productId: product.$id };
  } catch (error: any) {
    console.error("Create Error:", error);
    return { error: "Lỗi Server: " + error.message };
  }
}

// Update Product
export async function updateProduct(
  productId: string,
  formData: FormData,
  userId: string
) {
  try {
    const client = getAdminClient();
    const databases = new Databases(client);
    const product = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      "products",
      productId
    );

    if (product.sellerId !== userId)
      return { success: false, error: "Không chính chủ!" };

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = Number(formData.get("price"));

    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      "products",
      productId,
      { name, description, price }
    );
    return { success: true };
  } catch (error) {
    return { success: false, error: "Lỗi cập nhật." };
  }
}

// --- DELETE PRODUCT ---
export async function deleteProduct(productId: string, userId: string) {
  try {
    const client = getAdminClient();
    const databases = new Databases(client);
    const storage = new Storage(client);

    // 1. Lấy thông tin người yêu cầu xóa để check quyền
    const profileRes = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      "profiles",
      [Query.equal("userId", userId), Query.limit(1)]
    );

    if (profileRes.documents.length === 0)
      return { success: false, error: "Không tìm thấy danh tính." };

    const userProfile = profileRes.documents[0];
    const userRole = (userProfile.role as RoleType) || "no_le";

    // 2. Lấy thông tin sản phẩm
    const product = await databases.getDocument(
      APPWRITE_CONFIG.databaseId,
      "products",
      productId
    );

    // 3. Check Quyền
    const isChiTon = userRole === "chi_ton";
    const isOwner = product.sellerId === userId;

    if (!isChiTon && !isOwner) {
      return {
        success: false,
        error: "Ngươi không đủ tu vi để hủy diệt vật phẩm này!",
      };
    }

    // 4. Xóa Document
    await databases.deleteDocument(
      APPWRITE_CONFIG.databaseId,
      "products",
      productId
    );

    return { success: true };
  } catch (error: any) {
    console.error("Delete Error:", error);
    return { success: false, error: "Lỗi Server: " + error.message };
  }
}

// 1. Thêm vào giỏ hàng
export async function addToCart(userId: string, productId: string) {
  try {
    const client = getAdminClient();
    const databases = new Databases(client);

    // Kiểm tra xem đã có trong giỏ chưa
    const existing = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      "carts",
      [Query.equal("userId", userId), Query.equal("productId", productId)]
    );

    if (existing.documents.length > 0) {
      // Nếu có rồi thì tăng số lượng
      const item = existing.documents[0];
      await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        "carts",
        item.$id,
        { quantity: item.quantity + 1 }
      );
      return { success: true, message: "Đã tăng số lượng trong Túi Trữ Vật!" };
    } else {
      // Chưa có thì tạo mới
      await databases.createDocument(
        APPWRITE_CONFIG.databaseId,
        "carts",
        ID.unique(),
        {
          userId,
          productId,
          quantity: 1,
        }
      );
      return { success: true, message: "Đã thu nạp vào Túi Trữ Vật!" };
    }
  } catch (error: any) {
    console.error("Add Cart Error:", error);
    return { success: false, error: "Lỗi không gian: " + error.message };
  }
}

// 2. Lấy danh sách giỏ hàng
export async function getCartItems(userId: string) {
  try {
    const client = getAdminClient();
    const databases = new Databases(client);

    const cartRes = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      "carts",
      [Query.equal("userId", userId)]
    );

    if (cartRes.documents.length === 0) return { success: true, items: [] };

    const itemsWithProduct = await Promise.all(
      cartRes.documents.map(async (cartItem) => {
        try {
          const product = await databases.getDocument(
            APPWRITE_CONFIG.databaseId,
            "products",
            cartItem.productId
          );
          return { ...cartItem, product };
        } catch {
          return null;
        }
      })
    );

    return {
      success: true,
      items: itemsWithProduct.filter((item) => item !== null),
    };
  } catch (error: any) {
    console.error("Get Cart Error:", error);
    return { success: false, items: [] };
  }
}

// 2b. LẤY TỔNG KHOẢN & GIỎ HÀNG DÙNG TRÊN SERVER (GIÚP GIẢM TẢI CLIENT)
export async function getCartSummary() {
  try {
    const serverUser = await getServerUser();
    if (!serverUser) return { success: false, error: "NOT_LOGGED_IN" };

    const [cartRes, balanceRes] = await Promise.all([
      getCartItems(serverUser.$id),
      getUserBalance(serverUser.$id),
    ]);

    return {
      success: true,
      userId: serverUser.$id,
      items: cartRes.success ? cartRes.items : [],
      balance: balanceRes.success ? balanceRes.balance : 0,
    };
  } catch (error: any) {
    console.error("getCartSummary error:", error);
    return { success: false, error: error?.message || "UNKNOWN" };
  }
}

// 3. Xóa khỏi giỏ hàng
export async function removeFromCart(cartId: string) {
  try {
    const client = getAdminClient();
    const databases = new Databases(client);
    await databases.deleteDocument(APPWRITE_CONFIG.databaseId, "carts", cartId);
    return { success: true };
  } catch (error) {
    return { success: false, error: "Không thể xóa vật phẩm" };
  }
}

// ==========================================
// PHẦN MỚI: HỆ THỐNG THANH TOÁN (CHECKOUT)
// ==========================================

export async function processCheckout(userId: string) {
  try {
    const client = getAdminClient();
    const databases = new Databases(client);

    // 1. Lấy thông tin Giỏ hàng & Profile người dùng
    const [cartRes, profileRes] = await Promise.all([
      databases.listDocuments(APPWRITE_CONFIG.databaseId, "carts", [
        Query.equal("userId", userId),
      ]),
      databases.listDocuments(APPWRITE_CONFIG.databaseId, "profiles", [
        Query.equal("userId", userId),
        Query.limit(1),
      ]),
    ]);

    if (profileRes.documents.length === 0)
      throw new Error("Không tìm thấy hồ sơ đạo hữu.");
    if (cartRes.documents.length === 0) throw new Error("Giỏ hàng trống rỗng.");

    const profile = profileRes.documents[0];

    // 🔥 FIX 1: Ép kiểu từ String DB sang Number để tính toán
    // Nếu currency là "1000", Number("1000") = 1000
    const currentBalance = Number(profile.currency) || 0;

    const cartItems = cartRes.documents;

    // 2. Tính tổng tiền
    let totalAmount = 0;
    const orderItems = [];

    for (const item of cartItems) {
      const product = await databases.getDocument(
        APPWRITE_CONFIG.databaseId,
        "products",
        item.productId
      );

      // Giá sản phẩm vẫn là số (Integer/Float)
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: product.$id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: JSON.parse(product.images)[0] || "",
      });
    }

    // 3. Kiểm tra số dư
    if (currentBalance < totalAmount) {
      return {
        success: false,
        error: `Không đủ linh thạch! Cần ${totalAmount.toLocaleString()} nhưng chỉ có ${currentBalance.toLocaleString()}.`,
      };
    }

    // 4. THỰC HIỆN GIAO DỊCH
    // A. Trừ tiền (Tính toán số học)
    const newBalance = currentBalance - totalAmount;

    await databases.updateDocument(
      APPWRITE_CONFIG.databaseId,
      "profiles",
      profile.$id,
      {
        // 🔥 FIX 2: Ép kiểu từ Number về String để lưu vào DB
        currency: String(newBalance),
      }
    );

    // B. Tạo đơn hàng
    await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      "orders",
      ID.unique(),
      {
        userId,
        items: JSON.stringify(orderItems),
        totalAmount,
        status: "completed",
      }
    );

    // C. Xóa giỏ hàng
    await Promise.all(
      cartItems.map((item) =>
        databases.deleteDocument(APPWRITE_CONFIG.databaseId, "carts", item.$id)
      )
    );

    // Trả về số để UI hiển thị dễ dàng
    return { success: true, newBalance: newBalance };
  } catch (error: any) {
    console.error("Checkout Error:", error);
    return { success: false, error: "Lỗi giao dịch: " + error.message };
  }
}

// Hàm lấy số dư hiện tại (Helper)
export async function getUserBalance(userId: string) {
  try {
    const client = getAdminClient();
    const databases = new Databases(client);
    const profileRes = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      "profiles",
      [Query.equal("userId", userId), Query.limit(1)]
    );
    if (profileRes.documents.length > 0) {
      // 🔥 FIX 3: Ép kiểu String từ DB sang Number cho Frontend hiển thị
      const balanceNum = Number(profileRes.documents[0].currency);
      return { success: true, balance: isNaN(balanceNum) ? 0 : balanceNum };
    }
    return { success: true, balance: 0 };
  } catch {
    return { success: false, balance: 0 };
  }
}
