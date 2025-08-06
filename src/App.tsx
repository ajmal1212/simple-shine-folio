
import * as React from 'react';

const App = () => {
  console.log('App rendering with React:', React);
  
  return React.createElement('div', {
    style: { padding: '20px', textAlign: 'center' }
  }, 
    React.createElement('h1', null, 'Hello World'),
    React.createElement('p', null, 'React is working!')
  );
};

export default App;
