import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfileAvatar({ className = "rounded-full" }) {
	return (
		<Avatar className={className}>
			<AvatarImage src="https://github.com/shadcn.png" />
			<AvatarFallback>CN</AvatarFallback>
		</Avatar>
	);
}