import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import React from "react";

function NavLink({
  href,
  children,
  className,
}) {
  const location = useLocation();
  const pathName = location.pathname;

  const isActive =
    href === pathName || (href !== "/" && pathName.startsWith(href));

  return (
    <Link
      to={href}
      className={cn(
        "transition-colors text-sm font-bold duration-200 text-slate-600 hover:text-rose-500 no-underline",
        className,
        isActive && "text-rose-500"
      )}
    >
      {children}
    </Link>
  );
}

export default NavLink;
