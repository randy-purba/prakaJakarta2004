module.exports = (num) => {
  const arr = '0123456789'.split('')
  const arrnum = []
  for (let i = 0; i < num; i += 1) {
    arrnum.push(arr[Math.floor(Math.random() * arr.length)])
  }
  return arrnum.join('')
}
