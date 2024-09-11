import {CommandContext, Context} from 'grammy'
import {Update} from 'node-telegram-bot-api'

export type CustomContext = Context & {
	update: Update
}

export type LocationMessageContext = CommandContext<CustomContext> & {
	message: {
		location: {
			latitude: number
			longitude: number
		}
	}
}
