export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface User {
    id: string;
    name: string;
    email: string;
    role: "candidate" | "admin" | "examiner";
    licenseCategory?: string;
    testCenter?: string;
  }
  
  export interface LoginResponse {
    success: boolean;
    data: {
      user: User;
      token: string;
    };
    message?: string;
  }
  
  // Mock login function (replace with actual API call later)
  export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));
  
    // Mock validation - for demo purposes
    if (credentials.email === "candidate@adlts.et" && credentials.password === "password123") {
      return {
        success: true,
        data: {
          user: {
            id: "1",
            name: "Test Candidate",
            email: credentials.email,
            role: "candidate",
            licenseCategory: "B",
            testCenter: "Bole Test Center",
          },
          token: "mock-jwt-token",
        },
      };
    }
  
    throw new Error("Invalid email or password");
  }
  
  // Logout function
  export async function logout(): Promise<void> {
    localStorage.removeItem("auth-token");
    // Clear any other auth data
  }
  
  // Get current user from token (if stored)
  export function getCurrentUser(): User | null {
    const token = localStorage.getItem("auth-token");
    if (!token) return null;
    // In real app, decode token or fetch user
    return null;
  }