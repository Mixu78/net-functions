import { ReplicatedStorage } from "@rbxts/services";
import {
	RemoteFunctionHandler,
	EventsRecord,
	INetFunctionsClient,
	TupleToFunction,
	ReturnsRecord,
	tStaticify,
	EventKey,
	INetFunctionsServer,
} from "./types";

export class NetFunctionsClient<Events extends EventsRecord<Events>, Returns extends ReturnsRecord<Events>>
	implements INetFunctionsClient<Events, Returns> {
	private eventsFolder: Folder;

	constructor(parameterChecks: Events, returnChecks: Returns, id?: string) {
		this.eventsFolder = ReplicatedStorage.WaitForChild(`NetFunctions(${id ?? ""})`) as Folder;
	}

	private getEvent<E extends EventKey<Events>>(eventName: E) {
		const func = this.eventsFolder.FindFirstChild(eventName) as RemoteFunction;
		if (!func) throw "Event not created on server!";

		return func;
	}

	invoke<E extends EventKey<Events>>(
		eventName: E,
		...args: Parameters<TupleToFunction<Events[E]>>
	): tStaticify<Returns[E]> {
		const func = this.getEvent(eventName);

		return func.InvokeServer(...args);
	}

	Destroy(): void {
		//@ts-expect-error assigning this
		this = undefined;
	}
}

export class NetFunctionsServer<Events extends EventsRecord<Events>, Returns extends ReturnsRecord<Events>>
	implements INetFunctionsServer<Events, Returns> {
	private eventFolder: Folder;

	private eventsMap = new Map<EventKey<Events>, RemoteFunction>();

	constructor(private parameterChecks: Events, returnChecks: Returns, id?: string) {
		this.eventFolder = new Instance("Folder");
		this.eventFolder.Name = `NetFunctions(${id ?? ""})`;
		this.eventFolder.Parent = ReplicatedStorage;
	}

	private getEvent<E extends EventKey<Events>>(eventName: E) {
		const func =
			this.eventsMap.get(eventName) ??
			(() => {
				const func = new Instance("RemoteFunction");
				func.Name = eventName;
				func.Parent = this.eventFolder;
				return func;
			})();

		if (!this.eventsMap.has(eventName)) {
			this.eventsMap.set(eventName, func);
		}

		return func;
	}

	on<E extends EventKey<Events>>(
		eventName: E,
		callback: RemoteFunctionHandler<TupleToFunction<Events[E]>, Returns[E]>,
	): this {
		const func = this.getEvent(eventName);

		func.OnServerInvoke = (player, ...args) => {
			let ok = true;

			if (args.size() !== this.parameterChecks[eventName].size()) {
				ok = false;
				return;
			}
			this.parameterChecks[eventName].forEach((check, i) => {
				if (!check(args[i])) ok = false;
			});

			if (ok) {
				return (callback as Callback)(player, ...args);
			}
		};

		return this;
	}

	Destroy(): void {
		for (const [key, event] of this.eventsMap) {
			event.Destroy();
			this.eventsMap.delete(key);
		}
		this.eventFolder.Destroy();
		this.eventsMap = undefined!;
		//@ts-expect-error assigning this
		this = undefined;
	}
}
