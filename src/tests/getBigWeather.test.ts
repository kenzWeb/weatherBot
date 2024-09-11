import {CallbackQueryContext, Context} from 'grammy'
import {getBigWeather} from '../hocs/getBigWeather'
import * as getCityModule from '../hocs/getCity'
import {BigWeather} from '../services/bigWeather'
import {GetBigWeatherFromCache} from '../services/cache'

jest.mock('../services/cache', () => ({
	GetBigWeatherFromCache: jest.fn(),
	UpdateBigWeatherCache: jest.fn(),
}))
jest.mock('../services/bigWeather', () => ({
	BigWeather: jest.fn(),
}))
jest.mock('../hocs/getCity', () => ({
	getCity: jest.fn(),
}))

describe('getBigWeather', () => {
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

		await getBigWeather(ctx as CallbackQueryContext<Context>, false)

		expect(ctx.reply).toHaveBeenCalledWith(
			'Пожалуйста, выберите город с помощью команды /select.',
		)
		expect(ctx.answerCallbackQuery).toHaveBeenCalled()
	})

	it('должен использовать кеш, если он существует', async () => {
		const cachedWeather = 'Прогноз: солнечно'
		;(GetBigWeatherFromCache as jest.Mock).mockReturnValueOnce(cachedWeather)
		jest.spyOn(getCityModule, 'getCity').mockReturnValueOnce('Makhachkala')

		await getBigWeather(ctx as CallbackQueryContext<Context>, false)

		expect(GetBigWeatherFromCache).toHaveBeenCalledWith('Makhachkala')
		expect(ctx.reply).toHaveBeenCalledWith(cachedWeather)
	})

	it('должен обработать ошибки при запросе прогноза', async () => {
		jest.spyOn(getCityModule, 'getCity').mockReturnValueOnce('Makhachkala')
		;(BigWeather as jest.Mock).mockRejectedValueOnce(new Error('Ошибка сети'))

		await getBigWeather(ctx as CallbackQueryContext<Context>, false)

		expect(ctx.reply).toHaveBeenCalledWith(
			'Ошибка при получении данных о погоде. Пожалуйста, попробуйте позже.',
		)
	})
})
