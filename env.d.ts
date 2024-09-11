export {}

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			BOT_TOKEN: string
			GEOCODING_API_KEY: string
		}
	}
}
