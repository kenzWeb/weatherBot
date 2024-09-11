import {translate} from '@vitalets/google-translate-api'
import {Context} from 'grammy'
import { GetBigWeather } from '../utils/bigWeatherScrapper'

type WeatherData = {
	ctx: Context
	city: string
	isFahrenheit: boolean
}

const degreeSymbols = {
	fahrenheit: 'F',
	celsius: 'C',
}

const getWeatherEmoji = (temperature: number): string => {
	if (temperature >= 30) return '🔥'
	if (temperature >= 20) return '☀️'
	if (temperature >= 10) return '⛅'
	return '❄️'
}

const formatWeatherMessage = (
	city: string,
	days: string[],
	temperatures: string[],
	conditions: string[],
	degreeSymbol: string,
): string => {
	let message = `🌆 Погода для города: ${city}\n\n📅 Прогноз на неделю:\n`
	days.forEach((day, index) => {
		const temp = temperatures[index]
		const condition = conditions[index]
		const temperatureValue = parseInt(temp)
		message += `📌 ${day.trim()}: ${getWeatherEmoji(
			temperatureValue,
		)} ${temp}${degreeSymbol} - ${condition.trim()}\n`
	})
	return message + `\n✨ Приятного дня!`
}

export const BigWeather = async ({ctx, city, isFahrenheit}: WeatherData) => {
	if (!city) {
		await ctx.reply(
			'❗️Пожалуйста, сначала выберите город с помощью команды /select.',
		)
		return null
	}

	try {
		const {text: cityInEnglish} = await translate(city, {from: 'ru', to: 'en'})
		const weatherData = await GetBigWeather(cityInEnglish.toLowerCase())

		const {day, temperature, condition} = weatherData
		if (day && temperature && condition) {
			const degreeSymbol = isFahrenheit
				? degreeSymbols.fahrenheit
				: degreeSymbols.celsius
			const weatherMessage = formatWeatherMessage(
				city,
				day,
				temperature,
				condition,
				degreeSymbol,
			)
			await ctx.reply(weatherMessage, {parse_mode: 'Markdown'})
			return weatherMessage
		} else {
			throw new Error('Incomplete weather data')
		}
	} catch (error) {
		console.error('Error during translation or weather fetching:', error)
		await ctx.reply(
			`❗️Произошла ошибка при получении данных о погоде для города *${city}*. Попробуйте позже.`,
			{parse_mode: 'Markdown'},
		)
		return null
	}
}
