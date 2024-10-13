import axiosInstance from "@/instance/axiosInstance";

export interface StatusData {
  status: 'processing' | 'completed';
  result?: StatusResult | null;
}

export interface StatusResult {
  audio: string;
  text: string;
  label: number;
  attribute: number;
}

export const getStatus = async () => {
  try {
    const response = await axiosInstance.get<StatusData>("/recognition/status");
    return response.data;
  } catch (error) {
    console.error("Error fetching server health data:", error);
    throw error;
  }
};
