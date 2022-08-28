//функция случайного целого числа мин макс включительно
function getRandomNumber(min, max, value = 0) {
  if (min < 0 || max < 0) {
    return -1;
  } else if (min === max) {
    return min;
  } else if (min > max) {
    const boofer = max;
    max = min;
    min = boofer;
  }
  const result = ((Math.random() * (max - min)) + min).toFixed(value);
  return result;
}

function getUniqueItem(targetArray, sourceArray) {
  const index = getRandomNumber(0, sourceArray.length-1);
  const spliced = sourceArray.splice(index, 1);
  targetArray.push(...spliced);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

export {getRandomNumber, getUniqueItem, shuffle};