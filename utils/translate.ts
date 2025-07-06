// Словарь соответствий для категорий
const categoryDictionary: Record<string, string> = {
  all: "Все",
  nature: "Природа",
  architecture: "Архитектура",
  people: "Люди",
  animals: "Животные",
  landscape: "Пейзаж",
  portrait: "Портрет",
  wildlife: "Дикая природа",
  city: "Город",
  travel: "Путешествия",
  food: "Еда",
  macro: "Макро",
  street: "Улица",
  night: "Ночь",
  abstract: "Абстракция",
  sport: "Спорт",
  underwater: "Подводный мир",
  aerial: "Аэросъемка",
  "black-and-white": "Черно-белое",
  vintage: "Винтаж",
  doors : "Двери" , 
  houses : "Малоэтажные дома" ,
  bath : "Ванны" ,
  towers : "Башни" , 
  "room" : "пууп" , 
  "room2" : "пупу" , 
  "room3" : "пипи" , 
  "room4" : "фыв" , 



}

/**
 * Переводит название категории на русский язык
 */
export function translateCategory(category: string): string {
  // Проверяем, есть ли категория в словаре
  if (category.toLowerCase() in categoryDictionary) {
    return categoryDictionary[category.toLowerCase()]
  }

  // Если категории нет в словаре, возвращаем оригинальное название с заглавной буквы
  return capitalizeFirstLetter(category)
}

/**
 * Делает первую букву строки заглавной
 */
function capitalizeFirstLetter(text: string): string {
  if (!text) return ""
  return text.charAt(0).toUpperCase() + text.slice(1)
}

