import { ApiConfiguration } from "./api"
import { Mode, PromptComponent } from "./modes"
import { ApiConfigMeta } from "./ExtensionMessage"
import { CustomPrompts } from "./modes"
import { Commit } from "./git"

export type PromptMode = Mode | "enhance"

export type AudioType = "notification" | "celebration" | "progress_loop"

export type WebviewMessageType =
	| "customInstructions"
	| "alwaysAllowReadOnly"
	| "alwaysAllowWrite"
	| "alwaysAllowExecute"
	| "alwaysAllowBrowser"
	| "allowedCommands"
	| "soundEnabled"
	| "soundVolume"
	| "diffEnabled"
	| "browserViewportSize"
	| "screenshotQuality"
	| "fuzzyMatchThreshold"
	| "preferredLanguage"
	| "writeDelayMs"
	| "terminalOutputLineLimit"
	| "mcpEnabled"
	| "alwaysApproveResubmit"
	| "requestDelaySeconds"
	| "currentApiConfigName"
	| "listApiConfigMeta"
	| "mode"
	| "customPrompts"
	| "enhancementApiConfigId"
	| "experimentalDiffStrategy"
	| "autoApprovalEnabled"
	| "getSystemPrompt"
	| "saveApiConfiguration"
	| "loadApiConfiguration"
	| "deleteApiConfiguration"
	| "renameApiConfiguration"
	| "getListApiConfiguration"
	| "webviewDidLaunch"
	| "newTask"
	| "askResponse"
	| "clearTask"
	| "didShowAnnouncement"
	| "selectImages"
	| "exportCurrentTask"
	| "showTaskWithId"
	| "deleteTaskWithId"
	| "exportTaskWithId"
	| "resetState"
	| "requestOllamaModels"
	| "requestLmStudioModels"
	| "openImage"
	| "openFile"
	| "openMention"
	| "cancelTask"
	| "refreshGlamaModels"
	| "refreshOpenRouterModels"
	| "refreshOpenAiModels"
	| "alwaysAllowMcp"
	| "playSound"
	| "openMcpSettings"
	| "restartMcpServer"
	| "toggleToolAlwaysAllow"
	| "toggleMcpServer"
	| "enhancePrompt"
	| "enhancedPrompt"
	| "draggedImages"
	| "deleteMessage"
	| "searchCommits"
	| "setApiConfigPassword"
	| "requestVsCodeLmModels"
	| "updatePrompt"
	| "updateEnhancedPrompt"
	| "systemPrompt"
	| "apiConfiguration"
	| "upsertApiConfiguration"

export interface WebviewMessage {
	type: WebviewMessageType
	text?: string
	bool?: boolean
	number?: number
	values?: {
		name?: string
		oldName?: string
		newName?: string
		baseUrl?: string
		apiKey?: string
	}
	apiConfiguration?: ApiConfiguration
	listApiConfig?: ApiConfigMeta[]
	customPrompts?: CustomPrompts
	disabled?: boolean
	query?: string
	commands?: string[]
	audioType?: AudioType
	serverName?: string
	toolName?: string
	alwaysAllow?: boolean
	mode?: Mode
	promptMode?: PromptMode
	customPrompt?: PromptComponent
	dataUrls?: string[]
	images?: string[]
	askResponse?: ClineAskResponse
	value?: number
}

export type ClineAskResponse = "yesButtonClicked" | "noButtonClicked" | "messageResponse"

export interface ExtensionMessage {
	type: "theme" | "ollamaModels" | "lmStudioModels" | "vsCodeLmModels" | "enhancedPrompt" | "commitSearchResults"
	theme?: any
	text?: string
	ollamaModels?: string[]
	lmStudioModels?: string[]
	vsCodeLmModels?: string[]
	commits?: Commit[]
}
