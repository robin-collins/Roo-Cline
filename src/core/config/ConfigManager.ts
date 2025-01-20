import { ExtensionContext } from "vscode"
import { ApiConfiguration, ApiProvider, ModelInfo } from "../../shared/api"
import { Mode } from "../prompts/types"
import { ApiConfigMeta } from "../../shared/ExtensionMessage"
import * as vscode from "vscode"
import { validateProfileSettings, validateProfileName, validateProfileTransition } from "../../shared/validation"

export interface GlobalSettings {
	currentApiConfigName: string
	alwaysAllowReadOnly?: boolean
	alwaysAllowWrite?: boolean
	alwaysAllowExecute?: boolean
	alwaysAllowBrowser?: boolean
	alwaysAllowMcp?: boolean
	modeApiConfigs?: Partial<Record<Mode, string>>
}

export interface ProfileSpecificSettings {
	id: string
	apiProvider?: ApiProvider
	apiModelId?: string
	apiKey?: string
	glamaApiKey?: string
	glamaModelId?: string
	glamaModelInfo?: ModelInfo
	openRouterApiKey?: string
	awsAccessKey?: string
	awsSecretKey?: string
	awsSessionToken?: string
	awsRegion?: string
	awsUseCrossRegionInference?: boolean
	vertexProjectId?: string
	vertexRegion?: string
	openAiBaseUrl?: string
	openAiApiKey?: string
	openAiModelId?: string
	ollamaModelId?: string
	ollamaBaseUrl?: string
	lmStudioModelId?: string
	lmStudioBaseUrl?: string
	anthropicBaseUrl?: string
	geminiApiKey?: string
	openAiNativeApiKey?: string
	deepSeekApiKey?: string
	mistralApiKey?: string
	azureApiVersion?: string
	openAiStreamingEnabled?: boolean
	openRouterModelId?: string
	openRouterModelInfo?: ModelInfo
	openRouterUseMiddleOutTransform?: boolean
	vsCodeLmModelSelector?: vscode.LanguageModelChatSelector
}

export interface ApiConfigData {
	globalSettings: GlobalSettings
	profiles: {
		[key: string]: ProfileSpecificSettings
	}
}

export class ConfigManager {
	private readonly defaultConfig: ApiConfigData = {
		globalSettings: {
			currentApiConfigName: "default",
		},
		profiles: {
			default: {
				id: this.generateId(),
			},
		},
	}

	private readonly SCOPE_PREFIX = "roo_cline_config_"
	private readonly context: ExtensionContext

	constructor(context: ExtensionContext) {
		this.context = context
		this.initConfig().catch(console.error)
	}

	private generateId(): string {
		return Math.random().toString(36).substring(2, 15)
	}

	/**
	 * Initialize config if it doesn't exist and handle migrations
	 */
	async initConfig(): Promise<void> {
		try {
			const config = await this.readConfig()
			if (!config) {
				await this.writeConfig(this.defaultConfig)
				return
			}

			let needsMigration = false

			// Migrate old config structure to new structure
			if ("apiConfigs" in config) {
				const oldConfig = config as any
				const newConfig: ApiConfigData = {
					globalSettings: {
						currentApiConfigName: oldConfig.currentApiConfigName || "default",
						modeApiConfigs: oldConfig.modeApiConfigs || {},
					},
					profiles: {},
				}

				// Migrate each profile
				for (const [name, apiConfig] of Object.entries(oldConfig.apiConfigs)) {
					const profileSettings = this.extractProfileSettings(apiConfig as ApiConfiguration)
					newConfig.profiles[name] = profileSettings
				}

				await this.writeConfig(newConfig)
				needsMigration = true
			}

			// Ensure all configs have IDs
			if (!needsMigration) {
				for (const [name, profile] of Object.entries(config.profiles)) {
					if (!profile.id) {
						profile.id = this.generateId()
						needsMigration = true
					}
				}

				if (needsMigration) {
					await this.writeConfig(config)
				}
			}

			// Ensure global settings exist
			if (!config.globalSettings) {
				config.globalSettings = {
					currentApiConfigName: config.profiles["default"] ? "default" : Object.keys(config.profiles)[0],
				}
				await this.writeConfig(config)
			}
		} catch (error) {
			throw new Error(`Failed to initialize config: ${error}`)
		}
	}

