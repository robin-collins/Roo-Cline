import { memo, useState } from "react"
import { ApiConfigMeta } from "../../../../src/shared/ExtensionMessage"
import { ApiConfiguration } from "../../../../src/shared/api"

interface ApiConfigManagerProps {
	listApiConfigMeta: ApiConfigMeta[]
	apiConfiguration: ApiConfiguration
	onSelectConfig: (configName: string) => void
	onDeleteConfig: (configName: string) => void
	onRenameConfig: (oldName: string, newName: string) => void
	onUpdateConfig: (config: ApiConfiguration) => void
	onSaveConfig: (configName: string, config: ApiConfiguration) => void
}

const ApiConfigManager: React.FC<ApiConfigManagerProps> = ({
	listApiConfigMeta,
	apiConfiguration,
	onSelectConfig,
	onDeleteConfig,
	onRenameConfig,
	onUpdateConfig,
	onSaveConfig,
}) => {
	const [isAdding, setIsAdding] = useState(false)
	const [isRenaming, setIsRenaming] = useState(false)
	const [newConfigName, setNewConfigName] = useState("")
	const [selectedConfigName, setSelectedConfigName] = useState("")
	const [isSwitching, setIsSwitching] = useState(false)

	const handleAdd = async () => {
		if (!newConfigName) return
		const validation = await validateProfileName(newConfigName, listApiConfigMeta)
		if (validation.isValid) {
			onSaveConfig(newConfigName, apiConfiguration)
			setNewConfigName("")
			setIsAdding(false)
		}
	}

	const handleRename = async (oldName: string, newName: string) => {
		if (!newName) return
		const validation = await validateProfileName(newName, listApiConfigMeta, oldName)
		if (validation.isValid) {
			onRenameConfig(oldName, newName)
			setIsRenaming(false)
		}
	}

	const handleSelectConfig = async (configName: string) => {
		const validation = await validateProfileTransition(apiConfiguration, configName)
		if (validation.isValid) {
			setIsSwitching(true)
			onSelectConfig(configName)
			setSelectedConfigName(configName)
			setIsSwitching(false)
		}
	}

	return (
		<div className="api-config-manager">
			<div className="config-list">
				{listApiConfigMeta.map((config) => (
					<div
						key={config.name}
						className={`config-item ${selectedConfigName === config.name ? "selected" : ""}`}
						style={{ opacity: isSwitching ? 0.5 : 1 }}>
						{isRenaming && selectedConfigName === config.name ? (
							<input
								type="text"
								value={newConfigName}
								onChange={(e) => setNewConfigName(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										handleRename(config.name, newConfigName)
									}
								}}
								autoFocus
							/>
						) : (
							<span onClick={() => handleSelectConfig(config.name)}>{config.name}</span>
						)}
						<div className="config-actions">
							<button
								onClick={() => {
									setIsRenaming(true)
									setSelectedConfigName(config.name)
									setNewConfigName(config.name)
								}}
								disabled={isSwitching}>
								Rename
							</button>
							<button onClick={() => onDeleteConfig(config.name)} disabled={isSwitching}>
								Delete
							</button>
						</div>
					</div>
				))}
			</div>
			{isAdding ? (
				<div className="add-config">
					<input
						type="text"
						value={newConfigName}
						onChange={(e) => setNewConfigName(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								handleAdd()
							}
						}}
						placeholder="New configuration name"
						autoFocus
					/>
					<button onClick={handleAdd}>Add</button>
					<button
						onClick={() => {
							setIsAdding(false)
							setNewConfigName("")
						}}>
						Cancel
					</button>
				</div>
			) : (
				<button onClick={() => setIsAdding(true)} disabled={isSwitching}>
					Add New Configuration
				</button>
			)}
		</div>
	)
}

export default memo(ApiConfigManager)
