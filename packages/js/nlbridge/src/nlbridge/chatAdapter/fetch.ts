import {AdapterExtras, NluxError, NluxUsageError, StreamingAdapterObserver} from '@nlux/core';
import {NlBridgeAbstractAdapter} from './adapter';

export class NlBridgeFetchAdapter extends NlBridgeAbstractAdapter {
    constructor(options: any) {
        super(options);
    }

    async fetchText(message: string, extras: AdapterExtras): Promise<string> {
        const response = await fetch(this.endpointUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: this.contextId ? 'assist' : 'chat',
                payload: {
                    message,
                    contextId: this.contextId,
                },
            }),
        });

        if (!response.ok) {
            throw new NluxError({
                source: this.constructor.name,
                message: `NlBridge adapter returned status code: ${response.status}`,
            });
        }

        const body = await response.json();
        if (
            typeof body === 'object' && body !== null && body.success === true &&
            typeof body.result === 'object' && body.result !== null &&
            typeof body.result.response === 'string'
        ) {
            const {
                response,
                task,
            } = body.result;

            if (
                this.taskRunner && task
                && typeof task === 'object' && typeof task.taskId === 'string'
                && Array.isArray(task.parameters)
            ) {
                this.taskRunner(task.taskId, task.parameters);
            }

            return response;
        } else {
            throw new NluxError({
                source: this.constructor.name,
                message: 'Invalid response from NlBridge: String expected.',
            });
        }
    }

    streamText(message: string, observer: StreamingAdapterObserver, extras: AdapterExtras): void {
        throw new NluxUsageError({
            source: this.constructor.name,
            message: 'Cannot stream text from the fetch adapter!',
        });
    }
}
