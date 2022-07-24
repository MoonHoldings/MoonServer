const fact = (n) => {
  let res = 1
  for (let i = 2; i <= n; i++) {
    res = res * i
  }
  return res
}

module.exports = (n, r) => {
  // combination math
  return fact(n) / (fact(r) * fact(n - r))
}
