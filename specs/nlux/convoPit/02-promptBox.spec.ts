import {AdapterBuilder, ConvoPit, createConvoPit} from '@nlux/nlux';
import {createAdapter} from '@nlux/openai';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import {queries} from '../../utils/selectors';
import {waitForMilliseconds, waitForRenderCycle} from '../../utils/wait';

const apiKey = 'YOUR_API_KEY_HERE';

describe('When typing a prompt ', () => {
    const adapter: AdapterBuilder<any, any> = createAdapter('openai/gpt')
        .withApiKey(apiKey)
        .useFetchingMode();

    let rootElement: HTMLElement | undefined;
    let convoPit: ConvoPit | undefined;

    beforeEach(() => {
        rootElement = document.createElement('div');
        document.body.append(rootElement);
    });

    afterEach(() => {
        convoPit?.unmount();
        rootElement?.remove();
        convoPit = undefined;
        rootElement = undefined;
    });

    describe('Initial state', () => {
        it('should render an empty prompt box with disabled button', async () => {
            convoPit = createConvoPit().withAdapter(adapter);
            convoPit.mount(rootElement);
            await waitForRenderCycle();

            const textInput: any = queries.promptBoxTextInput() as any;
            const sendButton: any = queries.promptBoxSendButton() as any;

            expect(textInput.value).toBe('');
            expect(sendButton).toBeDisabled();
        });
    });

    describe('When the user types a prompt', () => {
        it('should enable the send button', async () => {
            convoPit = createConvoPit().withAdapter(adapter);
            convoPit.mount(rootElement);
            await waitForRenderCycle();

            const textInput: any = queries.promptBoxTextInput() as any;
            const sendButton: any = queries.promptBoxSendButton() as any;

            await userEvent.type(textInput, 'Hello');
            await waitForRenderCycle();

            expect(textInput.value).toBe('Hello');
            expect(sendButton).not.toBeDisabled();
        });
    });

    describe('When the user clears the prompt', () => {
        it('should disable the send button', async () => {
            convoPit = createConvoPit().withAdapter(adapter);
            convoPit.mount(rootElement);
            await waitForRenderCycle();

            const textInput: any = queries.promptBoxTextInput() as any;
            const sendButton: any = queries.promptBoxSendButton() as any;

            await userEvent.type(textInput, 'Hello');
            await waitForRenderCycle();

            expect(textInput.value).toBe('Hello');
            expect(sendButton).not.toBeDisabled();

            await userEvent.clear(textInput);
            await waitForRenderCycle();

            expect(textInput.value).toBe('');
            expect(sendButton).toBeDisabled();
        });
    });
});