	/**
	 * List all available configs with metadata
	 */
	async ListConfig(): Promise<ApiConfigMeta[]> {
		try {
			const config = await this.readConfig()
			return Object.entries(config.profiles).map(([name, profile]) => ({
				name,
				id: profile.id,
				apiProvider: profile.apiProvider,
			}))
		} catch (error) {
			throw new Error(`Failed to list configs: ${error}`)
		}
	}

	/**
	 * Extract profile-specific settings from an ApiConfiguration
	 */
	public extractProfileSettings(apiConfiguration: ApiConfiguration): ProfileSpecificSettings {
		const {
			apiProvider,
			apiModelId,
			apiKey,
			glamaModelId,
			glamaModelInfo,
			glamaApiKey,
			openRouterApiKey,
			awsAccessKey,
			awsSecretKey,
			awsSessionToken,
			awsRegion,
			awsUseCrossRegionInference,
			vertexProjectId,
			vertexRegion,
			openAiBaseUrl,
			openAiApiKey,
			openAiModelId,
			ollamaModelId,
			ollamaBaseUrl,
			lmStudioModelId,
			lmStudioBaseUrl,
			anthropicBaseUrl,
			geminiApiKey,
			openAiNativeApiKey,
			deepSeekApiKey,
			mistralApiKey,
			azureApiVersion,
			openAiStreamingEnabled,
			openRouterModelId,
			openRouterModelInfo,
			openRouterUseMiddleOutTransform,
			vsCodeLmModelSelector,
		} = apiConfiguration

		return {
			id: apiConfiguration.id || this.generateId(),
			apiProvider,
			apiModelId,
			apiKey,
			glamaModelId,
			glamaModelInfo,
			glamaApiKey,
			openRouterApiKey,
			awsAccessKey,
			awsSecretKey,
			awsSessionToken,
			awsRegion,
			awsUseCrossRegionInference,
			vertexProjectId,
			vertexRegion,
			openAiBaseUrl,
			openAiApiKey,
			openAiModelId,
			ollamaModelId,
			ollamaBaseUrl,
			lmStudioModelId,
			lmStudioBaseUrl,
			anthropicBaseUrl,
			geminiApiKey,
			openAiNativeApiKey,
			deepSeekApiKey,
			mistralApiKey,
			azureApiVersion,
			openAiStreamingEnabled,
			openRouterModelId,
			openRouterModelInfo,
			openRouterUseMiddleOutTransform,
			vsCodeLmModelSelector,
		}
	}

	/**
	 * Validate profile settings based on provider requirements
	 */
	private validateProfileSettings(settings: ProfileSpecificSettings): boolean {
		if (!settings.apiProvider) return false

		switch (settings.apiProvider) {
			case "anthropic":
				return !!settings.apiKey
			case "glama":
				return !!settings.glamaApiKey
			case "openrouter":
				return !!settings.openRouterApiKey
			case "bedrock":
				return !!settings.awsAccessKey && !!settings.awsSecretKey
			case "vertex":
				return !!settings.vertexProjectId && !!settings.vertexRegion
			case "openai":
				return !!settings.openAiApiKey && !!settings.openAiBaseUrl
			case "gemini":
				return !!settings.geminiApiKey
			case "openai-native":
				return !!settings.openAiNativeApiKey
			case "deepseek":
				return !!settings.deepSeekApiKey
			case "mistral":
				return !!settings.mistralApiKey
			case "ollama":
				return true // No required fields
			case "lmstudio":
				return true // No required fields
			case "vscode-lm":
				return !!settings.vsCodeLmModelSelector
			default:
				return false
		}
	}

