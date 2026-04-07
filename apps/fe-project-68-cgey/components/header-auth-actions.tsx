import Link from "next/link";

import { getCurrentUser, type CurrentUser } from "@/lib/auth";
import UserMenu from "@/components/user-menu";

type HeaderAuthActionsProps = {
  className: string;
  currentUser?: CurrentUser | null;
};

export default async function HeaderAuthActions({
  className,
  currentUser: initialCurrentUser,
}: HeaderAuthActionsProps) {
  const currentUser =
    initialCurrentUser === undefined ? await getCurrentUser() : initialCurrentUser;

  if (currentUser) {
    return (
      <div className={`${className} justify-end`}>
        <UserMenu name={currentUser.name} id={currentUser._id} email={currentUser.email} telephone={currentUser.telephone}/>
      </div>
    );
  }

  return (
    <div className={`${className} lg:w-[250px] lg:justify-between`}>
      <Link
        href="/login"
        className="flex h-[38px] w-[105px] items-center justify-center rounded-[50px] border-2 border-[#d37624] text-[14px] font-bold leading-[1.4] text-[#d37624] transition-colors hover:bg-[#fff4ea] lg:w-[115px] lg:text-[16px]"
      >
        Login
      </Link>
      <Link
        href="/signup"
        className="flex h-[38px] w-[105px] items-center justify-center rounded-[50px] bg-[#d37624] text-[14px] font-bold leading-[1.4] text-white transition-colors hover:bg-[#bc661d] lg:w-[115px] lg:text-[16px]"
      >
        Sign Up
      </Link>
    </div>
  );
}
