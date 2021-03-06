<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [kibana-plugin-plugins-data-public](./kibana-plugin-plugins-data-public.md) &gt; [waitUntilNextSessionCompletes$](./kibana-plugin-plugins-data-public.waituntilnextsessioncompletes_.md)

## waitUntilNextSessionCompletes$() function

Creates an observable that emits when next search session completes. This utility is helpful to use in the application to delay some tasks until next session completes.

<b>Signature:</b>

```typescript
export declare function waitUntilNextSessionCompletes$(sessionService: ISessionService, { waitForIdle }?: WaitUntilNextSessionCompletesOptions): import("rxjs").Observable<SearchSessionState>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  sessionService | <code>ISessionService</code> | [ISessionService](./kibana-plugin-plugins-data-public.isessionservice.md) |
|  { waitForIdle } | <code>WaitUntilNextSessionCompletesOptions</code> |  |

<b>Returns:</b>

`import("rxjs").Observable<SearchSessionState>`

