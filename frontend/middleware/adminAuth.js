export default function ({ route, redirect }) {
  if (process.client) {
    const token = localStorage.getItem("access_token");

    if (!token) {
      return redirect("/controller/login");
    }

    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const { role } = decodedToken;

      if (role !== "manager") {
        return redirect("/controller/login");
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      return redirect("/controller/login");
    }
  }
}
