export default function ({ to, from }) {
  if (process.client) {
    const token = localStorage.getItem("access_token");

    if (!token) {
      return navigateTo("/controller/login");
    }

    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const { role } = decodedToken;

      if (role !== "manager") {
        return navigateTo("/controller/login");
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      return navigateTo("/controller/login");
    }
  }
}
