const countryCurrencies = new Map([
    ["nigeria", "NGN"],
    ["united kingdom", "GBP"],
])

export function getCurrency(country:string): string | undefined{
    return countryCurrencies.get(country.trim().toLowerCase())
}







