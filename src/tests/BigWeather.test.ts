import * as googleTranslateApi from '@vitalets/google-translate-api'
import {Context} from 'grammy'
import {BigWeather} from '../services/bigWeather'
import {GetBigWeather} from '../utils/bigWeatherScrapper'

jest.mock('@vitalets/google-translate-api', () => ({
	translate: jest.fn(),
}))

jest.mock('../utils/bigWeatherScrapper', () => ({
	GetBigWeather: jest.fn(),
}))

describe('BigWeather', () => {
	let ctx: Partial<Context>

	beforeEach(() => {
		ctx = {
			reply: jest.fn(),
		}
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('должен отправить сообщение о необходимости выбора города, если город не выбран', async () => {
		await BigWeather({ctx: ctx as Context, city: '', isFahrenheit: false})

		expect(ctx.reply).toHaveBeenCalledWith(
			'❗️Пожалуйста, сначала выберите город с помощью команды /select.',
		)
	})

	it('должен обрабатывать ошибки при получении данных о погоде', async () => {
		const mockCity = 'Makhachkala'
		const mockErrorMessage = 'Error during translation or weather fetching'

		;(googleTranslateApi.translate as jest.Mock).mockRejectedValueOnce(
			new Error(mockErrorMessage),
		)

		await BigWeather({ctx: ctx as Context, city: mockCity, isFahrenheit: false})

		expect(ctx.reply).toHaveBeenCalledWith(
			`❗️Произошла ошибка при получении данных о погоде для города *${mockCity}*. Попробуйте позже.`,
			{parse_mode: 'Markdown'},
		)
	})

	it('должен обрабатывать ошибки при неполных данных о погоде', async () => {
		const mockCity = 'Makhachkala'
		const mockCityInEnglish = 'Makhachkala'
		const incompleteWeatherData = {
			day: ['Понедельник'],
			temperature: null,
			condition: ['Солнечно'],
		}

		;(googleTranslateApi.translate as jest.Mock).mockResolvedValueOnce({
			text: mockCityInEnglish,
		})
		;(GetBigWeather as jest.Mock).mockResolvedValueOnce(incompleteWeatherData)

		await BigWeather({ctx: ctx as Context, city: mockCity, isFahrenheit: false})

		expect(ctx.reply).toHaveBeenCalledWith(
			`❗️Произошла ошибка при получении данных о погоде для города *${mockCity}*. Попробуйте позже.`,
			{parse_mode: 'Markdown'},
		)
	})
})