	/**
	 * Save a config with the given name
	 */
	async SaveConfig(name: string, config: ApiConfiguration): Promise<void> {
		try {
			const currentConfig = await this.readConfig()
			const profileSettings = this.extractProfileSettings(config)

			// Validate profile settings
			const settingsValidation = validateProfileSettings(profileSettings)
			if (!settingsValidation.isValid) {
				throw new Error(`Invalid configuration: ${settingsValidation.errors.join(", ")}`)
			}

			// Validate profile name
			const existingNames = Object.keys(currentConfig.profiles).filter((n) => n !== name)
			const nameValidation = validateProfileName(name, existingNames)
			if (!nameValidation.isValid) {
				throw new Error(`Invalid profile name: ${nameValidation.errors.join(", ")}`)
			}

			// If this is an existing profile, validate the transition
			if (currentConfig.profiles[name]) {
				const transitionValidation = validateProfileTransition(currentConfig.profiles[name], profileSettings)
				if (!transitionValidation.isValid) {
					console.warn(`Profile transition warnings: ${transitionValidation.errors.join(", ")}`)
				}
			}

			currentConfig.profiles[name] = profileSettings
			await this.writeConfig(currentConfig)
		} catch (error) {
			throw new Error(`Failed to save config: ${error}`)
		}
	}

	/**
	 * Convert profile settings back to ApiConfiguration
	 */
	private profileSettingsToApiConfig(settings: ProfileSpecificSettings): ApiConfiguration {
		return {
			...settings,
		}
	}

	/**
	 * Load a config by name
	 */
	async LoadConfig(name: string): Promise<ApiConfiguration> {
		try {
			const config = await this.readConfig()
			const profileSettings = config.profiles[name]

			if (!profileSettings) {
				throw new Error(`Config '${name}' not found`)
			}

			// Validate profile settings before loading
			const settingsValidation = validateProfileSettings(profileSettings)
			if (!settingsValidation.isValid) {
				console.warn(`Loading profile with validation errors: ${settingsValidation.errors.join(", ")}`)
			}

			// Update current profile in global settings
			config.globalSettings.currentApiConfigName = name
			await this.writeConfig(config)

			// Convert profile settings to ApiConfiguration
			return this.profileSettingsToApiConfig(profileSettings)
		} catch (error) {
			throw new Error(`Failed to load config: ${error}`)
		}
	}

	/**
	 * Delete a config by name
	 */
	async DeleteConfig(name: string): Promise<void> {
		try {
			const currentConfig = await this.readConfig()
			if (!currentConfig.profiles[name]) {
				throw new Error(`Config '${name}' not found`)
			}

			// Don't allow deleting the default config
			if (Object.keys(currentConfig.profiles).length === 1) {
				throw new Error(`Cannot delete the last remaining configuration.`)
			}

			// If deleting the current profile, switch to another one
			if (currentConfig.globalSettings.currentApiConfigName === name) {
				const newCurrentName = Object.keys(currentConfig.profiles).find((n) => n !== name)
				if (newCurrentName) {
					currentConfig.globalSettings.currentApiConfigName = newCurrentName
				}
			}

			// Remove profile from mode configs if it's being used
			if (currentConfig.globalSettings.modeApiConfigs) {
				for (const [mode, configId] of Object.entries(currentConfig.globalSettings.modeApiConfigs)) {
					if (configId === currentConfig.profiles[name].id) {
						delete currentConfig.globalSettings.modeApiConfigs[mode]
					}
				}
			}

			delete currentConfig.profiles[name]
			await this.writeConfig(currentConfig)
		} catch (error) {
			throw new Error(`Failed to delete config: ${error}`)
		}
	}

