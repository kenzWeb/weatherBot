import 'dotenv/config'
import {Bot, Composer, InlineKeyboard} from 'grammy'
import {commands} from './src/constants/constants'
import {getBigWeather} from './src/hocs/getBigWeather'
import {
	getCity,
	getIsFahrenheit,
	setCity,
	setIsFahrenheit,
} from './src/hocs/getCity'
import {getLocation} from './src/hocs/getLocation'
import {getWeather} from './src/hocs/getWeather'
import {location} from './src/services/location'
import {LocationMessageContext} from './src/types/types'

const botToken = process.env.BOT_TOKEN

if (!botToken) {
	throw new Error('BOT_TOKEN is not defined in the environment variables.')
}

const bot = new Bot(botToken)
const composer = new Composer()

bot.api.setMyCommands(commands)

bot.command('start', (ctx) => {
	const keyboard = new InlineKeyboard()
		.text('Выбрать город', 'select_city')
		.row()
		.text('Узнать погоду', 'get_weather')
		.row()
		.text('Сменить единицу температуры', 'change_unit')
		.row()
		.text('Узнать погоду по геолокации', 'get_location')
		.row()
		.text('Погода на 7 дней', 'get_weatherSeven')
	ctx.reply(
		'Добро пожаловать! Я помогу вам узнать погоду. Воспользуйтесь кнопками ниже для взаимодействия с ботом.',
		{reply_markup: keyboard},
	)
})

bot.command('help', (ctx) =>
	ctx.reply(
		'Доступные команды:\n' +
			'/select - выбрать город\n' +
			'/unit - сменить единицу температуры\n' +
			'/weather - узнать погоду в выбранном городе\n' +
			'/help - показать это сообщение\n' +
			'/location - узнать город по геолокации',
	),
)

bot.callbackQuery('get_weather', async (ctx) => {
	await getWeather(ctx, getIsFahrenheit())
})

bot.callbackQuery('get_weatherSeven', async (ctx) => {
	await getBigWeather(ctx, getIsFahrenheit())
})

bot.callbackQuery('change_unit', async (ctx) => {
	setIsFahrenheit(!getIsFahrenheit())
	const unit = getIsFahrenheit() ? 'Фаренгейт' : 'Цельсий'
	await ctx.reply(`Единица температуры переключена на: ${unit}`)
	await ctx.answerCallbackQuery()
})

bot.callbackQuery('select_city', async (ctx) => {
	setCity(undefined)
	await ctx.reply('Пожалуйста, введите название города:')
	await ctx.answerCallbackQuery()
})

bot.callbackQuery('get_location', async (ctx) => {
	getLocation(ctx)
	await ctx.answerCallbackQuery()
})

composer.command('select', async (ctx) => {
	await ctx.reply('Пожалуйста, введите название города:')
	setCity(undefined)
})

composer.on('message:text', async (ctx) => {
	if (!getCity()) {
		setCity(ctx.message.text)
		await ctx.reply(`Вы выбрали город: *${getCity()}*`)
	} else {
		await ctx.reply(
			'Город уже выбран. Используйте команду /weather для получения погоды или /select для выбора нового города.',
		)
	}
})

bot.command('unit', async (ctx) => {
	setIsFahrenheit(!getIsFahrenheit())
	const unit = getIsFahrenheit() ? 'Фаренгейт' : 'Цельсий'
	await ctx.reply(`Единица температуры переключена на: ${unit}`)
})

bot.command('weather', async (ctx) => {
	await getWeather(ctx, getIsFahrenheit())
})

bot.command('location', async (ctx) => {
	getLocation(ctx)
})

bot.use(composer)

bot.on('message:location', async (ctx) => {
	location(ctx as LocationMessageContext)
})

bot.on('message', async (ctx) => {
	await ctx.reply(
		'Используйте команду /select для выбора города или /weather для просмотра погоды. Используйте /unit для смены единицы температуры или /help для списка команд.',
	)
})

bot.catch((err) => {
	console.error('Error occurred:', err)
})

bot.start()
