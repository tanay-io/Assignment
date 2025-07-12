export function getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }
  
  export function getUser() {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
  
  export function logout() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
  