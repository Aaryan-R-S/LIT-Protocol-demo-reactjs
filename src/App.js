import logo from './logo.svg';
import './App.css';
// import {Authentication} from "./components/Authentication";
// import { CapacityCredits } from './components/CapacityCredits';
// import { EncryptAuthSig } from './components/EncryptAuthSig';
import { SocialLogin } from './components/SocialLogin';
// import { AuthContext } from './components/AuthContext';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      {/* <Authentication/> */}
      {/* <CapacityCredits/> */}
      {/* <EncryptAuthSig/> */}
      <SocialLogin/>
      {/* <AuthContext></AuthContext> */}
      </header>
    </div>
  );
}

export default App;