describe('When sending a chat message ', () => {
    let adapter: AdapterBuilder<any, any> = createAdapter('openai/gpt')
        .withApiKey(apiKey)
        .useFetchingMode();

    let rootElement: HTMLElement | undefined;
    let convoPit: ConvoPit | undefined;

    beforeEach(() => {
        rootElement = document.createElement('div');
        document.body.append(rootElement);
    });

    afterEach(() => {
        adapter = createAdapter('openai/gpt')
            .withApiKey(apiKey)
            .useFetchingMode();

        convoPit?.unmount();
        rootElement?.remove();
        convoPit = undefined;
        rootElement = undefined;
    });

    describe('When the user clicks the send button', () => {
        it('should display the user message in conversation container', async () => {
            (adapter as any).create = () => ({
                send: async () => {
                    // Do nothing
                },
            });

            convoPit = createConvoPit().withAdapter(adapter);
            convoPit.mount(rootElement);
            await waitForRenderCycle();

            const textInput: any = queries.promptBoxTextInput() as any;
            const sendButton: any = queries.promptBoxSendButton() as any;

            await userEvent.type(textInput, 'Hello LLM');
            await waitForRenderCycle();

            expect(textInput.value).toBe('Hello LLM');
            expect(sendButton).not.toBeDisabled();

            await userEvent.click(sendButton);
            await waitForRenderCycle();
            await waitForMilliseconds(100);

            expect(queries.conversationMessagesContainer()).toContainHTML('Hello LLM');
        });

        it('should display a loading indicator', async () => {
            (adapter as any).create = () => ({
                send: () => new Promise(() => {
                    // Do nothing
                }),
            });

            convoPit = createConvoPit().withAdapter(adapter);
            convoPit.mount(rootElement);

            await waitForRenderCycle();

            const textInput: any = queries.promptBoxTextInput() as any;
            const sendButton: any = queries.promptBoxSendButton() as any;

            await userEvent.type(textInput, 'Hello');
            await waitForRenderCycle();

            expect(textInput.value).toBe('Hello');
            expect(sendButton).not.toBeDisabled();
            expect(sendButton).not.toHaveClass('nluxc-prompt-box-send-button-loading');

            await userEvent.click(sendButton);
            await waitForRenderCycle();

            expect(sendButton).toBeDisabled();
            expect(sendButton).toHaveClass('nluxc-prompt-box-send-button-loading');
        });

        describe('When the API call fails', () => {
            it('should display an error message', async () => {
                (adapter as any).create = () => ({
                    send: () => new Promise(() => {
                        throw new Error('API call failed');
                    }),
                });

                convoPit = createConvoPit().withAdapter(adapter);
                convoPit.mount(rootElement);
                await waitForRenderCycle();

                const textInput: any = queries.promptBoxTextInput() as any;
                const sendButton: any = queries.promptBoxSendButton() as any;

                await userEvent.type(textInput, 'Hello');
                await waitForRenderCycle();

                expect(textInput.value).toBe('Hello');
                expect(sendButton).not.toBeDisabled();

                expect(queries.exceptionMessage()).toBeEmptyDOMElement();
                await userEvent.click(sendButton);
                await waitForRenderCycle();

                expect(queries.exceptionMessage()).not.toBeEmptyDOMElement();
            });

            it('Should remove the initial user message', async () => {
                const delayBeforeSendingResponse = 100;
                (adapter as any).create = () => ({
                    send: () => new Promise((resolve, reject) => {
                        waitForMilliseconds(delayBeforeSendingResponse).then(() => {
                            reject(new Error('API call failed'));
                        });
                    }),
                });

                convoPit = createConvoPit().withAdapter(adapter);
                convoPit.mount(rootElement);
                await waitForRenderCycle();

                const textInput: any = queries.promptBoxTextInput() as any;
                const sendButton: any = queries.promptBoxSendButton() as any;

                await userEvent.type(textInput, 'Hello');
                await waitForRenderCycle();

                expect(textInput.value).toBe('Hello');
                expect(sendButton).not.toBeDisabled();

                await userEvent.click(sendButton);
                await waitForMilliseconds(delayBeforeSendingResponse / 2);
                expect(queries.conversationMessagesContainer()).toContainHTML('Hello');

                await waitForMilliseconds(delayBeforeSendingResponse + 10);
                expect(queries.conversationMessagesContainer()).not.toContainHTML('Hello');
            });

            it('should keep the content of the prompt box', async () => {
                (adapter as any).create = () => ({
                    send: () => new Promise(() => {
                        throw new Error('API call failed');
                    }),
                });

                convoPit = createConvoPit().withAdapter(adapter);
                convoPit.mount(rootElement);
                await waitForRenderCycle();

                const textInput: any = queries.promptBoxTextInput() as any;
                const sendButton: any = queries.promptBoxSendButton() as any;

                await userEvent.type(textInput, 'Hello');
                await waitForRenderCycle();

                expect(textInput.value).toBe('Hello');
                expect(sendButton).not.toBeDisabled();

                await userEvent.click(sendButton);
                await waitForMilliseconds(100);

                expect(textInput.value).toBe('Hello');
            });
        });
    });

    describe('When using invalid API key', () => {
        it('should render error message', async () => {
            convoPit = createConvoPit().withAdapter(adapter);
            convoPit.mount(rootElement);
            await waitForRenderCycle();

            const textInput: any = queries.promptBoxTextInput() as any;
            const sendButton: any = queries.promptBoxSendButton() as any;

            await userEvent.type(textInput, 'Hello');
            await waitForRenderCycle();

            expect(textInput.value).toBe('Hello');
            expect(sendButton).not.toBeDisabled();

            userEvent.click(sendButton);
            await waitForRenderCycle();

            expect(queries.exceptionMessage().innerHTML).toBe('Failed to load content. Please try again.');
        });
    });

    describe('When the user receives a response', () => {
        it('should display the response', async () => {
            const delayBeforeSendingResponse = 100;
            (adapter as any).create = () => ({
                send: async () => {
                    await waitForMilliseconds(delayBeforeSendingResponse);
                    return 'Hello back!';
                },
            });

            convoPit = createConvoPit().withAdapter(adapter);
            convoPit.mount(rootElement);
            await waitForRenderCycle();

            const textInput: any = queries.promptBoxTextInput() as any;
            const sendButton: any = queries.promptBoxSendButton() as any;

            await userEvent.type(textInput, 'Hello');
            await waitForRenderCycle();

            expect(textInput.value).toBe('Hello');
            expect(sendButton).not.toBeDisabled();

            userEvent.click(sendButton);
            await waitForMilliseconds(delayBeforeSendingResponse);
            await waitForRenderCycle();

            expect(queries.conversationContainer()).toHaveTextContent('Hello back!');
        });

        it('should remove the loading indicator', async () => {
            const delayBeforeSendingResponse = 100;
            (adapter as any).create = () => ({
                send: async () => {
                    await waitForMilliseconds(delayBeforeSendingResponse);
                    return 'Hello back!';
                },
            });

            convoPit = createConvoPit().withAdapter(adapter);
            convoPit.mount(rootElement);
            await waitForRenderCycle();

            const textInput: any = queries.promptBoxTextInput() as any;
            const sendButton: any = queries.promptBoxSendButton() as any;

            await userEvent.type(textInput, 'Hello');
            await waitForRenderCycle();

            expect(textInput.value).toBe('Hello');
            expect(sendButton).not.toBeDisabled();

            userEvent.click(sendButton);
            await waitForMilliseconds(delayBeforeSendingResponse);
            await waitForRenderCycle();

            expect(sendButton).not.toHaveClass('nluxc-prompt-box-send-button-loading');
        });

        it('should empty the prompt box', async () => {
            const delayBeforeSendingResponse = 100;
            (adapter as any).create = () => ({
                send: async () => {
                    await waitForMilliseconds(delayBeforeSendingResponse);
                    return 'Hello back!';
                },
            });

            convoPit = createConvoPit().withAdapter(adapter);
            convoPit.mount(rootElement);
            await waitForRenderCycle();

            const textInput: any = queries.promptBoxTextInput() as any;
            const sendButton: any = queries.promptBoxSendButton() as any;

            await userEvent.type(textInput, 'Hello');
            await waitForRenderCycle();

            expect(textInput.value).toBe('Hello');
            expect(sendButton).not.toBeDisabled();

            userEvent.click(sendButton);
            await waitForMilliseconds(delayBeforeSendingResponse);
            await waitForRenderCycle();

            expect(textInput.value).toBe('');
        });
    });
});
