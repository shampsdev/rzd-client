import axiosInstance from "@/instance/axiosInstance";

export const uploadVoice = async (audioBlob: Blob) => {
  const formData = new FormData();
  formData.append("file", audioBlob, "recording.webm");

  try {
    const response = await axiosInstance.post("/recognition/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("Файл успешно отправлен", response.data);
    return response.data;
  } catch (error) {
    console.error("Ошибка при отправке файла", error);
  }
};
