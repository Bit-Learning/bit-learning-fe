import {
	CommandDialog,
	CommandEmpty,
	CommandInput,
	CommandList,
	CommandSeparator,
} from "@workspace/ui/components/command";
import { ScrollArea } from "@workspace/ui/components/ScrollArea";
import { useSearch } from "@/shared/context/search-context";

// import { useNavigate } from "react-router-dom";

export function CommandMenu() {
	// const navigate = useNavigate();
	const { open, setOpen } = useSearch();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	// const runCommand = React.useCallback(
	//   (command: () => unknown) => {
	//     setOpen(false);
	//     command();
	//   },
	//   [setOpen]
	// );

	return (
		<CommandDialog modal open={open} onOpenChange={setOpen}>
			<CommandInput placeholder="Nhập lệnh hoặc tìm kiếm..." />
			<CommandList>
				<ScrollArea type="hover" className="h-72 pr-1">
					<CommandEmpty>Không có kết quả nào.</CommandEmpty>
					<CommandSeparator />
				</ScrollArea>
			</CommandList>
		</CommandDialog>
	);
}
