// type that represents json data that is sent from extension to webview, called ExtensionMessage and has 'type' enum which can be 'plusButtonClicked' or 'settingsButtonClicked' or 'hello'

import { ApiConfiguration } from "./api"
import { ModelInfo } from "./api"
import { Mode } from "./modes"

export interface ApiConfigMeta {
	name: string
	apiProvider?: string
	id?: string
}

export interface ExtensionMessage {
	type:
		| "autoApprovalEnabled"
		| "glamaModels"
		| "action"
		| "state"
		| "selectedImages"
		| "ollamaModels"
		| "lmStudioModels"
		| "theme"
		| "workspaceUpdated"
		| "invoke"
		| "partialMessage"
		| "error"
		| "themeChanged"
		| "openRouterModels"
		| "listApiConfig"
		| "systemPrompt"
		| "vsCodeLmModels"
		| "openAiModels"
		| "enhancedPrompt"
		| "commitSearchResults"
	theme?: any
	text?: string
	error?: string
	state?: ExtensionState
	selectedImages?: string[]
	ollamaModels?: string[]
	lmStudioModels?: string[]
	openRouterModels?: Record<string, ModelInfo>
	glamaModels?: Record<string, ModelInfo>
	listApiConfig?: ApiConfigMeta[]
	systemPrompt?: string
	action?: string
	mode?: Mode
	images?: string[]
	commits?: any[]
}

export interface ExtensionState {
	apiConfiguration: ApiConfiguration
	customInstructions?: string
	alwaysAllowReadOnly?: boolean
	alwaysAllowWrite?: boolean
	alwaysAllowExecute?: boolean
	alwaysAllowBrowser?: boolean
	alwaysAllowMcp?: boolean
	allowedCommands?: string[]
	soundEnabled?: boolean
	soundVolume?: number
	diffEnabled?: boolean
	browserViewportSize?: string
	screenshotQuality?: number
	fuzzyMatchThreshold?: number
	preferredLanguage?: string
	writeDelayMs?: number
	terminalOutputLineLimit?: number
	mcpEnabled?: boolean
	alwaysApproveResubmit?: boolean
	requestDelaySeconds?: number
	currentApiConfigName?: string
	listApiConfigMeta?: ApiConfigMeta[]
	mode?: Mode
	customPrompts?: Record<string, any>
	enhancementApiConfigId?: string
	experimentalDiffStrategy?: boolean
	autoApprovalEnabled?: boolean
}

export interface ClineAsk {
	text: string
	images?: string[]
}

export interface ClineSay {
	text: string
	images?: string[]
}

export interface ClineMessage {
	type: "message" | "error" | "warning" | "info" | "ask" | "say"
	text: string
	ts: number
	ask?: ClineAsk
	say?: ClineSay
	images?: string[]
	partial?: boolean
}
