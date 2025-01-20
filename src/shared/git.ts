export interface Commit {
	hash: string
	subject: string
	body?: string
	author: string
	date: string
	files?: string[]
}
