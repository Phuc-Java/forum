import LockScreen from "@/components/events/LockScreen.client";

export const metadata = {
  title: "My Crush",
};

export default function Page() {
  return (
    <LockScreen>
      <div>
        <h3 style={{ color: "#19ffb0" }}>Nội dung bí mật của My Crush</h3>
        <p>
          Đây là nơi bạn có thể đặt hình ảnh, tin nhắn hoặc bất kỳ nội dung nào
          sau khi mở khóa.
        </p>
      </div>
    </LockScreen>
  );
}
