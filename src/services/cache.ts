/* eslint-disable @typescript-eslint/no-explicit-any */
export const BigWeatherCache = new Map()

export const GetBigWeatherFromCache = (city: string) => {
	const cacheData = BigWeatherCache.get(city)
	if (cacheData && Date.now() - cacheData.timestamp < 3600000) {
		return cacheData.data
	}
	return null
}

export const UpdateBigWeatherCache = (city: string, data: any) => {
	BigWeatherCache.set(city, {data, timestamp: Date.now()})
}

export const WeatherCache = new Map()

export const GetWeatherFromCache = (city: string) => {
	const cacheData = WeatherCache.get(city)
	if (cacheData && Date.now() - cacheData.timestamp < 3600000) {
		return cacheData.data
	}
	return null
}

export const UpdateWeatherCache = (city: string, data: any) => {
	WeatherCache.set(city, {data, timestamp: Date.now()})
}
