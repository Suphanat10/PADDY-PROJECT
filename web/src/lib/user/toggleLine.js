const API_BASE_URL = "/api/v1";
const isDemoMode = true;

export async function toggleLine(
  isLineConnected,
  setIsLineConnected
) {
  if (isLineConnected) {
    if (!confirm("ต้องการยกเลิกการเชื่อมต่อ LINE?")) return;
    setIsLineConnected(false);
    return;
  }

  if (!isDemoMode) {
    await fetch(`${API_BASE_URL}/user/line/connect`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
  }
  alert("เชื่อมต่อ LINE สำเร็จ");
  setIsLineConnected(true);
}
