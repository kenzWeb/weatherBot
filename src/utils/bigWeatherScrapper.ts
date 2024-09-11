import {chromium} from 'playwright'

export async function GetBigWeather(city: string): Promise<{
	temperature: string[] | null
	day: string[] | null
	condition: string[] | null
}> {
	const url = `https://pogoda.mail.ru/prognoz/${city}/7dney/`
	const browser = await chromium.launch()
	const page = await browser.newPage()

	try {
		await page.goto(url)
		console.log(`Fetching weather data from: ${url}`)

		const day = await page.$$eval('.hdr__inner', (elements) =>
			elements
				.slice(1, 7)
				.map((el) => (el as HTMLElement).textContent?.trim() || ''),
		)

		const temperature = await page.$$eval('.text_bold_medium', (elements) =>
			elements
				.filter((_, index) => (index + 1) % 4 === 0)
				.map((el) => (el as HTMLElement).textContent?.trim() || ''),
		)

		const condition = await page.$$eval(
			'span.text.text_block.text_light_normal.text_fixed.color_gray',
			(elements) =>
				elements
					.map((el) => (el as HTMLElement).textContent?.trim() || '')
					.filter((text, index, self) => self.indexOf(text) === index),
		)

		return {day, temperature, condition}
	} catch (error) {
		console.error('Error fetching weather data:', error)
		return {day: null, temperature: null, condition: null}
	} finally {
		await browser.close()
	}
}
