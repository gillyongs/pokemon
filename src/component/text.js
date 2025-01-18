import { useState } from 'react';

const useText = () => {
  const [text, setText] = useState(null);

  return { text, setText };
};

export default { text, setText };
