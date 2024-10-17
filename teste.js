const jogadas = [{peixes : 0, jogadorFiscalizado: 1 },
                {peixes : 0, jogadorFiscalizado: 1 },
                {peixes : 0, jogadorFiscalizado: 1 },
                {peixes : 0, jogadorFiscalizado: 2 }]


const counts = jogadas.reduce((acc, jogada) => {
  const { jogadorFiscalizado } = jogada;
  acc[jogadorFiscalizado] = (acc[jogadorFiscalizado] || 0) + 1;
  return acc;
}, {});

console.log(counts);
