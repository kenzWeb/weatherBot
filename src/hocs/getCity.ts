export let city: string | undefined
export let isFahrenheit: boolean = false

export const getCity = () => city
export const setCity = (newCity: string | undefined) => {
	if (newCity !== undefined) {
		city = newCity
	} else {
		city = ''
	}
}

export const getIsFahrenheit = () => isFahrenheit
export const setIsFahrenheit = (value: boolean) => {
	isFahrenheit = value
}
