import { getCurrentUser, logout } from "@/actions/auth";
import { redirect } from "next/navigation";

const page = async () => {
  const user = await getCurrentUser();

  const logoutSession = async () => {
    "use server";
    await logout();
  };

  if (!user) {
    redirect("/login");
  }
  return (
    <div>
      <h1>Dashboard</h1>
      <form action={logoutSession}>
        <button className="btn btn-primary mt-4 text-white cursor-pointer p-2 bg-red-500 hover:bg-red-600">
          Logout
        </button>
      </form>
    </div>
  );
};

export default page;
