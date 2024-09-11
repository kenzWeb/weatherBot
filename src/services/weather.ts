import {translate} from '@vitalets/google-translate-api'

import {Context} from 'grammy'
import {convertToFahrenheit} from '../utils/celsius-to-fahrenheit'
import {getWeather} from '../utils/weatherScrapper'

type WeatherData = {
	ctx: Context
	city: string
	isFahrenheit: boolean
}

export const weather = async ({ctx, city, isFahrenheit}: WeatherData) => {
	if (!city) {
		await ctx.reply(
			'Пожалуйста, сначала выберите город с помощью команды /select.',
		)
		return
	}

	try {
		const translatedCity = await translate(city, {from: 'ru', to: 'en'})
		const cityInEnglish = translatedCity.text.toLowerCase()
		const weatherData = await getWeather(cityInEnglish)

		if (weatherData.temperature && weatherData.condition) {
			const temperatureCelsius = parseFloat(
				weatherData.temperature.trim().replace('°', ''),
			)

			const temperature = isFahrenheit
				? `${convertToFahrenheit(temperatureCelsius).toFixed(1)}°F`
				: `${temperatureCelsius}°C`

			const weatherMessage =
				`🌆 Погода в городе *${city}*:\n\n` +
				`🌡 Температура: *${temperature}*\n` +
				`🌥 Состояние: *${weatherData.condition.trim()}*\n` +
				`📅 Дата: ${new Date().toLocaleDateString()}\n\n` +
				`🌐 Ссылка на более подробную информацию: https://pogoda.mail.ru/prognoz/${cityInEnglish}`

			await ctx.reply(weatherMessage)
			return weatherMessage
		} else {
			await ctx.reply(`Не удалось получить данные о погоде для города ${city}.`)
		}
	} catch (error) {
		console.error('Error during translation or weather fetching:', error)
		await ctx.reply(
			'Произошла ошибка при переводе названия города или получении данных о погоде.',
		)
	}
}
