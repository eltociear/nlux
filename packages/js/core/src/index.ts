import {AiChat} from './core/aiChat';

export {AiChat} from './core/aiChat';
export const createAiChat = (): AiChat => new AiChat();

export {Observable} from './core/bus/observable';
export {NluxError, NluxUsageError, NluxValidationError, NluxRenderingError, NluxConfigError} from './core/error';
export {createMdStreamRenderer} from './core/markdown/streamParser';
export {debug} from './x/debug';
export {warn, warnOnce} from './x/warn';
export {uid} from './x/uid';

export type {ExceptionId} from './exceptions/exceptions';
export type {ConversationOptions} from './core/options/conversationOptions';
export type {PromptBoxOptions} from './core/options/promptBoxOptions';
export type {LayoutOptions} from './core/options/layoutOptions';

export type {
    PersonaOptions,
    BotPersona,
    UserPersona,
} from './core/options/personaOptions';

export type {IObserver} from './core/bus/observer';
export type {ExposedConfig} from './core/config';

export type {AiChatInternalProps} from './types/aiChat/props';

export type {
    EventName,
    EventCallback,
    EventsMap,
    ErrorCallback,
    ErrorEventDetails,
    ReadyCallback,
    ReadyEventDetails,
    PreDestroyCallback,
    PreDestroyEventDetails,
    MessageSentCallback,
    MessageReceivedCallback,
} from './types/event';

export type {
    StandardAdapter,
} from './types/aiChat/standardAdapter';

export type {
    StandardAdapterInfo,
    AdapterEncodeFunction,
    AdapterDecodeFunction,
    InputFormat,
    OutputFormat,
} from './types/aiChat/standardAdapterConfig';

export type {
    AiChatProps,
} from './types/aiChat/props';

export type {
    Adapter,
    AdapterExtras,
    StreamingAdapterObserver,
    DataTransferMode,
} from './types/aiChat/adapter';

export type {
    AdapterBuilder,
} from './types/aiChat/adapterBuilder';

export type {
    StreamParser,
    StandardStreamParser,
    StandardStreamParserOutput,
} from './types/markdown/streamParser';

export type {
    AiContextAdapter,
} from './types/aiContext/adapter';

export type {
    ContextAdapterBuilder,
} from './types/aiContext/builder';

export type {
    Highlighter,
    HighlighterExtension,
    HighlighterColorMode,
    CreateHighlighterOptions,
} from './core/highlighter/highlighter';

export type {
    ConversationItem,
} from './types/conversation';

export type {
    ParticipantRole,
} from './types/participant';
