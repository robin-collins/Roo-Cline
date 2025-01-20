import { ApiConfiguration, ApiProvider } from "./api"

export interface ValidationResult {
	isValid: boolean
	errors: string[]
}

export function validateProfileSettings(config: ApiConfiguration): ValidationResult {
	const errors: string[] = []

	// Validate required fields based on provider
	switch (config.apiProvider) {
		case "anthropic":
			if (!config.apiKey) {
				errors.push("API key is required for Anthropic")
			}
			break

		case "openai":
			if (!config.openAiApiKey) {
				errors.push("API key is required for OpenAI")
			}
			if (!config.openAiBaseUrl) {
				errors.push("Base URL is required for OpenAI")
			}
			break

		case "glama":
			if (!config.glamaApiKey) {
				errors.push("API key is required for Glama")
			}
			break

		case "openrouter":
			if (!config.openRouterApiKey) {
				errors.push("API key is required for OpenRouter")
			}
			break

		case "bedrock":
			if (!config.awsAccessKey) {
				errors.push("Access key is required for AWS Bedrock")
			}
			if (!config.awsSecretKey) {
				errors.push("Secret key is required for AWS Bedrock")
			}
			break

		case "vertex":
			if (!config.vertexProjectId) {
				errors.push("Project ID is required for Vertex AI")
			}
			if (!config.vertexRegion) {
				errors.push("Region is required for Vertex AI")
			}
			break

		case "gemini":
			if (!config.geminiApiKey) {
				errors.push("API key is required for Gemini")
			}
			break

		case "openai-native":
			if (!config.openAiNativeApiKey) {
				errors.push("API key is required for OpenAI Native")
			}
			break

		case "deepseek":
			if (!config.deepSeekApiKey) {
				errors.push("API key is required for DeepSeek")
			}
			break

		case "mistral":
			if (!config.mistralApiKey) {
				errors.push("API key is required for Mistral")
			}
			break

		case "ollama":
		case "lmstudio":
			// No required fields for these providers
			break

		case "vscode-lm":
			if (!config.vsCodeLmModelSelector) {
				errors.push("Model selector is required for VS Code Language Model")
			}
			break

		default:
			errors.push("Invalid API provider")
	}

	// Validate model ID if specified
	if (config.apiModelId && !config.apiModelId.trim()) {
		errors.push("Model ID cannot be empty if specified")
	}

	return {
		isValid: errors.length === 0,
		errors,
	}
}

export function validateProfileName(name: string, existingNames: string[]): ValidationResult {
	const errors: string[] = []

	if (!name) {
		errors.push("Profile name is required")
	} else if (name.trim().length === 0) {
		errors.push("Profile name cannot be empty")
	} else if (existingNames.includes(name)) {
		errors.push("Profile name already exists")
	} else if (name.length > 50) {
		errors.push("Profile name cannot be longer than 50 characters")
	} else if (!/^[a-zA-Z0-9\s-_]+$/.test(name)) {
		errors.push("Profile name can only contain letters, numbers, spaces, hyphens, and underscores")
	}

	return {
		isValid: errors.length === 0,
		errors,
	}
}

export function validateProfileTransition(fromConfig: ApiConfiguration, toConfig: ApiConfiguration): ValidationResult {
	const errors: string[] = []

	// Check if switching between providers that require different authentication
	if (fromConfig.apiProvider !== toConfig.apiProvider) {
		const requiresReauth = [
			"anthropic",
			"openai",
			"glama",
			"openrouter",
			"bedrock",
			"vertex",
			"gemini",
			"openai-native",
			"deepseek",
			"mistral",
		]

		if (requiresReauth.includes(fromConfig.apiProvider) && requiresReauth.includes(toConfig.apiProvider)) {
			errors.push("Switching between these providers may require re-authentication")
		}
	}

	// Check if model compatibility is maintained
	if (fromConfig.apiModelId && toConfig.apiProvider !== fromConfig.apiProvider) {
		errors.push("Model ID may not be compatible with the new provider")
	}

	return {
		isValid: errors.length === 0,
		errors,
	}
}
