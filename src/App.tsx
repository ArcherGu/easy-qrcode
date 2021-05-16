import './App.css';
import React from 'react';
import Title from './components/Title';
import Introduction from './components/Introduction';
import Links from './components/Links';
import Demo from './components/Demo';

function App() {
    return (
        <div id="app">
            <Title />
            <Introduction />
            <Demo />
            <Links />
        </div>
    );
}

export default App;
