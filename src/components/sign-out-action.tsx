import { signOut } from "@/auth";
import SignoutButton from "@/components/sign-out-button";

export default function SignOutAction() {
  const handleSignOut = async () => {
    "use server";
    await signOut({
      redirectTo: "/api/auth/signin?callbackUrl=tonyeeebrary.vercel.app",
    });
  };

  return <SignoutButton signOut={handleSignOut} />;
}
