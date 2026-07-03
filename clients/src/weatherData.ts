import { WeatherInfo } from "./types";

export const regionalWeather: { [region: string]: WeatherInfo } = {
  dodoma: {
    temp: 28,
    condition: "Sunny / Jua Kali",
    conditionCode: "sunny",
    humidity: 45,
    precipitationChance: 5,
    recommendation: "Dry soils. Excellent day for applying organic mulch and clearing weeds. Water your crops in the evening.",
    recommendationSw: "Udongo mkavu. Siku nzuri ya kuweka matandazo (mulch) na kupalilia magugu. Wagilia mazao yako jioni."
  },
  "dar es salaam": {
    temp: 31,
    condition: "Humid & Cloudy / Unyevu na Mawingu",
    conditionCode: "cloudy",
    humidity: 82,
    precipitationChance: 40,
    recommendation: "High humidity levels favor fungal growth. Keep crop spacing wide and check leaves for early mold or spots.",
    recommendationSw: "Unyevu mkubwa wa hewa unachochea ukungu (fungus). Hakikisha nafasi ya kutosha kati ya mimea na kagua majani."
  },
  mbeya: {
    temp: 21,
    condition: "Rainy / Mvua",
    conditionCode: "rainy",
    humidity: 88,
    precipitationChance: 90,
    recommendation: "Heavy rain. Ensure drainage channels are clear to prevent waterlogging. Avoid chemical spraying during rain.",
    recommendationSw: "Mvua kubwa. Hakikisha mifereji ya maji iko wazi kuzuia mafuriko. Epuka kupiga dawa wakati wa mvua."
  },
  mwanza: {
    temp: 26,
    condition: "Windy / Upepo",
    conditionCode: "windy",
    humidity: 60,
    precipitationChance: 25,
    recommendation: "Strong winds can damage tall crops like maize. Check staking for climbing beans and heavy fruiting tomato vines.",
    recommendationSw: "Upepo mkali unaweza kudhuru mazao marefu kama mahindi. Imarisha miti ya kuegemea nyanya na maharagwe."
  },
  arusha: {
    temp: 22,
    condition: "Cool & Cloudy / Baridi na Mawingu",
    conditionCode: "cloudy",
    humidity: 70,
    precipitationChance: 15,
    recommendation: "Cool conditions are ideal for leafy vegetable growth. Monitor for caterpillars and aphids under the leaves.",
    recommendationSw: "Hali ya hewa ya baridi inafaa mboga za majani. Kagua viwavi na wadudu wadogo (aphids) chini ya majani."
  },
  morogoro: {
    temp: 27,
    condition: "Mostly Sunny / Jua Wastani",
    conditionCode: "sunny",
    humidity: 55,
    precipitationChance: 10,
    recommendation: "Good weather for top-dressing fertilizer (Urea/CAN) if the soil is damp. Ensure even application.",
    recommendationSw: "Hali nzuri ya kuweka mbolea ya kukuzia (Urea/CAN) kama udongo una unyevu. Sambaza kwa usawa."
  },
  iringa: {
    temp: 20,
    condition: "Very Cold & Dry / Baridi Kali na Ukavu",
    conditionCode: "sunny",
    humidity: 50,
    precipitationChance: 0,
    recommendation: "Cold morning temperatures. Protect nurseries using a light shade. Ensure adequate water is provided.",
    recommendationSw: "Baridi kali asubuhi. Linda kitalu cha miche kwa kutumia chujio la mwanga au nyasi nyepesi."
  },
  nairobi: {
    temp: 23,
    condition: "Cloudy / Mawingu",
    conditionCode: "cloudy",
    humidity: 75,
    precipitationChance: 30,
    recommendation: "Moderate overcast. Ideal time for transplanting seedlings from the nursery to the main garden.",
    recommendationSw: "Mawingu wastani. Wakati mzuri wa kuhamisha miche kutoka kitaluni kwenda shambani moja kwa moja."
  }
};

export const defaultWeather: WeatherInfo = {
  temp: 26,
  condition: "Partly Cloudy / Mawingu Kiasi",
  conditionCode: "cloudy",
  humidity: 65,
  precipitationChance: 20,
  recommendation: "Keep a daily eye on crop leaves for color changes or yellow spots. Early detection is the key to prevention.",
  recommendationSw: "Chunguza majani ya mimea yako kila siku kuona mabadiliko ya rangi au madoa. Kuwahi kubaini ndiyo kinga kuu."
};