	/**
	 * Set the current active API configuration
	 */
	async SetCurrentConfig(name: string): Promise<void> {
		try {
			const currentConfig = await this.readConfig()
			if (!currentConfig.profiles[name]) {
				throw new Error(`Config '${name}' not found`)
			}

			currentConfig.globalSettings.currentApiConfigName = name
			await this.writeConfig(currentConfig)
		} catch (error) {
			throw new Error(`Failed to set current config: ${error}`)
		}
	}

	/**
	 * Check if a config exists by name
	 */
	async HasConfig(name: string): Promise<boolean> {
		try {
			const config = await this.readConfig()
			return name in config.profiles
		} catch (error) {
			throw new Error(`Failed to check config existence: ${error}`)
		}
	}

	/**
	 * Set the API config for a specific mode
	 */
	async SetModeConfig(mode: Mode, configId: string): Promise<void> {
		try {
			const currentConfig = await this.readConfig()
			if (!currentConfig.globalSettings.modeApiConfigs) {
				currentConfig.globalSettings.modeApiConfigs = {}
			}
			currentConfig.globalSettings.modeApiConfigs[mode] = configId
			await this.writeConfig(currentConfig)
		} catch (error) {
			throw new Error(`Failed to set mode config: ${error}`)
		}
	}

	/**
	 * Get the API config ID for a specific mode
	 */
	async GetModeConfigId(mode: Mode): Promise<string | undefined> {
		try {
			const config = await this.readConfig()
			return config.globalSettings.modeApiConfigs?.[mode]
		} catch (error) {
			throw new Error(`Failed to get mode config: ${error}`)
		}
	}

	async RenameConfig(oldName: string, newName: string): Promise<void> {
		try {
			const currentConfig = await this.readConfig()
			if (!currentConfig.profiles[oldName]) {
				throw new Error(`Config '${oldName}' not found`)
			}

			// Validate new profile name
			const existingNames = Object.keys(currentConfig.profiles).filter((n) => n !== oldName)
			const nameValidation = validateProfileName(newName, existingNames)
			if (!nameValidation.isValid) {
				throw new Error(`Invalid profile name: ${nameValidation.errors.join(", ")}`)
			}

			// Move the profile to the new name
			currentConfig.profiles[newName] = currentConfig.profiles[oldName]
			delete currentConfig.profiles[oldName]

			// Update current profile name if necessary
			if (currentConfig.globalSettings.currentApiConfigName === oldName) {
				currentConfig.globalSettings.currentApiConfigName = newName
			}

			// Update mode configs if necessary
			if (currentConfig.globalSettings.modeApiConfigs) {
				for (const [mode, configId] of Object.entries(currentConfig.globalSettings.modeApiConfigs)) {
					if (configId === currentConfig.profiles[oldName].id) {
						currentConfig.globalSettings.modeApiConfigs[mode] = currentConfig.profiles[newName].id
					}
				}
			}

			await this.writeConfig(currentConfig)
		} catch (error) {
			throw new Error(`Failed to rename config: ${error}`)
		}
	}

	private async readConfig(): Promise<ApiConfigData> {
		try {
			const configKey = `${this.SCOPE_PREFIX}api_config`
			const content = await this.context.secrets.get(configKey)

			if (!content) {
				return this.defaultConfig
			}

			const config = JSON.parse(content)

			// Ensure the config has the correct structure
			if (!config.globalSettings || !config.profiles) {
				// If it's an old format config, it will be migrated in initConfig
				return config
			}

			return config
		} catch (error) {
			throw new Error(`Failed to read config from secrets: ${error}`)
		}
	}

	private async writeConfig(config: ApiConfigData): Promise<void> {
		try {
			const configKey = `${this.SCOPE_PREFIX}api_config`
			const content = JSON.stringify(config, null, 2)
			await this.context.secrets.store(configKey, content)
		} catch (error) {
			throw new Error(`Failed to write config to secrets: ${error}`)
		}
	}
}
