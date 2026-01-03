import { queryOptions } from "@tanstack/react-query";
import type { AxiosInstance } from "axios";
import type { ExampleResponse } from "./example.type";

export class ExampleApi {
	constructor(readonly _client: AxiosInstance) {}

	hello() {
		return queryOptions({
			queryKey: ["hello"],
			queryFn: () => {
				const response: ExampleResponse = {
					message: "Hello World",
				};

				return response;
			},
		});
	}
}
