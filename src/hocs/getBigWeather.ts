import {CallbackQueryContext, Context} from 'grammy'
import {BigWeather} from '../services/bigWeather'
import {GetBigWeatherFromCache, UpdateBigWeatherCache} from '../services/cache'
import {getCity} from './getCity'

export const getBigWeather = async (
	ctx: CallbackQueryContext<Context> | Context,
	isFahrenheit: boolean,
) => {
	const city = getCity()

	if (!city) {
		await ctx.reply('Пожалуйста, выберите город с помощью команды /select.')
		return ctx.callbackQuery && (await ctx.answerCallbackQuery())
	}

	try {
		const cachedWeather = GetBigWeatherFromCache(city)

		if (cachedWeather) {
			await ctx.reply(cachedWeather)
		} else {
			const weatherData = await BigWeather({ctx, city, isFahrenheit})

			if (weatherData) {
				UpdateBigWeatherCache(city, weatherData)
				await ctx.reply(weatherData)
			}
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
