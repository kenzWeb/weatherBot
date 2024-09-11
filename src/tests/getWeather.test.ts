import {CallbackQueryContext, Context} from 'grammy'
import * as getCityModule from '../hocs/getCity'
import {getWeather} from '../hocs/getWeather'
import {GetWeatherFromCache} from '../services/cache'
import {weather} from '../services/weather'

jest.mock('../services/cache', () => ({
	GetWeatherFromCache: jest.fn(),
	UpdateWeatherCache: jest.fn(),
}))
jest.mock('../services/weather', () => ({
	weather: jest.fn(),
}))
jest.mock('../hocs/getCity', () => ({
	getCity: jest.fn(),
}))

describe('getWeather', () => {
	let ctx: Partial<CallbackQueryContext<Context>>

	beforeEach(() => {
		ctx = {
			reply: jest.fn(),
			answerCallbackQuery: jest.fn(),
			callbackQuery: {
				id: 'test_id',
				from: {
					id: Number('test_id'),
					username: 'test_username',
					is_bot: false,
					first_name: 'Test',
				},
				chat_instance: 'test_chat_instance',
				data: 'test_data',
			},
		}
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('должен отправлять сообщение о необходимости выбора города', async () => {
		jest.spyOn(getCityModule, 'getCity').mockReturnValueOnce('')

		await getWeather(ctx as CallbackQueryContext<Context>, false)

		expect(ctx.reply).toHaveBeenCalledWith(
			'Пожалуйста, выберите город с помощью команды /select.',
		)
		expect(ctx.answerCallbackQuery).toHaveBeenCalled()
	})

	it('должен использовать кеш, если он существует', async () => {
		const cachedWeather = 'Прогноз: солнечно'
		;(GetWeatherFromCache as jest.Mock).mockReturnValueOnce(cachedWeather)
		jest.spyOn(getCityModule, 'getCity').mockReturnValueOnce('Makhachkala')

		await getWeather(ctx as CallbackQueryContext<Context>, false)

		expect(GetWeatherFromCache).toHaveBeenCalledWith('Makhachkala')
		expect(ctx.reply).toHaveBeenCalledWith(cachedWeather)
	})

	it('должен обработать ошибки при запросе прогноза', async () => {
		jest.spyOn(getCityModule, 'getCity').mockReturnValueOnce('Makhachkala')
		;(weather as jest.Mock).mockRejectedValueOnce(new Error('Ошибка сети'))

		await getWeather(ctx as CallbackQueryContext<Context>, false)

		expect(ctx.reply).toHaveBeenCalledWith(
			'Ошибка при получении данных о погоде. Пожалуйста, попробуйте позже.',
		)
	})
})
