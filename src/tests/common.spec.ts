///<reference types="@rbxts/testez/globals"/>

declare function afterEach(fn: (context: {}) => void): void;

import { NetFunctionsServer as Server, NetFunctionsClient as Client } from "..";
import { t } from "@rbxts/t";
import Spy from "./spy";

const events = {
	test: [t.number] as const,
	many: [t.boolean, t.string, t.number] as const,
};

const returns = {
	test: t.boolean,
	many: [t.boolean, t.number] as const,
};

//@ts-expect-error Changing private variables bad
Client._mock = true;

export = () => {
	let server = new Server(events, returns);
	let client = new Client(events, returns);

	afterEach(() => {
		server.Destroy();
		client.Destroy();

		server = new Server(events, returns);
		client = new Client(events, returns);
	});

	it("should receive invokes from client", () => {
		const spy = new Spy();
		server.on("test", (player, num) => {
			spy.value(num);
			return true;
		});

		client.invoke("test", 10);

		expect(spy.callCount).to.equal(1);
		expect(spy.valuesLength).to.equal(1);
		expect(spy.values[0]).to.equal(10);
	});

	it("should receive correct values from server", () => {
		server.on("test", (player, num) => {
			return num * 2;
		});

		const response = client.invoke("test", 2);
		expect(response).to.equal(4);
	});

	it("should work with tuple invokes", () => {
		server.on("many", (player, bool, string, num) => {
			expect(t.boolean(bool)).to.be.ok();
			expect(t.string(string)).to.be.ok();
			expect(t.number(num)).to.be.ok();

			return [true, 0] as const;
		});
	});

	it("should work with tuple returns", () => {
		server.on("many", () => {
			return [true, 0] as const;
		});

		const result = client.invoke("many", true, "", 0);
		expect(t.boolean(result[0])).to.be.ok();
		expect(t.number(result[1])).to.be.ok();
	});
};
