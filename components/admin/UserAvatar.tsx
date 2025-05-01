// components/UserAvatar.tsx
import { User } from "@/types";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function UserAvatar({ user, className }: { user: User; className?: string }) {
  return (
    <div className={cn("rounded-full overflow-hidden", className)}>
      {user.imageUrl ? (
        <Image
          src={user.imageUrl}
          alt={user.name || "User avatar"}
          width={40}
          height={40}
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <span className="text-gray-600 font-medium">
            {(user.name?.[0] || user.email[0]).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}
