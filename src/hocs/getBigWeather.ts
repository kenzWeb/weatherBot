import {CallbackQueryContext, Context} from 'grammy'

import {BigWeather} from '../services/bigWeather'
import {GetBigWeatherFromCache, UpdateBigWeatherCache} from '../services/cache'
import {getCity} from './getCity'

export const getBigWeather = async (
	ctx: CallbackQueryContext<Context> | Context,
	isFahrenheit: boolean,
) => {
	const city = getCity()
	if (city) {
		try {
			const cachedWeather = GetBigWeatherFromCache(city)
			if (cachedWeather) {
				await ctx.reply(cachedWeather)
				if (ctx.callbackQuery) {
					await ctx.answerCallbackQuery()
				}
				return
			}

			const weatherData = await BigWeather({ctx, city, isFahrenheit})
			if (weatherData) {
				UpdateBigWeatherCache(city, weatherData)
				await ctx.reply(weatherData)
			}
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
