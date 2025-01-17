function skillEffect(name) {
  const functions = {
    화상: (Attack) => {
      console.log(Attack);
    },
    2: () => console.log("Function for ID 2"),
    3: () => console.log("Function for ID 3"),
  };

  return functions[name] || null;
}

export default skillEffect;
