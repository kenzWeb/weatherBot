import {CallbackQueryContext, Context} from 'grammy'

import {GetWeatherFromCache, UpdateWeatherCache} from '../services/cache'
import {weather} from '../services/weather'
import {getCity} from './getCity'

export const getWeather = async (
	ctx: CallbackQueryContext<Context> | Context,
	isFahrenheit: boolean,
) => {
	const city = getCity()
	if (city) {
		try {
			const cachedWeather = GetWeatherFromCache(city)
			if (cachedWeather) {
				await ctx.reply(cachedWeather)
				if (ctx.callbackQuery) {
					await ctx.answerCallbackQuery()
				}
				return
			}

			const weatherData = await weather({ctx, city, isFahrenheit})
			UpdateWeatherCache(city, weatherData)
		} catch (error) {
			await ctx.reply(
				'Ошибка при получении данных о погоде. Пожалуйста, попробуйте позже.',
			)
			console.log(error)
		}
	} else {
		await ctx.reply('Пожалуйста, выберите город с помощью команды /select.')
	}
	if (ctx.callbackQuery) {
		await ctx.answerCallbackQuery()
	}
}
