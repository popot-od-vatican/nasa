import ThreeScene from './ThreeJSContainer';
import React from 'react';
import ReactDOM from 'react-dom/client'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <>
    <ThreeScene planetName={"Mars"} labelColor={"red"} num={1}/>
  </>,
)


