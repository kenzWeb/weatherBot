import {CallbackQueryContext, CommandContext, Context} from 'grammy'

export const getLocation = async (
	ctx: CallbackQueryContext<Context> | CommandContext<Context>,
) => {
	const keyboard = {
		reply_markup: {
			keyboard: [
				[
					{
						text: 'Отправить свою геолокацию',
						request_location: true,
					},
				],
			],
			resize_keyboard: true,
			one_time_keyboard: true,
		},
	}

	await ctx.reply(
		'Отправьте свою геолокацию, и я помогу вам определить город.',
		keyboard,
	)
}
