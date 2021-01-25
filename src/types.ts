import { t } from "@rbxts/t";

export const FolderName = "NetworkEventEmitter";

/*eslint-disable @typescript-eslint/no-explicit-any*/
export type RemoteFunctionHandler<
	F extends (...args: any[]) => void,
	R extends t.check<unknown> | readonly t.check<unknown>[]
> = (
	player: Player,
	...args: Parameters<F>
) => { [K in keyof R]: K extends keyof Array<any> | "length" ? R[K] : t.static<R[K]> };

export type tStaticify<T> = T extends t.check<unknown>
	? t.static<T>
	: { [K in keyof T]: K extends keyof Array<any> | "length" ? T[K] : t.static<T[K]> };

export type EventKey<T> = Extract<keyof T, string>;
export type EventsRecord<E> = Record<EventKey<E>, readonly t.check<unknown>[]>;

export type ReturnsRecord<E> = Record<EventKey<E>, t.check<unknown> | readonly t.check<unknown>[]>;

export type TupleToFunction<F> = F extends infer T
	? (
			...args: { [K in keyof T]: K extends keyof Array<any> | "length" ? T[K] : t.static<T[K]> } extends infer A
				? A extends ReadonlyArray<any>
					? A
					: never
				: never
	  ) => void
	: never;
/*eslint-enable @typescript-eslint/no-explicit-any */

export interface INetFunctionsClient<Events extends EventsRecord<Events>, Returns extends ReturnsRecord<Events>> {
	/**
	 * Invoke the server and get a response
	 */
	invoke<E extends EventKey<Events>>(
		eventName: E,
		...args: Parameters<TupleToFunction<Events[E]>>
	): tStaticify<Returns[E]>;

	/**
	 * Destroy the class
	 */
	Destroy(): void;
}

export interface INetFunctionsServer<Events extends EventsRecord<Events>, Returns extends ReturnsRecord<Events>> {
	/**
	 * Set the function to be called when the remotefunction is invoked
	 * @param eventName The name of the event
	 * @param callback The function to set
	 */
	on<E extends EventKey<Events>>(
		eventName: E,
		callback: RemoteFunctionHandler<TupleToFunction<Events[E]>, Returns[E]>,
	): this;

	/**
	 * Destroy the class, deleting all remotefunctions
	 */
	Destroy(): void;
}
