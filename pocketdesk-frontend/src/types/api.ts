export interface AuthResponse {
  accessToken: string;
  email: string;
  role: string;
}

export interface Pdf {
  _id: string;
  fileName: string;
  uploadedAt: string;
}

export interface ChatResponse {
answer: string;
sources: {
text: string;
}[];
}