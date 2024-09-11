import axios from 'axios'
import {getIsFahrenheit, setCity} from '../hocs/getCity'
import {getWeather} from '../hocs/getWeather'
import {LocationMessageContext} from '../types/types'

export const location = async (ctx: LocationMessageContext) => {
	if (!ctx.message || !ctx.message.location) {
		await ctx.reply(
			'Не удалось получить геолокацию. Пожалуйста, отправьте данные о местоположении ещё раз.',
		)
		return
	}

	const {latitude, longitude} = ctx.message.location

	const locationApiKey = process.env.GEOCODING_API_KEY

	try {
		const url = `https://api.opencagedata.com/geocode/v1/json`
		const response = await axios.get(url, {
			params: {
				key: locationApiKey,
				q: `${latitude},${longitude}`,
				pretty: 1,
				no_annotations: 1,
			},
			headers: {
				'Content-Type': 'application/json',
			},
		})

		const city = response.data.results[0].components.city
		if (city) {
			setCity(city)
			await ctx.reply(`Ваш город определен: *${city}* ✅`)
			await ctx.reply(`Загрузка...`)
			await getWeather(ctx, getIsFahrenheit())
		} else {
			await ctx.reply('Не удалось определить город по геолокации.')
		}
	} catch (error) {
		console.error('Ошибка при получении города по геолокации:', error)
		await ctx.reply(
			'Произошла ошибка при определении города. Попробуйте позже.',
		)
	}
}
