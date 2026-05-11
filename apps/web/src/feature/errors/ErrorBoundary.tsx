import { Component, type ErrorInfo, type ReactNode } from "react";
import { GeneralError } from "./general-error";

interface ErrorBoundaryProps {
	children: ReactNode;
	minimal?: boolean;
}

interface ErrorBoundaryState {
	hasError: boolean;
}

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	public state: ErrorBoundaryState = {
		hasError: false,
	};

	public static getDerivedStateFromError(): ErrorBoundaryState {
		return { hasError: true };
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		// In the future we can send this to an error tracking service
		console.error("Uncaught error:", error, errorInfo);
	}

	public render(): ReactNode {
		if (this.state.hasError) {
			return <GeneralError minimal={this.props.minimal} />;
		}

		return this.props.children;
	}
}
