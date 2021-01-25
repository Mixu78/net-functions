# @rbxts/net-functions

[![NPM](https://nodei.co/npm/@rbxts/net-functions.png)](https://npmjs.org/package/@rbxts/net-functions)

## Installation
```npm i @rbxts/net-functions```

## Usage
First make two objects with ```eventName: readonly t.check<any>[]``` and ```eventName: t.check<any> | readonly t.check<any>[]``` pairs, for example
```ts
import { t } from "@rbxts/t"
const GameFunctions = {
	getData = [t.number, t.boolean] as const;
	doThing = [] as const;
}

const GameFunctionsReturns = {
	getData = t.string;
	doThing = [t.number, t.string] as const;
}

```
Then create a server and client like so:
```ts
//server
import { NetFunctionsServer as Server } from "@rbxts/net-functions";

const server = new Server(GameFunctions, GameFunctionsReturns);
```
```ts
//client
import { NetFunctionsClient as Client } from "@rbxts/net-functions";

const client = new Client(GameFunctions, GameFunctionsReturns);
```
where GameFunctions is your event object, and GameFunctionsReturns contains event return checks.

To use multiple servers and clients add in an id parameter to the constructor:
```ts
import { NetFunctionsClient as Client } from "@rbxts/net-functions";

const client = new Client(GameFunctions, GameFunctionsReturns, "id1");
```

## Example
```ts
import { NetFunctionsServer as Server } from "@rbxts/net-functions";
import { t } from "@rbxts/t";

const events = {
	getData: [t.number, t.boolean] as const,
};

const eventsReturns = {
	getData: t.string,
};

const server = new Server(events, eventsReturns, "main");
server.on("getData", (player, number, boolean) => {
	return `${number}: ${boolean}`;
});
```
```ts
import { NetFunctionsClient as Client } from "@rbxts/net-functions";
import { t } from "@rbxts/t";

const events = {
	getData: [t.number, t.boolean] as const,
};

const eventsReturns = {
	getData: t.string,
};

const client = new Client(events, eventsReturns, "main");

const data = client.invoke("getData", 0, true);
print(`Data: "${data}"`);
```