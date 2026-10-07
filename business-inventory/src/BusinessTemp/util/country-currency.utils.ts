const countryCurrencies = new Map([
  ["nigeria", "NGN"], ["united states", "USD"], ["united kingdom", "GBP"], 
  ["canada", "CAD"], ["australia", "AUD"], ["germany", "EUR"], 
  ["france", "EUR"], ["japan", "JPY"], ["india", "INR"], 
  ["china", "CNY"], ["south africa", "ZAR"], ["ghana", "GHS"], 
  ["kenya", "KES"], ["brazil", "BRL"], ["russia", "RUB"], 
  ["south korea", "KRW"], ["saudi arabia", "SAR"], ["united arab emirates", "AED"], 
  ["egypt", "EGP"], ["turkey", "TRY"], ["italy", "EUR"], 
  ["spain", "EUR"], ["netherlands", "EUR"], ["switzerland", "CHF"], 
  ["sweden", "SEK"], ["norway", "NOK"], ["mexico", "MXN"], 
  ["argentina", "ARS"], ["colombia", "COP"], ["new zealand", "NZD"], 
  ["singapore", "SGD"], ["malaysia", "MYR"], ["indonesia", "IDR"], 
  ["philippines", "PHP"], ["thailand", "THB"], ["vietnam", "VND"], 
  ["pakistan", "PKR"], ["bangladesh", "BDT"], ["ukraine", "UAH"], 
  ["poland", "PLN"], ["morocco", "MAD"], ["algeria", "DZD"], 
  ["tunisia", "TND"], ["israel", "ILS"], ["ireland", "EUR"], 
  ["portugal", "EUR"], ["belgium", "EUR"], ["austria", "EUR"], 
  ["greece", "EUR"], ["finland", "EUR"], ["denmark", "DKK"], 
  ["chile", "CLP"], ["peru", "PEN"], ["venezuela", "VES"], 
  ["cameroon", "XAF"], ["ivory coast", "XOF"], ["senegal", "XOF"], 
  ["uganda", "UGX"], ["ethiopia", "ETB"], ["angola", "AOA"]
])
export const countries = [
  "nigeria", "united states", "united kingdom", "canada", "australia", 
  "germany", "france", "japan", "india", "china", 
  "south africa", "ghana", "kenya", "brazil", "russia", 
  "south korea", "saudi arabia", "united arab emirates", "egypt", "turkey", 
  "italy", "spain", "netherlands", "switzerland", "sweden", 
  "norway", "mexico", "argentina", "colombia", "new zealand", 
  "singapore", "malaysia", "indonesia", "philippines", "thailand", 
  "vietnam", "pakistan", "bangladesh", "ukraine", "poland", 
  "morocco", "algeria", "tunisia", "israel", "ireland", 
  "portugal", "belgium", "austria", "greece", "finland", 
  "denmark", "chile", "peru", "venezuela", "cameroon", 
  "ivory coast", "senegal", "uganda", "ethiopia", "angola"
];
export const currencies = [
  "NGN", "USD", "GBP", "CAD", "AUD", "EUR", "JPY", "INR", "CNY", "ZAR", 
  "GHS", "KES", "BRL", "RUB", "KRW", "SAR", "AED", "EGP", "TRY", "CHF", 
  "SEK", "NOK", "MXN", "ARS", "COP", "NZD", "SGD", "MYR", "IDR", "PHP", 
  "THB", "VND", "PKR", "BDT", "UAH", "PLN", "MAD", "DZD", "TND", "ILS", 
  "DKK", "CLP", "PEN", "VES", "XAF", "XOF", "UGX", "ETB", "AOA"
];

export function getCurrency(country:string): string | undefined{
    return countryCurrencies.get(country.trim().toLowerCase())
}







