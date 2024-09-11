import * as googleTranslateApi from '@vitalets/google-translate-api'
import {Context} from 'grammy'
import {weather} from '../services/weather'
import {convertToFahrenheit} from '../utils/celsius-to-fahrenheit'
import {getWeather} from '../utils/weatherScrapper'

jest.mock('@vitalets/google-translate-api', () => ({
	translate: jest.fn(),
}))

jest.mock('../utils/weatherScrapper', () => ({
	getWeather: jest.fn(),
}))

jest.mock('../utils/celsius-to-fahrenheit', () => ({
	convertToFahrenheit: jest.fn(),
}))

describe('weather', () => {
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
		await weather({ctx: ctx as Context, city: '', isFahrenheit: false})

		expect(ctx.reply).toHaveBeenCalledWith(
			'Пожалуйста, сначала выберите город с помощью команды /select.',
		)
	})

	it('должен отправить сообщение с погодой в градусах Цельсия', async () => {
		const mockCity = 'Москва'
		const mockCityInEnglish = 'moscow'
		const mockWeatherData = {
			temperature: '15°',
			condition: 'Облачно',
		}

		;(googleTranslateApi.translate as jest.Mock).mockResolvedValueOnce({
			text: mockCityInEnglish,
		})
		;(getWeather as jest.Mock).mockResolvedValueOnce(mockWeatherData)

		const expectedMessage = `🌆 Погода в городе *${mockCity}*:\n\n🌡 Температура: *15°C*\n🌥 Состояние: *Облачно*\n📅 Дата: ${new Date().toLocaleDateString()}\n\n🌐 Ссылка на более подробную информацию: https://pogoda.mail.ru/prognoz/${mockCityInEnglish}`

		await weather({ctx: ctx as Context, city: mockCity, isFahrenheit: false})

		expect(ctx.reply).toHaveBeenCalledWith(expectedMessage)
	})

	it('должен отправить сообщение с погодой в градусах Фаренгейта', async () => {
		const mockCity = 'Москва'
		const mockCityInEnglish = 'moscow'
		const mockWeatherData = {
			temperature: '15°',
			condition: 'Облачно',
		}

		;(googleTranslateApi.translate as jest.Mock).mockResolvedValueOnce({
			text: mockCityInEnglish,
		})
		;(getWeather as jest.Mock).mockResolvedValueOnce(mockWeatherData)
		;(convertToFahrenheit as jest.Mock).mockReturnValueOnce(59)

		const expectedMessage = `🌆 Погода в городе *${mockCity}*:\n\n🌡 Температура: *59.0°F*\n🌥 Состояние: *Облачно*\n📅 Дата: ${new Date().toLocaleDateString()}\n\n🌐 Ссылка на более подробную информацию: https://pogoda.mail.ru/prognoz/${mockCityInEnglish}`

		await weather({ctx: ctx as Context, city: mockCity, isFahrenheit: true})

		expect(ctx.reply).toHaveBeenCalledWith(expectedMessage)
		expect(convertToFahrenheit).toHaveBeenCalledWith(15)
	})

	it('должен обрабатывать ошибки при запросе погоды', async () => {
		const mockCity = 'Москва'
		const mockErrorMessage = 'Error during translation or weather fetching'

		;(googleTranslateApi.translate as jest.Mock).mockRejectedValueOnce(
			new Error(mockErrorMessage),
		)

		await weather({ctx: ctx as Context, city: mockCity, isFahrenheit: false})

		expect(ctx.reply).toHaveBeenCalledWith(
			'Произошла ошибка при переводе названия города или получении данных о погоде.',
		)
	})

	it('должен отправить сообщение, если данные о погоде неполные', async () => {
		const mockCity = 'Москва'
		const mockCityInEnglish = 'moscow'
		const incompleteWeatherData = {
			temperature: null,
			condition: null,
		}

		;(googleTranslateApi.translate as jest.Mock).mockResolvedValueOnce({
			text: mockCityInEnglish,
		})
		;(getWeather as jest.Mock).mockResolvedValueOnce(incompleteWeatherData)

		await weather({ctx: ctx as Context, city: mockCity, isFahrenheit: false})

		expect(ctx.reply).toHaveBeenCalledWith(
			`Не удалось получить данные о погоде для города ${mockCity}.`,
		)
	})
})
