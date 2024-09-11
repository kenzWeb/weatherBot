import {chromium} from 'playwright'

export async function getWeather(
	city: string,
): Promise<{temperature: string | null; condition: string | null}> {
	const url = `https://pogoda.mail.ru/prognoz/${city}`
	const browser = await chromium.launch()
	const page = await browser.newPage()
	await page.goto(url)

	try {
		console.log(url)

		const temperature = await page.$eval(
			'.information__content__temperature',
			(el) => (el as HTMLElement).textContent,
		)
		const condition = await page.$eval(
			'.information__content__additional__item',
			(el) => (el as HTMLElement).textContent,
		)

		await browser.close()

		return {
			temperature: temperature || null,
			condition: condition || null,
		}
	} catch (error) {
		console.error('Error fetching weather data:', error)
		console.log(url)
		await browser.close()
		return {
			temperature: null,
			condition: null,
		}
	}
}
