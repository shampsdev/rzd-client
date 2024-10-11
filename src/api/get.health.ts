import axiosInstance from "@/instance/axiosInstance";

export const getServerHealth = async () => {
  try {
    const response = await axiosInstance.get("/health");
    return response.data;
  } catch (error) {
    console.error("Error fetching server health data:", error);
    throw error;
  }
};
