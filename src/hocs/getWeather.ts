import {CallbackQueryContext, Context} from 'grammy'
import {GetWeatherFromCache, UpdateWeatherCache} from '../services/cache'
import {weather} from '../services/weather'
import {getCity} from './getCity'

export const getWeather = async (
	ctx: CallbackQueryContext<Context> | Context,
	isFahrenheit: boolean,
) => {
	const city = getCity()

	if (!city) {
		await ctx.reply('Пожалуйста, выберите город с помощью команды /select.')
		return ctx.callbackQuery && (await ctx.answerCallbackQuery())
	}

	try {
		const cachedWeather = GetWeatherFromCache(city)

		if (cachedWeather) {
			await ctx.reply(cachedWeather)
		} else {
			const weatherData = await weather({ctx, city, isFahrenheit})
			UpdateWeatherCache(city, weatherData)
		}
	} catch (error) {
		console.error('Ошибка получения данных о погоде:', error)
		await ctx.reply(
			'Ошибка при получении данных о погоде. Пожалуйста, попробуйте позже.',
		)
	}

	if (ctx.callbackQuery) {
		await ctx.answerCallbackQuery()
	}
}
